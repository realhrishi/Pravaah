"use client";

import { useEffect, useState } from "react";
import { alertsService } from "@/services/alerts";
import { RISK_CONFIG } from "@/lib/riskConfig";
import { useAuth } from "@/context/AuthContext";
import type { Alert, RiskClass } from "@/types/api";

const RISK_FILTERS: { label: string; value: RiskClass | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Watch", value: "WATCH" },
  { label: "Warning", value: "WARNING" },
  { label: "Critical", value: "CRITICAL" },
];

const ACK_FILTERS: { label: string; value: "ALL" | "ACKED" | "UNACKED" }[] = [
  { label: "All", value: "ALL" },
  { label: "Unacknowledged", value: "UNACKED" },
  { label: "Acknowledged", value: "ACKED" },
];

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuthorityAlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<RiskClass | "ALL">("ALL");
  const [ackFilter, setAckFilter] = useState<"ALL" | "ACKED" | "UNACKED">("ALL");
  // Track in-flight per-alert actions so we can disable just that row's
  // buttons instead of freezing the whole table on one click.
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    alertsService.list().then(setAlerts).finally(() => setLoading(false));
  }, []);

  function setPending(id: number, isPending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleAcknowledge(id: number) {
    setPending(id, true);
    try {
      const updated = await alertsService.acknowledge(id);
      // Server response may not echo back the acknowledgedBy user relation
      // depending on what acknowledgeAlert's prisma.update includes — patch
      // in what we already know locally (current user, current time) as a
      // fallback so the UI is correct immediately either way.
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...updated,
                acknowledgedBy: updated.acknowledgedBy ?? (user ? { ...user } : null),
              }
            : a,
        ),
      );
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
    } finally {
      setPending(id, false);
    }
  }

  async function handleDispatch(id: number) {
    setPending(id, true);
    try {
      await alertsService.dispatch(id);
      // dispatch() just enqueues a job — it doesn't mark dispatched=true
      // synchronously (that happens later, in the worker, once Twilio
      // actually confirms sends). Reflect "in flight" rather than lying
      // that it's done.
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, dispatched: false } : a)),
      );
    } catch (err) {
      console.error("Failed to enqueue dispatch", err);
    } finally {
      setPending(id, false);
    }
  }

  const filtered = alerts.filter((a) => {
    if (riskFilter !== "ALL" && a.riskClass !== riskFilter) return false;
    if (ackFilter === "ACKED" && !a.acknowledged) return false;
    if (ackFilter === "UNACKED" && a.acknowledged) return false;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-xl font-bold text-white">Alerts</h1>
      <p className="mt-1 text-sm text-white/50">
        Every escalation, with acknowledge and dispatch controls.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRiskFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                riskFilter === f.value
                  ? "bg-white text-[#0a0714]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex gap-2">
          {ACK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setAckFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                ackFilter === f.value
                  ? "bg-white text-[#0a0714]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Village</th>
              <th className="px-4 py-3 font-medium">Escalated from</th>
              <th className="px-4 py-3 font-medium">Lead time</th>
              <th className="px-4 py-3 font-medium">Dispatched</th>
              <th className="px-4 py-3 font-medium">Acknowledged</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                  Loading alerts...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                  No alerts match this filter.
                </td>
              </tr>
            )}
            {filtered.map((alert) => {
              const config = RISK_CONFIG[alert.riskClass];
              const isPending = pendingIds.has(alert.id);
              return (
                <tr key={alert.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {alert.village?.name ?? alert.villageId}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {alert.previousClass ? RISK_CONFIG[alert.previousClass].label : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {alert.leadTimeMinutes != null ? `~${Math.round(alert.leadTimeMinutes)} min` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {alert.dispatched ? (
                      <span className="text-emerald-400">Sent</span>
                    ) : (
                      <span className="text-white/30">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {alert.acknowledged ? (
                      <div className="flex flex-col">
                        <span className="text-white/80">{alert.acknowledgedBy?.name ?? "—"}</span>
                        <span className="text-xs text-white/30">{formatTime(alert.acknowledgedAt)}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/40">{formatTime(alert.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={alert.acknowledged || isPending}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                      >
                        {alert.acknowledged ? "Acked" : isPending ? "..." : "Acknowledge"}
                      </button>
                      <button
                        onClick={() => handleDispatch(alert.id)}
                        disabled={isPending}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                      >
                        {isPending ? "..." : "Dispatch"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}