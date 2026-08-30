// src/components/alerts/SubscribeForm.tsx
"use client";

import { useEffect, useState } from "react";
import { watershedsService } from "@/services/watershed";
import { subscribersService } from "@/services/subscriber";
import { findNearestVillage, NO_MATCH_THRESHOLD_KM } from "@/lib/geolocation";
import type { Village, Watershed } from "@/types/api";

type Channel = "WHATSAPP" | "SMS";

export function SubscribeForm() {
  const [open, setOpen] = useState(false);
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState("");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<Channel[]>(["WHATSAPP"]);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || watersheds.length > 0) return;
    watershedsService.list().then((ws) => {
      setWatersheds(ws);
      if (ws.length > 0) setActiveWatershedId(ws[0].watershedId);
    });
  }, [open]);

  useEffect(() => {
    if (!activeWatershedId) return;
    watershedsService.getVillages(activeWatershedId).then(setVillages);
  }, [activeWatershedId]);

  function toggleChannel(c: Channel) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Location isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestVillage(pos.coords.latitude, pos.coords.longitude, villages);
        setLocating(false);
        if (!nearest || nearest.distanceKm > NO_MATCH_THRESHOLD_KM) {
          setLocationNote(
            nearest ? `Nearest monitored village is ${nearest.distanceKm.toFixed(1)} km away — pick manually.` : "No monitored villages nearby.",
          );
          return;
        }
        setLocationNote(null);
        setSelectedVillageId(nearest.village.villageId);
      },
      () => {
        setLocating(false);
        setLocationNote("Location denied — pick your village manually.");
      },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVillageId || !phone || channels.length === 0) return;
    setStatus("submitting");
    setErrorMsg(null);
    try {
      await subscribersService.subscribe({ villageId: selectedVillageId, phone, channels });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message ?? "Something went wrong — try again.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-white/[0.05]"
      >
        Get alerts for your village
      </button>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <p className="font-semibold text-emerald-300">You're subscribed.</p>
        <p className="mt-1 text-sm text-white/60">
          You'll get alerts via {channels.map((c) => (c === "WHATSAPP" ? "WhatsApp" : "SMS")).join(" and ")} if this village escalates.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Get alerts for your village</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white/70">✕</button>
      </div>
      <p className="mt-1 text-sm text-white/50">No account needed — just a phone number and a village.</p>

      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locating}
        className="mt-5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
      >
        {locating ? "Locating..." : "📍 Use my location"}
      </button>
      {locationNote && <p className="mt-2 text-xs text-amber-400">{locationNote}</p>}

      <div className="mt-4 flex items-center gap-3 text-xs text-white/30">
        <div className="h-px flex-1 bg-white/10" />OR PICK MANUALLY<div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select value={activeWatershedId ?? ""} onChange={(e) => setActiveWatershedId(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none">
          {watersheds.map((w) => <option key={w.watershedId} value={w.watershedId} className="bg-[#12101f]">{w.name}</option>)}
        </select>
        <select value={selectedVillageId} onChange={(e) => setSelectedVillageId(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none">
          <option value="" className="bg-[#12101f]">Select village</option>
          {villages.map((v) => <option key={v.villageId} value={v.villageId} className="bg-[#12101f]">{v.name}</option>)}
        </select>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          required
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />

        <div className="flex shrink-0 rounded-xl border border-white/15 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleChannel("WHATSAPP")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              channels.includes("WHATSAPP")
                ? "bg-white text-[#0a0714]"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            WhatsApp
          </button>
          
          {/* Vertical divider line */}
          <div className="w-px bg-white/15" />
          
          <button
            type="button"
            onClick={() => toggleChannel("SMS")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              channels.includes("SMS")
                ? "bg-white text-[#0a0714]"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            SMS
          </button>
        </div>
      </div>

      {errorMsg && <p className="mt-3 text-xs text-rose-400">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !selectedVillageId || !phone || channels.length === 0}
        className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a0714] transition-transform hover:scale-[1.01] disabled:opacity-40"
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe to alerts"}
      </button>
    </form>
  );
}