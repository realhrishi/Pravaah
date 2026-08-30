// app/authority/admin/sensors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { watershedsService } from "@/services/watershed";
import { sensorsService } from "@/services/sensors";
import { adminService, type CreateSensorInput } from "@/services/admin";
import type { Watershed, Village, Sensor } from "@/types/api";

const SENSOR_TYPES = ["RAIN", "SOIL_MOISTURE", "WATER_LEVEL"] as const;

export default function AdminSensorsPage() {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [activeWatershedId, setActiveWatershedId] = useState("");
  const [villages, setVillages] = useState<Village[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    sensorId: "",
    villageId: "",
    sensorType: "RAIN" as CreateSensorInput["sensorType"],
    lat: "",
    lon: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    watershedsService.list().then((ws) => {
      setWatersheds(ws);
      if (ws.length > 0) setActiveWatershedId(ws[0].watershedId);
    });
  }, []);

  function refreshSensors(watershedId: string) {
    setLoading(true);
    sensorsService.list(watershedId).then(setSensors).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!activeWatershedId) return;
    watershedsService.getVillages(activeWatershedId).then(setVillages);
    refreshSensors(activeWatershedId);
  }, [activeWatershedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.villageId || !form.lat || !form.lon) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminService.createSensor({
        sensorId: form.sensorId,
        villageId: form.villageId,
        sensorType: form.sensorType,
        lat: Number(form.lat),
        lon: Number(form.lon),
      });
      setForm({ sensorId: "", villageId: "", sensorType: "RAIN", lat: "", lon: "" });
      refreshSensors(activeWatershedId);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create sensor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white">Sensors</h1>

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
          placeholder="Sensor ID (e.g. SNS-RAIN-001)"
          value={form.sensorId}
          onChange={(e) => setForm({ ...form, sensorId: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <select
          required
          value={form.villageId}
          onChange={(e) => setForm({ ...form, villageId: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="" className="bg-[#12101f]">Select village</option>
          {villages.map((v) => (
            <option key={v.villageId} value={v.villageId} className="bg-[#12101f]">{v.name}</option>
          ))}
        </select>
        <select
          value={form.sensorType}
          onChange={(e) => setForm({ ...form, sensorType: e.target.value as CreateSensorInput["sensorType"] })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
        >
          {SENSOR_TYPES.map((t) => <option key={t} value={t} className="bg-[#12101f]">{t}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {error && <p className="sm:col-span-2 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a0714] disabled:opacity-40"
        >
          {submitting ? "Creating..." : "Register sensor"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        {loading && <p className="p-5 text-sm text-white/40">Loading...</p>}
        {!loading && sensors.length === 0 && <p className="p-5 text-sm text-white/40">No sensors in this watershed yet.</p>}
        {!loading &&
          sensors.map((s) => (
            <div key={s.sensorId} className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-sm last:border-0">
              <div>
                <p className="text-white">{s.sensorId}</p>
                <p className="text-xs text-white/40">{s.sensorType} · {s.villageId}</p>
              </div>
              <span className={`text-xs font-semibold ${s.status === "ONLINE" ? "text-emerald-400" : s.status === "STALE" ? "text-amber-400" : "text-white/30"}`}>
                {s.status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}