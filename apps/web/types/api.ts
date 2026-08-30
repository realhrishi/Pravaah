
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

declare namespace GeoJSON {
  type Point = {
    type: "Point";
    coordinates: [number, number];
  };

  type Polygon = {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface RiskView {
  probability: number;
  riskClass: RiskClass;
  confidence: number;
  estimatedLeadTimeMinutes: number | null;
  modelVersion: string;
  computedAt: string;
}

export type RiskClass = "GREEN" | "WATCH" | "WARNING" | "CRITICAL";

export interface Watershed {
  watershedId: string;
  name: string;
  createdAt: string;
}

export interface RiskSnapshot {
  id: number;
  villageId: string;
  probability: number;
  riskClass: RiskClass;
  confidence: number;
  estimatedLeadTimeMinutes: number | null;
  modelVersion: string;
  triggerType: string;
  computedAt: string;
}

export interface Village {
  villageId: string;
  watershedId: string;
  name: string;
  population: number | null;
  elevationM: number | null;
  slopeDeg: number | null;
  aspectDeg: number | null;
  historicalEventFreq: number | null;
  boundaryGeoJson: GeoJSON.Polygon | GeoJSON.Point;
  currentRisk?: RiskSnapshot | null;
}

export interface Sensor {
  sensorId: string;
  villageId: string;
  sensorType: "RAIN" | "SOIL_MOISTURE" | "WATER_LEVEL";
  status: "ONLINE" | "STALE" | "OFFLINE";
  lat: number;
  lon: number;
  lastSeen: string | null;
}

export interface Alert {
  id: number;
  villageId: string;
  riskClass: RiskClass;
  previousClass: RiskClass | null;
  leadTimeMinutes: number | null;
  recommendedAction: string | null;
  channels: string[];
  dispatched: boolean;
  dispatchedAt: string | null;
  acknowledged: boolean;
  acknowledgedById: string | null;
  acknowledgedBy?: AuthUser | null;
  acknowledgedAt: string | null;
  createdAt: string;
  village?: Village;
  shelter?: Shelter | null;
}

export interface Shelter {
  shelterId: string;
  watershedId: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number | null;
}

export interface FeatureDriver {
  feature: string;
  contribution: number;
  direction: "increases" | "decreases";
}

export interface ExplainResponse {
  village_id: string;
  timestamp: string;
  top_drivers: FeatureDriver[];
  model_version: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "AUTHORITY" | "ADMIN";
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}