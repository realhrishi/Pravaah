// src/context/VillageContext.tsx
"use client";

import { createContext, useContext } from "react";
import type { Village } from "@/types/api";

export const VillageContext = createContext<Village | null>(null);
export const useVillage = () => useContext(VillageContext);