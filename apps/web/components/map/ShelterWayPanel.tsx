// src/components/map/ShelterWayPanel.tsx
"use client";

import dynamic from "next/dynamic";
import type { Village } from "@/types/api";

const EvacuationMapInner = dynamic(
  () => import("./EvacuationRoute").then((m) => m.EvacuationRoute),
  { ssr: false },
);

interface ShelterWayPanelProps {
  village: Village | null;
  userLocation: [number, number] | null;
  requested: boolean; // only render the route once the user clicked the button
}

export function ShelterWayPanel({ village, userLocation, requested }: ShelterWayPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0d0a1a] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
        Shelter Way
      </p>

      {!requested ? (
        <div className="flex flex-1 items-center justify-center text-sm text-white/30">
          Click "Show nearest shelter way" to see your evacuation route.
        </div>
      ) : !village ? (
        <div className="flex flex-1 items-center justify-center text-sm text-white/30">
          Select a village first.
        </div>
      ) : (
        <div className="flex-1">
          <EvacuationMapInner village={village} userLocation={userLocation} />
        </div>
      )}
    </div>
  );
}