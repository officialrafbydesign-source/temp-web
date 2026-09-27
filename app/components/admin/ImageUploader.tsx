"use client";

import { CldUploadWidget } from "next-cloudinary";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 1,
        clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
      }}
      onSuccess={(result) => {
        // Look closely here: info contains the public metadata
        if (result.info && typeof result.info !== "string") {
          const secureUrl = result.info.secure_url;
          // This gives you: https://res.cloudinary.com/dcrkpsnn9/image/upload/v.../filename.jpg

          onUploadSuccess(secureUrl);
        }
      }}
    >
      {({ open }) => {
        return (
          <button
            type="button"
            onClick={() => open()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border-2 border-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5"
          >
            Upload Artwork
          </button>
        );
      }}
    </CldUploadWidget>
  );
}