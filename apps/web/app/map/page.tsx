"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import { MapSidebar } from "@/components/map/MapSidebar";
import { watershedsService } from "@/services/watershed";
import { villagesService, type ShelterRouteResult } from "@/services/villages";
import {
  findNearestVillage,
  getSavedVillage,
  NO_MATCH_THRESHOLD_KM,
} from "@/lib/geolocation";
import type { Village, RiskSnapshot, Watershed } from "@/types/api";
import { useSocket } from "@/hooks/useSocket";

const VillageMapClient = dynamic(
  () => import("@/components/map/VillageMap").then((m) => m.VillageMap),
  { ssr: false },
);

export default function MapPage() {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState<string | null>(
    null,
  );
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [risk, setRisk] = useState<RiskSnapshot | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"risk" | "shelter">("risk");
  const [shelterRoute, setShelterRoute] = useState<ShelterRouteResult | null>(
    null,
  );
  const [shelterLoading, setShelterLoading] = useState(false);

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
      const saved = getSavedVillage();
      if (saved && v.some((village) => village.villageId === saved))
        handleSelect(saved);
    });
  }, [activeWatershedId]);

  useEffect(() => {
    if (!latestRisk) return;
    const riskClass = latestRisk.riskClass ?? latestRisk.risk_class ?? "GREEN";
    const normalizedRisk = {
      ...latestRisk,
      id: 0,
      villageId: latestRisk.village_id,
      riskClass,
      risk_class: riskClass,
      confidence: latestRisk.confidence ?? 0,
      estimatedLeadTimeMinutes: latestRisk.estimated_lead_time_minutes ?? null,
      modelVersion: latestRisk.model_version ?? "unknown",
      computedAt: latestRisk.timestamp ?? new Date().toISOString(),
      triggerType: "AUTO",
    } as unknown as RiskSnapshot;

    setVillages((prev) =>
      prev.map((v) =>
        v.villageId === latestRisk.village_id
          ? { ...v, currentRisk: normalizedRisk }
          : v,
      ),
    );
    setRisk((prev) =>
      selectedVillage?.villageId === latestRisk.village_id
        ? normalizedRisk
        : prev,
    );
  }, [latestRisk, selectedVillage]);

  function handleSelect(villageId: string) {
    setViewMode("risk");
    setShelterRoute(null);
    villagesService
      .get(villageId)
      .then(setSelectedVillage)
      .catch(() => setSelectedVillage(null));
    villagesService
      .getRisk(villageId)
      .then(setRisk)
      .catch(() => setRisk(null));
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Location isn't supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        const nearest = findNearestVillage(latitude, longitude, villages);
        if (!nearest || nearest.distanceKm > NO_MATCH_THRESHOLD_KM) {
          setLocationNote(
            nearest
              ? `No monitored village near you (nearest is ${nearest.distanceKm.toFixed(1)} km away).`
              : "No monitored villages have location data yet.",
          );
          return;
        }
        setLocationNote(null);
        handleSelect(nearest.village.villageId);
      },
      () => setLocationNote("Location access denied."),
    );
  }

  function handleShowShelter() {
    if (!selectedVillage) return;
    setViewMode("shelter");
    setShelterLoading(true);
    villagesService
      .getShelterRoute(
        selectedVillage.villageId,
        userLocation?.[0],
        userLocation?.[1],
      )
      .then(setShelterRoute)
      .catch(() => setShelterRoute(null))
      .finally(() => setShelterLoading(false));
  }

  return (
    <main className="h-screen overflow-hidden bg-[#0a0714]">
      <Navbar />
      <div className="grid h-full grid-cols-[340px_1fr] gap-4 px-4 pb-4 pt-24">
        {/* min-h-0 here is the actual fix — without it this column grows
            with its content instead of staying fixed at the row's height */}
        <div className="min-h-0">
          <MapSidebar
            villages={villages}
            watersheds={watersheds}
            activeWatershedId={activeWatershedId}
            onWatershedChange={setActiveWatershedId}
            selectedVillage={selectedVillage}
            risk={risk}
            locationNote={locationNote}
            onSelectVillage={handleSelect}
            onUseLocation={handleUseLocation}
          />
        </div>

        <div className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10">
          <div className="absolute right-4 top-4 z-[1000] flex gap-2">
            <button
              onClick={() => setViewMode("risk")}
              className={`rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-colors ${
                viewMode === "risk"
                  ? "bg-white text-[#0a0714]"
                  : "bg-black/50 text-white/70 hover:bg-black/70"
              }`}
            >
              Risk Map
            </button>
            <button
              onClick={handleShowShelter}
              disabled={!selectedVillage}
              className={`rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-colors disabled:opacity-40 ${
                viewMode === "shelter"
                  ? "bg-emerald-400 text-[#0a0714]"
                  : "bg-black/50 text-white/70 hover:bg-black/70"
              }`}
            >
              Shelter Way
            </button>
          </div>

          {viewMode === "shelter" && shelterLoading && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/40 text-sm text-white/70">
              Finding route...
            </div>
          )}
          {viewMode === "shelter" && !shelterLoading && !shelterRoute && (
            <div className="absolute left-4 top-16 z-[999] rounded-lg bg-black/60 px-3 py-2 text-xs text-white/70">
              No shelter route available for this village.
            </div>
          )}
          {viewMode === "shelter" && shelterRoute && (
            <div className="absolute bottom-4 left-4 right-4 z-[999] flex items-center justify-between rounded-xl bg-black/60 px-4 py-2.5 text-xs text-white backdrop-blur-sm">
              <span>{shelterRoute.shelter.name}</span>
              <span>
                {shelterRoute.distanceKm} km
                {shelterRoute.durationMin
                  ? ` · ~${Math.round(shelterRoute.durationMin)} min`
                  : ""}
              </span>
            </div>
          )}

          <VillageMapClient
            villages={villages}
            userLocation={userLocation}
            onVillageClick={handleSelect}
            mode={viewMode}
            shelterRoute={shelterRoute}
            height="100%"
          />
        </div>
      </div>
    </main>
  );
}
