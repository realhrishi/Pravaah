"use client";

import { useEffect, useState } from "react";
import { watershedsService } from "@/services/watershed";
import { riskService } from "@/services/risk";
import { useSocket } from "@/hooks/useSocket";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Village, Watershed } from "@/types/api";

interface LogEntry {
  id: string;
  villageId: string;
  villageName: string;
  status: "queued" | "resolved";
  riskClass?: string;
  probability?: number;
  triggeredAt: number;
}

export default function AuthoritySimulatePage() {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const { latestRisk } = useSocket(activeWatershedId ?? undefined);

  useEffect(() => {
    watershedsService.list().then((ws) => {
      setWatersheds(ws);
      if (ws.length > 0) setActiveWatershedId(ws[0].watershedId);
    });
  }, []);

  useEffect(() => {
    if (!activeWatershedId) return;
    watershedsService.getVillages(activeWatershedId).then((v) => {
      setVillages(v);
      setSelectedVillageId((prev) => prev || v[0]?.villageId || "");
    });
  }, [activeWatershedId]);

  useEffect(() => {
    if (!latestRisk) return;
    setLog((prev) => {
      const idx = prev.findIndex((e) => e.villageId === latestRisk.village_id && e.status === "queued");
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        status: "resolved",
        riskClass: latestRisk.risk_class,
        probability: latestRisk.probability,
      };
      return next;
    });
  }, [latestRisk]);

  async function handleTrigger() {
    if (!selectedVillageId) return;
    const village = villages.find((v) => v.villageId === selectedVillageId);
    if (!village) return;

    setTriggering(true);
    try {
      await riskService.simulate(selectedVillageId);
      setLog((prev) => [
        {
          id: `${selectedVillageId}-${Date.now()}`,
          villageId: selectedVillageId,
          villageName: village.name,
          status: "queued",
          triggeredAt: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to enqueue simulation", err);
    } finally {
      setTriggering(false);
    }
  }

  const selectedVillage = villages.find((v) => v.villageId === selectedVillageId) ?? null;

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header section spanning full width of the container */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Simulate Inference</h1>
          <p className="mt-2 text-sm text-white/50">
            Manually trigger and monitor risk inference for specific villages using their real-time sensor data.
          </p>
        </div>

        {/* Two-column layout for large screens, stacked for smaller screens */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          
          {/* LEFT PANEL: Controls */}
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#0d0a1a] p-6 shadow-xl lg:p-8">
            <div>
              <h2 className="text-lg font-semibold text-white">Target Selection</h2>
              <p className="mt-1 text-xs text-white/40">Select the watershed and village to evaluate.</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Watershed</label>
              <select
                value={activeWatershedId ?? ""}
                onChange={(e) => {
                  setActiveWatershedId(e.target.value);
                  setSelectedVillageId("");
                }}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors hover:border-white/25 focus:border-white/40"
              >
                {watersheds.map((w) => (
                  <option key={w.watershedId} value={w.watershedId} className="bg-[#12101f]">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">Village</label>
              <select
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors hover:border-white/25 focus:border-white/40"
              >
                {villages.map((v) => (
                  <option key={v.villageId} value={v.villageId} className="bg-[#12101f]">
                    {v.name}
                  </option>
                ))}
              </select>

              {/* Current Status Indicator */}
              {selectedVillage?.currentRisk && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="text-white/40">Current Status:</span>
                  <span className="font-semibold" style={{ color: RISK_CONFIG[selectedVillage.currentRisk.riskClass].color }}>
                    {RISK_CONFIG[selectedVillage.currentRisk.riskClass].label}
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="font-medium text-white/80">
                    {(selectedVillage.currentRisk.probability * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleTrigger}
                disabled={triggering || !selectedVillageId}
                className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#0a0714] transition-all hover:bg-white/90 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:hover:bg-white disabled:hover:shadow-none"
              >
                {triggering ? "Queuing Simulation..." : "Trigger Simulation"}
              </button>
              <p className="mt-3 text-center text-xs leading-relaxed text-white/30">
                This process re-runs the inference engine instantly without waiting for the next scheduled batch.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Activity Log */}
          <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0d0a1a] p-6 shadow-xl lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Activity Log</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60">
                {log.length} session entries
              </span>
            </div>
            
            {log.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
                <p className="text-sm text-white/30">No simulations triggered yet.<br/>Activity will appear here.</p>
              </div>
            ) : (
              <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-2">
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                  >
                    <div>
                      <div className="font-medium text-white">{entry.villageName}</div>
                      <div className="mt-0.5 text-xs text-white/40">
                        {new Date(entry.triggeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </div>
                    {entry.status === "queued" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-400/80">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span
                          className="text-sm font-bold tracking-wide"
                          style={{ color: RISK_CONFIG[entry.riskClass as keyof typeof RISK_CONFIG].color }}
                        >
                          {RISK_CONFIG[entry.riskClass as keyof typeof RISK_CONFIG].label}
                        </span>
                        <span className="text-xs text-white/50">
                          {((entry.probability ?? 0) * 100).toFixed(0)}% risk
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}