import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import teamData from "@/data/team.json";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import {
  Cpu,
  Layers,
  Radio,
  Clock,
  ShieldAlert,
  ArrowRight,
  Database,
  MapPin,
  Flame,
  CheckCircle2,
  FileCode2,
  Compass,
  Zap,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  contribution: string;
  image?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
}

export const metadata = {
  title: "About Pravaah — Team & Mission | Flash Flood Early Warning",
  description:
    "Learn about Pravaah, our mission for Smart India Hackathon 2026, and meet the builders behind the AI and IoT flash flood warning system.",
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-purple-600 to-pink-600",
  "from-emerald-600 to-teal-600",
  "from-amber-600 to-orange-600",
  "from-rose-600 to-red-600",
  "from-cyan-600 to-blue-600",
];

export default function AboutPage() {
  const members: TeamMember[] = teamData;

  return (
    <main className="min-h-screen bg-[#0a0714] text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:pt-36">
        {/* Glow backdrop effects */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-300">
            <Flame className="h-3.5 w-3.5 text-indigo-400" />
            Smart India Hackathon 2026 · Problem Statement SIH26192
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Minutes that turn panic into{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              preparedness.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
            <strong className="font-semibold text-white">
              PRAVAAH (प्रवाह)
            </strong>{" "}
            is an AI-driven, IoT-fused early warning and evacuation decision
            platform engineered specifically for the fast-flowing mountain
            catchments of India's hilly terrains.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0a0714] transition-all hover:bg-white/90 hover:scale-[1.02]"
            >
              <Compass className="h-4 w-4" />
              Explore Live Risk Map
            </Link>
            <Link
              href="/DosDonts"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              Flash Flood Do&apos;s &amp; Don&apos;ts
            </Link>
          </div>
        </div>
      </section>

      {/* THE PROBLEM & PURPOSE */}
      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                The Ground Reality
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Why generic weather forecasts fail in Indian hill villages
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70 sm:text-base">
                <p>
                  In the plains, floodwaters rise gradually over days, giving
                  authorities ample time to broadcast evacuation orders. But in
                  the steep gorges of Uttarakhand, Himachal Pradesh, Sikkim, and
                  the Western Ghats, flash floods triggered by cloudbursts or
                  glacial breaches unleash destructive torrents in just{" "}
                  <span className="font-semibold text-white">
                    15 to 30 minutes
                  </span>
                  .
                </p>
                <p>
                  Traditional meteorological reports issue district-wide alerts
                  covering thousands of square kilometers. By the time a village
                  sarpanch or citizen realizes that their specific tributary has
                  swelled beyond its banks, the evacuation route is already
                  severed.
                </p>
                <p>
                  <strong className="text-white">Pravaah</strong> bridges this
                  life-or-death gap. We don&apos;t just predict rainfall; we
                  fuse upstream river sensor telemetry, digital elevation models
                  (DEM), and hydrological velocity modeling to answer the single
                  question a village needs:{" "}
                  <em className="text-indigo-300">
                    &ldquo;How many minutes do we have, and which shelter is
                    safe to reach?&rdquo;
                  </em>
                </p>
              </div>
            </div>

            {/* Real Stats Grid */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-white">
                    87,474
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300">
                    High Vulnerability
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Active landslide and flash flood zones across 179 districts in
                  19 Indian states.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Source: Geological Survey of India (GSI)
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-amber-400">
                    12.6%
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    Terrain Exposure
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Of India&apos;s land area is susceptible to rapid slope runoff
                  and cloudburst inundations.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Source: NDMA &amp; National Disaster Records
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    15 min
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    Target Lead Time
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Pravaah calculates dynamic lead time to allow orderly
                  evacuation to concrete shelters before river crest arrival.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Calibrated for rural hill walking speeds
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* MEET THE BUILDERS SECTION */}
      <section
        id="team"
        className="border-t border-white/10  px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Meet Team Binary Bandits
              </h2>
            </div>
          </div>

          {/* Builder Cards Grid */}
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => {
              const gradient = GRADIENTS[index % GRADIENTS.length];
              const initials = getInitials(member.name);

              return (
                <div
                  key={member.id || index}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="flex h-full flex-col">
                    {/* Header: Avatar + Social links */}
                    <div className="flex items-start justify-between gap-4">
                      {member.image ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-md">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-bold text-white shadow-lg ring-2 ring-white/15`}
                        >
                          {initials}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} GitHub`}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                        )}

                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} LinkedIn`}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white"
                          >
                            <LinkedinIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="mt-5 min-h-[52px]">
                      <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300">
                        {member.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        {member.role}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="mt-3 min-h-[44px] text-sm leading-relaxed text-white/70">
                      {member.bio}
                    </p>

                    {/* Contribution pushed to bottom */}
                    <div className="mt-auto pt-4">
                      <div className="flex min-h-[110px] flex-col justify-start rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-3.5">
                        <p className="text-xs font-semibold text-indigo-300">
                          Key Contribution:
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-white/80">
                          {member.contribution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GitHub Repository Banner */}
          <div className="mt-14 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-indigo-950/30 p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  Visit Github Repository for Source Code
                </p>
              </div>
            </div>
            <Link
              href="https://github.com/realhrishi/Pravaah"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 hover:border-white/40 sm:mt-0"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              Visit Repository
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
        PRAVAAH — Smart India Hackathon 2026 · Problem Statement SIH26192
      </footer>
    </main>
  );
}
