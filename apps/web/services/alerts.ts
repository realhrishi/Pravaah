import api from "../lib/api";
import type { Alert } from "../types/api";

export const alertsService = {
  list: () => api.get<{ data: Alert[] }>("/alerts").then((r) => r.data.data),
  get: (id: number) =>
    api.get<{ data: Alert }>(`/alerts/${id}`).then((r) => r.data.data),
  acknowledge: (id: number) =>
    api
      .post<{ data: Alert }>(`/alerts/${id}/acknowledge`)
      .then((r) => r.data.data),
  dispatch: (id: number) =>
    api
      .post<{ data: Alert }>(`/alerts/${id}/dispatch`)
      .then((r) => r.data.data),
};
