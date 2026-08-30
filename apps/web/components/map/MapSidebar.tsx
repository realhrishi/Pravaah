// src/components/map/MapSidebar.tsx — stats section expanded
"use client";

import { useState } from "react";
import { saveSelectedVillage } from "@/lib/geolocation";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Village, RiskSnapshot } from "@/types/api";

interface MapSidebarProps {
  villages: Village[];
  selectedVillage: Village | null;
  risk: RiskSnapshot | null;
  onSelectVillage: (villageId: string) => void;
  watersheds: { watershedId: string; name: string }[];
  activeWatershedId: string | null;
  onWatershedChange: (id: string) => void;
  locationNote: string | null;
  onUseLocation: () => void;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-1.5 last:border-0">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export function MapSidebar({
  villages,
  selectedVillage,
  risk,
  onSelectVillage,
  watersheds,
  activeWatershedId,
  onWatershedChange,
  locationNote,
  onUseLocation,
}: MapSidebarProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filtered = villages.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handlePick(villageId: string) {
    saveSelectedVillage(villageId);
    onSelectVillage(villageId);
    setShowResults(false);
    setSearch("");
  }

  const riskClass = risk?.riskClass ?? "GREEN";
  const config = RISK_CONFIG[riskClass];
  const isUrgent = riskClass === "WARNING" || riskClass === "CRITICAL";

  const onlineSensors =
    selectedVillage &&
    "sensors" in selectedVillage &&
    Array.isArray(selectedVillage.sensors)
      ? selectedVillage.sensors.filter((s) => s.status === "ONLINE").length
      : 0;
  const totalSensors =
    selectedVillage &&
    "sensors" in selectedVillage &&
    Array.isArray(selectedVillage.sensors)
      ? selectedVillage.sensors.length
      : 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0a1a] p-4">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search Village"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
        />
        {showResults && search && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#12101f] shadow-lg">
            {filtered.map((v) => (
              <button
                key={v.villageId}
                onClick={() => handlePick(v.villageId)}
                className="block w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5"
              >
                {v.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-white/30">No matches</p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onUseLocation}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        📍 Use current location
      </button>
      {locationNote && <p className="text-xs text-amber-400">{locationNote}</p>}

      <select
        value={activeWatershedId ?? ""}
        onChange={(e) => onWatershedChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
      >
        {watersheds.map((w) => (
          <option
            key={w.watershedId}
            value={w.watershedId}
            className="bg-[#12101f]"
          >
            {w.name}
          </option>
        ))}
      </select>

      <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4 scrollbar-none">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
          Village Stats
        </p>

        {!selectedVillage ? (
          <p className="text-sm text-white/30">
            Select a village to see its status.
          </p>
        ) : (
          <div className="text-sm">
            {/* Status */}
            <StatRow label="Village" value={selectedVillage.name} />
            <StatRow
              label="Status"
              value={
                (
                  <span style={{ color: config.color }}>{config.label}</span>
                ) as any
              }
            />
            {selectedVillage.population != null && (
              <StatRow
                label="Population"
                value={selectedVillage.population.toLocaleString()}
              />
            )}
            {selectedVillage.watershedId && (
              <StatRow label="Watershed" value={selectedVillage.watershedId} />
            )}

            {/* Risk snapshot */}
            {risk && (
              <>
                <StatRow
                  label="Probability"
                  value={`${(risk.probability * 100).toFixed(0)}%`}
                />
                <StatRow
                  label="Confidence"
                  value={`${(risk.confidence * 100).toFixed(0)}%`}
                />
                {risk.estimatedLeadTimeMinutes != null && (
                  <StatRow
                    label="Lead time"
                    value={`~${Math.round(risk.estimatedLeadTimeMinutes)} min`}
                  />
                )}
                <StatRow
                  label="Last updated"
                  value={new Date(risk.computedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </>
            )}

            {/* Terrain */}
            {selectedVillage.elevationM != null && (
              <StatRow
                label="Elevation"
                value={`${selectedVillage.elevationM.toFixed(0)} m`}
              />
            )}
            {selectedVillage.slopeDeg != null && (
              <StatRow
                label="Slope"
                value={`${selectedVillage.slopeDeg.toFixed(1)}°`}
              />
            )}
            {selectedVillage.historicalEventFreq != null && (
              <StatRow
                label="Historical events"
                value={selectedVillage.historicalEventFreq}
              />
            )}

            {/* Sensors */}
            {totalSensors > 0 && (
              <StatRow
                label="Sensors online"
                value={`${onlineSensors} / ${totalSensors}`}
              />
            )}

            {isUrgent && (
              <div
                className="mt-3 rounded-lg border p-3"
                style={{
                  borderColor: `${config.color}40`,
                  backgroundColor: `${config.color}12`,
                }}
              >
                <p
                  className="mb-1.5 text-xs font-semibold uppercase"
                  style={{ color: config.color }}
                >
                  In case of alert
                </p>
                <p className="text-xs text-white/70">
                  {riskClass === "CRITICAL"
                    ? "Evacuate now to the nearest shelter. Avoid riverbanks and low-lying paths."
                    : "Prepare essentials. Stay away from riverbanks. Monitor for updates."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
