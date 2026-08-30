import "dotenv/config";
import { prisma } from "./index.ts";
console.log("start");
try {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("RESULT", JSON.stringify(result));
} catch (e) {
  console.error("PRISMA_ERR", e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
