"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/auth";
import type { AuthUser } from "../types/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token"; // must match the key your axios interceptor reads

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    // token already attached automatically by the axios interceptor —
    // this call just validates it's still good and restores the user
    authService
      .me()
      .then(setUser)
      .catch(() => {
        // axios interceptor already clears the token + redirects on 401,
        // this catch just makes sure `loading` resolves either way
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = "/authority/login";
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}