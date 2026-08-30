import api from "../lib/api";

export interface SensorReading {
  id: number;
  sensorId: string;
  value: number;
  recordedAt: string;
}

export interface SensorWithReading {
  sensorId: string;
  villageId: string;
  sensorType: "RAIN" | "SOIL_MOISTURE" | "WATER_LEVEL";
  status: "ONLINE" | "STALE" | "OFFLINE";
  lat: number;
  lon: number;
  lastSeen: string | null;
  village?: { villageId: string; name: string };
  readings: SensorReading[]; // 0 or 1 item — the latest reading, if any
}

export const sensorsService = {
  list: (watershedId?: string) =>
    api
      .get<{ data: SensorWithReading[] }>("/sensors", { params: watershedId ? { watershedId } : {} })
      .then((r) => r.data.data),
};