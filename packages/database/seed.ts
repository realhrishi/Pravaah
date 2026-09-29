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
    twi: number;
    spi: number;
    flow_accumulation: number;
    distance_to_stream_m: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

async function seedShelters(watershedId: string) {
  const shelters = [
    {
      shelterId: "SHL-001",
      name: "Government Inter College, Nam Tol",
      lat: 30.085,
      lon: 79.42,
      capacity: 150,
    },
    {
      shelterId: "SHL-002",
      name: "Panchayat Bhawan, Devpuri",
      lat: 30.095,
      lon: 79.428,
      capacity: 80,
    },
    {
      shelterId: "SHL-003",
      name: "Primary Health Centre, Karchauda",
      lat: 30.105,
      lon: 79.415,
      capacity: 60,
    },
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



async function seedSubscribers() {
  const subscribers = [
    { villageId: "041635", phone: "6207136032" },
    { villageId: "041605", phone: "8766204806" },
  ];

  for (const s of subscribers) {
    await prisma.subscriber.upsert({
      where: { villageId_phone: { villageId: s.villageId, phone: s.phone } },
      update: {},
      create: { ...s, preferredChannel: ["WHATSAPP"] },
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
      name: "Ashu Authority",
      role: "AUTHORITY",
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@chamoli-pilot.local" },
    update: {},
    create: {
      email: "admin@chamoli-pilot.local",
      passwordHash,
      name: "Ashu Admin",
      role: "ADMIN",
    },
  });
  console.log("authority user created");
}

async function main() {
  const localSeedPath = path.join(__dirname, "seed-data/pilot_final_v3.geojson");
  const fallbackPath = path.join(
    __dirname,
    "../../scripts/gis-seed/data/processed/pilot_final_v3.geojson",
  );
  const filePath = fs.existsSync(localSeedPath)
    ? localSeedPath
    : fallbackPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed geojson not found at ${localSeedPath} or ${fallbackPath}`);
  }

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
        twi: p.twi,
        spi: p.spi,
        flowAccumulation: p.flow_accumulation,
        distanceToStreamM: p.distance_to_stream_m,
        boundaryGeoJson: feature.geometry as any, // Json field
      },
    });

    console.log(`${p.vilname11}`);
  }

  const allVillages = await prisma.village.findMany({
  where: { watershedId: watershed.watershedId },
  select: {
    villageId: true,
    boundaryGeoJson: true,
  },
});

  const sensorTypes = ["RAIN", "SOIL_MOISTURE", "WATER_LEVEL"] as const;

for (const village of allVillages) {
  const geometry = village.boundaryGeoJson as any;

  const [lon, lat] = geometry.coordinates[0][0];

  for (const sensorType of sensorTypes) {
    let sensor= "" ;
    if(sensorType === "RAIN" ) {
      sensor = "RAIN";
    } else if(sensorType === "SOIL_MOISTURE") {
      sensor = "SOIL";
    } else if(sensorType === "WATER_LEVEL") {
      sensor = "WL";
    }
    await prisma.sensor.upsert({
      where: {
        sensorId: `SNS-${sensor}-${village.villageId}`,
      },
      update: {},
      create: {
        sensorId: `SNS-${sensor}-${village.villageId}`,
        villageId: village.villageId,
        sensorType,
        lat,
        lon,
      },
    });
  }
}

  await seedShelters(watershed.watershedId);
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
