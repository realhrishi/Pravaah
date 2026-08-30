"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { watershedsService } from "@/services/watershed";
import { alertsService } from "@/services/alerts";
import { useSocket } from "@/hooks/useSocket";
import { AuthorityAlertsStrip } from "@/components/authority/AuthorityAlertsStrip";
import { AuthorityVillagePanel } from "@/components/authority/AuthorityVillagePanel";
import type { Village, Watershed, Alert } from "@/types/api";

const VillageMapClient = dynamic(
  () => import("@/components/map/VillageMap").then((m) => m.VillageMap),
  { ssr: false },
);

export default function AuthorityDashboardPage() {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const { latestRisk, latestAlert } = useSocket(activeWatershedId ?? undefined);

  // Initial watershed list
  useEffect(() => {
    watershedsService.list().then((ws) => {
      setWatersheds(ws);
      if (ws.length > 0) setActiveWatershedId(ws[0].watershedId);
    });
  }, []);

  // Villages (with currentRisk already joined in, per the backend fix)
  // for whichever watershed is active
  useEffect(() => {
    if (!activeWatershedId) return;
    watershedsService.getVillages(activeWatershedId).then(setVillages);
  }, [activeWatershedId]);

  // Recent alerts strip — independent of watershed filter, shows everything
  useEffect(() => {
    alertsService.list().then(setAlerts);
  }, []);

  // Live risk updates merge into the villages array in place
  useEffect(() => {
    if (!latestRisk) return;
    setVillages((prev) =>
      prev.map((v) => (v.villageId === latestRisk.village_id ? { ...v, currentRisk: latestRisk as any} : v)),
    );
  }, [latestRisk]);

  // Live alert arrivals prepend into the strip, same dedupe pattern as the public alerts page
  useEffect(() => {
    if (!latestAlert) return;
    setAlerts((prev) => {
      if (prev.some((a) => a.id === latestAlert.id)) return prev;
      return [latestAlert as Alert, ...prev];
    });
  }, [latestAlert]);

  function handleVillageClick(villageId: string) {
    const village = villages.find((v) => v.villageId === villageId) ?? null;
    setSelectedVillage(village);
  }

  const selectedRisk = selectedVillage?.currentRisk ?? null;

  return (
    // Changed to flex column to cleanly manage the remaining height
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 shrink-0">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <select
            value={activeWatershedId ?? ""}
            onChange={(e) => {
              setActiveWatershedId(e.target.value);
              setSelectedVillage(null);
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none"
          >
            {watersheds.map((w) => (
              <option key={w.watershedId} value={w.watershedId} className="bg-[#12101f]">
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <AuthorityAlertsStrip alerts={alerts} />
      </div>

      {/* Replaced calc() with flex-1 min-h-0. Added responsive lg:grid-cols constraint if needed */}
      <div className="grid flex-1 min-h-0 grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px] gap-4">
        {/* Map Container */}
        <div className="min-w-0 min-h-0 overflow-hidden rounded-2xl border border-white/10">
          <VillageMapClient
            villages={villages}
            onVillageClick={handleVillageClick}
            mode="risk"
            height="100%"
          />
        </div>
        
        {/* Panel Container - Added min-h-0 and h-full here */}
        <div className="min-w-0 min-h-0 h-full">
          <AuthorityVillagePanel village={selectedVillage} risk={selectedRisk} />
        </div>
      </div>
    </div>
  );
}