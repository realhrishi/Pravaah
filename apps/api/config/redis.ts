import { createRedisConnection } from "@repo/redis/client";
const redis = createRedisConnection();

export default redis;