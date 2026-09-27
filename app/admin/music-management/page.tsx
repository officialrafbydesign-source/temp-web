"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

type Track = {
  id?: string;
  trackNo: string;
  title: string;
  duration: string;
  audioUrl: string;
  fileUrl: string;
  isrc: string;
  price: string;
  sellIndividually: boolean;
};

const emptyTrack = (trackNo = 1): Track => ({
  trackNo: String(trackNo),
  title: "",
  duration: "",
  audioUrl: "",
  fileUrl: "",
  isrc: "",
  price: "0.99",
  sellIndividually: true,
});

export default function MusicManagementPage() {
  const [musicProducts, setMusicProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [featuringId, setFeaturingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [price, setPrice] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [stock, setStock] = useState("");
  const [type, setType] = useState<"DIGITAL" | "PHYSICAL">("DIGITAL");
  const [musicType, setMusicType] = useState<
    "album" | "ep" | "mixtape" | "single" | "compilation"
  >("mixtape");
  const [genre, setGenre] = useState("");
  const [upc, setUpc] = useState("");
  const [tuneCode, setTuneCode] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [catalogNo, setCatalogNo] = useState("");
  const [description, setDescription] = useState("");
  const [albumZipUrl, setAlbumZipUrl] = useState("");
  const [tracks, setTracks] = useState<Track[]>([emptyTrack(1)]);

  async function fetchMusicProducts() {
    try {
      const res = await fetch("/api/admin/music-products");
      const data = await res.json();
      if (Array.isArray(data)) setMusicProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMusicProducts();
  }, []);

  function autoFetchDuration(index: number, url: string) {
    if (!url || !url.startsWith("http")) return;

    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const seconds = Math.round(audio.duration);
        updateTrack(index, "duration", String(seconds));
      }
    };
  }

  const filteredProducts = [...musicProducts]
    .filter((p) => {
      const q = search.toLowerCase();
      if (!q) return true;

      const releaseTitle = p.release?.title?.toLowerCase() || "";
      const artistName = p.release?.artist?.name?.toLowerCase() || "";
      const releaseType = p.release?.type?.toLowerCase() || "";
      const genreName = p.release?.genre?.toLowerCase() || "";
      const upcValue = p.release?.upc?.toLowerCase() || "";
      const catalogValue = p.release?.catalogNo?.toLowerCase() || "";

      return (
        releaseTitle.includes(q) ||
        artistName.includes(q) ||
        releaseType.includes(q) ||
        genreName.includes(q) ||
        upcValue.includes(q) ||
        catalogValue.includes(q)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "titleAsc":
          return (a.release?.title || "").localeCompare(b.release?.title || "");
        case "titleDesc":
          return (b.release?.title || "").localeCompare(a.release?.title || "");
        case "artist":
          return (a.release?.artist?.name || "").localeCompare(
            b.release?.artist?.name || ""
          );
        case "type":
          return (a.release?.type || "").localeCompare(b.release?.type || "");
        case "genre":
          return (a.release?.genre || "").localeCompare(b.release?.genre || "");
        case "priceAsc":
          return Number(a.price || 0) - Number(b.price || 0);
        case "priceDesc":
          return Number(b.price || 0) - Number(a.price || 0);
        case "tracks":
          return (
            (b.release?.songs?.length || 0) - (a.release?.songs?.length || 0)
          );
        case "releaseDate":
          return (
            new Date(b.release?.releaseDate || 0).getTime() -
            new Date(a.release?.releaseDate || 0).getTime()
          );
        case "catalogNo":
          return (a.release?.catalogNo || "").localeCompare(
            b.release?.catalogNo || ""
          );
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setArtist("");
    setPrice("");
    setCoverUrl("");
    setStock("");
    setType("DIGITAL");
    setMusicType("mixtape");
    setGenre("");
    setUpc("");
    setTuneCode("");
    setReleaseDate("");
    setCatalogNo("");
    setDescription("");
    setAlbumZipUrl("");
    setTracks([emptyTrack(1)]);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }

  function updateTrack(index: number, field: keyof Track, value: string | boolean) {
    setTracks((prev) =>
      prev.map((track, i) => (i === index ? { ...track, [field]: value } : track))
    );

    if (field === "audioUrl" && typeof value === "string") {
      autoFetchDuration(index, value);
    }
  }

  function addTrackRow() {
    setTracks((prev) => [...prev, emptyTrack(prev.length + 1)]);
  }

  function removeTrackRow(index: number) {
    setTracks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((track, i) => ({ ...track, trackNo: String(i + 1) }))
    );
  }

  function handleEdit(product: any) {
    const release = product.release;

    setEditingId(product.id);
    setTitle(release?.title || "");
    setArtist(release?.artist?.name || "");
    setPrice(String(product.price ?? ""));
    setCoverUrl(release?.coverUrl || "");
    setStock(String(product.stock ?? ""));
    setType(product.itemType === "PHYSICAL" ? "PHYSICAL" : "DIGITAL");
    setMusicType(release?.type || "mixtape");
    setGenre(release?.genre || "");
    setUpc(release?.upc || "");
    setTuneCode(release?.tuneCode || "");
    setCatalogNo(release?.catalogNo || "");
    setDescription(release?.description || "");
    setAlbumZipUrl(product.fileUrl || "");

    if (release?.releaseDate) {
      setReleaseDate(new Date(release.releaseDate).toISOString().split("T")[0]);
    } else {
      setReleaseDate("");
    }

    const mappedTracks =
      release?.songs?.length > 0
        ? release.songs.map((song: any, index: number) => ({
            id: song.id,
            trackNo: String(song.trackNo ?? index + 1),
            title: song.title || "",
            duration: song.duration ? String(song.duration) : "",
            audioUrl: song.audioUrl || "",
            fileUrl: song.fileUrl || "",
            isrc: song.isrc || "",
            price: song.price ? String(song.price) : "0.99",
            sellIndividually: Boolean(song.sellIndividually),
          }))
        : [emptyTrack(1)];

    setTracks(mappedTracks);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function canFeatureRelease(product: any) {
    const releaseType = String(product?.release?.type || "").toLowerCase();
    return releaseType !== "single";
  }

  async function handleSetFeatured(product: any) {
    if (!product?.id || !product?.release) return;

    const currentlyFeatured = Boolean(product.release.featured);

    if (!currentlyFeatured && !canFeatureRelease(product)) {
      setMessage("❌ Singles cannot be used as the featured project banner.");
      return;
    }

    try {
      setFeaturingId(product.id);
      setMessage("");

      const res = await fetch("/api/admin/music-products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          featured: !currentlyFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update featured release.");
      }

      setMusicProducts((prev) =>
        prev.map((item) => ({
          ...item,
          release: item.release
            ? {
                ...item.release,
                featured:
                  !currentlyFeatured && item.id === product.id
                    ? true
                    : currentlyFeatured && item.id === product.id
                      ? false
                      : !currentlyFeatured
                        ? false
                        : Boolean(item.release.featured),
              }
            : item.release,
        }))
      );

      setMessage(
        currentlyFeatured
          ? "✅ Featured release cleared. The Music page will fall back to the newest project."
          : `✅ "${product.release.title}" is now the featured Music release.`
      );
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err?.message || "Failed to update featured release."}`);
    } finally {
      setFeaturingId(null);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Delete this music release?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/music-products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setMusicProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to delete music release.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/music-products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title,
          artist,
          price: Number(price),
          stock: type === "PHYSICAL" ? Number(stock || 0) : 0,
          coverUrl,
          type,
          musicType,
          genre,
          upc,
          tuneCode,
          releaseDate,
          catalogNo,
          description,
          albumZipUrl,
          tracks,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save failed");

      if (editingId) {
        setMusicProducts((prev) =>
          prev.map((p) => (p.id === editingId ? data : p))
        );
        setMessage("✅ Music release updated successfully.");
      } else {
        setMusicProducts((prev) => [data, ...prev]);
        setMessage("✅ Music release added successfully.");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save music release. Check terminal logs.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalTracks = musicProducts.reduce(
    (sum, p) => sum + (p.release?.songs?.length || 0),
    0
  );

  return (
    <AdminLayout active="music">
      <div className="space-y-8 text-zinc-900 max-w-7xl mx-auto p-4 md:p-6">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Music Management
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your music catalog, item pricing, audio tracks, and artwork assets.
            </p>
          </div>
        </div>

        {/* Dynamic Feedback Banner */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm font-medium transition-all ${
            message.includes("❌")
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            {message}
          </div>
        )}

        {/* Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Releases", value: musicProducts.length },
            { label: "Total Audio Tracks", value: totalTracks },
            { label: "Matches Filter", value: filteredProducts.length },
            { label: "Digital Units", value: musicProducts.filter((p) => p.itemType === "DIGITAL").length }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
              <p className="text-3xl font-extrabold tracking-tight text-zinc-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Operations Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">
              {editingId ? "⚡ Edit Target Release" : "✨ Create New Release"}
            </h2>
            {editingId && (
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                Editing Mode
              </span>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Release Title *</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. Midnight Melodies" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Artist *</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. DJ Shadow" value={artist} onChange={(e) => setArtist(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Release Price (£ GBP) *</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" type="number" step="0.01" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Format / Configuration *</label>
                <select className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={musicType} onChange={(e) => setMusicType(e.target.value as any)}>
                  <option value="album">Album</option>
                  <option value="ep">EP</option>
                  <option value="mixtape">Mixtape</option>
                  <option value="single">Single</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Cover Artwork Path/URL *</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="https://res.cloudinary.com/... or storage URI" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Distribution Type *</label>
                <select className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={type} onChange={(e) => setType(e.target.value as "DIGITAL" | "PHYSICAL")}>
                  <option value="DIGITAL">Digital Delivery (Download/Stream)</option>
                  <option value="PHYSICAL">Physical Goods (Vinyl/CD)</option>
                </select>
              </div>
            </div>

            {coverUrl && (
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl inline-flex flex-col items-start">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Active Cover Art View</span>
                <img src={coverUrl} alt="Cover preview" className="w-36 aspect-square object-cover rounded-lg border shadow-sm mt-1" />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2 border-t border-zinc-100">
              {type === "PHYSICAL" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Stock Level *</label>
                  <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" type="number" placeholder="100" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Primary Genre</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Hip-Hop" value={genre} onChange={(e) => setGenre(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">UPC / Barcode Identifier</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Universal Product Code" value={upc} onChange={(e) => setUpc(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">TuneCode ID</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Publishing ID" value={tuneCode} onChange={(e) => setTuneCode(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Official Release Date</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Catalogue Number</label>
                <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. RAF001" value={catalogNo} onChange={(e) => setCatalogNo(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Release Summary Notes</label>
              <textarea className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Add specific liners, promotional descriptors, or general commentary..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Complete Distribution Package ZIP / Archive Link</label>
              <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="High-quality direct download archive asset link (ZIP)" value={albumZipUrl} onChange={(e) => setAlbumZipUrl(e.target.value)} />
            </div>

            {/* Individual Tracks Segment */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-zinc-800">Track Breakdown Matrix</h3>
                  <p className="text-xs text-zinc-400">Audio durations automatically calculate when you paste an audio link.</p>
                </div>
                <button type="button" onClick={addTrackRow} className="inline-flex items-center gap-1.5 bg-zinc-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-800 shadow-sm transition-all">
                  <span>＋</span> Add Audio Index
                </button>
              </div>

              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div key={index} className="bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-4 space-y-3 transition-colors hover:bg-zinc-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">

                      <div className="md:col-span-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Index</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={track.trackNo} onChange={(e) => updateTrack(index, "trackNo", e.target.value)} />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Track Title</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Track Name" value={track.title} onChange={(e) => updateTrack(index, "title", e.target.value)} />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Secs</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Auto" value={track.duration} onChange={(e) => updateTrack(index, "duration", e.target.value)} />
                      </div>

                      <div className="md:col-span-4">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Preview / Streaming Audio URL</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Public preview or streaming URL" value={track.audioUrl} onChange={(e) => updateTrack(index, "audioUrl", e.target.value)} />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">ISRC Identifier</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="GB-AAA-26-XXXXX" value={track.isrc} onChange={(e) => updateTrack(index, "isrc", e.target.value)} />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Price (£)</label>
                        <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" type="number" step="0.01" placeholder="0.99" value={track.price} onChange={(e) => updateTrack(index, "price", e.target.value)} />
                      </div>

                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Paid Full-Quality Download URL</label>
                      <input className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Full-quality WAV/MP3 customer download URL" value={track.fileUrl} onChange={(e) => updateTrack(index, "fileUrl", e.target.value)} />
                    </div>

                    {track.audioUrl && (
                      <div className="bg-white p-2 border rounded-lg shadow-inner">
                        <audio controls className="w-full h-8 opacity-80">
                          <source src={track.audioUrl} />
                        </audio>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 font-medium">
                        <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/20" checked={track.sellIndividually} onChange={(e) => updateTrack(index, "sellIndividually", e.target.checked)} />
                        <span>Allow standalone user checkout for this track</span>
                      </label>

                      {tracks.length > 1 && (
                        <button type="button" onClick={() => removeTrackRow(index)} className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors">
                          Remove Index
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 text-sm tracking-wide">
              {submitting ? "Processing Asset Storage..." : editingId ? "Save Catalog Mutations" : "Publish to Global Inventory"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} className="bg-zinc-200 text-zinc-700 font-bold px-6 py-3 rounded-xl hover:bg-zinc-300 transition-all text-sm">
                Discard Changes
              </button>
            )}
          </div>
        </form>

        {/* Catalog Browser */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-800">Master Catalog Registry</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Filter, sort by category/pricing, and process active inventory.</p>
            </div>

            <div className="bg-zinc-100 p-1 rounded-xl flex gap-1 shadow-inner self-end sm:self-auto">
              {(["table", "cards"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    viewMode === mode
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                className="w-full border border-zinc-200 p-2.5 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all pl-3"
                placeholder="Search across title, artist, configuration, genre, barcodes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-zinc-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-zinc-700 active:scale-95 transition-all shadow-sm">
                Apply Search
              </button>
              <button type="button" onClick={clearSearch} className="bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-zinc-200 active:scale-95 transition-all">
                Reset
              </button>
            </div>
          </form>

          {/* Extended Category Sort Menu */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sort Matrix:</span>
            <select
              className="border border-zinc-200 p-1.5 rounded-lg text-xs font-semibold bg-white shadow-sm focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Chronological (Newest First)</option>
              <option value="titleAsc">Title: Alphabetical (A - Z)</option>
              <option value="titleDesc">Title: Alphabetical (Z - A)</option>
              <option value="artist">Artist Name (A - Z)</option>
              <option value="type">Product Configuration Type</option>
              <option value="genre">Sound Genre Profile</option>
              <option value="priceAsc">Price Vector (Low to High)</option>
              <option value="priceDesc">Price Vector (High to Low)</option>
              <option value="tracks">Audio Track Density (Count)</option>
              <option value="releaseDate">Public Release Date</option>
              <option value="catalogNo">Distribution Catalog Index</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-50 border border-dashed rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800"></div>
            <p className="text-sm font-medium text-zinc-500 mt-4">Synchronizing database state streams...</p>
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === "table" && (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4 w-20">Art</th>
                    <th className="p-4">Release details</th>
                    <th className="p-4">Artist Node</th>
                    <th className="p-4">Configuration</th>
                    <th className="p-4">Genre</th>
                    <th className="p-4">Price (£ GBP)</th>
                    <th className="p-4 text-center">Indexes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-400 font-medium">
                        No music releases found matching your filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="p-4">
                          {p.release?.coverUrl ? (
                            <img src={p.release.coverUrl} alt="Artwork" className="w-12 h-12 rounded-lg object-cover border shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-100 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs">No Art</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-zinc-800">{p.release?.title || "Untitled"}</p>
                            {p.release?.featured && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">{p.release?.catalogNo || "No Cat #"}</p>
                        </td>
                        <td className="p-4 font-medium text-zinc-700">{p.release?.artist?.name || "Unknown Artist"}</td>
                        <td className="p-4">
                          <span className="bg-zinc-100 text-zinc-800 text-xs px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider">
                            {p.release?.type || "N/A"} ({p.itemType})
                          </span>
                        </td>
                        <td className="p-4 text-zinc-600">{p.release?.genre || "—"}</td>
                        <td className="p-4 font-bold text-emerald-600">£{Number(p.price || 0).toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center bg-zinc-100 text-zinc-700 font-mono text-xs px-2.5 py-1 rounded-full font-bold">
                            {p.release?.songs?.length || 0} tracks
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(p)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-lg text-xs transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cards View */}
        {!loading && viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full p-12 text-center text-zinc-400 bg-white border border-dashed rounded-2xl">
                No music releases found matching your filter parameters.
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                  <div className="p-5">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border mb-4">
                      {p.release?.coverUrl ? (
                        <img src={p.release.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">No Artwork</div>
                      )}
                      <span className="absolute top-2 right-2 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                        {p.release?.type || "Mixtape"}
                      </span>
                      {p.release?.featured && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-black border border-black text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-zinc-800 text-base truncate">{p.release?.title || "Untitled"}</h3>
                    <p className="text-xs font-semibold text-zinc-500 truncate mt-0.5">{p.release?.artist?.name || "Unknown Artist"}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 text-xs">
                      <span className="text-zinc-400 font-mono">{p.release?.genre || "No Genre"}</span>
                      <span className="font-bold text-emerald-600 text-base">£{Number(p.price || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border-t border-zinc-100 p-3 flex flex-wrap gap-2">
                    {canFeatureRelease(p) && (
                      <button
                        type="button"
                        disabled={featuringId === p.id}
                        onClick={() => handleSetFeatured(p)}
                        className={`flex-1 min-w-[120px] border font-semibold py-2 rounded-lg text-xs transition-all disabled:opacity-50 ${
                          p.release?.featured
                            ? "bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {featuringId === p.id
                          ? "Saving..."
                          : p.release?.featured
                            ? "Clear Featured"
                            : "Set Featured"}
                      </button>
                    )}
                    <button onClick={() => handleEdit(p)} className="flex-1 bg-white border border-zinc-200 text-zinc-800 font-semibold py-2 rounded-lg text-xs hover:bg-zinc-100 transition-all shadow-sm">
                      Edit Data
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-50 text-red-600 border border-red-100 font-semibold px-3 py-2 rounded-lg text-xs hover:bg-red-100 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
