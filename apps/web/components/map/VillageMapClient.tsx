"use client";

import dynamic from "next/dynamic";

// Leaflet reaches for `window` at import time — must be client-only,
// loaded dynamically so Next.js never tries to render it on the server.
export const VillageMapClient = dynamic(
  () => import("./VillageMap").then((mod) => mod.VillageMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-ops-muted">Loading map...</div> },
);
