// apps/api/src/controllers/shelter.controller.ts
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database/client";
import { haversineDistance, getPolygonCentroid } from "../lib/geo";

const OSRM_URL = process.env.OSRM_URL || "https://router.project-osrm.org";

export async function getNearestShelterRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const villageId = req.params.id as string;
    const { lat, lon } = req.query as { lat?: string; lon?: string };

    const village = await prisma.village.findUnique({ where: { villageId } });
    if (!village)
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });

    // Prefer the user's actual GPS position as the route start (Google-Maps-style
    // "directions from here") — fall back to the village centroid if location was denied.
    const origin =
      lat && lon
        ? { lat: Number(lat), lon: Number(lon) }
        : getPolygonCentroid(village.boundaryGeoJson);
    if (!origin)
      return res
        .status(422)
        .json({ success: false, message: "No usable location" });

    const shelters = await prisma.shelter.findMany({
      where: { watershedId: village.watershedId },
    });
    if (shelters.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No shelters registered for this watershed",
        });
    }

    const firstShelter = shelters[0];
    if (!firstShelter) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No shelters registered for this watershed",
        });
    }

    const nearest = shelters.reduce(
      (best, s) => {
        const d = haversineDistance(origin.lat, origin.lon, s.lat, s.lon);
        return d < best.dist ? { shelter: s, dist: d } : best;
      },
      {
        shelter: firstShelter,
        dist: haversineDistance(
          origin.lat,
          origin.lon,
          firstShelter.lat,
          firstShelter.lon,
        ),
      },
    );

    let routeGeoJson = null;
    let distanceKm = nearest.dist;
    let durationMin: number | null = null;

    try {
      const osrmRes = await fetch(
        `${OSRM_URL}/route/v1/driving/${origin.lon},${origin.lat};${nearest.shelter.lon},${nearest.shelter.lat}?overview=full&geometries=geojson`,
      );
      const data = await osrmRes.json() as { routes?: Array<{ geometry: unknown; distance: number; duration: number }> };
      const route = data.routes?.[0];
      if (route) {
        routeGeoJson = route.geometry;
        distanceKm = route.distance / 1000;
        durationMin = route.duration / 60;
      }
    } catch (err) {
      console.warn(
        "[shelter] OSRM unreachable, using straight-line fallback:",
        err,
      );
    }

    res.status(200).json({
      success: true,
      data: {
        shelter: nearest.shelter,
        origin,
        distanceKm: Number(distanceKm.toFixed(2)),
        durationMin: durationMin ? Number(durationMin.toFixed(1)) : null,
        routeGeoJson,
      },
    });
  } catch (error) {
    next(error);
  }
}
