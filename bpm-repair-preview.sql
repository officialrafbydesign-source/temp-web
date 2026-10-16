-- READ ONLY: decode only tiny positive values with recoverable whole BPM bits.
WITH decoded AS (
  SELECT id, title, bpm,
    ('x' || encode(float8send(bpm), 'hex'))::bit(64)::bigint AS recovered_bpm
  FROM public."Beat"
  WHERE bpm > 0 AND bpm < 1e-300
)
SELECT id, title, bpm::text AS current_bpm, recovered_bpm
FROM decoded
WHERE recovered_bpm BETWEEN 1 AND 1000
ORDER BY title;
