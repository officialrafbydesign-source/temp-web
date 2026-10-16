-- Preserve existing whole-number BPM values while allowing decimal tempos.
ALTER TABLE "Beat" ALTER COLUMN "bpm" TYPE DOUBLE PRECISION USING "bpm"::DOUBLE PRECISION;
