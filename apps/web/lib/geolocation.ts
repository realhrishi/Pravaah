import type { Village } from "@/types/api";

export const NO_MATCH_THRESHOLD_KM = 15

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getVillageCentroid(village: Village): [number, number] | null {
  const geo = village.boundaryGeoJson as any;
  if (!geo) return null;

  if (geo.type === "Point") {
    const [lon, lat] = geo.coordinates;
    return [lat, lon];
  }

  if (geo.type === "Polygon") {
    const ring = geo.coordinates[0];
    const lat = ring.reduce((sum: number, p: number[]) => sum + p[1], 0) / ring.length;
    const lon = ring.reduce((sum: number, p: number[]) => sum + p[0], 0) / ring.length;
    return [lat, lon];
  }

  return null;
}

export function findNearestVillage(
  userLat: number,
  userLon: number,
  villages: Village[],
): { village: Village; distanceKm: number } | null {
  let nearest: { village: Village; distanceKm: number } | null = null;

  for (const village of villages) {
    const centroid = getVillageCentroid(village);
    if (!centroid) continue;
    const distanceKm = haversineDistance(userLat, userLon, centroid[0], centroid[1]);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { village, distanceKm };
    }
  }

  return nearest;
}

const STORAGE_KEY = "pravaah_selected_village";

export function saveSelectedVillage(villageId: string) {
  localStorage.setItem(STORAGE_KEY, villageId);
}

export function getSavedVillage(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
