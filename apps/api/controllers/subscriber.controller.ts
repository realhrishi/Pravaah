
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database/client";
import type { SubscribeInput } from "../validators/subscriber.schema";

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { villageId, phone, channels } = req.body as SubscribeInput;

    const village = await prisma.village.findUnique({
      where: { villageId },
    });

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const existing = await prisma.subscriber.findUnique({
      where: {
        villageId_phone: { villageId, phone },
      },
    });

    const mergedChannels = Array.from(
      new Set([...(existing?.preferredChannel ?? []), ...channels])
    );

    const subscriber = await prisma.subscriber.upsert({
      where: {
        villageId_phone: { villageId, phone },
      },
      update: {
        preferredChannel: mergedChannels,
      },
      create: {
        villageId,
        phone,
        preferredChannel: channels,
      },
    });

    res.status(201).json({ success: true, data: subscriber });
  } catch (error) {
    next(error);
  }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { villageId, phone } = req.body as { villageId: string; phone: string };
    await prisma.subscriber.delete({ where: { villageId_phone: { villageId, phone } } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}