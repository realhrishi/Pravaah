// apps/api/src/lib/geo.ts
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPolygonCentroid(geo: any): { lat: number; lon: number } | null {
  if (!geo) return null;

  if (geo.type === "Point") {
    const [lon, lat] = geo.coordinates ?? [];
    if (lon === undefined || lat === undefined) return null;
    return { lat, lon };
  }

  if (geo.type === "Polygon") {
    const ring = geo.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length === 0) return null;

    const lat = ring.reduce((s: number, p: number[]) => s + (p[1] ?? 0), 0) / ring.length;
    const lon = ring.reduce((s: number, p: number[]) => s + (p[0] ?? 0), 0) / ring.length;
    return { lat, lon };
  }

  return null;
}