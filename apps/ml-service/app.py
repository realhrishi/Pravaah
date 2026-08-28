from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal, Optional
import random

app = FastAPI(title="SIH26192 ML Service (MOCK)")

MODEL_VERSION = "mock-v0.1"
RiskClass = Literal["GREEN", "WATCH", "WARNING", "CRITICAL"]
LAND_COVER_ENCODING = {
    "unknown": 0, "forest": 1, "agriculture": 2,
    "urban": 3, "barren": 4, "water": 5, "grassland": 6,
}


class Features(BaseModel):
    rainfall_1h_mm: float
    rainfall_3h_mm: float
    rainfall_6h_mm: float
    rainfall_24h_mm: float
    rainfall_forecast_mm: float
    soil_moisture_pct: float
    elevation_m: float
    slope_deg: float
    aspect_deg: float
    twi: float
    spi: float
    flow_accumulation: float
    distance_to_stream_m: float
    historical_event_freq: float
    upstream_water_level_m: float
    sensor_confidence: float
    land_cover_class: float


class PredictRequest(BaseModel):
    village_id: str
    timestamp: str
    features: Features


class PredictResponse(BaseModel):
    village_id: str
    timestamp: str
    probability: float
    risk_class: RiskClass
    confidence: float
    estimated_lead_time_minutes: Optional[float]
    model_version: str


class ExplainRequest(BaseModel):
    village_id: str
    timestamp: str
    features: Features


class Driver(BaseModel):
    feature: str
    contribution: float
    direction: Literal["increases", "decreases"]


class ExplainResponse(BaseModel):
    village_id: str
    timestamp: str
    top_drivers: list[Driver]
    model_version: str


def classify(probability: float) -> RiskClass:
    if probability < 0.25:
        return "GREEN"
    elif probability < 0.5:
        return "WATCH"
    elif probability < 0.75:
        return "WARNING"
    return "CRITICAL"


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # DETERMINISTIC mock — driven mainly by rainfall_6h so your demo is
    # controllable: inject rainfall via /simulate and watch it escalate
    # predictably, not randomly.
    f = req.features
    score = (
        f.rainfall_6h_mm / 80
        + (f.upstream_water_level_m or 0) / 8
        + f.slope_deg / 100  # your real Chamoli slope data now actually matters here
    )
    probability = min(max(score, 0.0), 1.0)
    risk_class = classify(probability)

    lead_time = None
    if risk_class != "GREEN":
        # rough inverse relationship — higher risk, shorter lead time,
        # deterministic rather than random for a controllable demo
        lead_time = round(60 - (probability * 40), 1)

    return PredictResponse(
        village_id=req.village_id,
        timestamp=req.timestamp,
        probability=round(probability, 3),
        risk_class=risk_class,
        confidence=0.85,
        estimated_lead_time_minutes=lead_time,
        model_version=MODEL_VERSION,
    )


@app.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    f = req.features
    candidates = [
        ("rainfall_6h_mm", f.rainfall_6h_mm / 80, "increases"),
        ("slope_deg", f.slope_deg / 100, "increases"),
        ("upstream_water_level_m", (f.upstream_water_level_m or 0) / 8, "increases"),
        ("historical_event_freq", f.historical_event_freq / 10, "increases"),
    ]
    candidates.sort(key=lambda x: x[1], reverse=True)
    drivers = [
        Driver(feature=name, contribution=round(val, 2), direction=direction)
        for name, val, direction in candidates[:3]
    ]

    return ExplainResponse(
        village_id=req.village_id,
        timestamp=req.timestamp,
        top_drivers=drivers,
        model_version=MODEL_VERSION,
    )


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}



# cmd - uvicorn app:app --reload --port 8000