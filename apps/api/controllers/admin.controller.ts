import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database/client";
import { hashPassword } from "../lib/hash";
import type {
  CreateAuthorityInput,
  CreateSensorInput,
  CreateShelterInput,
} from "../validators/admin.schema";

export async function createAuthority(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name, role } = req.body as CreateAuthorityInput;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function createSensor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { sensorId, villageId, sensorType, lat, lon } = req.body as CreateSensorInput;

    const village = await prisma.village.findUnique({ where: { villageId } });
    if (!village) {
      return res.status(404).json({ success: false, message: "Village not found" });
    }

    const existing = await prisma.sensor.findUnique({ where: { sensorId } });
    if (existing) {
      return res.status(409).json({ success: false, message: "sensorId already exists" });
    }

    const sensor = await prisma.sensor.create({
      data: { sensorId, villageId, sensorType, lat, lon, status: "OFFLINE" },
    });

    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    next(error);
  }
}

export async function createShelter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shelterId, watershedId, name, lat, lon, capacity } =
      req.body as CreateShelterInput;

    const watershed = await prisma.watershed.findUnique({ where: { watershedId } });
    if (!watershed) {
      return res.status(404).json({ success: false, message: "Watershed not found" });
    }

    const existing = await prisma.shelter.findUnique({ where: { shelterId } });
    if (existing) {
      return res.status(409).json({ success: false, message: "shelterId already exists" });
    }

    const shelter = await prisma.shelter.create({
      data: { shelterId, watershedId, name, lat, lon, capacity },
    });

    res.status(201).json({ success: true, data: shelter });
  } catch (error) {
    next(error);
  }
}

export async function listAuthorities(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}