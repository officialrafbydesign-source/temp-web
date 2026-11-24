// Story links always point to the public website, including when copied locally.
export const MUSIC_SITE_ORIGIN = "https://rafbydesign.co.uk";

export function musicTrackPath(id: string) {
  return `/music/tracks/${encodeURIComponent(id)}`;
}

export function musicTrackUrl(id: string) {
  return `${MUSIC_SITE_ORIGIN}${musicTrackPath(id)}`;
}
