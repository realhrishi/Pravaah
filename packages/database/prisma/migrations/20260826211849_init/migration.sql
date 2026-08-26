-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AUTHORITY', 'ADMIN');

-- CreateEnum
CREATE TYPE "RiskClass" AS ENUM ('GREEN', 'WATCH', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('RAIN', 'SOIL_MOISTURE', 'WATER_LEVEL');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('ONLINE', 'STALE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('WHATSAPP', 'SMS', 'SACHET');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('SCHEDULED', 'SENSOR_THRESHOLD', 'MANUAL', 'ADAPTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AUTHORITY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferred_channel" "AlertChannel" NOT NULL DEFAULT 'WHATSAPP',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watersheds" (
    "watershed_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watersheds_pkey" PRIMARY KEY ("watershed_id")
);

-- CreateTable
CREATE TABLE "villages" (
    "village_id" TEXT NOT NULL,
    "watershed_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER,
    "elevation_m" DOUBLE PRECISION,
    "slope_deg" DOUBLE PRECISION,
    "aspect_deg" DOUBLE PRECISION,
    "twi" DOUBLE PRECISION,
    "spi" DOUBLE PRECISION,
    "flow_accumulation" DOUBLE PRECISION,
    "distance_to_stream_m" DOUBLE PRECISION,
    "land_cover_class" TEXT,
    "historical_event_freq" DOUBLE PRECISION,
    "rainfall_cell_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("village_id")
);

-- CreateTable
CREATE TABLE "shelters" (
    "shelter_id" TEXT NOT NULL,
    "watershed_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shelters_pkey" PRIMARY KEY ("shelter_id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "sensor_id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "status" "SensorStatus" NOT NULL DEFAULT 'OFFLINE',
    "last_seen" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("sensor_id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_snapshots" (
    "id" SERIAL NOT NULL,
    "village_id" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "risk_class" "RiskClass" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "estimated_lead_time_minutes" DOUBLE PRECISION,
    "model_version" TEXT NOT NULL,
    "trigger_type" "TriggerType" NOT NULL DEFAULT 'SCHEDULED',
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "village_id" TEXT NOT NULL,
    "risk_class" "RiskClass" NOT NULL,
    "previous_class" "RiskClass",
    "lead_time_minutes" DOUBLE PRECISION,
    "recommended_action" TEXT,
    "shelter_id" TEXT,
    "route_geojson" JSONB,
    "channels" "AlertChannel"[],
    "dispatched" BOOLEAN NOT NULL DEFAULT false,
    "dispatched_at" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "subscribers_village_id_idx" ON "subscribers"("village_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_village_id_phone_key" ON "subscribers"("village_id", "phone");

-- CreateIndex
CREATE INDEX "villages_watershed_id_idx" ON "villages"("watershed_id");

-- CreateIndex
CREATE INDEX "shelters_watershed_id_idx" ON "shelters"("watershed_id");

-- CreateIndex
CREATE INDEX "sensors_village_id_idx" ON "sensors"("village_id");

-- CreateIndex
CREATE INDEX "sensor_readings_sensor_id_recorded_at_idx" ON "sensor_readings"("sensor_id", "recorded_at");

-- CreateIndex
CREATE INDEX "risk_snapshots_village_id_computed_at_idx" ON "risk_snapshots"("village_id", "computed_at");

-- CreateIndex
CREATE INDEX "alerts_village_id_created_at_idx" ON "alerts"("village_id", "created_at");

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_watershed_id_fkey" FOREIGN KEY ("watershed_id") REFERENCES "watersheds"("watershed_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_watershed_id_fkey" FOREIGN KEY ("watershed_id") REFERENCES "watersheds"("watershed_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("sensor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_snapshots" ADD CONSTRAINT "risk_snapshots_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_shelter_id_fkey" FOREIGN KEY ("shelter_id") REFERENCES "shelters"("shelter_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
