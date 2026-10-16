-- Additive and safe to run again. Keeps every order and download entitlement.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "excludedFromReports" BOOLEAN NOT NULL DEFAULT false;

-- Preserve existing whole-number BPM values while allowing decimal tempos.
ALTER TABLE "Beat" ALTER COLUMN "bpm" TYPE DOUBLE PRECISION USING "bpm"::DOUBLE PRECISION;

-- Existing beats retain newest-first order until a manual Beat Store order is saved.
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "storeOrder" INTEGER NOT NULL DEFAULT 1000000;
