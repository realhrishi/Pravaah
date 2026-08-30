import type { RiskClass } from "../types/api";

export const RISK_CONFIG: Record<
  RiskClass,
  { color: string; bgClass: string; textClass: string; label: string; pulse: boolean }
> = {
  GREEN: {
    color: "#4ADE80",
    bgClass: "bg-risk-green",
    textClass: "text-risk-green",
    label: "Safe",
    pulse: false,
  },
  WATCH: {
    color: "#FBBF24",
    bgClass: "bg-risk-watch",
    textClass: "text-risk-watch",
    label: "Watch",
    pulse: false,
  },
  WARNING: {
    color: "#FB923C",
    bgClass: "bg-risk-warning",
    textClass: "text-risk-warning",
    label: "Warning",
    pulse: false,
  },
  CRITICAL: {
    color: "#F87171",
    bgClass: "bg-risk-critical",
    textClass: "text-risk-critical",
    label: "Critical — Evacuate",
    pulse: true, // the one deliberate motion moment — urgency, not decoration
  },
};
