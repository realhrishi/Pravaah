export const RISK_CLASSES = ["GREEN", "WATCH", "WARNING", "CRITICAL"] as const;
export type RiskClass = (typeof RISK_CLASSES)[number];

export const RISK_CLASS_ORDER: Record<RiskClass, number> = {
  GREEN: 0,
  WATCH: 1,
  WARNING: 2,
  CRITICAL: 3,
};

export function normalizeRiskPayload<
  T extends { risk_class?: RiskClass; riskClass?: RiskClass },
>(payload: T): T & { riskClass: RiskClass; risk_class: RiskClass } {
  const riskClass = (payload.riskClass ??
    payload.risk_class ??
    "GREEN") as RiskClass;
  return {
    ...payload,
    riskClass,
    risk_class: riskClass,
  };
}

export function isEscalation(prev: RiskClass, next: RiskClass): boolean {
  return RISK_CLASS_ORDER[next] > RISK_CLASS_ORDER[prev];
}

export const FEATURE_NAMES = [
  // dynamic — rainfall (from rain sensors / rainfall grid cell)
  "rainfall_1h_mm",
  "rainfall_3h_mm",
  "rainfall_6h_mm",
  "rainfall_24h_mm",
  "rainfall_forecast_mm",
  // dynamic — sensors
  "soil_moisture_pct",
  // static — terrain (precomputed from DEM at seed time)
  "elevation_m",
  "slope_deg",
  "aspect_deg",
  "twi",
  "spi",
  "flow_accumulation",
  "distance_to_stream_m",
  "land_cover_class",
  // static — history (from flood/landslide inventory)
  "historical_event_freq",
  // dynamic — upstream & quality
  "upstream_water_level_m",
  "sensor_confidence",
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export type FeatureVector = Record<FeatureName, number>;

export const LAND_COVER_ENCODING = {
  unknown: 0,
  forest: 1,
  agriculture: 2,
  urban: 3,
  barren: 4,
  water: 5,
  grassland: 6,
} as const;
export type LandCoverLabel = keyof typeof LAND_COVER_ENCODING;

export interface PredictRequest {
  village_id: string;
  timestamp: string;
  features: FeatureVector;
}

export interface PredictResponse {
  village_id: string;
  timestamp: string;
  probability: number;
  risk_class: RiskClass;
  confidence: number;
  estimated_lead_time_minutes: number | null;
  model_version: string;
}

export type DriverDirection = "increases" | "decreases";

export interface FeatureDriver {
  feature: FeatureName;
  contribution: number;
  direction: DriverDirection;
}

export interface ExplainRequest {
  village_id: string;
  timestamp: string;
  features: FeatureVector;
}

export interface ExplainResponse {
  village_id: string;
  timestamp: string;
  top_drivers: FeatureDriver[];
  model_version: string;
}
