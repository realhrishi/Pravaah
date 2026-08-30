"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, Tooltip, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { Village } from "@/types/api";
import type { ShelterRouteResult } from "@/services/villages";

interface VillageMapProps {
  villages: Village[];
  userLocation?: [number, number] | null;
  onVillageClick?: (villageId: string) => void;
  mode: "risk" | "shelter";
  shelterRoute?: ShelterRouteResult | null;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

function FitToRoute({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [40, 40] });
  }, [coords, map]);
  return null;
}

export function VillageMap({
  villages,
  userLocation,
  onVillageClick,
  mode,
  shelterRoute,
  center = [30.09, 79.42],
  zoom = 13,
  height = "100%",
}: VillageMapProps) {
  const lineCoords: [number, number][] | null =
    mode === "shelter" && shelterRoute
      ? (shelterRoute.routeGeoJson?.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]) ?? [
          [shelterRoute.origin.lat, shelterRoute.origin.lon],
          [shelterRoute.shelter.lat, shelterRoute.shelter.lon],
        ])
      : null;

  return (
    <MapContainer center={userLocation ?? center} zoom={zoom} style={{ height, width: "100%" }}>
      {/* Plain OSM tiles — free, no key, and already light-themed */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

      {mode === "risk" && (
        <>
          {userLocation && (
            <CircleMarker center={userLocation} radius={7} pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 1, weight: 3 }}>
              <Popup>Your location</Popup>
            </CircleMarker>
          )}
          {villages.map((village) => {
            const geo = village.boundaryGeoJson as any;
            if (!geo) return null;
            const riskClass = village.currentRisk?.riskClass ?? "GREEN";
            const config = RISK_CONFIG[riskClass];
            const label = (
              <Tooltip permanent direction="center" className="village-label">
                {village.name}
              </Tooltip>
            );
            const popup = (
              <Popup>
                <div className="text-sm">
                  <strong>{village.name}</strong>
                  <br />
                  {config.label}
                  {village.currentRisk && (
                    <>
                      <br />
                      Probability: {(village.currentRisk.probability * 100).toFixed(0)}%
                    </>
                  )}
                </div>
              </Popup>
            );

            if (geo.type === "Polygon") {
              const positions = geo.coordinates[0].map(([lon, lat]: number[]) => [lat, lon] as [number, number]);
              return (
                <Polygon
                  key={village.villageId}
                  positions={positions}
                  pathOptions={{ color: config.color, fillColor: config.color, fillOpacity: 0.35, weight: 2 }}
                  eventHandlers={{ click: () => onVillageClick?.(village.villageId) }}
                >
                  {label}
                  {popup}
                </Polygon>
              );
            }
            if (geo.type === "Point") {
              const [lon, lat] = geo.coordinates;
              return (
                <CircleMarker
                  key={village.villageId}
                  center={[lat, lon]}
                  radius={10}
                  pathOptions={{ color: config.color, fillColor: config.color, fillOpacity: 0.7, weight: 2 }}
                  eventHandlers={{ click: () => onVillageClick?.(village.villageId) }}
                >
                  {label}
                  {popup}
                </CircleMarker>
              );
            }
            return null;
          })}
        </>
      )}

      {mode === "shelter" && shelterRoute && (
        <>
          <CircleMarker
            center={[shelterRoute.origin.lat, shelterRoute.origin.lon]}
            radius={8}
            pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 1 }}
          />
          <CircleMarker
            center={[shelterRoute.shelter.lat, shelterRoute.shelter.lon]}
            radius={10}
            pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top">{shelterRoute.shelter.name}</Tooltip>
          </CircleMarker>
          {lineCoords && <Polyline positions={lineCoords} pathOptions={{ color: "#16a34a", weight: 4 }} />}
          {lineCoords && <FitToRoute coords={lineCoords} />}
        </>
      )}
    </MapContainer>
  );
}