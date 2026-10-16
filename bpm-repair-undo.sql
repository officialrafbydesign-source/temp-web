-- Optional reversal. Only restores records that still have the repaired value.
-- Do not run during the normal repair flow.
BEGIN;
UPDATE public."Beat" AS beat
SET bpm = backup.original_bpm
FROM raf_maintenance.beat_bpm_repair_20261016 AS backup
WHERE beat.id = backup.id AND beat.bpm = backup.repaired_bpm
RETURNING beat.title, beat.bpm::text;
COMMIT;
