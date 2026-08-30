import api from "../lib/api";

export const riskService = {
  simulate: (villageId: string) =>
    api.post<{ data: { villageId: string } }>("/risk/simulate", { villageId }).then((r) => r.data.data),
};