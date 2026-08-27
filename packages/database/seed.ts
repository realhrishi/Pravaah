// packages/database/prisma/seed.ts
import { prisma } from "./index";
import fs from "fs";
import path from "path";




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

async function main() {
  const filePath = path.join(
    __dirname,
    "../../scripts/gis-seed/data/processed/pilot_final.geojson"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const geojson = JSON.parse(raw);
  const features: VillageFeature[] = geojson.features;

  console.log(`Seeding ${features.length} villages...`);

  // one Watershed row — your pilot's real WRIS/SLUSI id
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

    console.log(`  ✓ ${p.vilname11}`);
  }

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