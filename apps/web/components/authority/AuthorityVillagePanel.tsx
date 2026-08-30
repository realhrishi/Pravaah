"use client";

import { useEffect, useState } from "react";
import { villagesService, type ExplainResult, FEATURE_LABELS } from "@/services/villages";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Village, RiskSnapshot } from "@/types/api";
import Link from "next/link";

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-1.5 last:border-0">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export function AuthorityVillagePanel({
  village,
  risk,
}: {
  village: Village | null;
  risk: RiskSnapshot | null;
}) {
  const [explain, setExplain] = useState<ExplainResult | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(false);

  useEffect(() => {
    setExplain(null);
    setExplainError(false);
    if (!village) return;
    setExplainLoading(true);
    villagesService
      .getExplain(village.villageId)
      .then(setExplain)
      .catch(() => setExplainError(true))
      .finally(() => setExplainLoading(false));
  }, [village]);

  if (!village) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-[#0d0a1a] p-6">
        <p className="text-sm text-white/30">Select a village on the map for full detail.</p>
      </div>
    );
  }

  const riskClass = risk?.riskClass ?? "GREEN";
  const config = RISK_CONFIG[riskClass];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0a1a] p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Selected Village</p>
        <h2 className="mt-1 text-xl font-bold text-white">{village.name}</h2>
        <span className="mt-1 inline-block text-sm font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        {risk ? (
          <>
            <StatRow label="Probability" value={`${(risk.probability * 100).toFixed(0)}%`} />
            <StatRow label="Confidence" value={`${(risk.confidence * 100).toFixed(0)}%`} />
            {risk.estimatedLeadTimeMinutes != null && (
              <StatRow label="Lead time" value={`~${Math.round(risk.estimatedLeadTimeMinutes)} min`} />
            )}
            <StatRow
              label="Last updated"
              value={new Date(risk.computedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            />
          </>
        ) : (
          <p className="text-white/30">No risk data yet for this village.</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Terrain</p>
        {village.elevationM != null && <StatRow label="Elevation" value={`${village.elevationM.toFixed(0)} m`} />}
        {village.slopeDeg != null && <StatRow label="Slope" value={`${village.slopeDeg.toFixed(1)}°`} />}
        {village.historicalEventFreq != null && (
          <StatRow label="Historical events" value={village.historicalEventFreq} />
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Risk Drivers</p>
        {explainLoading && <p className="text-white/30">Loading...</p>}
        {explainError && <p className="text-white/30">Explain data unavailable for this village right now.</p>}
        {!explainLoading && !explainError && explain && (
          <div className="flex flex-col gap-3">
            {(explain.top_drivers as Array<{ feature: string; direction: string; contribution: number }>).map((driver) => (
              <div key={driver.feature}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/70">
                    {FEATURE_LABELS[driver.feature] ?? driver.feature}
                  </span>
                  <span className="text-white/40">
                    {driver.direction === "increases" ? "↑" : "↓"} {(driver.contribution * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(driver.contribution * 100, 100)}%`,
                      backgroundColor: driver.direction === "increases" ? "#f87171" : "#4ade80",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

            <Link
        href={`/authority/village-history/${village.villageId}`}
        className="mt-auto rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        Show village history →
      </Link>
    </div>
  );
}