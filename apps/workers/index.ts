import { Worker } from "bullmq";
import axios from "axios";
import { prisma } from "@repo/database/client";
import { buildFeatureVector } from "@repo/database/featureBuilder";
import { setCachedRisk } from "@repo/redis/cache";
import { publishRiskUpdate, publishAlert } from "@repo/redis/pubsub";
import { isEscalation, type RiskClass } from "@repo/shared-types";
import { createRedisConnection, enqueueDispatch } from "@repo/redis/client";
import type { TriggerType } from "@repo/database/client";
import { dispatchAlertInternal } from "./dispatch";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const connection = createRedisConnection();

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

    await prisma.riskSnapshot.create({
      data: {
        villageId,
        probability: prediction.probability,
        riskClass: prediction.risk_class,
        confidence: prediction.confidence,
        estimatedLeadTimeMinutes: prediction.estimated_lead_time_minutes,
        modelVersion: prediction.model_version,
        triggerType: trigger as TriggerType,
      },
    });

    await setCachedRisk(villageId, prediction);
    await publishRiskUpdate(villageId, prediction);

    console.log(
      `[worker] ${villageId} → ${prediction.risk_class} (${prediction.probability})`,
    );

    if (previousClass && isEscalation(previousClass, prediction.risk_class)) {
      const alert = await prisma.alert.create({
        data: {
          villageId,
          riskClass: prediction.risk_class,
          previousClass,
          leadTimeMinutes: prediction.estimated_lead_time_minutes,
          channels: ["WHATSAPP", "SMS"],
        },
      });
      await publishAlert(villageId, alert);
      await enqueueDispatch(alert.id);
      console.log(
        `[worker] ESCALATION: ${villageId} ${previousClass} → ${prediction.risk_class}, alert created`,
      );
    }
  },
  { connection },
);

const dispatchWorker = new Worker(
  "alert-dispatch",
  async (job) => {
    await dispatchAlertInternal(job.data.alertId);
  },
  { connection },
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
