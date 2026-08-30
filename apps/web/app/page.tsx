"use client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import GradientWaves from "@/components/GradientWaves";
import RiskStateCycle from "@/components/RiskStateCycle";
import PipelineDiagram from "@/components/PipelineDiagram";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0714]">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 h-full w-full">
          <GradientWaves
            horizonColor="#5227FF"
            waveColor="#FF9FFC"
            crestColor="#FFFFFF"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
          <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-[#0d0a1a] to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
  

          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            The river tells you
            <br />
            before it arrives.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-white/70">
            PRAVAAH watches rainfall, terrain, and river sensors together —
            turning hours of warning into minutes your village can actually use.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/map"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0a0714] transition-transform hover:scale-[1.02]"
            >
              View Live Risk Map
            </Link>
            <Link
              href="/authority/login"
              className="rounded-full bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              For Authorities
            </Link>
          </div>

          <div className="mt-16 flex gap-10 text-white/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">15 min</div>
              <div className="text-xs uppercase tracking-wide">
                avg. lead time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs uppercase tracking-wide">monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Live</div>
              <div className="text-xs uppercase tracking-wide">
                village status
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* PROBLEM CONTEXT — national scope, real cited numbers */}
      <section className="relative z-20 bg-[#0d0a1a] px-6 py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-100 w-full -translate-y-full bg-gradient-to-t from-[#0d0a1a] to-transparent" />
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            Not another weather dashboard. A last-mile decision layer.
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            PRAVAAH doesn't replace IMD, CWC, or NDMA — it fuses their signals
            with terrain and local sensors to answer the one question a village
            dashboard can't: how many minutes do you actually have.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                01 — FUSE
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Multi-source monitoring
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Rainfall, terrain slope, historical flood records, and live
                sensor readings are combined for every village — not treated as
                separate feeds.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">
                02 — PREDICT
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Actionable lead time
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Not just "high risk" — an estimated number of minutes before the
                water arrives, weighed against how long evacuation actually
                takes.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-400">03 — ALERT</p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                Event-driven, not fixed-interval
              </h3>
              <p className="mt-2 text-sm text-white/60">
                A sensor threshold crossing triggers an immediate re-check — the
                system doesn't wait on a timer while conditions worsen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
            Why This Matters
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            This isn't one district's problem. It's every hilly state's.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-bold text-white">87,474</div>
              <p className="mt-2 text-sm text-white/60">
                active landslide zones across 179 districts in 19 Indian states
                and union territories.{" "}
                <span className="text-white/30">— GSI, 2025</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-bold text-white">12.6%</div>
              <p className="mt-2 text-sm text-white/60">
                of India's land area is landslide-prone — spanning the
                Himalayas, Northeast hill ranges, and Western Ghats alike.{" "}
                <span className="text-white/30">— GSI</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-bold text-white">80–100</div>
              <p className="mt-2 text-sm text-white/60">
                new landslide zones identified every single monsoon season in
                Uttarakhand alone — the terrain itself keeps shifting.{" "}
                <span className="text-white/30">— GSI, 2025</span>
              </p>
            </div>
          </div>

          <p className="mt-10 max-w-2xl text-sm text-white/50">
            Sikkim, Uttarakhand, Himachal Pradesh, and Arunachal Pradesh each
            have over 40% of their area classified as highly susceptible — a
            national pattern, not a regional one.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-20">
  <div className="mx-auto max-w-3xl text-center">
    <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
      System Architecture
    </p>
    <h2 className="mt-3 text-2xl font-bold text-white">
      From a rain gauge to a village alert, in one pipeline.
    </h2>
    <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/40">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#8b7dfb]" /> Processing
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Citizen path
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-rose-400" /> Alert path
      </span>
    </div>
    <div className="mt-10">
      <PipelineDiagram />
    </div>
  </div>
</section>

      {/* PIPELINE */}
      {/* PIPELINE — replaces the generic numbered-circle section */}
      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
            The Escalation Model
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Every village sits in one of four states, live.
          </h2>
          <div className="mt-14">
            <RiskStateCycle />
          </div>
        </div>
      </section>

      {/* PIPELINE — real system architecture, not a generic diagram */}


      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
        PRAVAAH — Smart India Hackathon 2026 · SIH26192
      </footer>
    </main>
  );
}
