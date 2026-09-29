const API_URL = process.env.API_URL || "http://localhost:4000";
const TICK_MS = 5000;

interface SensorState {
  sensorId: string;
  villageId: string;
  type: "RAIN" | "SOIL_MOISTURE" | "WATER_LEVEL";
  baseline: number;
  current: number;
  escalating: boolean;
  escalationRate: number;
  rateMmPerHr?: number; 
}

async function ingest(sensorId: string, value: number) {
  try {
    const res = await fetch(`${API_URL}/api/sensors/${sensorId}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: Math.round(value * 1000) / 1000 }),
    });
    if (!res.ok) console.error(`  ✗ ${sensorId}: HTTP ${res.status}`);
  } catch (err) {
    console.error(`  ✗ ${sensorId}: ${err}`);
  }
}


function nextRainDelta(state: SensorState): number {
  const rate = state.rateMmPerHr ?? 0;

  if (state.escalating) {
    // ramps from drizzle toward a real cloudburst intensity, caps at 90mm/hr
    state.rateMmPerHr = Math.min(90, rate + state.escalationRate);
  } else {
    // calm villages: light noise around 0-3mm/hr, never a real storm
    state.rateMmPerHr = Math.max(0, rate + (Math.random() - 0.55) * 0.6);
  }

  const deltaMm = (state.rateMmPerHr / 3600) * (TICK_MS / 1000);
  return Math.max(0, deltaMm);
}


function nextAbsoluteValue(state: SensorState, min: number, max: number): number {
  const noise = (Math.random() - 0.5) * (state.baseline * 0.15);
  if (state.escalating) {
    state.current += state.escalationRate + Math.max(0, noise);
  } else {
    state.current += noise;
    state.current = Math.max(state.baseline * 0.3, state.current);
  }
  return Math.min(max, Math.max(min, state.current));
}

function nextValue(state: SensorState): number {
  if (state.type === "RAIN") return nextRainDelta(state);
  if (state.type === "SOIL_MOISTURE") return nextAbsoluteValue(state, 0, 100);
  return nextAbsoluteValue(state, 0, Infinity); // WATER_LEVEL
}

async function fetchVillageIds(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/watersheds/g_mws.54029/villages`);
  const json = (await res.json()) as { data: { villageId: string }[] };
  return json.data.map((v) => v.villageId);
}

async function main() {
  const villageIds = await fetchVillageIds();
  console.log(`Generating mock sensor data for ${villageIds.length} villages...\n`);

  const states: SensorState[] = [];

  villageIds.forEach((villageId, i) => {
    const willEscalate = i % 3 === 0;

    states.push({
      sensorId: `SNS-RAIN-${villageId}`,
      villageId,
      type: "RAIN",
      baseline: 0,
      current: 0,
      rateMmPerHr: willEscalate ? 4 : 1,
      escalating: willEscalate,
      escalationRate: willEscalate ? 3 + Math.random() * 2 : 0, // mm/hr added per tick while escalating
    });
    states.push({
      sensorId: `SNS-SOIL-${villageId}`,
      villageId,
      type: "SOIL_MOISTURE",
      baseline: 35,
      current: 35,
      escalating: willEscalate,
      escalationRate: willEscalate ? 2 : 0,
    });
    states.push({
      sensorId: `SNS-WL-${villageId}`,
      villageId,
      type: "WATER_LEVEL",
      baseline: 0.8,
      current: 0.8,
      escalating: willEscalate,
      escalationRate: willEscalate ? 0.15 + Math.random() * 0.1 : 0,
    });
  });

  console.log(`${states.filter((s) => s.escalating).length / 3} villages will escalate toward flood conditions.\n`);

  setInterval(async () => {
    for (const state of states) {
      const value = nextValue(state);
      await ingest(state.sensorId, value);
    }
    console.log(`Tick complete — ${new Date().toLocaleTimeString()}`);
  }, TICK_MS);
}

main();