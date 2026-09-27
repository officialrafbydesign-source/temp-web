"use client";

import { useState, useEffect } from "react";

interface CloudinaryImagePickerProps {
  onSelectImage: (url: string) => void;
  currentValue?: string;
  folder?: string;
}

export default function CloudinaryImagePicker({
  onSelectImage,
  currentValue,
  folder = "design",
}: CloudinaryImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCloudinaryMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?folder=${folder}`);
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch (err) {
      console.error("Failed to load Cloudinary media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudinaryMedia();
    }
  }, [isOpen]);

  return (
    <div className="space-y-2 font-mono">
      {/* Current Selection Preview */}
      <div className="flex items-center gap-4">
        {currentValue ? (
          <div className="w-16 h-16 relative border-2 border-black rounded bg-zinc-900 overflow-hidden shrink-0">
            <img
              src={currentValue}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500">
            NO IMAGE
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-500 text-black font-black text-xs px-4 py-2 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
        >
          {currentValue ? "Change Image" : "Select from Cloudinary"}
        </button>
      </div>

      {/* Cloudinary Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-4 border-black w-full max-w-4xl max-h-[80vh] rounded-xl flex flex-col p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b-4 border-black mb-4">
              <h3 className="text-lg font-black uppercase text-red-500">
                SELECT CLOUDINARY ASSET
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-zinc-500 text-xs">
                Loading Cloudinary media library...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto p-2">
                {images.map((img) => (
                  <div
                    key={img.publicId}
                    onClick={() => {
                      onSelectImage(img.url);
                      setIsOpen(false);
                    }}
                    className="group border-2 border-black rounded bg-zinc-900 p-2 cursor-pointer hover:border-red-500 transition"
                  >
                    <div className="aspect-square relative overflow-hidden rounded mb-2">
                      <img
                        src={img.url}
                        alt={img.publicId}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <p className="text-[9px] text-zinc-400 truncate font-bold">
                      {img.publicId.split("/").pop()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}