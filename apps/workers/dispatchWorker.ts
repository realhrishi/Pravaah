
import { Worker } from "bullmq";
import { dispatchAlertInternal } from "./dispatch";
import { createRedisConnection } from "@repo/redis/client";

const connection = createRedisConnection();

//for later use, can run separately if needed

const dispatchWorker = new Worker("alert-dispatch", async (job) => {
  await dispatchAlertInternal(job.data.alertId);
}, { connection });

dispatchWorker.on("completed", (job) =>
  console.log(`[worker] job ${job.id} completed`),
);
dispatchWorker.on("failed", (job, err) =>
  console.error(`[worker] job ${job?.id} failed:`, err.message),
);