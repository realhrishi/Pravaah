
import { prisma } from "./index";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";



interface VillageFeature {
  type: "Feature";
  properties: {
    vilname11: string;
    vilcode11: string;
    dtname: string;
    elevation_m: number;
    slope_deg: number;
    aspect_deg: number;
    historical_event_freq: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

async function seedShelters(watershedId: string) {
  const shelters = [
    { shelterId: "SHL-001", name: "Government Inter College, Nam Tol", lat: 30.0850, lon: 79.4200, capacity: 150 },
    { shelterId: "SHL-002", name: "Panchayat Bhawan, Devpuri", lat: 30.0950, lon: 79.4280, capacity: 80 },
    { shelterId: "SHL-003", name: "Primary Health Centre, Karchauda", lat: 30.1050, lon: 79.4150, capacity: 60 },
  ];

  for (const s of shelters) {
    await prisma.shelter.upsert({
      where: { shelterId: s.shelterId },
      update: {},
      create: { ...s, watershedId },
    });
    console.log(`shelter: ${s.name}`);
  }
}


async function seedSensors() {
  const sensors = [
    { sensorId: "SNS-RAIN-001", villageId: "041635", sensorType: "RAIN" as const, lat: 30.0855, lon: 79.4205 },
    { sensorId: "SNS-WL-001", villageId: "041605", sensorType: "WATER_LEVEL" as const, lat: 30.0955, lon: 79.4285 },
  ];

  for (const s of sensors) {
    await prisma.sensor.upsert({
      where: { sensorId: s.sensorId },
      update: {},
      create: { ...s, status: "OFFLINE" },
    });
    console.log(`sensor: ${s.sensorId} → ${s.villageId}`);
  }
}

async function seedSubscribers() {
  const subscribers = [
    { villageId: "041635", phone: "6207136032" },
    { villageId: "041605", phone: "8766204806" },
  ];

  for (const s of subscribers) {
    await prisma.subscriber.upsert({
      where: { villageId_phone: { villageId: s.villageId, phone: s.phone } },
      update: {},
      create: { ...s, preferredChannel: "WHATSAPP" },
    });
    console.log(`subscriber: ${s.phone} → ${s.villageId}`);
  }
}

async function seedAuthorityUser() {
  const passwordHash = await bcrypt.hash("demo-password-123", 10);

  await prisma.user.upsert({
    where: { email: "authority@chamoli-pilot.local" },
    update: {},
    create: {
      email: "authority@chamoli-pilot.local",
      passwordHash,
      name: "Pilot Authority Admin",
      role: "AUTHORITY",
    },
  });
  console.log("authority user created");
}


async function main() {
  const filePath = path.join(
    __dirname,
    "../../scripts/gis-seed/data/processed/pilot_final.geojson"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const geojson = JSON.parse(raw);
  const features: VillageFeature[] = geojson.features;

  console.log(`Seeding ${features.length} villages...`);


  const watershed = await prisma.watershed.upsert({
    where: { watershedId: "g_mws.54029" },
    update: {},
    create: {
      watershedId: "g_mws.54029",
      name: "Chamoli Pilot Watershed",
    },
  });

  for (const feature of features) {
    const p = feature.properties;

    await prisma.village.upsert({
      where: { villageId: p.vilcode11 },
      update: {},
      create: {
        villageId: p.vilcode11,
        watershedId: watershed.watershedId,
        name: p.vilname11,
        elevationM: p.elevation_m,
        slopeDeg: p.slope_deg,
        aspectDeg: p.aspect_deg,
        historicalEventFreq: p.historical_event_freq,
        boundaryGeoJson: feature.geometry as any, // Json field
      },
    });

    console.log(`${p.vilname11}`);
  }

  await seedShelters(watershed.watershedId);
  await seedSensors();
  await seedSubscribers();
  await seedAuthorityUser();

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });