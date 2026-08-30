import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database/client";
import { getCachedRisk } from "@repo/redis/cache";
import type { RiskClass } from "@repo/shared-types";

export async function getWatersheds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const watersheds = await prisma.watershed.findMany();
    res.status(200).json({ success: true, data: watersheds });
  } catch (error) {
    next(error);
  }
}

export async function getWatershed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const watershedId = req.params.id as string;
    if (!watershedId) {
      return res.status(400).json({ error: "Invalid watershed ID" });
    }
    const watershed = await prisma.watershed.findUnique({
      where: { watershedId },
      include: {shelters: true},
    });
    if (!watershed)
      return res.status(404).json({ success: false, message: "Watershed not found" });
    res.status(200).json({ success: true, data: watershed });
  } catch (error) {
    next(error);
  }
}

// The main dashboard-map endpoint — villages + their current cached
// risk in one call, exactly what the authority map needs on load.
function normalizeRisk(raw: any): {
  probability: number;
  riskClass: string;
  confidence: number;
  estimatedLeadTimeMinutes: number | null;
  modelVersion: string;
  computedAt: string;
} | null {
  if (!raw) return null;
  return {
    probability: raw.probability,
    riskClass: raw.riskClass ?? raw.risk_class,
    confidence: raw.confidence,
    estimatedLeadTimeMinutes:
      raw.estimatedLeadTimeMinutes ?? raw.estimated_lead_time_minutes ?? null,
    modelVersion: raw.modelVersion ?? raw.model_version,
    computedAt: raw.computedAt ?? raw.timestamp,
  };
}
 
export async function getWatershedVillages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const watershedId = req.params.id as string;
    if (!watershedId) {
      return res.status(400).json({ error: "Invalid watershed ID" });
    }
 
    const villages = await prisma.village.findMany({
      where: { watershedId },
    });
 
    const cacheResults = await Promise.all(
      villages.map((v) => getCachedRisk(v.villageId)),
    );
 
    const missedIds = villages
      .filter((_, i) => !cacheResults[i])
      .map((v) => v.villageId);
 
    let dbFallbackByVillageId: Record<string, any> = {};
    if (missedIds.length > 0) {
      const snapshots = await prisma.riskSnapshot.findMany({
        where: { villageId: { in: missedIds } },
        orderBy: { computedAt: "desc" },
      });
      for (const snap of snapshots) {
        if (!dbFallbackByVillageId[snap.villageId]) {
          dbFallbackByVillageId[snap.villageId] = snap;
        }
      }
    }
 
    const villagesWithRisk = villages.map((village, i) => ({
      ...village,
      currentRisk: normalizeRisk(
        cacheResults[i] ?? dbFallbackByVillageId[village.villageId] ?? null,
      ),
    }));
 
    res.status(200).json({ success: true, data: villagesWithRisk });
  } catch (error) {
    next(error);
  }
}

export async function getWatershedSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const watershedId = req.params.id as string;
    if (!watershedId) {
      return res.status(400).json({ error: "Invalid watershed ID" });
    }

    const villages = await prisma.village.findMany({
      where: { watershedId },
      select: { villageId: true },
    });

    const risks = await Promise.all(
      villages.map((v) => getCachedRisk(v.villageId)),
    );

    const riskOrder: Record<RiskClass, number> = {
      GREEN: 0,
      WATCH: 1,
      WARNING: 2,
      CRITICAL: 3,
    };

    const validRisks = risks.filter(
      (risk): risk is { riskClass: RiskClass } => Boolean(risk) && "riskClass" in risk,
    );

    const highestRiskClass: RiskClass = validRisks.reduce<RiskClass>((max, risk) => {
      const currentOrder = riskOrder[risk.riskClass];
      const maxOrder = riskOrder[max];
      return currentOrder > (maxOrder ?? -1) ? risk.riskClass : max;
    }, "GREEN");

    res.status(200).json({
      success: true,
      data: {
        watershedId,
        totalVillages: villages.length,
        villagesWithData: validRisks.length,
        highestRiskClass,
      },
    });
  } catch (error) {
    next(error);
  }
}