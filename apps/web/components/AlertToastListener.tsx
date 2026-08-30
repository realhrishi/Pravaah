// src/components/AlertToastListener.tsx
"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { RISK_CONFIG } from "@/lib/riskConfig";
import type { AlertNewPayload } from "@/types/socket";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function AlertToastListener() {
  const [toasts, setToasts] = useState<(AlertNewPayload & { toastId: number })[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("alert:broadcast", (payload: AlertNewPayload) => {
      const toastId = Date.now();
      setToasts((prev) => [...prev, { ...payload, toastId }]);
      if (payload.riskClass !== "CRITICAL") {
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.toastId !== toastId)), 8000);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  function dismiss(toastId: number) {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }

  return (
    <div className="fixed right-4 top-24 z-50 flex flex-col gap-3">
      {toasts.map((t) => {
        const config = RISK_CONFIG[t.riskClass];
        return (
          <div
            key={t.toastId}
            className="w-80 rounded-xl border p-4 shadow-xl backdrop-blur-md"
            style={{ borderColor: `${config.color}60`, backgroundColor: `${config.color}15` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: config.color }}>{config.label} — escalation</span>
              <button onClick={() => dismiss(t.toastId)} className="text-white/40 hover:text-white/70">✕</button>
            </div>
            {t.leadTimeMinutes != null && (
              <p className="mt-1 text-xs text-white/60">Estimated lead time: ~{Math.round(t.leadTimeMinutes)} min</p>
            )}
          </div>
        );
      })}
    </div>
  );
}