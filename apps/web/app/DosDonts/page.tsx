"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { YoutubeIcon } from "@/components/icons/BrandIcons";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  ShieldCheck,
  Droplets,
  Zap,
  Car,
  Home,
  Mountain,
  HeartPulse,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertOctagon,
  Radio,
  FileText,
  LifeBuoy,
} from "lucide-react";

interface GuideItem {
  id: string;
  category: "during" | "before" | "after" | "mountain";
  title: string;
  description: string;
  officialRationale: string;
  iconType: "shield" | "water" | "car" | "zap" | "home" | "mountain" | "health";
}

const EMERGENCY_HELPLINES = [
  { number: "112", label: "National Emergency (Police, Fire, Ambulance)", badge: "Unified All-India" },
  { number: "1070", label: "State Disaster Management Control Room", badge: "State SDMA" },
  { number: "1077", label: "District Disaster Control Room (DDMA)", badge: "District Collectorate" },
  { number: "1078", label: "NDMA National Control Room (New Delhi)", badge: "NDMA GoI" },
  { number: "108", label: "Disaster Emergency Ambulance Service", badge: "Medical" },
];

const OFFICIAL_DOS: GuideItem[] = [
  {
    id: "do-1",
    category: "during",
    title: "Seek Immediate Higher Ground on Solid Terrain",
    description:
      "Move immediately uphill away from riverbeds, streams, and gullies. In hilly regions, climb at least 30 to 50 meters above the high-water line onto stable bedrock slopes.",
    officialRationale:
      "NDMA Protocol: Flash flood crests travel at 15–30 km/h in steep mountain valleys, carrying heavy sediment and uprooted trees that obliterate banks.",
    iconType: "mountain",
  },
  {
    id: "do-2",
    category: "during",
    title: "Shut Off Main Power Switch & LPG Gas Cylinders",
    description:
      "If you have even 60 seconds before evacuating, switch off the main electrical MCB/breaker and tightly turn off the LPG regulator valve at the cylinder.",
    officialRationale:
      "SDRF Safety SOP: Prevents high-voltage electrical back-feed, water-conduction electrocution, and explosive gas leaks when structures are impacted.",
    iconType: "zap",
  },
  {
    id: "do-3",
    category: "during",
    title: "If Trapped in a Multi-Storey Building, Climb to the Highest Floor",
    description:
      "Take your emergency Go-Bag, warm clothing, and a high-decibel whistle. Signal for help using a bright torch or high-visibility cloth from an open window or roof.",
    officialRationale:
      "NDRF SOP: Never enter an enclosed attic without a clear roof-escape hatch. Rising floodwaters can submerge the attic ceiling, trapping occupants.",
    iconType: "home",
  },
  {
    id: "do-4",
    category: "during",
    title: "Carry a Whistle & Flashlight for Acoustic & Visual Signaling",
    description:
      "Shouting in heavy rain and roaring torrents exhausts vocal cords within 10 minutes. A high-frequency whistle sound carries over 500 meters through torrential rain noise.",
    officialRationale:
      "NDRF Search & Rescue: Rescuers use acoustic listening devices. Three sharp whistle blasts is the international distress signal.",
    iconType: "shield",
  },
  {
    id: "do-5",
    category: "before",
    title: "Prepare a 72-Hour Waterproof 'Go-Bag' (आपदा किट)",
    description:
      "Keep a waterproof pouch containing original/photocopies of Aadhaar cards, land records, bank passbooks, 3-day dry rations (chana, gur, sattu), chlorine tablets, and vital prescription medicines.",
    officialRationale:
      "NDMA Family Disaster Plan: In flash floods, you will have less than 5 minutes to vacate. Having documents and medicine pre-packed prevents catastrophic delays.",
    iconType: "shield",
  },
  {
    id: "do-6",
    category: "before",
    title: "Identify & Walk Your Village Evacuation Route in Daylight",
    description:
      "Pre-identify the designated safe concrete shelter or school located on elevated ground. Verify which footbridges and gullies are prone to washing away.",
    officialRationale:
      "Disaster Management Authority Guideline: Evacuations during flash floods often occur in total darkness or heavy downpours with zero visibility.",
    iconType: "mountain",
  },
  {
    id: "do-7",
    category: "before",
    title: "Monitor IMD Radar & Pravaah Live Alerts During Red/Orange Warnings",
    description:
      "Pay strict attention to IMD 'Nowcasts' and Pravaah village risk escalations (Watch -> Warning -> Critical). Charge phones and battery power banks in advance.",
    officialRationale:
      "IMD Flash Flood Guidance Services (FFGS): Mountain catchments with over 50mm rainfall in 1 hour have a 90%+ probability of sudden torrent surges.",
    iconType: "water",
  },
  {
    id: "do-8",
    category: "after",
    title: "Boil Drinking Water Vigorously for at Least 3 Minutes",
    description:
      "Assume all tap water, tube-wells, open step-wells (baolis), and springs are biologically and chemically contaminated with sewage and silt.",
    officialRationale:
      "Ministry of Health & Family Welfare (MoHFW): Cholera, Leptospirosis, and Hepatitis A outbreaks peak within 48 to 72 hours following flood subsidence.",
    iconType: "health",
  },
  {
    id: "do-9",
    category: "after",
    title: "Inspect Buildings for Structural Cracks Before Entering",
    description:
      "Check foundations, retaining walls, and soil subsidence around your home. Wear thick-soled leather boots and work gloves when clearing debris.",
    officialRationale:
      "CPWD / NDMA Structural Safety: Floodwaters erode soil support beneath foundation plinths, causing sudden collapse hours after waters recede.",
    iconType: "home",
  },
  {
    id: "do-10",
    category: "after",
    title: "Use a Long Stick to Probe for Snakes and Scorpions",
    description:
      "Displaced reptiles (especially Indian Cobras, Common Kraits, and Russell's Vipers) seek dry refuge inside cupboards, rolled mattresses, and dark roof rafters.",
    officialRationale:
      "National Snakebite Initiative / NDRF: Snakebite incidents increase by over 300% in flood-affected rural blocks during cleanup operations.",
    iconType: "health",
  },
  {
    id: "do-11",
    category: "mountain",
    title: "Watch for Sudden River Discoloration & Roaring Sounds",
    description:
      "If a clear mountain river turns into a thick, muddy chocolate-brown torrent with floating timber, or if you hear a low rumble like a freight train upstream, evacuate immediately.",
    officialRationale:
      "GSI & CWC Mountain Protocol: Indicates a temporary natural landslide dam has formed upstream and is now breaching, releasing a catastrophic flash wave.",
    iconType: "mountain",
  },
  {
    id: "do-12",
    category: "mountain",
    title: "Unchain Livestock & Release Animals to Open Higher Pastures",
    description:
      "If an orange/red alert is sounded, un-tether cattle, goats, and pets. Animals have acute natural survival instincts and will naturally climb higher rocky terrain if untied.",
    officialRationale:
      "NDMA Animal Welfare in Disasters: Over 60% of rural livestock mortality during flash floods is due to animals being tied in low-lying sheds and sheds collapsing.",
    iconType: "shield",
  },
];

const OFFICIAL_DONTS: GuideItem[] = [
  {
    id: "dont-1",
    category: "during",
    title: "NEVER Walk or Wade Through Flowing Floodwater ('6-Inch Rule')",
    description:
      "Just 15 cm (6 inches) of rapidly moving water has enough hydrodynamic force to knock an adult off their feet. Underneath the muddy surface, manholes and culverts may be missing.",
    officialRationale:
      "NDMA & International SAR Standard: Flowing water exerts tremendous lateral pressure. Over 50% of flood drownings occur when individuals try walking through shallow-looking currents.",
    iconType: "water",
  },
  {
    id: "dont-2",
    category: "during",
    title: "NEVER Drive Across Submerged Causeways or Culverts",
    description:
      "Turn Around, Don't Drown! 30 cm (12 inches) of water floats small cars; 60 cm (2 feet) sweeps away heavy SUVs and tractors. The road surface underneath may have already collapsed into the gorge.",
    officialRationale:
      "Ministry of Road Transport & Highways (MoRTH) & NDMA: Vehicle drownings are the leading cause of preventable flood deaths in India during monsoon cloudbursts.",
    iconType: "car",
  },
  {
    id: "dont-3",
    category: "during",
    title: "NEVER Touch Fallen Electric Cables or Submerged Poles",
    description:
      "Stay at least 10 meters (33 feet) away from down wires. Do not step into puddles that are in contact with electric posts or bent transformers.",
    officialRationale:
      "Central Electricity Authority (CEA) Safety Standard: High-voltage currents conduct through floodwaters with high mineral/silt content, causing immediate fatal ventricular fibrillation.",
    iconType: "zap",
  },
  {
    id: "dont-4",
    category: "during",
    title: "NEVER Stand on Bridges or Riverbanks to Take Videos or Selfies",
    description:
      "Do not congregate on check dams, bridge railings, or retaining walls to watch raging rivers. High-velocity flash floods undermine bridge abutments and riverbanks without warning.",
    officialRationale:
      "DDMA Public Safety Notice: Bank scour occurs from underneath. Riverbanks collapse silently in large chunks under human foot pressure during surges.",
    iconType: "shield",
  },
  {
    id: "dont-5",
    category: "during",
    title: "NEVER Hide in Basements or Underground Cellars",
    description:
      "Basements fill within seconds during flash floods, turning into inescapable drowning traps as water pressure locks outward-opening doors.",
    officialRationale:
      "NDMA Urban & Rural Flood Guidelines: Water depth can rise 2 meters in under 90 seconds in enclosed lower spaces.",
    iconType: "home",
  },
  {
    id: "dont-6",
    category: "before",
    title: "DO NOT Build Temporary Sheds or Camp in Dry Riverbeds (Nullahs)",
    description:
      "Dry riverbeds and dry seasonal 'khads' or 'nullahs' are the primary natural conduits for sudden cloudburst runoff. What is bone-dry at 2:00 PM can be a 10-foot torrent at 2:20 PM.",
    officialRationale:
      "CWC Catchment Regulation: Encroachment and camping in ephemeral stream courses is the single largest factor in mass casualty flash flood incidents in mountain states.",
    iconType: "mountain",
  },
  {
    id: "dont-7",
    category: "before",
    title: "DO NOT Ignore Early Evacuation Advisories From Local Authorities",
    description:
      "Never wait until floodwaters reach your doorstep. Once water surrounds a home, evacuation requires specialist boats or helicopters which cannot operate in narrow mountain valleys.",
    officialRationale:
      "National Disaster Response Force (NDRF): Early voluntary evacuation has a 99.8% survival rate compared to desperate last-minute extraction.",
    iconType: "shield",
  },
  {
    id: "dont-8",
    category: "after",
    title: "DO NOT Switch On Wet Electrical Appliances Immediately",
    description:
      "Do not plug in televisions, refrigerators, motors, or invertors until they have been completely dried and inspected by a certified electrician.",
    officialRationale:
      "Bureau of Indian Standards (BIS) Electrical Protocol: Moisture and silt trapped in circuitry cause catastrophic electrical fires and short-circuits upon re-energization.",
    iconType: "zap",
  },
  {
    id: "dont-9",
    category: "after",
    title: "DO NOT Consume Flood-Damaged Food or Perishables",
    description:
      "Discard any grains, spices, cooked food, or sealed cans that came in direct contact with floodwaters or that remained unrefrigerated for more than 4 hours.",
    officialRationale:
      "FSSAI Guidelines: Floodwaters carry industrial chemicals, agricultural pesticides, animal carcasses, and sewage pathogens.",
    iconType: "health",
  },
  {
    id: "dont-10",
    category: "after",
    title: "DO NOT Forward Unverified Social Media Rumors or Audio Clips",
    description:
      "Rely only on official statements from the District Collector, DDMA, IMD, or state disaster control rooms. Unverified WhatsApp panic clips trigger stampedes.",
    officialRationale:
      "National Disaster Management Act (Section 54): Spreading false alarms or unverified disaster panic is a cognizable legal offense punishable with imprisonment.",
    iconType: "shield",
  },
  {
    id: "dont-11",
    category: "mountain",
    title: "NEVER Run Downhill Along the River Channel",
    description:
      "When escaping an approaching mountain torrent, always move perpendicular (up the hill slope) rather than trying to outrun the river downstream.",
    officialRationale:
      "Hydrological Wave Dynamics: Mountain flash flood crests accelerate downstream as tributaries join, easily outrunning human sprint speeds.",
    iconType: "mountain",
  },
  {
    id: "dont-12",
    category: "mountain",
    title: "DO NOT Seek Shelter Under Weak Overhanging Cliffs or Soil Banks",
    description:
      "Flash floods are accompanied by slope saturation. Low cliffs and loose soil embankments frequently trigger simultaneous mudslides and rockfalls.",
    officialRationale:
      "Wadia Institute of Himalayan Geology (WIHG): 70% of flash flood fatalities in high Himalayas occur due to coupled debris flow and rockfall hazards.",
    iconType: "mountain",
  },
];

const YOUTUBE_VIDEOS = [
  {
    id: "ndma-before-flood",
    phaseBadge: "Phase 1: Before Flood (तैयारी)",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    title: "बाढ़ से पहले क्या तैयारी रखें? (Before Flood Preparedness)",
    source: "National Disaster Management Authority (NDMA GoI)",
    embedUrl: "https://www.youtube.com/embed/2KwuqolYLO4",
    youtubeLink: "https://www.youtube.com/watch?v=2KwuqolYLO4",
    summary:
      "Official NDMA instructional guide on assembling the family emergency Go-Bag (आपदा किट), securing drainage channels, tracking IMD weather advisories, and establishing village evacuation paths before floods hit.",
    highlights: ["Emergency Go-Bag (आपदा किट)", "Pre-monsoon drainage checks", "Safe evacuation routes"],
  },
  {
    id: "ndma-during-flood",
    phaseBadge: "Phase 2: During Flood (बाढ़ के दौरान)",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    title: "बाढ़ के दौरान क्या करें और क्या न करें (During Flood: Do's & Don'ts)",
    source: "National Disaster Management Authority (NDMA GoI)",
    embedUrl: "https://www.youtube.com/embed/0b0yrwHvCdc?start=1",
    youtubeLink: "https://www.youtube.com/watch?v=0b0yrwHvCdc&t=1s",
    summary:
      "Crucial survival protocols when floodwaters strike: immediate movement to higher bedrock ground, disconnecting main electric breakers & gas valves, avoiding flowing torrents, and avoiding flooded roads.",
    highlights: ["Turn Around Don't Drown", "Switch off MCB & LPG valve", "Move to higher ground"],
  },
  {
    id: "ndma-after-flood",
    phaseBadge: "Phase 3: After Flood (बाढ़ के बाद)",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    title: "बाढ़ के बाद क्या करें और क्या न करें (After Flood: Recovery & Safety)",
    source: "National Disaster Management Authority (NDMA GoI)",
    embedUrl: "https://www.youtube.com/embed/lJq1FLc5Bqc?start=4",
    youtubeLink: "https://www.youtube.com/watch?v=lJq1FLc5Bqc&t=4s",
    summary:
      "Essential rehabilitation and disease prevention guidelines: vigorous boiling of drinking water, checking building foundations for erosion, safe inspection of electrical circuits, and checking for displaced reptiles.",
    highlights: ["Boil water for 3+ minutes", "Structural inspection", "Displaced reptile caution"],
  },
];

export default function DosDontsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "during" | "before" | "after" | "mountain">("during");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filterItems = (items: GuideItem[]) => {
    return items.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.officialRationale.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  };

  const filteredDos = filterItems(OFFICIAL_DOS);
  const filteredDonts = filterItems(OFFICIAL_DONTS);

  return (
    <main className="min-h-screen bg-[#0a0714] text-white">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32 sm:pt-36">
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-600/15 via-indigo-600/15 to-transparent blur-3xl" />

        <div className="mx-auto max-w-5xl text-center">
          

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Flash Flood Safety:{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-rose-400 bg-clip-text text-transparent">
              Do&apos;s &amp; Don&apos;ts
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            Authoritative protocols, scientific rationales, and life-saving actions verified from
            the <strong className="text-white">National Disaster Management Authority (NDMA)</strong>,{" "}
            <strong className="text-white">India Meteorological Department (IMD)</strong>, and{" "}
            <strong className="text-white">Central Water Commission (CWC)</strong> for cloudbursts and mountain river surges.
          </p>
        </div>

        {/* EMERGENCY HELPLINE STRIP (INDIA) */}
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-red-950/20 to-rose-950/40 p-5 backdrop-blur-md">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <Phone className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Emergency Helplines (India 24/7 Toll-Free)</h2>
                  <p className="text-xs text-white/60">
                    Direct access to National and District Disaster Management Control Rooms
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5 md:w-auto">
                {EMERGENCY_HELPLINES.map((helpline) => (
                  <button
                    key={helpline.number}
                    onClick={() => copyToClipboard(helpline.number)}
                    title={`Click to copy: ${helpline.label}`}
                    className="group relative flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center transition-all hover:border-rose-400/40 hover:bg-white/10"
                  >
                    <span className="text-base font-extrabold text-white group-hover:text-rose-300">
                      {helpline.number}
                    </span>
                    <span className="text-[10px] text-white/50">{helpline.badge}</span>
                    <div className="absolute right-1.5 top-1.5 text-white/30 group-hover:text-white">
                      {copiedNumber === helpline.number ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {copiedNumber && (
              <p className="mt-2 text-right text-xs font-semibold text-emerald-400">
                ✓ Helpline {copiedNumber} copied to clipboard!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CORE SURVIVAL RULES (CARDINAL RULES) */}
      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6">
              <div className="flex items-center gap-2 text-amber-400">
                <Car className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">The Vehicle Rule</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Turn Around, Don&apos;t Drown</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                <strong className="text-white">30 cm (12 in)</strong> of rushing water can float a car.{" "}
                <strong className="text-white">60 cm (2 ft)</strong> sweeps away 4x4 SUVs and tractors. If your vehicle stalls in rising water, abandon it immediately and seek higher ground.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-6">
              <div className="flex items-center gap-2 text-rose-400">
                <Droplets className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">The 6-Inch Rule</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Never Wade Fast Currents</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Just <strong className="text-white">15 cm (6 inches)</strong> of fast-moving water sweeps an adult off their feet. Muddy water conceals washed-out culverts, open manholes, and charged power lines.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.04] p-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Mountain className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Hilly Terrain Protocol</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">Perpendicular Elevation</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                In steep Himalayan &amp; Western Ghats valleys, flash waves gain speed downstream.{" "}
                <strong className="text-white">Never run downstream.</strong> Climb up perpendicular bedrock slopes immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROLS */}
      <section className="border-t border-white/10 px-6 pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Phase Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("during")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "during"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                🚨 During the Surge (Immediate)
              </button>
              <button
                onClick={() => setActiveTab("before")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "before"
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                ⏳ Before (Prep &amp; Alerts)
              </button>
              <button
                onClick={() => setActiveTab("after")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "after"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                💧 After Waters Recede
              </button>
              <button
                onClick={() => setActiveTab("mountain")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "mountain"
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                ⛰️ Hill &amp; Cloudburst Zones
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "all"
                    ? "bg-white text-[#0a0714]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                All Actions
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search: e.g. car, electric, water..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/15 bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVE DO'S & DON'TS GRID */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* DO'S COLUMN */}
            <div>
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-emerald-400">DO&apos;S (क्या करें)</h2>
                  <p className="text-xs text-white/60">
                    Mandatory life-saving actions &amp; precautions
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredDos.length === 0 ? (
                  <p className="text-sm text-white/40">No matching guidelines found.</p>
                ) : (
                  filteredDos.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/[0.05]"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-emerald-300">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-white/80">
                            {item.description}
                          </p>
                          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/40 p-2.5 text-[11px] text-emerald-200/90">
                            <span className="font-semibold uppercase tracking-wider text-emerald-400">
                              Official Rationale:{" "}
                            </span>
                            {item.officialRationale}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DON'TS COLUMN */}
            <div>
              <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-rose-400">DON&apos;TS (क्या न करें)</h2>
                  <p className="text-xs text-white/60">
                    High-risk fatal mistakes to strictly avoid
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredDonts.length === 0 ? (
                  <p className="text-sm text-white/40">No matching guidelines found.</p>
                ) : (
                  filteredDonts.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-5 transition-all hover:border-rose-500/40 hover:bg-rose-500/[0.05]"
                    >
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-400" />
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-rose-300">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-white/80">
                            {item.description}
                          </p>
                          <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-950/40 p-2.5 text-[11px] text-rose-200/90">
                            <span className="font-semibold uppercase tracking-wider text-rose-400">
                              Hazard Analysis:{" "}
                            </span>
                            {item.officialRationale}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 72-HOUR SURVIVAL GO-BAG (आपदा किट) INTERACTIVE CHECKLIST */}
      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Preparedness Protocol
            </span>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-4xl">
              The 72-Hour Emergency &ldquo;Go-Bag&rdquo; (आपदा किट)
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs text-white/60 sm:text-sm">
              Keep this sealed in a durable, waterproof backpack near the front entrance of your home before monsoon begins.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <FileText className="h-6 w-6 text-indigo-400" />
              <h3 className="mt-3 text-sm font-bold text-white">1. Waterproof Documents</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-white/70">
                <li>• Aadhaar &amp; Voter ID cards in zip-lock</li>
                <li>• Land &amp; property deeds</li>
                <li>• Bank passbooks &amp; emergency cash</li>
                <li>• Passports and birth certificates</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <Droplets className="h-6 w-6 text-blue-400" />
              <h3 className="mt-3 text-sm font-bold text-white">2. Water &amp; Dry Rations</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-white/70">
                <li>• 3 liters of potable bottled water</li>
                <li>• Halogen / Chlorine purification tablets</li>
                <li>• High-calorie dry food (chana, sattu, gur)</li>
                <li>• Glucose &amp; electrolyte (ORS) packets</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <HeartPulse className="h-6 w-6 text-rose-400" />
              <h3 className="mt-3 text-sm font-bold text-white">3. Medical &amp; First Aid</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-white/70">
                <li>• 7 days of daily chronic prescriptions</li>
                <li>• Sterile bandages, antiseptic cream, Betadine</li>
                <li>• Paracetamol &amp; anti-diarrheal tablets</li>
                <li>• Water-resistant medical tape &amp; scissors</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <Radio className="h-6 w-6 text-amber-400" />
              <h3 className="mt-3 text-sm font-bold text-white">4. Tools &amp; Signaling</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-white/70">
                <li>• High-decibel whistle (distress signal)</li>
                <li>• LED torch + spare lithium batteries</li>
                <li>• Charged power bank with cables</li>
                <li>• Multi-tool knife &amp; matchbox in wax seal</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED OFFICIAL YOUTUBE AWARENESS VIDEOS */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-300">
                <YoutubeIcon className="h-4 w-4 text-red-500" />
                Video Training &amp; Public Broadcasts
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Official Flood Safety Video Demonstrations
              </h2>
              <p className="mt-2 max-w-2xl text-xs text-white/60 sm:text-sm">
                Watch curated awareness films produced by NDMA India and disaster safety engineers
                explaining hydrological survival science.
              </p>
            </div>

            <a
              href="https://www.youtube.com/@ndmaindiagoi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
            >
              <YoutubeIcon className="h-4 w-4" />
              Visit Official NDMA India Channel
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {YOUTUBE_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20"
              >
                <div>
                  {/* Responsive Video Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${video.badgeColor}`}>
                        {video.phaseBadge}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                        <YoutubeIcon className="h-3 w-3 text-red-500" />
                        <span>NDMA India</span>
                      </div>
                    </div>

                    <h3 className="mt-3 text-base font-bold leading-snug text-white">
                      {video.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      {video.summary}
                    </p>

                    {/* Highlights */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {video.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 p-4">
                  <a
                    href={video.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    Watch full video on YouTube
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICIAL REFERENCES & CITATIONS */}
      <section className="border-t border-white/10 bg-[#0d0a1a] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Official Data Sources &amp; Verification
              </h3>
              <p className="mt-1 text-xs text-white/60">
                All recommendations are compiled directly from statutory Indian disaster management frameworks:
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-indigo-300">
                <a
                  href="https://ndma.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  NDMA India Guidelines on Floods <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://mausam.imd.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  IMD Flash Flood Guidance Services (FFGS) <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="http://cwc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  Central Water Commission (CWC) <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/map"
                className="rounded-full bg-white px-5 py-2 text-xs font-bold text-[#0a0714] transition-all hover:bg-white/90"
              >
                Go to Live Risk Map
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                About Pravaah Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
        PRAVAAH — Smart India Hackathon 2026 · Disaster Management Guidelines
      </footer>
    </main>
  );
}
