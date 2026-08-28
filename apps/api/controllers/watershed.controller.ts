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

    const villagesWithRisk = await Promise.all(
      villages.map(async (village) => {
        const cachedRisk = await getCachedRisk(village.villageId);
        return { ...village, currentRisk: cachedRisk ?? null };
      }),
    );

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