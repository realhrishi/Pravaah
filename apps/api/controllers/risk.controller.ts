import type { Request, Response, NextFunction } from "express";
import { enqueueManualInference } from "@repo/redis/queue";
import { z } from "zod";

const simulateSchema = z.object({
  villageId: z.string().min(1),
});

export async function simulateRisk(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { villageId } = req.body as z.infer<typeof simulateSchema>;
    await enqueueManualInference(villageId, "MANUAL");
    res.status(200).json({ success: true, message: "Simulation job enqueued", villageId });
  } catch (error) {
    next(error);
  }
}

export { simulateSchema };