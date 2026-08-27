# ML Service Contract (`@repo/shared-types`)

The **frozen** interface between the backend (app developer) and the ML inference
service (ML teammate). TypeScript is the source of truth in
[`ml-contract.ts`](./ml-contract.ts); this document is the language-agnostic wire
spec plus a Pydantic mirror for the Python service.

## Ground rules

- The ML service is **stateless** and **internal-only** — never exposed to the
  public internet. Only the BullMQ worker (`apps/workers`) calls it.
- Two endpoints: `POST /predict` and `POST /explain`.
- All timestamps are **ISO 8601 UTC** (e.g. `2026-08-27T10:15:00Z`).
- `probability` and `confidence` are floats in `0..1`.
- `estimated_lead_time_minutes` is `null` when `risk_class` is `GREEN`.
- `risk_class` ∈ `GREEN | WATCH | WARNING | CRITICAL` — keep in sync with the
  `RiskClass` enum in `packages/database/prisma/schema.prisma`.
- **Changing any field name or type is a contract break** — bump the version and
  tell both sides.

## The 17 features

The request carries a keyed object (not a positional array). All values are numeric.

| # | Feature | Unit / meaning | Kind | Source |
|---|---------|----------------|------|--------|
| 1 | `rainfall_1h_mm` | rainfall accumulation, last 1 h (mm) | dynamic | rain sensors / rainfall cell |
| 2 | `rainfall_3h_mm` | rainfall, last 3 h (mm) | dynamic | rain sensors / rainfall cell |
| 3 | `rainfall_6h_mm` | rainfall, last 6 h (mm) | dynamic | rain sensors / rainfall cell |
| 4 | `rainfall_24h_mm` | rainfall, last 24 h (mm) | dynamic | rain sensors / rainfall cell |
| 5 | `rainfall_forecast_mm` | forecast rainfall, next window (mm) | dynamic | forecast source |
| 6 | `soil_moisture_pct` | soil moisture (%) | dynamic | soil-moisture sensors |
| 7 | `elevation_m` | mean elevation (m) | static | DEM |
| 8 | `slope_deg` | mean slope (degrees) | static | DEM |
| 9 | `aspect_deg` | slope aspect (0–360°) | static | DEM |
| 10 | `twi` | Topographic Wetness Index | static | DEM-derived |
| 11 | `spi` | Stream Power Index | static | DEM-derived |
| 12 | `flow_accumulation` | upstream flow accumulation | static | DEM-derived |
| 13 | `distance_to_stream_m` | distance to nearest stream (m) | static | hydrology layer |
| 14 | `land_cover_class` | **encoded** land-cover id (see below) | static | land-cover raster |
| 15 | `historical_event_freq` | past flood/landslide event frequency | static | flood/landslide inventory |
| 16 | `upstream_water_level_m` | upstream water level (m) | dynamic | water-level sensors |
| 17 | `sensor_confidence` | data quality/freshness score (0..1) | dynamic | derived from sensor status |

`land_cover_class` uses a shared string→int map (`LAND_COVER_ENCODING`). The class
set is a **placeholder** until Phase 1 fixes it against the real geodata.

## `POST /predict`

**Request**
```json
{
  "village_id": "vil_001",
  "timestamp": "2026-08-27T10:15:00Z",
  "features": {
    "rainfall_1h_mm": 22.5, "rainfall_3h_mm": 48.0, "rainfall_6h_mm": 70.0,
    "rainfall_24h_mm": 130.0, "rainfall_forecast_mm": 40.0, "soil_moisture_pct": 82.0,
    "elevation_m": 1450.0, "slope_deg": 27.5, "aspect_deg": 210.0, "twi": 8.1,
    "spi": 320.0, "flow_accumulation": 15400.0, "distance_to_stream_m": 45.0,
    "land_cover_class": 2, "historical_event_freq": 0.35,
    "upstream_water_level_m": 3.2, "sensor_confidence": 0.9
  }
}
```

**Response**
```json
{
  "village_id": "vil_001",
  "timestamp": "2026-08-27T10:15:00Z",
  "probability": 0.87,
  "risk_class": "WARNING",
  "confidence": 0.9,
  "estimated_lead_time_minutes": 35,
  "model_version": "xgb-v0.1"
}
```

## `POST /explain`

**Request** — identical shape to `/predict` (SHAP explains a specific vector).

**Response**
```json
{
  "village_id": "vil_001",
  "timestamp": "2026-08-27T10:15:00Z",
  "top_drivers": [
    { "feature": "rainfall_3h_mm", "contribution": 0.41, "direction": "increases" },
    { "feature": "soil_moisture_pct", "contribution": 0.22, "direction": "increases" },
    { "feature": "elevation_m", "contribution": -0.10, "direction": "decreases" }
  ],
  "model_version": "xgb-v0.1"
}
```

`top_drivers` holds the top 3–5 features sorted by `|contribution|` descending;
`direction` mirrors the sign of `contribution`.

## Pydantic mirror (for `apps/ml-service`)

Keep in sync with `ml-contract.ts`.

```python
from typing import Optional, Literal
from pydantic import BaseModel

RiskClass = Literal["GREEN", "WATCH", "WARNING", "CRITICAL"]
DriverDirection = Literal["increases", "decreases"]

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
    land_cover_class: float  # encoded id
    historical_event_freq: float
    upstream_water_level_m: float
    sensor_confidence: float

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

class FeatureDriver(BaseModel):
    feature: str
    contribution: float
    direction: DriverDirection

class ExplainRequest(BaseModel):
    village_id: str
    timestamp: str
    features: Features

class ExplainResponse(BaseModel):
    village_id: str
    timestamp: str
    top_drivers: list[FeatureDriver]
    model_version: str
```
