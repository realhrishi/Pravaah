"use client";

import { useEffect, useState } from "react";
import { sensorsService, type SensorWithReading } from "@/services/sensors";

const POLL_INTERVAL_MS = 10_000;

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  ONLINE: { label: "Online", color: "#4ade80" },
  STALE: { label: "Stale", color: "#facc15" },
  OFFLINE: { label: "Offline", color: "#f87171" },
};

const SENSOR_TYPE_LABELS: Record<string, string> = {
  RAIN: "Rain",
  SOIL_MOISTURE: "Soil Moisture",
  WATER_LEVEL: "Water Level",
};

const SENSOR_UNITS: Record<string, string> = {
  RAIN: "mm",
  SOIL_MOISTURE: "%",
  WATER_LEVEL: "m",
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuthoritySensorsPage() {
  const [sensors, setSensors] = useState<SensorWithReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function fetchSensors() {
      sensorsService
        .list()
        .then((data) => {
          if (!cancelled) setSensors(data);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    fetchSensors(); // initial load
    const interval = setInterval(fetchSensors, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sensors</h1>
          <p className="mt-1 text-sm text-white/50">
            All monitored sensors across every watershed. Refreshes every 10s.
          </p>
        </div>
        <span className="text-xs text-white/30">{sensors.length} sensors</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Sensor ID</th>
              <th className="px-4 py-3 font-medium">Village</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last reading</th>
              <th className="px-4 py-3 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  Loading sensors...
                </td>
              </tr>
            )}
            {!loading && sensors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  No sensors registered yet.
                </td>
              </tr>
            )}
            {sensors.map((sensor) => {
              const status = STATUS_STYLES[sensor.status] ?? STATUS_STYLES.OFFLINE;
              const latest = sensor.readings?.[0];
              return (
                <tr key={sensor.sensorId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{sensor.sensorId}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {sensor.village?.name ?? sensor.villageId}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {SENSOR_TYPE_LABELS[sensor.sensorType] ?? sensor.sensorType}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: status.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {latest ? `${latest.value} ${SENSOR_UNITS[sensor.sensorType] ?? ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/40">{formatTime(sensor.lastSeen)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}