import {prisma} from "./index";

async function main() {
  console.log("Resetting demo state...");


  await prisma.alert.deleteMany({});
  await prisma.riskSnapshot.deleteMany({});
  await prisma.sensorReading.deleteMany({});

  await prisma.sensor.updateMany({
    data: { status: "OFFLINE", lastSeen: null },
  });

  console.log("Done. Villages, watersheds, shelters, subscribers, and users are untouched.");
  console.log("Sensors reset to OFFLINE. Alert and risk history cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());