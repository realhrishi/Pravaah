"use client";

import { useState } from "react";
import { findNearestVillage, saveSelectedVillage } from "@/lib/geolocation";
import type { Village } from "@/types/api";

interface VillageSelectorProps {
  villages: Village[];
  onSelect: (villageId: string) => void;
}

export function VillageSelector({ villages, onSelect }: VillageSelectorProps) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location isn't supported on this device.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestVillage(latitude, longitude, villages);
        setLocating(false);

        if (!nearest) {
          setLocationError("Couldn't match your location to a monitored village yet.");
          return;
        }

        saveSelectedVillage(nearest.village.villageId);
        onSelect(nearest.village.villageId);
      },
      () => {
        setLocating(false);
        setLocationError("Location access denied. Search for your village instead.");
      },
    );
  }

  function handleSelect(villageId: string) {
    saveSelectedVillage(villageId);
    onSelect(villageId);
  }

  const filtered = villages.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={handleUseLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0a0714] transition-transform hover:scale-[1.01] disabled:opacity-50"
      >
        {locating ? "Locating..." : "📍 Use My Current Location"}
      </button>

      {locationError && (
        <p className="mt-2 text-center text-xs text-rose-400">{locationError}</p>
      )}

      <div className="my-6 flex items-center gap-3 text-xs text-white/30">
        <div className="h-px flex-1 bg-white/10" />
        OR SEARCH MANUALLY
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your village..."
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
      />

      <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto">
        {filtered.map((village) => (
          <button
            key={village.villageId}
            onClick={() => handleSelect(village.villageId)}
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
          >
            {village.name}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-2.5 text-sm text-white/30">No villages match "{search}"</p>
        )}
      </div>
    </div>
  );
}
