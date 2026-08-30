import api from "../lib/api";
import type { AuthUser } from "../types/api";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: (email: string, password: string) =>
    api
      .post<{ success: boolean; data: LoginResponse }>("/auth/login", { email, password })
      .then((r) => r.data.data),

  me: () =>
    api
      .get<{ success: boolean; data: AuthUser }>("/auth/me")
      .then((r) => r.data.data),
};