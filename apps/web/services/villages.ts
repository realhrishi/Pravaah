// src/services/villages.ts
import api from "@/lib/api";
import type { Village, RiskSnapshot } from "@/types/api";

export const villagesService = {
  get: (id: string) => api.get(`/villages/${id}`).then((r) => r.data.data as Village),
  getRisk: (id: string) => api.get(`/villages/${id}/risk`).then((r) => r.data.data as RiskSnapshot),
  getRiskHistory: (id: string, hours = 24) =>
    api.get(`/villages/${id}/risk/history`, { params: { hours } }).then((r) => r.data.data as RiskSnapshot[]),
  getShelterRoute: (id: string, lat?: number, lon?: number) =>
    api
      .get(`/villages/${id}/nearest-shelter`, { params: lat && lon ? { lat, lon } : {} })
      .then((r) => r.data.data as ShelterRouteResult),
   getExplain: (id: string) =>
    api.get(`/villages/${id}/explain`).then((r) => r.data.data as ExplainResult),
};

export interface ShelterRouteResult {
  shelter: { shelterId: string; name: string; lat: number; lon: number };
  origin: { lat: number; lon: number };
  distanceKm: number;
  durationMin: number | null;
  routeGeoJson: { type: "LineString"; coordinates: [number, number][] } | null;
}

export interface ExplainResult {
  village_id: string;
  timestamp: string;
  [key: string]: unknown; // real driver fields TBD from actual ML response
}

export interface ExplainDriver {
  feature: string;
  contribution: number;
  direction: "increases" | "decreases";
}

export const FEATURE_LABELS: Record<string, string> = {
  rainfall_6h_mm: "Rainfall (6h)",
  slope_deg: "Slope",
  upstream_water_level_m: "Upstream water level",
  historical_event_freq: "Historical event frequency",
};