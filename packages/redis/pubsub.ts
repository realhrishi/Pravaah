import { createRedisConnection } from "./client";


const redis = createRedisConnection();

export async function publishRiskUpdate(villageId: string, data: unknown) {
  await redis.publish(`risk:${villageId}`, JSON.stringify(data));
}

export async function publishAlert(villageId: string, data: unknown) {
  await redis.publish(`alert:${villageId}`, JSON.stringify(data));
}

export async function publishSensorStatus(sensorId: string, data: unknown) {
  await redis.publish(`sensor:${sensorId}`, JSON.stringify(data));
}


export function createSubscriber() {
  return createRedisConnection();
}