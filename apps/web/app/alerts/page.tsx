// app/alerts/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { alertsService } from "@/services/alerts";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Alert, RiskClass } from "@/types/api";
import { SubscribeForm } from "@/components/alerts/SubscribeForm";
import { useSocket } from "@/hooks/useSocket";

const FILTERS: { label: string; value: RiskClass | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Watch", value: "WATCH" },
  { label: "Warning", value: "WARNING" },
  { label: "Critical", value: "CRITICAL" },
];

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AlertCard({ alert }: { alert: Alert }) {
  const config = RISK_CONFIG[alert.riskClass];

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: `${config.color}30`, backgroundColor: `${config.color}0A` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            {alert.village?.name ?? alert.villageId}
          </h3>
        </div>
        <span className="text-xs text-white/40">{timeAgo(alert.createdAt)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        {alert.previousClass && (
          <div>
            <p className="text-xs text-white/40">Escalated from</p>
            <p className="text-white/80">{RISK_CONFIG[alert.previousClass].label}</p>
          </div>
        )}
        {alert.leadTimeMinutes != null && (
          <div>
            <p className="text-xs text-white/40">Lead time</p>
            <p className="font-medium text-white">~{Math.round(alert.leadTimeMinutes)} min</p>
          </div>
        )}
        {alert.shelter && (
          <div>
            <p className="text-xs text-white/40">Nearest shelter</p>
            <p className="text-white/80">{alert.shelter.name}</p>
          </div>
        )}
      </div>

      {alert.recommendedAction && (
        <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
          {alert.recommendedAction}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
        {alert.dispatched ? (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sent via{" "}
            {alert.channels.join(", ")}
          </span>
        ) : (
          <span>Not yet dispatched</span>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RiskClass | "ALL">("ALL");
  const { latestAlert } = useSocket(); 
  useEffect(() => {
    alertsService
      .list()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.riskClass === filter);


  useEffect(() => {
    if (!latestAlert) return;
    setAlerts((prev) => {
      if (prev.some((a) => a.id === latestAlert.id)) return prev; // dedupe
      return [latestAlert as Alert, ...prev];
    });
  }, [latestAlert]);

  return (
    <main className="min-h-screen bg-[#0a0714]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <h1 className="text-2xl font-bold text-white">Live Alerts</h1>
        <p className="mt-1 text-sm text-white/50">
          Every escalation across all monitored villages, in real time.
        </p>

        <div className="mt-8">
  <SubscribeForm />
</div>

        <div className="mt-6 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-white text-[#0a0714]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-white/40">Loading alerts...</p>}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="text-sm text-white/40">No alerts right now.</p>
            </div>
          )}

          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </main>
  );
}