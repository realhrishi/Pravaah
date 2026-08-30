
import api from "@/lib/api";

export const subscribersService = {
  subscribe: (payload: { villageId: string; phone: string; channels: ("WHATSAPP" | "SMS")[] }) =>
  api.post("/subscribers", payload).then((r) => r.data.data),
  unsubscribe: (payload: { villageId: string; phone: string }) =>
    api.delete("/subscribers", { data: payload }).then((r) => r.data),
};