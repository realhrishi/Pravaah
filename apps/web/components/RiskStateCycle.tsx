// apps/web/src/components/RiskStateCycle.tsx
"use client";

import { useEffect, useState } from "react";

const STATES = [
  {
    key: "GREEN",
    label: "Green",
    desc: "Baseline monitoring, 15-min cycle",
    border: "border-emerald-400/60",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    line: "#34d399",
  },
  {
    key: "WATCH",
    label: "Watch",
    desc: "Cadence tightens to 5 min",
    border: "border-amber-400/60",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    line: "#fbbf24",
  },
  {
    key: "WARNING",
    label: "Warning",
    desc: "Sensor threshold, instant re-check",
    border: "border-orange-400/60",
    bg: "bg-orange-400/10",
    text: "text-orange-400",
    line: "#fb923c",
  },
  {
    key: "CRITICAL",
    label: "Critical",
    desc: "Alert dispatched, lead time shown",
    border: "border-rose-400/60",
    bg: "bg-rose-400/10",
    text: "text-rose-400",
    line: "#f43f5e",
  },
] as const;

const CYCLE_MS = 2400;

export default function RiskStateCycle() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % STATES.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl items-stretch">
      {STATES.map((state, i) => {
        const isActive = i === active;
        const isPast = i < active;
        const isLive = isActive || isPast;

        return (
          <div key={state.key} className="flex flex-1 items-center">
            <div
              className={[
                "flex-1 rounded-2xl border px-4 py-4 text-left transition-all duration-500",
                isActive
                  ? `${state.border} ${state.bg} scale-[1.03]`
                  : "border-white/10 bg-white/[0.02]",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "h-2 w-2 rounded-full transition-colors duration-500",
                    isLive ? state.bg.replace("/10", "") : "bg-white/15",
                  ].join(" ")}
                  style={isLive ? { backgroundColor: state.line } : undefined}
                />
                <span
                  className={[
                    "text-sm font-semibold uppercase tracking-wide transition-colors duration-500",
                    isLive ? state.text : "text-white/30",
                  ].join(" ")}
                >
                  {state.label}
                </span>
              </div>
              <p
                className={[
                  "mt-2 text-xs leading-snug transition-colors duration-500",
                  isActive ? "text-white/70" : "text-white/30",
                ].join(" ")}
              >
                {state.desc}
              </p>
            </div>

            {i < STATES.length - 1 && (
              <div className="relative mx-2 h-px w-8 flex-shrink-0 bg-white/10 sm:w-12">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{
                    width: isPast ? "100%" : "0%",
                    backgroundColor: state.line,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}