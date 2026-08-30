// src/components/map/EvacuationRoute.tsx — rewritten to hit the real endpoint
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { villagesService, type ShelterRouteResult } from "@/services/villages";
import type { Village } from "@/types/api";

interface EvacuationRouteProps {
  village: Village;
  userLocation: [number, number] | null;
}

export function EvacuationRoute({ village, userLocation }: EvacuationRouteProps) {
  const [route, setRoute] = useState<ShelterRouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    villagesService
      .getShelterRoute(village.villageId, userLocation?.[0], userLocation?.[1])
      .then(setRoute)
      .catch(() => setRoute(null))
      .finally(() => setLoading(false));
  }, [village.villageId, userLocation]);

  if (loading) return <div className="flex h-48 items-center justify-center text-sm text-white/40">Finding route...</div>;
  if (!route) return <div className="flex h-48 items-center justify-center text-sm text-white/40">No shelter route available.</div>;

  const shelterPos: [number, number] = [route.shelter.lat, route.shelter.lon];
  const originPos: [number, number] = [route.origin.lat, route.origin.lon];
  const lineCoords: [number, number][] =
    route.routeGeoJson?.coordinates.map(([lon, lat]) => [lat, lon]) ?? [originPos, shelterPos];

  return (
    <div className="overflow-hidden rounded-2xl">
      <MapContainer center={originPos} zoom={14} style={{ height: "220px", width: "100%" }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OSM &copy; CARTO" />
        <CircleMarker center={originPos} radius={8} pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.9 }} />
        <CircleMarker center={shelterPos} radius={10} pathOptions={{ color: "#4ADE80", fillColor: "#4ADE80", fillOpacity: 0.9 }} />
        <Polyline
          positions={lineCoords}
          pathOptions={{ color: "#4ADE80", weight: 4, dashArray: route.routeGeoJson ? undefined : "6 6" }}
        />
      </MapContainer>
      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
        <span>{route.shelter.name}</span>
        <span>{route.distanceKm} km{route.durationMin ? ` · ~${Math.round(route.durationMin)} min` : ""}</span>
      </div>
    </div>
  );
}