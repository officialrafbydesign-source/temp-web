-- Additive and safe to run again. Keeps every order and download entitlement.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "excludedFromReports" BOOLEAN NOT NULL DEFAULT false;
