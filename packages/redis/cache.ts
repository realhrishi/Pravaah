import { createRedisConnection } from "./client";

const redis = createRedisConnection();

const RISK_CACHE_TTL_SECONDS = 600;

export async function getCachedRisk(villageId: string) {
  const cached = await redis.get(`risk:${villageId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedRisk(villageId: string, data: unknown) {
  await redis.set(`risk:${villageId}`, JSON.stringify(data), "EX", RISK_CACHE_TTL_SECONDS);
}


export async function markSensorSeen(sensorId: string) {
  await redis.set(`sensor:${sensorId}:lastSeen`, Date.now().toString(), "EX", 3600);
}

export async function isSensorFresh(sensorId: string, maxAgeSeconds = 1800) {
  const lastSeen = await redis.get(`sensor:${sensorId}:lastSeen`);
  if (!lastSeen) return false;
  return Date.now() - Number(lastSeen) < maxAgeSeconds * 1000;
}