import type { RiskClass, RiskSnapshot } from "./api";

export interface RiskUpdatePayload {
  village_id: string;
  timestamp: string;
  probability: number;
  riskClass?: RiskClass;
  risk_class?: RiskClass;
  confidence: number;
  estimated_lead_time_minutes: number | null;
  model_version: string;
}

export interface AlertNewPayload {
  id: number;
  villageId: string;
  riskClass: RiskClass;
  previousClass: RiskClass | null;
  leadTimeMinutes: number | null;
  createdAt: string;
}

export interface SensorStatusPayload {
  sensorId: string;
  villageId: string;
  status: "ONLINE" | "STALE" | "OFFLINE";
}
