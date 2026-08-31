import axios from "axios";
import { createRedisConnection } from "./client";

const redis = createRedisConnection();
const CACHE_TTL_SECONDS = 900; // 15 min — matches your baseline poll interval, avoids redundant calls on SENSOR_THRESHOLD bursts

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    precipitation: number[];
    soil_moisture_0_to_1cm: number[];
  };
  hourly_units: Record<string, string>;
}

interface RainfallData {
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_6h_mm: number;
  rainfall_24h_mm: number;
  rainfall_forecast_mm: number; // next 1h forecast, from the same call
  soil_moisture_pct: number;
}

export async function fetchRainfallAndSoil(lat: number, lon: number): Promise<RainfallData> {
  const cacheKey = `openmeteo:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = "https://api.open-meteo.com/v1/forecast";
  const { data } = await axios.get<OpenMeteoResponse>(url, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: "precipitation,soil_moisture_0_to_1cm",
      past_days: 1,
      forecast_days: 1,
      timezone: "auto",
    },
    timeout: 5000,
  });

  const precip = data.hourly.precipitation;
  const soil = data.hourly.soil_moisture_0_to_1cm;

  const nowIdx = 24;
  const pastHours = precip.slice(0, nowIdx + 1); // includes current hour
  const sumLastN = (n: number) => pastHours.slice(-n).reduce((a, b) => a + b, 0);

  const forecastNext1h = precip[nowIdx + 1] ?? 0;
  const currentSoilMoisture = (soil[nowIdx] ?? 0) * 100; // Open-Meteo returns m³/m³, convert to %

  const result: RainfallData = {
    rainfall_1h_mm: sumLastN(1),
    rainfall_3h_mm: sumLastN(3),
    rainfall_6h_mm: sumLastN(6),
    rainfall_24h_mm: sumLastN(24),
    rainfall_forecast_mm: forecastNext1h,
    soil_moisture_pct: Math.round(currentSoilMoisture * 10) / 10,
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL_SECONDS);
  return result;
}