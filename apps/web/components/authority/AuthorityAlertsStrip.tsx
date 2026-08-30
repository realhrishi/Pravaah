"use client";

import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Alert } from "@/types/api";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AuthorityAlertsStrip({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/40">
        No recent alerts.
      </div>
    );
  }

  return (
    // Added snap-x and custom inline styling for a thin, styled scrollbar
    <div 
      className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth"
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}
    >
      {alerts.slice(0, 8).map((alert) => {
        const config = RISK_CONFIG[alert.riskClass];
        return (
          <div
            key={alert.id}
            // Added snap-start so it snaps neatly to each card
            className="flex min-w-[240px] shrink-0 flex-col gap-1 rounded-xl border p-3 snap-start"
            style={{ borderColor: `${config.color}30`, backgroundColor: `${config.color}0A` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-xs text-white/30">{timeAgo(alert.createdAt)}</span>
            </div>
            <span className="truncate text-sm font-semibold text-white">
              {alert.village?.name ?? alert.villageId}
            </span>
            <span className="text-xs text-white/40">
              {alert.acknowledged ? "Acknowledged" : "Unacknowledged"}
              {alert.dispatched ? " · Dispatched" : " · Not dispatched"}
            </span>
          </div>
        );
      })}
    </div>
  );
}