-- Existing releases retain newest-first order until a manual order is saved.
ALTER TABLE "MusicProduct" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 1000000;
