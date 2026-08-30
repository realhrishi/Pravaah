import { z } from "zod";

export const createAuthoritySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["AUTHORITY", "ADMIN"]).default("AUTHORITY"),
});

export const createSensorSchema = z.object({
  sensorId: z.string().min(1, "sensorId is required"),
  villageId: z.string().min(1, "villageId is required"),
  sensorType: z.enum(["RAIN", "SOIL_MOISTURE", "WATER_LEVEL"]),
  lat: z.number(),
  lon: z.number(),
});

export const createShelterSchema = z.object({
  shelterId: z.string().min(1, "shelterId is required"),
  watershedId: z.string().min(1, "watershedId is required"),
  name: z.string().min(1, "Name is required"),
  lat: z.number(),
  lon: z.number(),
  capacity: z.number().int().positive().optional(),
});

export type CreateAuthorityInput = z.infer<typeof createAuthoritySchema>;
export type CreateSensorInput = z.infer<typeof createSensorSchema>;
export type CreateShelterInput = z.infer<typeof createShelterSchema>;