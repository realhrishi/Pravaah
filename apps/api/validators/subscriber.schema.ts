import { z } from "zod";

export const subscribeSchema = z.object({
  villageId: z.string().min(1),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  channels: z
    .array(z.enum(["WHATSAPP", "SMS"]))
    .min(1, "Pick at least one channel"),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
