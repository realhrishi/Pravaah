-- AlterTable

-- 1. Remove the old scalar default
ALTER TABLE "subscribers"
ALTER COLUMN "preferred_channel" DROP DEFAULT;

-- 2. Convert scalar enum -> enum array
ALTER TABLE "subscribers"
ALTER COLUMN "preferred_channel"
TYPE "AlertChannel"[]
USING ARRAY["preferred_channel"];

-- 3. Set the new array default
ALTER TABLE "subscribers"
ALTER COLUMN "preferred_channel"
SET DEFAULT ARRAY['SMS']::"AlertChannel"[];