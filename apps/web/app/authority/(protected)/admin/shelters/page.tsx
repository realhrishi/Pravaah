// app/authority/admin/shelters/page.tsx
"use client";

import { useEffect, useState } from "react";
import { watershedsService } from "@/services/watershed";
import { adminService } from "@/services/admin";
import type { Watershed, Shelter } from "@/types/api";

export default function AdminSheltersPage() {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState("");
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ shelterId: "", name: "", lat: "", lon: "", capacity: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    watershedsService.list().then((ws) => {
      setWatersheds(ws);
      if (ws.length > 0) setActiveWatershedId(ws[0].watershedId);
    });
  }, []);

  function refreshShelters(watershedId: string) {
    setLoading(true);
    watershedsService
      .get(watershedId)
      .then((w) => {
        const watershed = w as Watershed & { shelters?: Shelter[] };
        setShelters(watershed.shelters ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (activeWatershedId) refreshShelters(activeWatershedId);
  }, [activeWatershedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lat || !form.lon || !activeWatershedId) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminService.createShelter({
        shelterId: form.shelterId,
        watershedId: activeWatershedId,
        name: form.name,
        lat: Number(form.lat),
        lon: Number(form.lon),
        capacity: form.capacity ? Number(form.capacity) : undefined,
      });
      setForm({ shelterId: "", name: "", lat: "", lon: "", capacity: "" });
      refreshShelters(activeWatershedId);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create shelter.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white">Shelters</h1>

      <select
        value={activeWatershedId}
        onChange={(e) => setActiveWatershedId(e.target.value)}
        className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
      >
        {watersheds.map((w) => (
          <option key={w.watershedId} value={w.watershedId} className="bg-[#12101f]">{w.name}</option>
        ))}
      </select>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
        <input
          required
          placeholder="Shelter ID"
          value={form.shelterId}
          onChange={(e) => setForm({ ...form, shelterId: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          required
          placeholder="Name (e.g. Government Inter College)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          required
          type="number"
          step="any"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          required
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.lon}
          onChange={(e) => setForm({ ...form, lon: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          type="number"
          placeholder="Capacity (optional)"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none sm:col-span-2"
        />

        {error && <p className="sm:col-span-2 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a0714] disabled:opacity-40"
        >
          {submitting ? "Creating..." : "Register shelter"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        {loading && <p className="p-5 text-sm text-white/40">Loading...</p>}
        {!loading && shelters.length === 0 && <p className="p-5 text-sm text-white/40">No shelters in this watershed yet.</p>}
        {!loading &&
          shelters.map((s) => (
            <div key={s.shelterId} className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-sm last:border-0">
              <p className="text-white">{s.name}</p>
              <p className="text-xs text-white/40">{s.lat.toFixed(4)}, {s.lon.toFixed(4)}{s.capacity ? ` · cap ${s.capacity}` : ""}</p>
            </div>
          ))}
      </div>
    </div>
  );
}