import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database/client";
import { enqueueDispatch } from "@repo/redis/queue";

export async function getAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        village: true,
        shelter: true,
        acknowledgedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
}

export async function getAlert(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid alert ID" });

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        village: true,
        shelter: true,
        acknowledgedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeAlert(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid alert ID" });

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedById: req.user!.userId,
        acknowledgedAt: new Date(),
      },
      include: {
        village: true,
        shelter: true,
        acknowledgedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
}


export async function dispatchAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await enqueueDispatch(id);
    res.status(200).json({ success: true, message: "Dispatch enqueued" });
  } catch (error) {
    next(error);
  }
}