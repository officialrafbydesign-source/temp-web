"use client";

import { useState } from "react";

type License = {
  name: string;
  price: number;
};

export default function UploadBeatPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");

  const [artwork, setArtwork] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [beatFile, setBeatFile] = useState<File | null>(null);

  const [licenses, setLicenses] = useState<License[]>([
    { name: "MP3 Lease", price: 20 },
    { name: "WAV Lease", price: 40 },
    { name: "Unlimited Lease", price: 80 },
  ]);

  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

const handleLicenseChange = (
  index: number,
  field: "name" | "price",
  value: string | number
) => {
  const newLicenses = [...licenses];
  if (field === "name" && typeof value === "string") {
    newLicenses[index].name = value;
  } else if (field === "price" && typeof value === "number") {
    newLicenses[index].price = value;
  }
  setLicenses(newLicenses);
};


  const addLicense = () =>
    setLicenses([...licenses, { name: "", price: 0 }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("bpm", bpm);
    formData.append("key", key);
    formData.append("genre", genre);

    formData.append("licenses", JSON.stringify(licenses));

    if (artwork) formData.append("artwork", artwork);
    if (audio) formData.append("audio", audio);
    if (beatFile) formData.append("beatFile", beatFile);

    const res = await fetch("/api/beats/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setResultMsg("Beat uploaded successfully! ✅");
      setTitle("");
      setDescription("");
      setBpm("");
      setKey("");
      setGenre("");
      setArtwork(null);
      setAudio(null);
      setBeatFile(null);
    } else {
      setResultMsg("Error: " + data.error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload New Beat</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TEXT FIELDS */}
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            className="border rounded p-2 w-full"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            value={description}
            className="border rounded p-2 w-full"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>BPM:</label>
            <input
              type="number"
              className="border rounded p-2 w-full"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
            />
          </div>

          <div>
            <label>Key:</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div>
            <label>Genre:</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
        </div>

        {/* LICENSES */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Licenses</h2>

          {licenses.map((lic, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input
                type="text"
                className="border p-2 flex-1"
                value={lic.name}
                placeholder="License Name"
                onChange={(e) =>
                  handleLicenseChange(index, "name", e.target.value)
                }
              />
              <input
                type="number"
                className="border p-2 w-32"
                value={lic.price}
                placeholder="Price"
                onChange={(e) =>
                  handleLicenseChange(index, "price", Number(e.target.value))
                }
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addLicense}
            className="mt-2 px-4 py-1 bg-gray-200 rounded"
          >
            + Add License
          </button>
        </div>

        {/* FILE UPLOADS */}
        <div>
          <label>Artwork Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArtwork(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label>Audio Preview (MP3):</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label>Full Beat File (WAV/ZIP):</label>
          <input
            type="file"
            onChange={(e) => setBeatFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded"
        >
          {loading ? "Uploading..." : "Upload Beat"}
        </button>

        {resultMsg && <p className="mt-4">{resultMsg}</p>}
      </form>
    </div>
  );
}
