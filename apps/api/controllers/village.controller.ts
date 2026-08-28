import type { Request, Response, NextFunction } from "express";
import axios from "axios";
import { prisma } from "@repo/database/client";
import { buildFeatureVector } from "@repo/database/featureBuilder";
import { getCachedRisk } from "@repo/redis/cache";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function getVillage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const villageId = req.params.id as string;
    if (!villageId) {
      return res.status(400).json({ error: "Invalid village ID" });
    }
    const village = await prisma.village.findUnique({
      where: { villageId },
      include: { sensors: true, watershed: true },
    });
    if (!village) return res.status(404).json({ success: false, message: "Village not found" });
    res.status(200).json({ success: true, data: village });
  } catch (error) {
    next(error);
  }
}

export async function getVillageRisk(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const villageId = req.params.id as string;
    if (!villageId) {
      return res.status(400).json({ error: "Invalid village ID" });
    }

    const cached = await getCachedRisk(villageId);
    if (cached) return res.json(cached);

    const latest = await prisma.riskSnapshot.findFirst({
      where: { villageId },
      orderBy: { computedAt: "desc" },
    });
    if (!latest)
      return res
        .status(404)
        .json({ success: false, message: "No risk data yet for this village" });
    res.status(200).json({ success: true, data: latest  });
  } catch (error) {
    next(error);
  }
}

export async function getVillageRiskHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const villageId = req.params.id as string;
    if (!villageId) {
      return res.status(400).json({ error: "Invalid village ID" });
    }
    const hours = Number(req.query.hours ?? 24);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await prisma.riskSnapshot.findMany({
      where: { villageId, computedAt: { gte: since } },
      orderBy: { computedAt: "asc" },
    });
    res.status(200).json({ success: true, data: history  });
  } catch (error) {
    next(error);
  }
}

export async function getVillageExplain(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const villageId = req.params.id as string;
    if (!villageId) {
      return res.status(400).json({ error: "Invalid village ID" });
    }
    const features = await buildFeatureVector(villageId);

    const { data } = await axios.post(`${ML_SERVICE_URL}/explain`, {
      village_id: villageId,
      timestamp: new Date().toISOString(),
      features,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
