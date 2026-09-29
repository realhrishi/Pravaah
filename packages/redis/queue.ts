import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const riskInferenceQueue = new Queue("risk-inference", {
  connection: { url: REDIS_URL },
});


export async function scheduleBaselinePolling(villageIds: string[]) {
  for (const villageId of villageIds) {
    await riskInferenceQueue.upsertJobScheduler(
      `baseline-${villageId}`,
      { every: 15 * 60 * 1000 },
      { name: "risk-inference", data: { villageId, trigger: "SCHEDULED" } }
    );
    await riskInferenceQueue.add("risk-inference", {
      villageId,
      trigger: "SCHEDULED",
    });
  }
}

export async function enableAdaptivePolling(villageId: string) {
  await riskInferenceQueue.upsertJobScheduler(
    `adaptive-${villageId}`,
    { every: 3 * 60 * 1000 },
    { name: "risk-inference", data: { villageId, trigger: "ADAPTIVE" } }
  );
}

export async function disableAdaptivePolling(villageId: string) {
  await riskInferenceQueue.removeJobScheduler(`adaptive-${villageId}`);
}

export async function enqueueManualInference(
  villageId: string,
  trigger: "SENSOR_THRESHOLD" | "MANUAL"
) {
  await riskInferenceQueue.add("risk-inference", { villageId, trigger });
}


export const alertDispatchQueue = new Queue("alert-dispatch", {
  connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
});

export async function enqueueDispatch(alertId: number) {
  await alertDispatchQueue.add("dispatch", { alertId });
}