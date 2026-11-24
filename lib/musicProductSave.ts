export class MusicSaveInterrupted extends Error {
  constructor() {
    super("The connection was interrupted. Your changes are still in this form. The save may have completed: refresh the release list and check the saved version before submitting again.");
    this.name = "MusicSaveInterrupted";
  }
}

// Never retry a write automatically: an interrupted response may follow a commit.
export async function saveMusicProduct(body: Record<string, unknown>, editing: boolean) {
  let response: Response;
  let raw: string;
  try {
    response = await fetch("/api/admin/music-products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    raw = await response.text();
  } catch {
    throw new MusicSaveInterrupted();
  }

  let data;
  try { data = JSON.parse(raw); }
  catch {
    if (response.ok) throw new MusicSaveInterrupted();
    throw new Error(`The server returned HTTP ${response.status}. Your changes are still in this form. Check the website terminal before trying again.`);
  }
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `Save failed (HTTP ${response.status}). Your changes are still in this form.`);
  }
  if (!data?.id || !data?.release) throw new MusicSaveInterrupted();
  return data;
}
