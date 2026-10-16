-- Existing beats retain newest-first order until a manual Beat Store order is saved.
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "storeOrder" INTEGER NOT NULL DEFAULT 1000000;
