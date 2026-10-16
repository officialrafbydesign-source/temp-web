export class InvalidBeatBpm extends Error {
  constructor() { super("BPM must be a positive number, for example 92.5. Leave it blank if unknown."); }
}

export function parseBeatBpm(value: unknown): number | null {
  if (value == null || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") throw new InvalidBeatBpm();
  const bpm = Number(value);
  // Existing clients use zero for an unspecified tempo.
  if (bpm === 0) return null;
  if (!Number.isFinite(bpm) || bpm < 0) throw new InvalidBeatBpm();
  return bpm;
}
