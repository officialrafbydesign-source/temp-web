"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import Script from "next/script";
import AdminLayout from "../components/AdminLayout";

type BeatTrack = {
  id: string;
  title: string;
  bpm: number;
  genre: string;
  freeDownload: boolean;
  musicalKey: string;
  tags: string[];
  priceStandard: number;
  pricePremium: number;
  mp3Url: string;
  zipUrl: string;
  standardFileUrl: string;
  artworkUrl?: string;
  backgroundUrl?: string;
  plays: number;
  downloads: number;
};

type BeatTelemetry = {
  topPlayedTitle: string;
  topPlayedCount: number;
  mostDownloadedTitle: string;
  mostDownloadedCount: number;
  totalCatalogPlays: number;
};

type SortField =
  | "title"
  | "bpm"
  | "genre"
  | "musicalKey"
  | "priceStandard"
  | "pricePremium"
  | "plays"
  | "downloads";

type SortOrder = "asc" | "desc";

declare global {
  interface Window {
    cloudinary: any;
  }
}

function BeatCardPreview({
  artworkUrl,
  backgroundUrl,
  title,
  large = false,
}: {
  artworkUrl?: string;
  backgroundUrl?: string;
  title: string;
  large?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-zinc-300 bg-zinc-900 ${
        large ? "w-48 h-48 rounded-xl" : "w-14 h-14 rounded-md"
      }`}
    >
      {backgroundUrl ? (
        <img
          src={backgroundUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-950" />
      )}

      {artworkUrl ? (
        <img
          src={artworkUrl}
          alt={title}
          className="absolute inset-0 z-10 w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-[9px] text-white/50 font-mono">
          NO FRONT
        </div>
      )}
    </div>
  );
}

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<BeatTrack[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     SELECTION / BULK EDITING
  ========================================================= */

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* =========================================================
     AUDIO
  ========================================================= */

  const [currentPlayingId, setCurrentPlayingId] =
    useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* =========================================================
     INTAKE MODE
  ========================================================= */

  const [intakeMode, setIntakeMode] =
    useState<"single" | "bulk">("single");

  /* =========================================================
     SORTING
  ========================================================= */

  const [sortField, setSortField] =
    useState<SortField>("title");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("asc");

  /* =========================================================
     TELEMETRY
  ========================================================= */

  const [telemetry, setTelemetry] =
    useState<BeatTelemetry>({
      topPlayedTitle: "None",
      topPlayedCount: 0,
      mostDownloadedTitle: "None",
      mostDownloadedCount: 0,
      totalCatalogPlays: 0,
    });

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 24;

  /* =========================================================
     SINGLE TRACK FORM
  ========================================================= */

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [genre, setGenre] = useState("");
  const [freeDownload, setFreeDownload] =
    useState(false);

  const [musicalKey, setMusicalKey] = useState("");
  const [tags, setTags] = useState("");

  const [priceStd, setPriceStd] =
    useState("29.99");

  const [pricePrem, setPricePrem] =
    useState("79.99");

  const [mp3Url, setMp3Url] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [standardFileUrl, setStandardFileUrl] = useState("");

  const [artworkUrl, setArtworkUrl] =
    useState("");

  const [backgroundUrl, setBackgroundUrl] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================================
     BULK UPLOAD
  ========================================================= */

  const [bulkRawInput, setBulkRawInput] =
    useState("");

  const [bulkParseError, setBulkParseError] =
    useState<string | null>(null);

  /* =========================================================
     TELEMETRY CALCULATION
  ========================================================= */

  const recalculateTelemetry = useCallback(
    (catalog: BeatTrack[]) => {
      if (catalog.length === 0) {
        setTelemetry({
          topPlayedTitle: "None",
          topPlayedCount: 0,
          mostDownloadedTitle: "None",
          mostDownloadedCount: 0,
          totalCatalogPlays: 0,
        });

        return;
      }

      const topPlayed = [...catalog].sort(
        (a, b) => b.plays - a.plays
      )[0];

      const topDownloaded = [...catalog].sort(
        (a, b) => b.downloads - a.downloads
      )[0];

      const totalPlays = catalog.reduce(
        (total, beat) =>
          total + (beat.plays || 0),
        0
      );

      setTelemetry({
        topPlayedTitle:
          topPlayed?.title || "None",

        topPlayedCount:
          topPlayed?.plays || 0,

        mostDownloadedTitle:
          topDownloaded?.title || "None",

        mostDownloadedCount:
          topDownloaded?.downloads || 0,

        totalCatalogPlays: totalPlays,
      });
    },
    []
  );

  /* =========================================================
     LOAD CATALOGUE
  ========================================================= */

  useEffect(() => {
    async function fetchCatalogData() {
      try {
        const res = await fetch(
          "/api/admin/beats"
        );

        if (!res.ok) {
          throw new Error(
            "Catalog fetch failed."
          );
        }

        const data = await res.json();

        const catalog: BeatTrack[] =
          data.beats || [];

        setBeats(catalog);

        recalculateTelemetry(catalog);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogData();
  }, [recalculateTelemetry]);

  /* =========================================================
     AUDIO
  ========================================================= */

  const togglePlayAudio = (
    beat: BeatTrack
  ) => {
    if (!beat.mp3Url) {
      alert(
        "No valid MP3 URL associated with this beat."
      );

      return;
    }

    if (
      currentPlayingId === beat.id &&
      isPlaying
    ) {
      audioRef.current?.pause();

      setIsPlaying(false);

      return;
    }

    audioRef.current?.pause();

    const newAudio = new Audio(
      beat.mp3Url
    );

    audioRef.current = newAudio;

    newAudio
      .play()
      .then(() => {
        setCurrentPlayingId(beat.id);
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error(
          "Playback error:",
          err
        );

        alert(
          "Unable to play stream. Please verify the MP3 URL."
        );
      });

    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    };
  };

  /* =========================================================
     CLOUDINARY UPLOAD
  ========================================================= */

  const openCloudinaryUploadWidget = (
    onSuccessCallback: (
      url: string
    ) => void
  ) => {
    if (
      typeof window === "undefined" ||
      !window.cloudinary
    ) {
      alert(
        "Cloudinary widget is still loading. Please try again."
      );

      return;
    }

    const cloudName =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert(
        "Missing Cloudinary environment variables."
      );

      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName,
        uploadPreset,

        sources: [
          "local",
          "url",
          "camera",
          "dropbox",
        ],

        multiple: false,

        folder: "beat_artwork",

        clientAllowedFormats: [
          "png",
          "jpeg",
          "jpg",
          "webp",
        ],

        maxFileSize: 10000000,
      },

      (error: any, result: any) => {
        if (
          !error &&
          result &&
          result.event === "success"
        ) {
          onSuccessCallback(
            result.info.secure_url
          );
        }
      }
    );
  };

  /* =========================================================
     CLOUDINARY MEDIA LIBRARY
  ========================================================= */

  const openCloudinaryMediaLibrary = (
    onSuccessCallback: (
      url: string
    ) => void
  ) => {
    if (
      typeof window === "undefined" ||
      !window.cloudinary
    ) {
      alert(
        "Cloudinary Media Library is still loading."
      );

      return;
    }

    const cloudName =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      alert(
        "Cloudinary Cloud Name or API Key is missing."
      );

      return;
    }

    window.cloudinary.openMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: apiKey,
        multiple: false,
        insert_caption: "Use Selected Asset",
      },

      {
        insertHandler: (
          data: any
        ) => {
          if (
            data.assets &&
            data.assets.length > 0
          ) {
            onSuccessCallback(
              data.assets[0].secure_url
            );
          }
        },
      }
    );
  };

  /* =========================================================
     ROW SELECTION
  ========================================================= */

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (selectedId) =>
              selectedId !== id
          )
        : [...prev, id]
    );
  }

  function selectAllCatalog() {
    setSelectedIds(
      beats.map((beat) => beat.id)
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function isSelected(id: string) {
    return selectedIds.includes(id);
  }

  /* =========================================================
     SORTING
  ========================================================= */

  const handleSort = (
    field: SortField
  ) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* =========================================================
     INLINE EDITING
  ========================================================= */

  const handleBulkChange = (
    id: string,
    field: keyof BeatTrack,
    value: any
  ) => {
    setBeats((prev) => {
      const updated = prev.map(
        (beat) =>
          beat.id === id
            ? {
                ...beat,
                [field]: value,
              }
            : beat
      );

      recalculateTelemetry(updated);

      return updated;
    });
  };

  /* =========================================================
     APPLY IMAGE TO ALL SELECTED
  ========================================================= */

  function applyAssetToSelected(
    field:
      | "artworkUrl"
      | "backgroundUrl",
    url: string
  ) {
    if (selectedIds.length === 0) {
      alert(
        "Select at least one beat first."
      );

      return;
    }

    setBeats((prev) =>
      prev.map((beat) =>
        selectedIds.includes(beat.id)
          ? {
              ...beat,
              [field]: url,
            }
          : beat
      )
    );
  }

  function clearAssetFromSelected(
    field:
      | "artworkUrl"
      | "backgroundUrl"
  ) {
    if (selectedIds.length === 0) {
      return;
    }

    setBeats((prev) =>
      prev.map((beat) =>
        selectedIds.includes(beat.id)
          ? {
              ...beat,
              [field]: "",
            }
          : beat
      )
    );
  }

  /* =========================================================
     SAVE ONLY SELECTED ROWS
  ========================================================= */

  const saveSelectedChangesToServer =
    async () => {
      if (selectedIds.length === 0) {
        alert(
          "Select the beat or beats you want to save."
        );

        return;
      }

      const selectedBeats =
        beats.filter((beat) =>
          selectedIds.includes(beat.id)
        );

      try {
        setIsSubmitting(true);

        const res = await fetch(
          "/api/admin/beats/bulk-update",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              beats: selectedBeats,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            "Backend rejected selected beat changes."
          );
        }

        alert(
          `${selectedBeats.length} beat(s) updated successfully.`
        );

        setSelectedIds([]);
      } catch (err) {
        console.error(err);

        alert(
          "Error saving selected beat changes."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /* =========================================================
     SINGLE TRACK SUBMIT
  ========================================================= */

  const handleUploadSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setIsSubmitting(true);

    const payload = {
      title,

      bpm: bpm
        ? parseInt(bpm, 10)
        : 0,

      genre,

      freeDownload,

      musicalKey,

      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      priceStandard:
        parseFloat(priceStd) || 0,

      pricePremium:
        parseFloat(pricePrem) || 0,

      mp3Url,

      zipUrl,

      standardFileUrl,

      artworkUrl,

      backgroundUrl,

      plays: 0,

      downloads: 0,
    };

    try {
      const res = await fetch(
        "/api/admin/beats",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Beat save failed."
        );
      }

      const newBeat =
        data.beat || data;

      const updatedCatalog = [
        newBeat,
        ...beats,
      ];

      setBeats(updatedCatalog);

      recalculateTelemetry(
        updatedCatalog
      );

      setTitle("");
      setBpm("");
      setGenre("");
      setFreeDownload(false);
      setMusicalKey("");
      setTags("");
      setMp3Url("");
      setZipUrl("");
      setStandardFileUrl("");
      setArtworkUrl("");
      setBackgroundUrl("");

      alert(
        "Beat created successfully!"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Error saving beat. Please check route configuration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     CSV / JSON BULK IMPORT
  ========================================================= */

  const parseBulkInput = (
    inputString: string
  ) => {
    const trimmed =
      inputString.trim();

    if (
      trimmed.startsWith("[") &&
      trimmed.endsWith("]")
    ) {
      const parsed =
        JSON.parse(trimmed);

      return parsed.map(
        (item: any) => ({
          title:
            item.title ||
            "Untitled",

          bpm:
            Number(item.bpm) ||
            120,

          genre:
            item.genre ||
            "Hip Hop",

          freeDownload:
            Boolean(
              item.freeDownload
            ),

          musicalKey:
            item.musicalKey ||
            "C Major",

          tags: Array.isArray(
            item.tags
          )
            ? item.tags
            : String(
                item.tags || ""
              )
                .split(",")
                .map((tag) =>
                  tag.trim()
                )
                .filter(Boolean),

          priceStandard:
            Number(
              item.priceStandard ||
                item.priceStd
            ) || 29.99,

          pricePremium:
            Number(
              item.pricePremium ||
                item.pricePrem
            ) || 79.99,

          mp3Url:
            item.mp3Url || "",

          zipUrl:
            item.zipUrl || "",

          standardFileUrl:
            item.standardFileUrl ||
            item.standardZipUrl ||
            "",

          artworkUrl:
            item.artworkUrl ||
            item.artwork ||
            item.coverArt ||
            "",

          backgroundUrl:
            item.backgroundUrl ||
            item.bgUrl ||
            item.background ||
            "",

          plays: 0,

          downloads: 0,
        })
      );
    }

    const lines = trimmed
      .split("\n")
      .filter(
        (line) =>
          line.trim() !== ""
      );

    if (lines.length < 2) {
      throw new Error(
        "CSV requires a header row and at least one row of data."
      );
    }

    const headers = lines[0]
      .split(",")
      .map((header) =>
        header
          .trim()
          .toLowerCase()
      );

    return lines
      .slice(1)
      .map((line) => {
        const values = line
          .split(",")
          .map((value) =>
            value.trim()
          );

        const row: Record<
          string,
          string
        > = {};

        headers.forEach(
          (header, index) => {
            row[header] =
              values[index] || "";
          }
        );

        return {
          title:
            row["title"] ||
            "Untitled",

          bpm:
            parseInt(
              row["bpm"],
              10
            ) || 120,

          genre:
            row["genre"] ||
            "Trap",

          freeDownload:
            row[
              "freedownload"
            ] === "true",

          musicalKey:
            row["key"] ||
            row[
              "musicalkey"
            ] ||
            "C Minor",

          tags: (
            row["tags"] || ""
          )
            .split(";")
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean),

          priceStandard:
            parseFloat(
              row[
                "pricestandard"
              ] ||
                row["lease"]
            ) || 29.99,

          pricePremium:
            parseFloat(
              row[
                "pricepremium"
              ] ||
                row["premium"]
            ) || 79.99,

          mp3Url:
            row["mp3url"] ||
            row["mp3"] ||
            "",

          zipUrl:
            row["zipurl"] ||
            row["zip"] ||
            "",

          standardFileUrl:
            row["standardfileurl"] ||
            row["standardzipurl"] ||
            row["standardzip"] ||
            "",

          artworkUrl:
            row[
              "artworkurl"
            ] ||
            row["artwork"] ||
            row["coverart"] ||
            "",

          backgroundUrl:
            row[
              "backgroundurl"
            ] ||
            row["bgurl"] ||
            row[
              "background"
            ] ||
            "",

          plays: 0,

          downloads: 0,
        };
      });
  };

  const handleBulkFileUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (
      event
    ) => {
      const content =
        event.target
          ?.result as string;

      setBulkRawInput(
        content
      );
    };

    reader.readAsText(file);
  };

  const handleBulkUploadSubmit =
    async (e: FormEvent) => {
      e.preventDefault();

      setBulkParseError(null);

      setIsSubmitting(true);

      try {
        const parsedTracks =
          parseBulkInput(
            bulkRawInput
          );

        const res = await fetch(
          "/api/admin/beats/bulk-upload",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              beats:
                parsedTracks,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            "Batch upload server error."
          );
        }

        const data =
          await res.json();

        const createdBeats: BeatTrack[] =
          data.beats || [];

        const updatedCatalog = [
          ...createdBeats,
          ...beats,
        ];

        setBeats(
          updatedCatalog
        );

        recalculateTelemetry(
          updatedCatalog
        );

        setBulkRawInput("");

        alert(
          `Successfully imported ${createdBeats.length} tracks!`
        );
      } catch (err: any) {
        console.error(err);

        setBulkParseError(
          err.message ||
            "Invalid formatting."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /* =========================================================
     SORT / PAGINATION
  ========================================================= */

  const sortedBeats = [
    ...beats,
  ].sort((a, b) => {
    let aValue: any =
      a[sortField] ?? "";

    let bValue: any =
      b[sortField] ?? "";

    if (
      typeof aValue ===
      "string"
    ) {
      aValue =
        aValue.toLowerCase();

      bValue = String(
        bValue
      ).toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder === "asc"
        ? -1
        : 1;
    }

    if (aValue > bValue) {
      return sortOrder === "asc"
        ? 1
        : -1;
    }

    return 0;
  });

  const totalPages =
    Math.ceil(
      sortedBeats.length /
        itemsPerPage
    ) || 1;

  const currentPagedBeats =
    sortedBeats.slice(
      (currentPage - 1) *
        itemsPerPage,

      currentPage *
        itemsPerPage
    );

  const currentPageIds =
    currentPagedBeats.map(
      (beat) => beat.id
    );

  const allPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) =>
      selectedIds.includes(id)
    );

  function toggleCurrentPage() {
    if (allPageSelected) {
      setSelectedIds((prev) =>
        prev.filter(
          (id) =>
            !currentPageIds.includes(
              id
            )
        )
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(
          new Set([
            ...prev,
            ...currentPageIds,
          ])
        )
      );
    }
  }

  const renderSortArrow = (
    field: SortField
  ) => {
    if (sortField !== field) {
      return (
        <span className="opacity-30">
          {" "}
          ↕
        </span>
      );
    }

    return sortOrder === "asc"
      ? " ↑"
      : " ↓";
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AdminLayout active="beats">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
      />

      <Script
        src="https://media-library.cloudinary.com/global/all.js"
        strategy="lazyOnload"
      />

      <div className="space-y-8 text-zinc-900 pb-12">
        {/* =====================================================
            CATALOG INTAKE
        ===================================================== */}

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-6 gap-4">
            <div>
              <h1 className="text-xl font-black text-zinc-900">
                Beats Catalog Intake
              </h1>

              <p className="text-xs text-zinc-500">
                Upload beats and select
                front / background
                artwork directly from
                Cloudinary.
              </p>
            </div>

            <div className="flex bg-zinc-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setIntakeMode(
                    "single"
                  )
                }
                className={`px-4 py-2 text-xs font-bold rounded-md ${
                  intakeMode ===
                  "single"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                + Single Track
              </button>

              <button
                type="button"
                onClick={() =>
                  setIntakeMode(
                    "bulk"
                  )
                }
                className={`px-4 py-2 text-xs font-bold rounded-md ${
                  intakeMode ===
                  "bulk"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                ⚡ Bulk Upload
              </button>
            </div>
          </div>

          {intakeMode ===
          "single" ? (
            <form
              onSubmit={
                handleUploadSubmit
              }
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Track Title *"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm font-semibold"
                  required
                />

                <input
                  type="number"
                  value={bpm}
                  onChange={(e) =>
                    setBpm(
                      e.target.value
                    )
                  }
                  placeholder="BPM"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm"
                />

                <input
                  type="text"
                  value={genre}
                  onChange={(e) =>
                    setGenre(
                      e.target.value
                    )
                  }
                  placeholder="Genre *"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm"
                  required
                />

                <input
                  type="text"
                  value={
                    musicalKey
                  }
                  onChange={(e) =>
                    setMusicalKey(
                      e.target.value
                    )
                  }
                  placeholder="Musical Key"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) =>
                    setTags(
                      e.target.value
                    )
                  }
                  placeholder="Tags (comma separated)"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm md:col-span-2"
                />

                <input
                  type="number"
                  step="0.01"
                  value={priceStd}
                  onChange={(e) =>
                    setPriceStd(
                      e.target.value
                    )
                  }
                  placeholder="Lease Price"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm"
                />

                <input
                  type="number"
                  step="0.01"
                  value={pricePrem}
                  onChange={(e) =>
                    setPricePrem(
                      e.target.value
                    )
                  }
                  placeholder="Premium Price"
                  className="bg-zinc-50 border p-3 rounded-lg text-sm"
                />
              </div>

              {/* CARD ARTWORK */}

              <div className="grid md:grid-cols-3 gap-5">
                <div className="flex justify-center items-center bg-zinc-950 rounded-xl p-4">
                  <BeatCardPreview
                    artworkUrl={
                      artworkUrl
                    }
                    backgroundUrl={
                      backgroundUrl
                    }
                    title={
                      title ||
                      "Beat Preview"
                    }
                    large
                  />
                </div>

                {/* FRONT */}

                <div className="border rounded-xl p-4 bg-zinc-50 space-y-3">
                  <h3 className="font-black text-sm">
                    🖼 Front Artwork
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Choose an
                    existing asset or
                    upload a new one.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openCloudinaryMediaLibrary(
                        (url) =>
                          setArtworkUrl(
                            url
                          )
                      )
                    }
                    className="w-full bg-zinc-900 text-white p-2.5 rounded-lg font-bold text-xs"
                  >
                    📁 Choose From
                    Library
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCloudinaryUploadWidget(
                        (url) =>
                          setArtworkUrl(
                            url
                          )
                      )
                    }
                    className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold text-xs"
                  >
                    ☁️ Upload New
                    Front
                  </button>

                  {artworkUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setArtworkUrl(
                          ""
                        )
                      }
                      className="w-full bg-red-100 text-red-700 p-2 rounded text-xs font-bold"
                    >
                      Clear Front
                    </button>
                  )}
                </div>

                {/* BACKGROUND */}

                <div className="border rounded-xl p-4 bg-zinc-50 space-y-3">
                  <h3 className="font-black text-sm">
                    🌄 Card Background
                  </h3>

                  <p className="text-xs text-zinc-500">
                    Choose an
                    existing
                    background or
                    upload a new one.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openCloudinaryMediaLibrary(
                        (url) =>
                          setBackgroundUrl(
                            url
                          )
                      )
                    }
                    className="w-full bg-zinc-900 text-white p-2.5 rounded-lg font-bold text-xs"
                  >
                    📁 Choose From
                    Library
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCloudinaryUploadWidget(
                        (url) =>
                          setBackgroundUrl(
                            url
                          )
                      )
                    }
                    className="w-full bg-purple-600 text-white p-2.5 rounded-lg font-bold text-xs"
                  >
                    ☁️ Upload New
                    Background
                  </button>

                  {backgroundUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setBackgroundUrl(
                          ""
                        )
                      }
                      className="w-full bg-red-100 text-red-700 p-2 rounded text-xs font-bold"
                    >
                      Clear Background
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="url"
                  value={mp3Url}
                  onChange={(e) =>
                    setMp3Url(
                      e.target.value
                    )
                  }
                  placeholder="Tagged MP3 / Preview URL *"
                  className="bg-zinc-50 border p-3 rounded-lg text-xs font-mono"
                  required
                />

                <input
                  type="url"
                  value={standardFileUrl}
                  onChange={(e) =>
                    setStandardFileUrl(
                      e.target.value
                    )
                  }
                  placeholder="Standard ZIP URL (untagged MP3 + WAV)"
                  className="bg-zinc-50 border p-3 rounded-lg text-xs font-mono"
                />

                <input
                  type="url"
                  value={zipUrl}
                  onChange={(e) =>
                    setZipUrl(
                      e.target.value
                    )
                  }
                  placeholder="Premium / Exclusive Stems ZIP URL *"
                  className="bg-zinc-50 border p-3 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={
                      freeDownload
                    }
                    onChange={(e) =>
                      setFreeDownload(
                        e.target.checked
                      )
                    }
                  />

                  Allow Free
                  Promotional
                  Download
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="bg-zinc-950 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Beat Track"}
                </button>
              </div>
            </form>
          ) : (
            /* BULK IMPORT */

            <form
              onSubmit={
                handleBulkUploadSubmit
              }
              className="space-y-4"
            >
              <div className="bg-zinc-50 border rounded-lg p-4">
                <h3 className="font-bold text-sm">
                  Import CSV or JSON
                </h3>

                <p className="text-xs text-zinc-500 mt-1">
                  Existing
                  artworkUrl and
                  backgroundUrl
                  columns are still
                  supported for file
                  imports.
                </p>

                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={
                    handleBulkFileUpload
                  }
                  className="mt-4 text-xs"
                />
              </div>

              <textarea
                value={bulkRawInput}
                onChange={(e) =>
                  setBulkRawInput(
                    e.target.value
                  )
                }
                placeholder="Paste CSV or JSON data..."
                rows={8}
                className="w-full bg-zinc-50 border p-3 rounded-lg text-xs font-mono"
                required
              />

              {bulkParseError && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs">
                  🚨{" "}
                  {bulkParseError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !bulkRawInput.trim()
                  }
                  className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Importing..."
                    : "Execute Bulk Import"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =====================================================
            TELEMETRY
        ===================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-950 text-white rounded-xl p-5 border border-zinc-800">
            <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
              🔥 Top Played Track
            </span>

            <h4 className="text-xl font-black mt-1 truncate">
              {
                telemetry.topPlayedTitle
              }
            </h4>

            <p className="text-xs mt-1 font-mono opacity-80">
              {telemetry.topPlayedCount.toLocaleString()}{" "}
              Plays
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              💾 Top Downloaded
              Track
            </span>

            <h4 className="text-xl font-black mt-1 truncate">
              {
                telemetry.mostDownloadedTitle
              }
            </h4>

            <p className="text-xs mt-1 font-mono text-zinc-500">
              {telemetry.mostDownloadedCount.toLocaleString()}{" "}
              Downloads
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              📈 Total Catalog
              Plays
            </span>

            <h4 className="text-2xl font-black mt-1 font-mono">
              {telemetry.totalCatalogPlays.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* =====================================================
            SELECTED BEAT TOOLS
        ===================================================== */}

        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="font-black text-lg">
                Selected Beat
                Controls
              </h2>

              <p className="text-xs text-zinc-500">
                {selectedIds.length}{" "}
                beat(s) currently
                selected.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  toggleCurrentPage
                }
                className="bg-zinc-800 text-white px-4 py-2 rounded text-xs font-bold"
              >
                {allPageSelected
                  ? "Deselect Current Page"
                  : "Select Current Page"}
              </button>

              <button
                type="button"
                onClick={
                  selectAllCatalog
                }
                className="bg-zinc-800 text-white px-4 py-2 rounded text-xs font-bold"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="bg-zinc-200 text-black px-4 py-2 rounded text-xs font-bold"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* APPLY COMMON IMAGES */}

          <div className="border-t pt-4">
            <p className="text-xs font-black uppercase text-zinc-500 mb-3">
              Apply Card Asset To
              Selected Beats
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  selectedIds.length ===
                  0
                }
                onClick={() =>
                  openCloudinaryMediaLibrary(
                    (url) =>
                      applyAssetToSelected(
                        "artworkUrl",
                        url
                      )
                  )
                }
                className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
              >
                📁 Choose Front
              </button>

              <button
                type="button"
                disabled={
                  selectedIds.length ===
                  0
                }
                onClick={() =>
                  openCloudinaryMediaLibrary(
                    (url) =>
                      applyAssetToSelected(
                        "backgroundUrl",
                        url
                      )
                  )
                }
                className="bg-purple-600 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
              >
                📁 Choose Background
              </button>

              <button
                type="button"
                disabled={
                  selectedIds.length ===
                  0
                }
                onClick={() =>
                  clearAssetFromSelected(
                    "artworkUrl"
                  )
                }
                className="bg-zinc-200 px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
              >
                Clear Front
              </button>

              <button
                type="button"
                disabled={
                  selectedIds.length ===
                  0
                }
                onClick={() =>
                  clearAssetFromSelected(
                    "backgroundUrl"
                  )
                }
                className="bg-zinc-200 px-4 py-2 rounded text-xs font-bold disabled:opacity-40"
              >
                Clear Background
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={
              selectedIds.length ===
                0 || isSubmitting
            }
            onClick={
              saveSelectedChangesToServer
            }
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-lg disabled:opacity-40"
          >
            {isSubmitting
              ? "SAVING..."
              : `SAVE SELECTED CHANGES (${selectedIds.length})`}
          </button>
        </div>

        {/* =====================================================
            CATALOG GRID
        ===================================================== */}

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-zinc-50 border-b">
            <h2 className="font-bold text-zinc-900">
              Saved Beats Inventory
            </h2>

            <p className="text-xs text-zinc-500">
              Tick the beat you want
              to edit. Only checked
              rows will be saved.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-medium">
              <thead>
                <tr className="bg-zinc-100 border-b text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        allPageSelected
                      }
                      onChange={
                        toggleCurrentPage
                      }
                      title="Select current page"
                    />
                  </th>

                  <th className="p-3 text-center">
                    Audio
                  </th>

                  <th className="p-3 text-center">
                    Card
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "title"
                      )
                    }
                    className="p-3 cursor-pointer"
                  >
                    Title{" "}
                    {renderSortArrow(
                      "title"
                    )}
                  </th>

                  <th
                    onClick={() =>
                      handleSort("bpm")
                    }
                    className="p-3 cursor-pointer"
                  >
                    BPM{" "}
                    {renderSortArrow(
                      "bpm"
                    )}
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "genre"
                      )
                    }
                    className="p-3 cursor-pointer"
                  >
                    Genre{" "}
                    {renderSortArrow(
                      "genre"
                    )}
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "musicalKey"
                      )
                    }
                    className="p-3 cursor-pointer"
                  >
                    Key{" "}
                    {renderSortArrow(
                      "musicalKey"
                    )}
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "priceStandard"
                      )
                    }
                    className="p-3 cursor-pointer"
                  >
                    Lease{" "}
                    {renderSortArrow(
                      "priceStandard"
                    )}
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "pricePremium"
                      )
                    }
                    className="p-3 cursor-pointer"
                  >
                    Premium{" "}
                    {renderSortArrow(
                      "pricePremium"
                    )}
                  </th>

                  <th className="p-3 text-center">
                    Plays
                  </th>

                  <th className="p-3 text-center">
                    Downloads
                  </th>

                  <th className="p-3">
                    Card Assets / Downloads
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="p-8 text-center text-zinc-400"
                    >
                      Loading
                      catalogue...
                    </td>
                  </tr>
                ) : currentPagedBeats.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="p-8 text-center text-zinc-400"
                    >
                      No beats found.
                    </td>
                  </tr>
                ) : (
                  currentPagedBeats.map(
                    (beat) => {
                      const selected =
                        isSelected(
                          beat.id
                        );

                      const inputClass = `border rounded px-2 py-1 text-xs ${
                        selected
                          ? "bg-white border-zinc-400 text-black"
                          : "bg-zinc-100 border-transparent text-zinc-400"
                      }`;

                      return (
                        <tr
                          key={beat.id}
                          className={
                            selected
                              ? "bg-emerald-50"
                              : "hover:bg-zinc-50"
                          }
                        >
                          {/* SELECT */}

                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                toggleSelected(
                                  beat.id
                                )
                              }
                              className="w-4 h-4"
                            />
                          </td>

                          {/* AUDIO */}

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                togglePlayAudio(
                                  beat
                                )
                              }
                              className={`w-8 h-8 rounded-full font-bold ${
                                currentPlayingId ===
                                  beat.id &&
                                isPlaying
                                  ? "bg-amber-500 text-white"
                                  : "bg-zinc-100"
                              }`}
                            >
                              {currentPlayingId ===
                                beat.id &&
                              isPlaying
                                ? "⏸"
                                : "▶"}
                            </button>
                          </td>

                          {/* PREVIEW */}

                          <td className="p-3">
                            <BeatCardPreview
                              artworkUrl={
                                beat.artworkUrl
                              }
                              backgroundUrl={
                                beat.backgroundUrl
                              }
                              title={
                                beat.title
                              }
                            />
                          </td>

                          {/* TITLE */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              value={
                                beat.title
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "title",
                                  e.target
                                    .value
                                )
                              }
                              className={`${inputClass} w-40 font-semibold`}
                            />
                          </td>

                          {/* BPM */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              type="number"
                              value={
                                beat.bpm ||
                                ""
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "bpm",
                                  parseInt(
                                    e
                                      .target
                                      .value,
                                    10
                                  ) || 0
                                )
                              }
                              className={`${inputClass} w-16`}
                            />
                          </td>

                          {/* GENRE */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              value={
                                beat.genre ||
                                ""
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "genre",
                                  e.target
                                    .value
                                )
                              }
                              className={`${inputClass} w-28`}
                            />
                          </td>

                          {/* KEY */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              value={
                                beat.musicalKey ||
                                ""
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "musicalKey",
                                  e.target
                                    .value
                                )
                              }
                              className={`${inputClass} w-24`}
                            />
                          </td>

                          {/* STANDARD */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              type="number"
                              step="0.01"
                              value={
                                beat.priceStandard
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "priceStandard",
                                  parseFloat(
                                    e
                                      .target
                                      .value
                                  ) || 0
                                )
                              }
                              className={`${inputClass} w-20`}
                            />
                          </td>

                          {/* PREMIUM */}

                          <td className="p-3">
                            <input
                              disabled={
                                !selected
                              }
                              type="number"
                              step="0.01"
                              value={
                                beat.pricePremium
                              }
                              onChange={(e) =>
                                handleBulkChange(
                                  beat.id,
                                  "pricePremium",
                                  parseFloat(
                                    e
                                      .target
                                      .value
                                  ) || 0
                                )
                              }
                              className={`${inputClass} w-20`}
                            />
                          </td>

                          <td className="p-3 text-center font-mono">
                            {beat.plays ||
                              0}
                          </td>

                          <td className="p-3 text-center font-mono">
                            {beat.downloads ||
                              0}
                          </td>

                          {/* ASSETS */}

                          <td className="p-3 min-w-[190px]">
                            <div className="space-y-2">
                              <input
                                disabled={
                                  !selected
                                }
                                type="url"
                                value={
                                  beat.standardFileUrl ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleBulkChange(
                                    beat.id,
                                    "standardFileUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="Standard ZIP URL"
                                className={`${inputClass} w-full font-mono`}
                              />

                              <input
                                disabled={
                                  !selected
                                }
                                type="url"
                                value={
                                  beat.zipUrl ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleBulkChange(
                                    beat.id,
                                    "zipUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="Premium / Exclusive ZIP URL"
                                className={`${inputClass} w-full font-mono`}
                              />

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    !selected
                                  }
                                  onClick={() =>
                                    openCloudinaryMediaLibrary(
                                      (
                                        url
                                      ) =>
                                        handleBulkChange(
                                          beat.id,
                                          "artworkUrl",
                                          url
                                        )
                                    )
                                  }
                                  className="flex-1 bg-blue-600 text-white rounded px-2 py-1 text-[10px] font-bold disabled:opacity-30"
                                >
                                  Choose Front
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    !selected
                                  }
                                  onClick={() =>
                                    openCloudinaryUploadWidget(
                                      (
                                        url
                                      ) =>
                                        handleBulkChange(
                                          beat.id,
                                          "artworkUrl",
                                          url
                                        )
                                    )
                                  }
                                  className="bg-blue-100 px-2 rounded disabled:opacity-30"
                                >
                                  ☁️
                                </button>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    !selected
                                  }
                                  onClick={() =>
                                    openCloudinaryMediaLibrary(
                                      (
                                        url
                                      ) =>
                                        handleBulkChange(
                                          beat.id,
                                          "backgroundUrl",
                                          url
                                        )
                                    )
                                  }
                                  className="flex-1 bg-purple-600 text-white rounded px-2 py-1 text-[10px] font-bold disabled:opacity-30"
                                >
                                  Choose BG
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    !selected
                                  }
                                  onClick={() =>
                                    openCloudinaryUploadWidget(
                                      (
                                        url
                                      ) =>
                                        handleBulkChange(
                                          beat.id,
                                          "backgroundUrl",
                                          url
                                        )
                                    )
                                  }
                                  className="bg-purple-100 px-2 rounded disabled:opacity-30"
                                >
                                  ☁️
                                </button>
                              </div>

                              {(beat.artworkUrl ||
                                beat.backgroundUrl) &&
                                selected && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleBulkChange(
                                        beat.id,
                                        "artworkUrl",
                                        ""
                                      );

                                      handleBulkChange(
                                        beat.id,
                                        "backgroundUrl",
                                        ""
                                      );
                                    }}
                                    className="text-[9px] text-red-600 underline"
                                  >
                                    Clear Card
                                    Images
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="p-4 bg-zinc-50 border-t flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Page {currentPage} of{" "}
                {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          page - 1,
                          1
                        )
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                  className="px-3 py-2 text-xs font-bold bg-white border rounded disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          totalPages
                        )
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  className="px-3 py-2 text-xs font-bold bg-white border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
