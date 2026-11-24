export type HubLink = { label: string; url: string };
export const EXTRA_KINDS = ["artwork", "video", "audio", "download", "episode"] as const;
export const EXTRA_ACCESS = ["public", "members", "purchase"] as const;
export const MUSIC_TYPES = ["album", "ep", "mixtape", "single", "compilation"] as const;
export type ExtraAccess = typeof EXTRA_ACCESS[number];
export type ExtraKind = typeof EXTRA_KINDS[number];

export class MusicInputError extends Error {}

export function text(value: unknown, max = 5000): string {
  if (typeof value !== "string") return "";
  if (value.length > max) throw new MusicInputError(`Text must be ${max} characters or fewer.`);
  return value.trim();
}

export function requiredText(value: unknown, label: string, max = 200): string {
  const result = text(value, max);
  if (!result) throw new MusicInputError(`${label} is required.`);
  return result;
}

export function webUrl(value: unknown): string | null {
  const result = text(value, 2048);
  if (!result) return null;
  try {
    const url = new URL(result);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error();
    return url.href;
  } catch {
    throw new MusicInputError("Use a complete https:// link without embedded credentials.");
  }
}

export function artistMediaUrl(value: unknown): string | null {
  const result = text(value, 2048);
  if (/^\/api\/music\/artist-media\/[a-z0-9_-]+$/.test(result)) return result;
  return webUrl(value);
}

export function privateKey(value: unknown): string | null {
  const key = text(value, 1000);
  if (!key) return null;
  if (/^[a-z]+:/i.test(key) || key.startsWith("/") || key.includes("\\") || key.split("/").includes("..") || /[\r\n\x00]/.test(key)) {
    throw new MusicInputError("Use a private R2 object key, for example music/trexx/bonus.mp4, rather than a URL.");
  }
  return key;
}

export function hubLinks(value: unknown): HubLink[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 12) throw new MusicInputError("Add up to 12 links.");
  return value.map((entry) => {
    const item = objectInput(entry);
    const label = requiredText(item.label, "Link label", 80);
    const url = webUrl(item.url);
    if (!url) throw new MusicInputError("Each link needs a URL.");
    return { label, url };
  });
}

export function objectInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new MusicInputError("Invalid request.");
  return value as Record<string, unknown>;
}

export function integer(value: unknown, min = 0, max = 100000): number {
  if (typeof value !== "number" && typeof value !== "string") throw new MusicInputError("Enter a whole number.");
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new MusicInputError(`Enter a whole number from ${min} to ${max}.`);
  return n;
}

export function money(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") throw new MusicInputError("Enter a valid price.");
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 10000) throw new MusicInputError("Enter a price between £0 and £10,000.");
  return Math.round(n * 100) / 100;
}

export function artistProfileInput(value: unknown) {
  const body = objectInput(value);
  const slug = text(body.slug, 100).toLowerCase();
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new MusicInputError("Use lowercase letters, numbers and single hyphens in the page address.");
  return {
    name: requiredText(body.name, "Artist name"), slug: slug || null,
    biography: text(body.biography, 10000) || null,
    imageUrl: webUrl(body.imageUrl), bannerUrl: webUrl(body.bannerUrl),
    links: hubLinks(body.links), isProfilePublished: body.isProfilePublished === true,
  };
}

export function extraInput(value: unknown) {
  const body = objectInput(value);
  const kind = text(body.kind) as ExtraKind;
  const access = text(body.access) as ExtraAccess;
  if (!EXTRA_KINDS.includes(kind) || !EXTRA_ACCESS.includes(access)) throw new MusicInputError("Choose a content type and access level.");
  const url = webUrl(body.url);
  const fileKey = privateKey(body.fileKey);
  const releaseId = text(body.releaseId, 200) || null;
  if (access !== "public" && url) throw new MusicInputError("Member and purchase content must use a private R2 file key. A public URL would bypass access controls.");
  if (access === "public" && !url && !fileKey) throw new MusicInputError("Add a public media URL or private file key.");
  if (access !== "public" && !fileKey) throw new MusicInputError("Add the private R2 file key for protected content.");
  if (access === "purchase" && !releaseId) throw new MusicInputError("Purchase content must belong to a release.");
  const rafOnly = body.rafOnly === true;
  return {
    artistId: requiredText(body.artistId, "Artist"), releaseId,
    title: requiredText(body.title, "Title"), description: text(body.description, 10000) || null,
    kind, access, url, fileKey, rafOnly,
    isPublished: body.isPublished === true,
    previewImageUrl: webUrl(body.previewImageUrl), seriesTitle: text(body.seriesTitle, 200) || null,
    episodeNo: body.episodeNo === "" || body.episodeNo == null ? null : integer(body.episodeNo, 1, 10000),
    sortOrder: integer(body.sortOrder ?? 0, 0, 100000),
  };
}

export function canAccessExtra(access: string, verifiedMember: boolean, ownsRelease: boolean, admin = false) {
  if (admin || access === "public") return true;
  if (!verifiedMember) return false;
  return access === "members" || (access === "purchase" && ownsRelease);
}

export function videoEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || null;
    }
    if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const match = url.pathname.match(/\/(?:video\/)?(\d+)$/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    return null;
  } catch { return null; }
}

export type SubmissionTrack = {
  title: string; audioUrl: string | null; fileUrl: string | null;
  duration: number | null; price: number | null; sellIndividually: boolean;
};
export type SubmissionData = {
  title: string; type: typeof MUSIC_TYPES[number]; coverUrl: string | null;
  description: string | null; price: number; fileUrl: string | null; tracks: SubmissionTrack[];
};
export function submissionInput(value: unknown, allowIncomplete = false): SubmissionData {
  const body = objectInput(value);
  const type = text(body.type);
  if (!MUSIC_TYPES.includes(type as typeof MUSIC_TYPES[number])) throw new MusicInputError("Choose a release type.");
  if (!Array.isArray(body.tracks) || !body.tracks.length || body.tracks.length > 100) throw new MusicInputError("Add between 1 and 100 tracks.");
  return {
    title: allowIncomplete ? text(body.title, 200) || "Untitled draft" : requiredText(body.title, "Release title"), type: type as SubmissionData["type"],
    coverUrl: artistMediaUrl(body.coverUrl), description: text(body.description, 10000) || null,
    price: money(body.price ?? 0), fileUrl: privateKey(body.fileUrl),
    tracks: body.tracks.map((value) => {
      const track = objectInput(value);
      const audioUrl = artistMediaUrl(track.audioUrl);
      const fileUrl = privateKey(track.fileUrl);
      if (!audioUrl && !allowIncomplete) throw new MusicInputError("Upload an audio preview for each track, or add a preview URL.");
      const price = track.price === "" || track.price == null ? null : money(track.price);
      const sellIndividually = track.sellIndividually === true;
      if (sellIndividually && !allowIncomplete && (!fileUrl || price == null || price <= 0)) throw new MusicInputError("Tracks sold individually need a private download key and a price greater than zero.");
      return { title: allowIncomplete ? text(track.title, 200) || "Untitled track" : requiredText(track.title, "Track title"), audioUrl, fileUrl, price, sellIndividually,
        duration: track.duration === "" || track.duration == null ? null : integer(track.duration, 1, 86400) };
    }),
  };
}

export type HubExtra = {
  id: string; title: string; description: string | null; kind: string; access: string;
  rafOnly: boolean; previewImageUrl: string | null; seriesTitle: string | null; episodeNo: number | null;
  releaseId: string | null; releaseTitle: string | null; url: string | null;
  allowed: boolean; signedIn: boolean;
};
