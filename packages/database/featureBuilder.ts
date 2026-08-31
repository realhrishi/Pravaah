import { prisma } from "./index";
import { LAND_COVER_ENCODING, type FeatureVector } from "@repo/shared-types";
import { fetchRainfallAndSoil } from "@repo/redis/openMeteo";
import { isSensorFresh } from "@repo/redis/cache";

const DEFAULT_LAND_COVER: keyof typeof LAND_COVER_ENCODING = "forest";

export async function buildFeatureVector(
  villageId: string,
): Promise<FeatureVector> {
  const village = await prisma.village.findUniqueOrThrow({
    where: { villageId },
  });
  const sensors = await prisma.sensor.findMany({ where: { villageId } });

  const waterSensor = sensors.find((s) => s.sensorType === "WATER_LEVEL");
  const now = new Date();

  async function latestReading(sensorId?: string): Promise<number | null> {
    if (!sensorId) return null;
    const reading = await prisma.sensorReading.findFirst({
      where: { sensorId },
      orderBy: { recordedAt: "desc" },
    });
    return reading?.value ?? null;
  }

  const geo = village.boundaryGeoJson as any;
  const centroid = getCentroid(geo);

  const [waterLevel, rainfallAndSoil] = await Promise.all([
    latestReading(waterSensor?.sensorId),
    centroid
      ? fetchRainfallAndSoil(centroid[0], centroid[1]).catch(() => null)
      : Promise.resolve(null),
  ]);

  const freshChecks = await Promise.all(
    sensors.map((s) => isSensorFresh(s.sensorId)),
  );
  const sensorConfidence =
    sensors.length > 0
      ? freshChecks.filter(Boolean).length / sensors.length
      : 0.5;

  const landCoverLabel = (village.landCoverClass ??
    DEFAULT_LAND_COVER) as keyof typeof LAND_COVER_ENCODING;

  return {
    rainfall_1h_mm: rainfallAndSoil?.rainfall_1h_mm ?? 0,
    rainfall_3h_mm: rainfallAndSoil?.rainfall_3h_mm ?? 0,
    rainfall_6h_mm: rainfallAndSoil?.rainfall_6h_mm ?? 0,
    rainfall_24h_mm: rainfallAndSoil?.rainfall_24h_mm ?? 0,
    rainfall_forecast_mm: rainfallAndSoil?.rainfall_forecast_mm ?? 0,

    soil_moisture_pct: rainfallAndSoil?.soil_moisture_pct ?? 40, 

    elevation_m: village.elevationM ?? 0,
    slope_deg: village.slopeDeg ?? 0,
    aspect_deg: village.aspectDeg ?? 0,
    twi: village.twi ?? 0,
    spi: village.spi ?? 0,
    flow_accumulation: village.flowAccumulation ?? 0,
    distance_to_stream_m: village.distanceToStreamM ?? 0,

    land_cover_class: LAND_COVER_ENCODING[landCoverLabel] ?? 0,

    historical_event_freq: village.historicalEventFreq ?? 0,

    upstream_water_level_m: waterLevel ?? -1,
    sensor_confidence: sensorConfidence,
  };
}

function getCentroid(geo: any): [number, number] | null {
  if (!geo) return null;
  if (geo.type === "Point") {
    const [lon, lat] = geo.coordinates;
    return [lat, lon];
  }
  if (geo.type === "Polygon") {
    const ring = geo.coordinates[0];
    if (!ring || ring.length === 0) return null;
    const lat =
      ring.reduce((s: number, p: number[]) => s + (p[1] ?? 0), 0) / ring.length;
    const lon =
      ring.reduce((s: number, p: number[]) => s + (p[0] ?? 0), 0) / ring.length;
    return [lat, lon];
  }
  return null;
}
