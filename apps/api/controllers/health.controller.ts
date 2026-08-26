import redis from "../config/redis";
import { prisma } from "@repo/database/client";

export const checkHealth = async (req: any, res: any) => {
  const checks: Record<string, "ok" | "error"> = {};
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch (err) {
    checks.redis = "error";
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (err) {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((status) => status === "ok");

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
};
