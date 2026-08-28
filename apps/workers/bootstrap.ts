import { prisma } from "@repo/database/client";
import { scheduleBaselinePolling } from "@repo/redis/queue";

async function main() {
  const villages = await prisma.village.findMany({
    select: { villageId: true },
  });

  console.log(`Scheduling baseline 15-min polling for ${villages.length} villages...`);
  await scheduleBaselinePolling(villages.map((v) => v.villageId));
  console.log("Done. These jobs now run every 15 minutes automatically.");

  process.exit(0);
}

main();

//Running this file would create a 15-minute polling job for each village in the database. This is intended to be run once at startup, and the jobs will then run automatically every 15 minutes.