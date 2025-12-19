"use client";
import { useState } from "react";

export default function UploadBeat() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState("");
  const [licenses, setLicenses] = useState([
    { name: "Basic", price: 20 },
    { name: "Premium", price: 50 },
    { name: "Exclusive", price: 200 },
  ]);

  const [artwork, setArtwork] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [beatFile, setBeatFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork || !audio || !beatFile) return alert("All files are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("bpm", bpm);
    formData.append("key", key);
    formData.append("genre", genre);
    formData.append("licenses", JSON.stringify(licenses));

    formData.append("artwork", artwork);
    formData.append("audio", audio);
    formData.append("beatFile", beatFile);

    try {
      const res = await fetch("/api/beats/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        alert("Beat uploaded successfully!");
        // Optionally redirect to marketplace page
        window.location.href = "/beats";
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-2 p-4">
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <input placeholder="BPM" type="number" value={bpm} onChange={e => setBpm(e.target.value)} />
      <input placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
      <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
      <label>Artwork File</label>
      <input type="file" accept="image/*" onChange={e => setArtwork(e.target.files![0])} required />
      <label>Audio Preview</label>
      <input type="file" accept="audio/*" onChange={e => setAudio(e.target.files![0])} required />
      <label>Full Beat File</label>
      <input type="file" accept="audio/*" onChange={e => setBeatFile(e.target.files![0])} required />

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Upload Beat</button>
    </form>
  );
}
