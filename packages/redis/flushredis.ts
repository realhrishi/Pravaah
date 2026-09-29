import { createRedisConnection } from "./client"; // path to your file

async function flush() {
  const redis = createRedisConnection();

  await redis.flushall();

  console.log("✅ All Redis data cleared.");

  await redis.quit();
}

flush().catch((err) => {
  console.error(err);
  process.exit(1);
});