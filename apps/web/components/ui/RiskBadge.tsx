import { RISK_CONFIG } from "../../lib/riskConfig";
import type { RiskClass } from "../../types/api";

interface RiskBadgeProps {
  riskClass: RiskClass;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ riskClass, size = "md" }: RiskBadgeProps) {
  const config = RISK_CONFIG[riskClass];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: `${config.color}22`, color: config.color }}
    >
      <span
        className={`h-2 w-2 rounded-full ${config.pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
