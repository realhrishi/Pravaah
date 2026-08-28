import dotenv from "dotenv";
dotenv.config();
const API_URL = process.env.API_URL || "http://localhost:4000";

interface ScenarioStep {
  sensorId: string;
  value: number;
  delayMs: number; 
}


const DEMO_SCENARIO: ScenarioStep[] = [
  { sensorId: "SNS-RAIN-001", value: 5, delayMs: 0 },
  { sensorId: "SNS-WL-001", value: 1.2, delayMs: 500 },
  { sensorId: "SNS-RAIN-001", value: 20, delayMs: 3000 },
  { sensorId: "SNS-RAIN-001", value: 45, delayMs: 3000 },
  { sensorId: "SNS-WL-001", value: 2.8, delayMs: 1000 },
  { sensorId: "SNS-RAIN-001", value: 90, delayMs: 3000 }, // crosses threshold
];

async function ingest(sensorId: string, value: number) {
  const res = await fetch(`${API_URL}/api/sensors/${sensorId}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  console.log(`  → ${sensorId}: ${value}  (HTTP ${res.status})`);
}

async function runScenario() {
  console.log("Running mock sensor scenario...\n");
  for (const step of DEMO_SCENARIO) {
    if (step.delayMs > 0) await new Promise((r) => setTimeout(r, step.delayMs));
    await ingest(step.sensorId, step.value);
  }
  console.log("\nScenario complete.");
}

runScenario();