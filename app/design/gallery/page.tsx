"use client";

import { useState, useEffect } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

type ServiceGallery = {
  service: string;
  description?: string;
  images: GalleryImage[];
};

// Default fallback data if a category has no Cloudinary images yet
const defaultGalleryData: ServiceGallery[] = [
  {
    service: "Logo Design",
    images: [
      { url: "/images/comission__natural_flavours_log.png", alt: "Natural Flavours Logo" },
      { url: "/images/comission__reality_team_tv_logo.png", alt: "Reality Team TV Logo" },
      { url: "/images/comission__table_time_podcast_logo_mono.jpg", alt: "Table Time Podcast Logo Mono" },
      { url: "/images/comission__table_time_podcast_logo.png", alt: "Table Time Podcast Logo" },
      { url: "/images/commission__iamlensphotography_logo.jpg", alt: "Iam Lens Photography Logo" },
      { url: "/images/commission__js_painting_and_decorating_logo.jpg", alt: "JS Painting and Decorating Logo" },
      { url: "/images/duchess_beauty_logo_redesign.png", alt: "Duchess Beauty Logo Redesign" },
      { url: "/images/duchess_beauty_logo_redesign_white.png", alt: "Duchess Beauty Logo Redesign White" },
      { url: "/images/LL Logo White.png", alt: "LL Logo White" },
    ],
  },
  {
    service: "2D Character / Mascot",
    images: [
      { url: "/images/2d_character__model_woman__full_colour___details.png", alt: "Model Woman Character Full Colour" },
      { url: "/images/2d_character__model_woman_2__basic_version.png", alt: "Model Woman Character Basic Version" },
    ],
  },
  {
    service: "Flyers",
    images: [
      { url: "/images/commission__lj_painting_and_decorating_flyer.jpg", alt: "LJ Painting and Decorating Flyer" },
    ],
  },
  {
    service: "Brochures / Menus",
    images: [
      { url: "/images/JSKITCHENANDGRILL MENU BIG.png", alt: "JS Kitchen and Grill Menu" },
      { url: "/images/natural_flavours_new_lunchtime_menu.jpg", alt: "Natural Flavours Lunchtime Menu" },
    ],
  },
  {
    service: "Music Cover Design",
    images: [
      { url: "/images/commission__a__staxx_x_fend_x_yohan__kodak_single.jpg", alt: "Kodak Single Cover" },
      { url: "/images/commission__fend__escape_single.jpg", alt: "Escape Single Cover" },
      { url: "/images/trap_king_chrome__dark_knight_cover.jpg", alt: "Dark Knight Cover" },
    ],
  },
  {
    service: "Business Card",
    images: [
      { url: "/images/commission_liamlensphotgraphy_business_card_design.jpg", alt: "Liam Lens Photography Business Card" },
      { url: "/images/DUCHESS BEAUTY BUSINESS CARD EXAMPLE.png", alt: "Duchess Beauty Business Card" },
    ],
  },
  {
    service: "GIF Design",
    images: [
      { url: "/images/taztaz visual.gif", alt: "TazTaz Visual GIF" },
    ],
  },
];

// Helper to normalize Cloudinary folder names to section titles
function mapFolderToServiceTitle(folderName: string): string {
  const normalized = folderName.toLowerCase().replace(/[-_]/g, " ");
  if (normalized.includes("logo")) return "Logo Design";
  if (normalized.includes("character") || normalized.includes("mascot")) return "2D Character / Mascot";
  if (normalized.includes("flyer")) return "Flyers";
  if (normalized.includes("menu") || normalized.includes("brochure")) return "Brochures / Menus";
  if (normalized.includes("cover") || normalized.includes("music")) return "Music Cover Design";
  if (normalized.includes("card") || normalized.includes("business")) return "Business Card";
  if (normalized.includes("gif") || normalized.includes("animated")) return "GIF Design";

  return folderName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SafeGalleryVisual({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-blue-500 text-[10px] font-mono font-black uppercase tracking-widest mb-1">
          IMAGE PENDING
        </span>
        <p className="text-[9px] text-zinc-500 line-clamp-3 italic font-mono uppercase">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-full w-full object-contain transition duration-500 group-hover:scale-102"
      loading="lazy"
    />
  );
}

export default function DesignGalleryPage() {
  const [gallerySections, setGallerySections] = useState<ServiceGallery[]>(defaultGalleryData);
  const [modalImage, setModalImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncCloudinaryGallery() {
      try {
        const res = await fetch("/api/gallery?folder=design/gallery");
        const data = await res.json();

        if (data.images && data.images.length > 0) {
          const cloudinaryGroups: Record<string, GalleryImage[]> = {};

          data.images.forEach((img: any) => {
            const rawCategory = img.category || "uncategorized";
            const serviceTitle = mapFolderToServiceTitle(rawCategory);

            if (!cloudinaryGroups[serviceTitle]) {
              cloudinaryGroups[serviceTitle] = [];
            }

            const fileName = img.publicId.split("/").pop() || "Design Work";
            const formattedAlt = fileName.replace(/[-_]/g, " ").toUpperCase();

            cloudinaryGroups[serviceTitle].push({
              url: img.url,
              alt: formattedAlt,
            });
          });

          const updatedSections = defaultGalleryData.map((section) => {
            const dynamicImages = cloudinaryGroups[section.service];
            if (dynamicImages && dynamicImages.length > 0) {
              return { ...section, images: dynamicImages };
            }
            return section;
          });

          Object.keys(cloudinaryGroups).forEach((serviceTitle) => {
            const exists = updatedSections.some((s) => s.service === serviceTitle);
            if (!exists) {
              updatedSections.push({
                service: serviceTitle,
                images: cloudinaryGroups[serviceTitle],
              });
            }
          });

          setGallerySections(updatedSections);
        }
      } catch (err) {
        console.error("Cloudinary Sync Failed, falling back to local images:", err);
      } finally {
        setLoading(false);
      }
    }

    syncCloudinaryGallery();
  }, []);

  return (
    <main className="min-h-screen w-full relative text-white bg-transparent pb-24">
      <style>
        {`
          @font-face {
            font-family: "RAF Font Demo";
            src: url("/fonts/RafFontDemo-Regular.otf") format("opentype");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }

          .raf-heading {
            font-family: "RAF Font Demo", sans-serif;
          }

          .section-title-panel {
            background-color: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
          }

          .brutalist-scrollbar::-webkit-scrollbar {
            height: 12px;
          }
          .brutalist-scrollbar::-webkit-scrollbar-track {
            background: #18181b;
            border: 2px solid #000;
          }
          .brutalist-scrollbar::-webkit-scrollbar-thumb {
            background: #2563eb;
            border: 2px solid #000;
          }
          .brutalist-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #3b82f6;
          }
        `}
      </style>

      {/* FULL WIDTH HEADER BANNER */}
      <header className="section-title-panel w-full border-b-4 border-black pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-3">
          <h1
            className="raf-heading text-2xl md:text-3xl lg:text-4xl font-black tracking-wide uppercase text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
            style={{
              WebkitTextStroke: "1.5px #000",
              paintOrder: "stroke fill",
            }}
          >
            Design Gallery
          </h1>

          {loading && (
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded font-mono text-[10px] text-blue-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Syncing Cloudinary...
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT STREAM */}
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-6 pt-12 space-y-16 z-10">
        {gallerySections.map((category) => (
          <GallerySection
            key={category.service}
            category={category}
            onImageClick={setModalImage}
          />
        ))}
      </div>

      {/* LIGHTBOX SYSTEM */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 sm:p-8 md:p-12"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative border-4 border-black bg-zinc-950 p-2 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[92vh] max-w-[95vw] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute right-4 top-4 z-50 rounded border-2 border-black bg-blue-600 px-4 py-1.5 font-mono text-[10px] font-black uppercase text-black hover:bg-blue-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              Close
            </button>

            <img
              src={modalImage.url}
              alt={modalImage.alt}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}

function GallerySection({
  category,
  onImageClick,
}: {
  category: ServiceGallery;
  onImageClick: (image: GalleryImage) => void;
}) {
  return (
    <section className="rounded-2xl border-4 border-black bg-black/75 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
      <div className="border-b-4 border-black pb-4 flex flex-row items-center justify-between gap-4 font-mono">
        <h2 className="raf-heading text-2xl sm:text-3xl uppercase tracking-wide text-white">
          {category.service}
        </h2>

        <p className="text-[10px] font-black uppercase tracking-wider text-blue-500 whitespace-nowrap bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
          {category.images.length} Image{category.images.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 pr-2 brutalist-scrollbar">
        {category.images.map((image, idx) => (
          <button
            key={`${image.url}-${idx}`}
            type="button"
            onClick={() => onImageClick(image)}
            className="group min-w-[260px] sm:min-w-[320px] lg:min-w-[340px] h-[260px] rounded-xl border-4 border-black bg-zinc-950 p-4 transition text-left focus:outline-none focus:border-blue-500 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transform duration-200"
          >
            <SafeGalleryVisual src={image.url} alt={image.alt} />
          </button>
        ))}
      </div>
    </section>
  );
}