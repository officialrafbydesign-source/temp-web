export type MusicFormat = "mp3" | "wav";
export type MusicFileKind = "track" | "release";
export type MusicDownloadFile = { key: string; name: string; bytes: number | null };
export type MusicDownloadFiles = Partial<Record<MusicFormat, MusicDownloadFile>>;
export type MusicDownloadChoice = { format: MusicFormat | "original"; label: string; url: string; bytes: number | null };

export function privateMusicKey(value: unknown) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  const key = raw.replace(/^\/+/, "");
  if (!key || key.length > 1000 || /[\\\x00-\x1f]/.test(key) || key.split("/").some(part => part === ".." || part === ".")) return null;
  return key;
}

export function musicDownloadFilesInput(value: unknown, kind: MusicFileKind): MusicDownloadFiles {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("Download files must contain MP3 and WAV entries.");
  const result: MusicDownloadFiles = {};
  for (const [format, raw] of Object.entries(value)) {
    if (format !== "mp3" && format !== "wav") throw new Error("Choose MP3 or WAV for the download format.");
    if (raw == null) continue;
    if (typeof raw !== "object" || Array.isArray(raw)) throw new Error("A download needs a private R2 file key.");
    const file = raw as Record<string, unknown>;
    const key = privateMusicKey(file.key);
    if (!key || !key.toLowerCase().endsWith(kind === "release" ? ".zip" : `.${format}`)) throw new Error(kind === "release" ? "Release downloads need private ZIP file keys." : `The ${format.toUpperCase()} download needs a private .${format} file key.`);
    const bytes = file.bytes == null ? null : Number(file.bytes);
    if (bytes !== null && (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > 4 * 1024 ** 3)) throw new Error("The download size is invalid.");
    const name = typeof file.name === "string" && file.name.trim() ? file.name.trim().slice(0, 250) : key.split("/").pop()!;
    result[format] = { key, name, bytes };
  }
  return result;
}

export function storedMusicDownloads(value: unknown, legacy: unknown, kind: MusicFileKind): MusicDownloadFiles {
  const result: MusicDownloadFiles = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const format of ["mp3", "wav"] as const) {
      try { Object.assign(result, musicDownloadFilesInput({ [format]: (value as Record<string, unknown>)[format] }, kind)); } catch { /* Ignore invalid legacy metadata without exposing it. */ }
    }
  }
  const key = privateMusicKey(legacy);
  if (kind === "track" && key) {
    for (const format of ["mp3", "wav"] as const) if (!result[format] && key.toLowerCase().endsWith(`.${format}`)) result[format] = { key, name: key.split("/").pop()!, bytes: null };
  }
  return result;
}

export function chooseMusicFile(value: unknown, legacy: unknown, kind: MusicFileKind, requested?: string | null) {
  const files = storedMusicDownloads(value, legacy, kind);
  if (requested && !["mp3", "wav", "original"].includes(requested)) return null;
  if (requested === "mp3" || requested === "wav") return files[requested]?.key || null;
  if (requested === "original") return privateMusicKey(legacy);
  return files.mp3?.key || files.wav?.key || privateMusicKey(legacy);
}

export function musicDownloadChoices(value: unknown, legacy: unknown, kind: MusicFileKind, baseUrl: string): MusicDownloadChoice[] {
  const files = storedMusicDownloads(value, legacy, kind);
  const choices: MusicDownloadChoice[] = [];
  for (const format of ["mp3", "wav"] as const) if (files[format]) choices.push({ format, label: `${format.toUpperCase()}${kind === "release" ? " ZIP" : ""}`, url: `${baseUrl}?format=${format}`, bytes: files[format]!.bytes });
  const key = privateMusicKey(legacy);
  if (key && choices.length === 0) choices.push({ format: "original", label: "Original file", url: `${baseUrl}?format=original`, bytes: null });
  return choices;
}

export function musicFileSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  return bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${(bytes / 1e6).toFixed(1)} MB`;
}
