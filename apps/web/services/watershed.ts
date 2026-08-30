import api from "../lib/api";
import type { Watershed, Village } from "../types/api";

export const watershedsService = {
  list: () => api.get<{ success: boolean; data: Watershed[] }>("/watersheds").then((r) => r.data.data),
  get: (id: string) =>
    api.get<{ success: boolean; data: Watershed }>(`/watersheds/${id}`).then((r) => r.data.data),
  getVillages: (id: string) =>
    api.get<{ success: boolean; data: Village[] }>(`/watersheds/${id}/villages`).then((r) => r.data.data),
  getSummary: (id: string) =>
    api
      .get<{ success: boolean; data: { watershedId: string; totalVillages: number; villagesWithData: number; highestRiskClass: string } }>(
        `/watersheds/${id}/summary`,
      )
      .then((r) => r.data.data),
};