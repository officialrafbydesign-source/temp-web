-- Preserve existing streaming URLs and legacy purchased-file references.
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "downloadFiles" JSONB;
ALTER TABLE "MusicProduct" ADD COLUMN IF NOT EXISTS "downloadFiles" JSONB;
