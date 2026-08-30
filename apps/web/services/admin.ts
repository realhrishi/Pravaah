import api from "../lib/api";

export interface CreateAuthorityInput {
  email: string;
  password: string;
  name: string;
  role?: "AUTHORITY" | "ADMIN";
}

export interface CreateSensorInput {
  sensorId: string;
  villageId: string;
  sensorType: "RAIN" | "SOIL_MOISTURE" | "WATER_LEVEL";
  lat: number;
  lon: number;
}

export interface CreateShelterInput {
  shelterId: string;
  watershedId: string;
  name: string;
  lat: number;
  lon: number;
  capacity?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "AUTHORITY" | "ADMIN";
  createdAt: string;
}

export interface AdminSensor {
  sensorId: string;
  villageId: string;
  sensorType: string;
  lat: number;
  lon: number;
  status: string;
}

export interface AdminShelter {
  shelterId: string;
  watershedId: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number | null;
}

export const adminService = {
  createAuthority: (input: CreateAuthorityInput) =>
    api.post<{ data: AdminUser }>("/admin/authorities", input).then((r) => r.data.data),

  createSensor: (input: CreateSensorInput) =>
    api.post<{ data: AdminSensor }>("/admin/sensors", input).then((r) => r.data.data),

  createShelter: (input: CreateShelterInput) =>
    api.post<{ data: AdminShelter }>("/admin/shelters", input).then((r) => r.data.data),
  listAuthorities: () => api.get<{ data: AdminUser[] }>("/admin/authorities").then((r) => r.data.data),
};