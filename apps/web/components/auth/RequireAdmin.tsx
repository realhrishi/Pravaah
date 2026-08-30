"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "./RequireAuth";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminCheck>{children}</AdminCheck>
    </RequireAuth>
  );
}

// Split out so this only runs its redirect logic once RequireAuth has
// already confirmed `user` exists — avoids a race where isAdmin is
// checked against a still-null user during the initial /me fetch.
function AdminCheck({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/authority/dashboard?error=admin_required");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0714]">
        <p className="text-sm text-white/40">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0714]">
        <p className="text-sm text-rose-400">Admin access required. Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}