import { Worker , Queue } from "bullmq";
import axios from "axios";
import { prisma } from "@repo/database/client";
import { buildFeatureVector } from "@repo/database/featureBuilder";
import { setCachedRisk } from "@repo/redis/cache";
import { publishRiskUpdate, publishAlert } from "@repo/redis/pubsub";
import {
  isEscalation,
  normalizeRiskPayload,
  type RiskClass,
} from "@repo/shared-types";
import { createRedisConnection, enqueueDispatch } from "@repo/redis/client";
import type { TriggerType } from "@repo/database/client";
import { dispatchAlertInternal } from "./dispatch";
import { isSensorFresh } from "@repo/redis/cache";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const riskConnection = createRedisConnection();
const dispatchConnection = createRedisConnection();
const sensorHealthConnection = createRedisConnection();

const riskWorker = new Worker(
  "risk-inference",
  async (job) => {
    const { villageId, trigger } = job.data as {
      villageId: string;
      trigger: string;
    };
    console.log(`[worker] processing ${villageId} (trigger: ${trigger})`);

    const features = await buildFeatureVector(villageId);
    const { data: prediction } = await axios.post(`${ML_SERVICE_URL}/predict`, {
      village_id: villageId,
      timestamp: new Date().toISOString(),
      features,
    });

    const previous = await prisma.riskSnapshot.findFirst({
      where: { villageId },
      orderBy: { computedAt: "desc" },
    });
    const previousClass = (previous?.riskClass as RiskClass) ?? null;
    const normalizedPrediction = normalizeRiskPayload(prediction);

    await prisma.riskSnapshot.create({
      data: {
        villageId,
        probability: normalizedPrediction.probability,
        riskClass: normalizedPrediction.riskClass,
        confidence: normalizedPrediction.confidence,
        estimatedLeadTimeMinutes:
          normalizedPrediction.estimated_lead_time_minutes,
        modelVersion: normalizedPrediction.model_version,
        triggerType: trigger as TriggerType,
      },
    });

    await setCachedRisk(villageId, normalizedPrediction);
    await publishRiskUpdate(villageId, normalizedPrediction);

    console.log(
      `[worker] ${villageId} → ${normalizedPrediction.riskClass} (${normalizedPrediction.probability})`,
    );

    if (
      previousClass &&
      isEscalation(previousClass, normalizedPrediction.riskClass)
    ) {
      const createAlert = await prisma.alert.create({
        data: {
          villageId,
          riskClass: normalizedPrediction.riskClass,
          previousClass,
          leadTimeMinutes: normalizedPrediction.estimated_lead_time_minutes,
          channels: ["WHATSAPP", "SMS"],
        },
      });

      const alert = await prisma.alert.findUniqueOrThrow({
        where: { id: createAlert.id },
        include: { village: true, shelter: true },
      });

      console.log(alert);
      await publishAlert(villageId, alert);
      await enqueueDispatch(createAlert.id);
      console.log(
        `[worker] ESCALATION: ${villageId} ${previousClass} → ${normalizedPrediction.riskClass}, alert created`,
      );
    }
  },
  { connection: riskConnection },
);

const dispatchWorker = new Worker(
  "alert-dispatch",
  async (job) => {
    await dispatchAlertInternal(job.data.alertId);
  },
  { connection: dispatchConnection },
);

riskWorker.on("completed", (job) =>
  console.log(`[worker] job ${job.id} completed`),
);
riskWorker.on("failed", (job, err) =>
  console.error(`[worker] job ${job?.id} failed:`, err.message),
);
dispatchWorker.on("completed", (job) =>
  console.log(`[worker] job ${job.id} completed`),
);
dispatchWorker.on("failed", (job, err) =>
  console.error(`[worker] job ${job?.id} failed:`, err.message),
);

console.log(
  "Risk inference and dispatch worker running, listening on 'risk-inference' queue...",
);



export const sensorHealthQueue = new Queue("sensor-health-check", {
  connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
});


export async function scheduleSensorHealthChecks() {
  await sensorHealthQueue.upsertJobScheduler(
    "sensor-health-check",
    { every: 5 * 60 * 1000 },
    { name: "check-all-sensors", data: {} },
  );
}

const STALE_AFTER_SECONDS = 30 * 60; 
const OFFLINE_AFTER_SECONDS = 2 * 60 * 60; 

const sensorHealthWorker = new Worker(
  "sensor-health-check",
  async () => {
    const sensors = await prisma.sensor.findMany();

    for (const sensor of sensors) {
      const freshRecent = await isSensorFresh(sensor.sensorId, STALE_AFTER_SECONDS);
      const freshAtAll = await isSensorFresh(sensor.sensorId, OFFLINE_AFTER_SECONDS);

      const newStatus = freshRecent ? "ONLINE" : freshAtAll ? "STALE" : "OFFLINE";

      if (newStatus !== sensor.status) {
        await prisma.sensor.update({
          where: { sensorId: sensor.sensorId },
          data: { status: newStatus },
        });
        console.log(`[sensor-health] ${sensor.sensorId}: ${sensor.status} → ${newStatus}`);
      }
    }
  },
  { connection: sensorHealthConnection },
);

sensorHealthWorker.on("completed", (job) =>
  console.log(`[sensor-health] job ${job.id} completed`),
);
sensorHealthWorker.on("failed", (job, err) =>
  console.error(`[sensor-health] job ${job?.id} failed:`, err.message),
);

console.log("Sensor health check worker running (every 5 min)...");
