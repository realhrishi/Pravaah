import { prisma } from "@repo/database/client";
import { enqueueManualInference } from "@repo/redis/queue";
import { markSensorSeen } from "@repo/redis/cache";
import type { NextFunction, Request, Response } from "express";

// Rough per-sensor-type thresholds — crossing one triggers an
// immediate SENSOR_THRESHOLD job instead of waiting for the 15-min cron.

const THRESHOLDS: Record<string, number> = {
  RAIN: 30, // mm in one reading — a real burst, not routine
  WATER_LEVEL: 2.5, // metres
  SOIL_MOISTURE: 80, // percent — near saturation
};

export const ingestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sensorId = req.params.id as string;
    const { value } = req.body as { value: number };

    if(!sensorId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sensor ID" });
    }

    if(!value) {
      return res
        .status(400)
        .json({ success: false, message: "Missing value in request body" });
    }

    const sensor = await prisma.sensor.findUnique({ where: { sensorId } });
    if (!sensor) {
      return res
        .status(404)
        .json({ success: false, message: "Sensor not found" });
    }

    await prisma.sensorReading.create({
      data: { sensorId, value, recordedAt: new Date() },
    });

    await markSensorSeen(sensorId);

    await prisma.sensor.update({
      where: { sensorId },
      data: { status: "ONLINE", lastSeen: new Date() },
    });

    const threshold = THRESHOLDS[sensor.sensorType];
    let triggered = false;
    if (threshold !== undefined && value > threshold) {
      await enqueueManualInference(sensor.villageId, "SENSOR_THRESHOLD");
      triggered = true;
    }

    console.log(
      `[ingest] ${sensorId} (${sensor.sensorType}) = ${value}${triggered ? "  → THRESHOLD CROSSED, job enqueued" : ""}`,
    );

    res.status(200).json({ success: true, data: { status: "ok", triggered } });
  } catch (error) {
    next(error);
  }
};

export async function listSensors(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const watershedId = req.query.watershedId as string | undefined;
    const sensors = await prisma.sensor.findMany({
      where: watershedId ? { village: { watershedId } } : undefined,
      include: {
        village: { select: { villageId: true, name: true } },
        readings: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });
    res.status(200).json({ success: true, data: sensors });
  } catch (error) {
    next(error);
  }
}

export async function getSensor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sensorId = req.params.id as string;
    if (!sensorId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sensor ID" });
    }
    const sensor = await prisma.sensor.findUnique({
      where: { sensorId },
      include: { readings: { orderBy: { recordedAt: "desc" }, take: 50 } },
    });
    if (!sensor)
      return res
        .status(404)
        .json({ success: false, message: "Sensor not found" });


    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    next(error);
  }
}
