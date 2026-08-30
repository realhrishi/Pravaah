// app/authority/village/[id]/history/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { villagesService } from "@/services/villages";
import { alertsService } from "@/services/alerts";
import { useVillage } from "@/context/VillageContext";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { RiskSnapshot, Alert, RiskClass } from "@/types/api";

const HOURS_OPTIONS = [
  { label: "6h", value: 6 },
  { label: "24h", value: 24 },
  { label: "72h", value: 72 },
];

const RISK_THRESHOLDS = [
  { label: "Watch", probability: 0.3, color: RISK_CONFIG.WATCH.color },
  { label: "Warning", probability: 0.5, color: RISK_CONFIG.WARNING.color },
  { label: "Critical", probability: 0.75, color: RISK_CONFIG.CRITICAL.color },
];

const TRIGGER_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled poll",
  SENSOR_THRESHOLD: "Sensor threshold",
  ADAPTIVE: "Adaptive (tightened)",
  MANUAL: "Manual / simulate",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

export default function VillageHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const village = useVillage();

  const [history, setHistory] = useState<RiskSnapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      villagesService.getRiskHistory(id, hours),
      alertsService.list(), // filtered client-side below — no dedicated backend route needed
    ])
      .then(([hist, allAlerts]) => {
        setHistory(hist);
        const since = Date.now() - hours * 60 * 60 * 1000;
        setAlerts(
          allAlerts
            .filter((a) => a.villageId === id && new Date(a.createdAt).getTime() >= since)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
      })
      .catch((err) => {
        setError(
          err?.response?.status
            ? `Request failed: ${err.response.status} ${err.response.statusText ?? ""}`
            : "Request failed — check the console and network tab.",
        );
      })
      .finally(() => setLoading(false));
  }, [id, hours]);

  const chartData = history.map((snap) => ({
    time: new Date(snap.computedAt).getTime(),
    probability: snap.probability,
    riskClass: snap.riskClass,
  }));

  // Derived stats — all computed client-side from data already fetched, no extra calls
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const peak = history.reduce((max, s) => (s.probability > max.probability ? s : max), history[0]);
    const warningPlus = history.filter((s) => s.riskClass === "WARNING" || s.riskClass === "CRITICAL").length;
    const warningPct = Math.round((warningPlus / history.length) * 100);
    const escalations = alerts.length;
    return { peak, warningPct, escalations };
  }, [history, alerts]);

  const triggerCounts = useMemo(() => {
    const counts: Record<string, number> = { SCHEDULED: 0, SENSOR_THRESHOLD: 0, ADAPTIVE: 0, MANUAL: 0 };
    history.forEach((s) => {
      counts[s.triggerType] = (counts[s.triggerType] ?? 0) + 1;
    });
    return counts;
  }, [history]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">Risk history for {village?.name ?? id}.</p>
        <div className="flex gap-2">
          {HOURS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setHours(opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                hours === opt.value ? "bg-white text-[#0a0714]" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && !error && stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Peak probability"
            value={`${(stats.peak.probability * 100).toFixed(0)}%`}
            sub={new Date(stats.peak.computedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          />
          <StatCard label="Escalations" value={String(stats.escalations)} sub={`in last ${hours}h`} />
          <StatCard label="Time at Warning+" value={`${stats.warningPct}%`} sub="of this window" />
          <StatCard label="Snapshots" value={String(history.length)} sub={`over ${hours}h`} />
        </div>
      )}

      {/* Trigger breakdown — the concrete proof the system is event-driven, not fixed-interval */}
      {!loading && !error && history.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
            What triggered each check
          </p>
          <div className="flex gap-2">
            {Object.entries(triggerCounts).map(([type, count]) => (
              <div
                key={type}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-center"
              >
                <p className="text-lg font-bold text-white">{count}</p>
                <p className="text-[11px] text-white/40">{TRIGGER_LABELS[type] ?? type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {loading && <p className="py-16 text-center text-sm text-white/40">Loading history...</p>}
        {!loading && error && <p className="py-16 text-center text-sm text-rose-400">{error}</p>}
        {!loading && !error && chartData.length === 0 && (
          <p className="py-16 text-center text-sm text-white/40">
            No risk snapshots in this window yet — trigger a few simulations to see a trend.
          </p>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
              />
              <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="rgba(255,255,255,0.3)" fontSize={12} />
              {RISK_THRESHOLDS.map((t) => (
                <ReferenceLine key={t.label} y={t.probability} stroke={t.color} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: t.label, position: "right", fill: t.color, fontSize: 11 }} />
              ))}
              <Tooltip
                contentStyle={{ background: "#12101f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelFormatter={(t) => new Date(t as number).toLocaleString()}
                formatter={(value) => [`${((value as number) * 100).toFixed(0)}%`, "Probability"]}
              />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={(props: any) => {
                  const cls: RiskClass = props.payload.riskClass;
                  return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill={RISK_CONFIG[cls].color} stroke="none" />;
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-village alert history — the accountability trail */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Alert History</p>
        {!loading && alerts.length === 0 && (
          <p className="py-6 text-center text-sm text-white/30">No alerts for this village in this window.</p>
        )}
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const config = RISK_CONFIG[alert.riskClass];
            return (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-white/80">
                    {alert.previousClass ? `${RISK_CONFIG[alert.previousClass].label} → ` : ""}
                    <span style={{ color: config.color }}>{config.label}</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>{alert.dispatched ? `Sent via ${alert.channels.join(", ")}` : "Not dispatched"}</span>
                  <span>{alert.acknowledged ? "Acknowledged" : "Unacknowledged"}</span>
                  <span>{timeAgo(alert.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}