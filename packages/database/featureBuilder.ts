import { prisma } from "./index";
import { LAND_COVER_ENCODING, type FeatureVector } from "@repo/shared-types";
import { isSensorFresh } from "@repo/redis/cache";

export async function buildFeatureVector(villageId: string): Promise<FeatureVector> {
  const village = await prisma.village.findUniqueOrThrow({ where: { villageId } });
  const sensors = await prisma.sensor.findMany({ where: { villageId } });

  const rainSensor = sensors.find((s) => s.sensorType === "RAIN");
  const soilSensor = sensors.find((s) => s.sensorType === "SOIL_MOISTURE");
  const waterSensor = sensors.find((s) => s.sensorType === "WATER_LEVEL");

  const now = new Date();

  async function sumRainfallSince(hoursAgo: number): Promise<number> {
    if (!rainSensor) return 0;
    const since = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const result = await prisma.sensorReading.aggregate({
      where: { sensorId: rainSensor.sensorId, recordedAt: { gte: since } },
      _sum: { value: true },
    });
    return result._sum.value ?? 0;
  }

  async function latestReading(sensorId?: string): Promise<number | null> {
    if (!sensorId) return null;
    const reading = await prisma.sensorReading.findFirst({
      where: { sensorId },
      orderBy: { recordedAt: "desc" },
    });
    return reading?.value ?? null;
  }

  const [rain1h, rain3h, rain6h, rain24h, soilMoisture, waterLevel] = await Promise.all([
    sumRainfallSince(1),
    sumRainfallSince(3),
    sumRainfallSince(6),
    sumRainfallSince(24),
    latestReading(soilSensor?.sensorId),
    latestReading(waterSensor?.sensorId),
  ]);


  const freshChecks = await Promise.all(sensors.map((s) => isSensorFresh(s.sensorId)));
  const sensorConfidence =
    sensors.length > 0 ? freshChecks.filter(Boolean).length / sensors.length : 0.5;

  const landCoverLabel = (village.landCoverClass ?? "unknown") as keyof typeof LAND_COVER_ENCODING;

  return {
    rainfall_1h_mm: rain1h,
    rainfall_3h_mm: rain3h,
    rainfall_6h_mm: rain6h,
    rainfall_24h_mm: rain24h,
    rainfall_forecast_mm: 0, 
    soil_moisture_pct: soilMoisture ?? 40,
    elevation_m: village.elevationM ?? 0,
    slope_deg: village.slopeDeg ?? 0,
    aspect_deg: village.aspectDeg ?? 0,
    twi: 0,
    spi: 0,
    flow_accumulation: 0,
    distance_to_stream_m: 0,
    land_cover_class: LAND_COVER_ENCODING[landCoverLabel] ?? 0,
    historical_event_freq: village.historicalEventFreq ?? 0,
    upstream_water_level_m: waterLevel ?? -1,
    sensor_confidence: sensorConfidence,
  };
}