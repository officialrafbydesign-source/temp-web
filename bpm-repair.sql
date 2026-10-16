-- Run after deploying the corrected Float BPM client. Keep beat editing paused.
-- Restores only the narrow integer-bit pattern observed in the corrupted values.
BEGIN;
LOCK TABLE public."Beat" IN SHARE ROW EXCLUSIVE MODE;

CREATE SCHEMA IF NOT EXISTS raf_maintenance;
REVOKE ALL ON SCHEMA raf_maintenance FROM PUBLIC;
CREATE TABLE IF NOT EXISTS raf_maintenance.beat_bpm_repair_20261016 (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_bpm DOUBLE PRECISION NOT NULL,
  repaired_bpm DOUBLE PRECISION NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE raf_maintenance.beat_bpm_repair_20261016 FROM PUBLIC;

CREATE TEMP TABLE raf_bpm_candidates ON COMMIT DROP AS
WITH decoded AS (
  SELECT id, title, bpm AS original_bpm,
    ('x' || encode(float8send(bpm), 'hex'))::bit(64)::bigint AS recovered_bpm
  FROM public."Beat"
  WHERE bpm > 0 AND bpm < 1e-300
)
SELECT id, title, original_bpm, recovered_bpm::double precision AS repaired_bpm
FROM decoded
WHERE recovered_bpm BETWEEN 1 AND 1000;

INSERT INTO raf_maintenance.beat_bpm_repair_20261016 (id, title, original_bpm, repaired_bpm)
SELECT id, title, original_bpm, repaired_bpm FROM raf_bpm_candidates
ON CONFLICT (id) DO NOTHING;

UPDATE public."Beat" AS beat
SET bpm = candidate.repaired_bpm
FROM raf_bpm_candidates AS candidate
WHERE beat.id = candidate.id AND beat.bpm = candidate.original_bpm
RETURNING beat.title, candidate.original_bpm::text AS previous_bpm, beat.bpm AS restored_bpm;

COMMIT;

SELECT beat.title, beat.bpm AS current_bpm
FROM public."Beat" AS beat
JOIN raf_maintenance.beat_bpm_repair_20261016 AS backup ON backup.id = beat.id
ORDER BY beat.title;
