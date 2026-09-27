"use client";

import { useState } from "react";
import Link from "next/link";
import HipHop100Background from "@/components/hiphop100/HipHop100Background";

type MediaItem = {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
};

type RangeItem = {
  name: string;
  slug: string;
  imageUrl: string;
};

type GalleryRange = {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  folder: string;
  publicIds: string[];
};

const HIPHOP100_BANNER_URL =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1787680095/HIPHOP100_BANNER_CLOTHING_SHOP_NEW_t3zrqg.png";

const BRAND_IMAGE_URL =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1787795545/GROUP3_F_vy6use.jpg";
const MEDIA_LIFESTYLE_IMAGE_URL =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1787795386/IMG-20221110-WA0033_dcdtwp.jpg";

const ranges: RangeItem[] = [
  {
    name: "ORIGINALS RANGE",
    slug: "originals",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271436/ORIGINALS_RANGE_BANNER_CLOTHING_SHOP_hj8ix6.jpg",
  },
  {
    name: "STATE OF MIND RANGE",
    slug: "state-of-mind",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271438/STATE_OF_MIND_RANGE_BANNER_CLOTHING_SHOP_eupaqg.jpg",
  },
  {
    name: "4 ELEMENTS RANGE",
    slug: "4-elements",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271416/4_ELEMENTS_RANGE_BANNER_CLOTHING_SHOP_irzdmr.png",
  },
  {
    name: "#KEEPIT100 RANGE",
    slug: "keepit100",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1786550922/_KEEPIT100_RANGE_BANNER_CLOTHING_SHOP_r1sgvf.png",
  },
 ];

const CLOUDINARY_GALLERY_BASE =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/f_auto,q_auto";

function cloudinaryGalleryImage(publicId: string) {
  return `${CLOUDINARY_GALLERY_BASE}/${encodeURIComponent(publicId)}`;
}

function cloudinaryGalleryFolderImage(folder: string, publicId: string) {
  const encodedPath = `${folder}/${publicId}`
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${CLOUDINARY_GALLERY_BASE}/${encodedPath}`;
}

const galleryRanges: GalleryRange[] = [
  {
    id: "originals",
    name: "ORIGINALS RANGE",
    description:
      "Photos from the HipHop100 Originals Range archive and campaign shoots.",
    bannerUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271436/ORIGINALS_RANGE_BANNER_CLOTHING_SHOP_hj8ix6.jpg",
    folder: "hiphop100/gallery/originals range",
    publicIds: [
      "CP3_mudhla",
      "CP1_BG_t4mbnx",
      "KD2_COL_nvudn3",
      "KD3_1_b989ta",
      "FEND4_rwpd4f",
      "K4_1_atrqrv",
      "CP4_s7mjki",
      "FEND_opsgp6",
      "CP2_vk9qkj",
      "TREXX5_l0jieu",
    ],
  },
  {
    id: "state-of-mind",
    name: "STATE OF MIND",
    description:
      "Selected photography from the HipHop100 State of Mind range.",
    bannerUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271438/STATE_OF_MIND_RANGE_BANNER_CLOTHING_SHOP_eupaqg.jpg",
    folder: "hiphop100/gallery/state of mind",
    publicIds: [
      "F2_vxbuud",
      "F1_BG_mnrpjb",
      "F4_kt4s3t",
      "F3_oefjxy",
    ],
  },
  {
    id: "keepit100",
    name: "#KEEPIT100",
    description:
      "Campaign and lifestyle photography from the #KeepIt100 range.",
    bannerUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1786550922/_KEEPIT100_RANGE_BANNER_CLOTHING_SHOP_r1sgvf.png",
    folder: "hiphop100/gallery/keepit100",
    publicIds: [
      "FemSoloSet2_-_2_rkdu5i",
      "FemSoloSet2_-_1_syqv6w",
      "1_1_vjavwf",
      "IMG-20221110-WA0026_xbmh6w",
      "IMG-20221110-WA0033_c4iiey",
      "IMG-20221214-WA0076_raoehu",
      "IMG-20221110-WA0030_n6kkae",
      "IMG-20221110-WA0021_srtkq0",
    ],
  },
  {
    id: "4-elements",
    name: "4 ELEMENTS",
    description:
      "Photography representing the MC, DJ, graffiti and breaking sides of the 4 Elements range.",
    bannerUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1785271416/4_ELEMENTS_RANGE_BANNER_CLOTHING_SHOP_irzdmr.png",
    folder: "hiphop100/gallery/4 elements",
    publicIds: [
      "MC_AD_RED_TSHIRT_4_TREXX_web_b4x6yw",
      "DJ_AD_GREEN_T_SHIRT_FEND_3_web_fitmyj",
      "MC_AD_RED_TSHIRT_3_TREXX_web_wexdjc",
      "GRAFF_AD_BLACK_T_SHIRT_5_ROG_web_yz2rqa",
      "GRAFF_AD_BLACK_T_SHIRT_4_ROG_web_o2kkud",
      "DJ_AD_GREEN_T_SHIRT_FEND_1_web_aro0dc",
      "BBOY_WHITE_T_SHIRT_3_ISABEL_f6kzay",
    ],
  },
];


const advertMedia: MediaItem[] = [
  {
    id: "adv-1",
    title: "Summer Launch 2022 Promo",
    subtitle: "HipHop100 #KeepIt100 Advert",
    thumbnailUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788365471/_Keepit100_Summer_Launch_2022_Thumbnail_dpluyb.png",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20%23KeepIt%F0%9F%92%AF%20Advert_%20Summer%20Launch%202022%20Promo.mp4",
  },
  {
    id: "adv-2",
    title: "4 Elements Advert (Full Version)",
    subtitle: "HipHop100 Official Commercial",
    thumbnailUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788365615/hqdefault_b2zdgj.webp",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF_%204%20Elements%20Advert%20(Full%20Version).mp4",
  },
  {
    id: "adv-3",
    title: "0 to 100 Advert",
    subtitle: "HipHop100 #KeepIt100 Campaign",
    thumbnailUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788365471/_Keepit100_with_Me_Thumbnail_lyivlz.png",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20%23KeepIt%F0%9F%92%AF%20Advert_%20_0%20to%20100_.mp4",
  },
];

const vlogMedia: MediaItem[] = [
  {
    id: "vlog-1",
    title: "Photoshoot Diaries - EP. 1 - Pilot",
    subtitle: "@rafbydesign and HipHop100",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%201-%20Pilot%20%5BREUPLOAD%5D.mp4",
  },
  {
    id: "vlog-2",
    title: "Photoshoot Diaries - EP. 2",
    subtitle: "@rafbydesign and HipHop100",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%202.mp4",
  },
  {
    id: "vlog-3",
    title: "Photoshoot Diaries - EP. 3",
    subtitle: "Unity In The Community Special",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%203-%20Unity%20In%20The%20Community%20Special.mp4",
  },
  {
    id: "vlog-4",
    title: "Photoshoot Diaries - EP. 4",
    subtitle: "4 Elements Advert Special",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%204-%204%20ELEMENTS%20ADVERT.mp4",
  },
  {
    id: "vlog-5",
    title: "4 Elements - B-Boy / B-Girl Vlog",
    subtitle: "Culture & Dance Feature",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20B-Boy_B-Girl%20Vlog.mp4",
  },
  {
    id: "vlog-6",
    title: "4 Elements - BTS [Making Of] Vlog",
    subtitle: "Production Behind The Scenes",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Behind%20The%20Scenes%20%5BMaking%20Of%5D%20Vlog.mp4",
  },
  {
    id: "vlog-7",
    title: "4 Elements - Graff Vlog",
    subtitle: "Graffiti & Visual Art Session",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Graff%20Vlog.mp4",
  },
];

const btsMedia: MediaItem[] = [
  {
    id: "bts-1",
    title: "#KeepIt100 BTS Shoot - EP.1",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.1.mp4",
  },
  {
    id: "bts-2",
    title: "#KeepIt100 BTS Shoot - EP.2",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.2.mp4",
  },
  {
    id: "bts-3",
    title: "#KeepIt100 BTS Shoot - EP.3",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.3.mp4",
  },
];

const freestyleMedia: MediaItem[] = [
  {
    id: "free-1",
    title: "Cypher Sessions 1 - Fashion Launch Special",
    subtitle: "Leemz x Trexx x K. Simmz x Fend",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions_%20Leemz%20x%20Trexx%20x%20K.%20Simmz%20x%20Fend%20%5BFashion%20Launch%20Event%20Special%5D%20%23keepit%F0%9F%92%AF.mp4",
  },
  {
    id: "free-2",
    title: "Cypher Sessions 2",
    subtitle: "Fend x Trexx x K. Simmz",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions%202_%20Fend%20x%20Trexx%20x%20K.%20Simmz.mp4",
  },
];

export default function HipHop100Page() {
  const [activeGalleryRangeId, setActiveGalleryRangeId] =
    useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeGalleryRange =
    galleryRanges.find((range) => range.id === activeGalleryRangeId) || null;

  const activeGalleryImages = activeGalleryRange
    ? activeGalleryRange.publicIds.map((publicId, index) => ({
        id: `${activeGalleryRange.id}-${index + 1}`,
        src: cloudinaryGalleryImage(publicId),
        fallbackSrc: cloudinaryGalleryFolderImage(
          activeGalleryRange.folder,
          publicId
        ),
        alt: `${activeGalleryRange.name} HipHop100 gallery photo ${index + 1}`,
      }))
    : [];

  function selectGalleryRange(rangeId: string) {
    setActiveGalleryRangeId(rangeId);
    setLightboxIndex(null);
  }

  function previousGalleryImage() {
    setLightboxIndex((current) => {
      if (current === null || activeGalleryImages.length === 0) return null;
      return (current - 1 + activeGalleryImages.length) % activeGalleryImages.length;
    });
  }

  function nextGalleryImage() {
    setLightboxIndex((current) => {
      if (current === null || activeGalleryImages.length === 0) return null;
      return (current + 1) % activeGalleryImages.length;
    });
  }

  return (
    <main className="min-h-screen relative text-white bg-black pt-20 pb-24">
      <HipHop100Background />

      <div className="relative z-10">
{/* HIPHOP100 BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-2xl overflow-hidden border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <img
            src={HIPHOP100_BANNER_URL}
            alt="HipHop100"
            className="block w-full h-auto"
          />
        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-black/90 backdrop-blur-md border-4 border-black rounded-2xl p-6 sm:p-9 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
          <h1 className="font-hiphop100 text-4xl sm:text-6xl uppercase text-white mt-2">
            HIPHOP<span className="text-red-600">100</span>
          </h1>

          <p className="font-hiphop100 text-xl sm:text-2xl uppercase text-amber-400 mt-1">
            REP THE CULTURE
          </p>

          <p className="font-mono text-sm sm:text-base text-zinc-200 leading-7 max-w-4xl mx-auto mt-6">
            HipHop100 was made for the culture by the culture. Made as a sub-brand of RAF By Design, Our tagline is simple "Rep The Culture" from emcees to taggers to everyone who loves and participates in the culture of Hip-Hop. We put that ethos in everything we do, from clothing to events. Check out our clothing sections and all the other work we have going on.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link
              href="/clothing"
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black rounded-lg font-mono font-black text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
            >
              SHOP HIPHOP100
            </Link>

            <Link
              href="/showcase"
              className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border-2 border-black rounded-lg font-mono font-black text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
            >
              RAF SHOWCASE →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-12 space-y-12">
        {/* BRAND INFORMATION */}
        <section className="grid md:grid-cols-2 gap-6">
          <article className="relative overflow-hidden rounded-2xl border-2 border-white bg-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[320px] sm:min-h-[380px]">
            <img
              src={BRAND_IMAGE_URL}
              alt="HipHop100 brand"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-[0.45]"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />

            <div className="relative z-10 flex min-h-[320px] sm:min-h-[380px] items-center p-6 sm:p-10 lg:p-12">
              <div className="max-w-4xl w-full">
                <div className="text-center">
                  <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase mt-1">
                    CULTURE FIRST
                  </h2>
                </div>

                <p className="font-mono text-sm sm:text-base text-zinc-200 leading-7 mt-4">
                  HipHop100 was created to represent Hip-Hop culture through
                  clothing, visuals and creative projects. The products are one
                  part of a wider brand built around the culture surrounding the
                  music and the people who represent it.
                </p>
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border-2 border-white bg-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[320px] sm:min-h-[380px]">
            <img
              src={MEDIA_LIFESTYLE_IMAGE_URL}
              alt="HipHop100 media and lifestyle"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.45]"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />

            <div className="relative z-10 flex min-h-[320px] sm:min-h-[380px] items-center p-6 sm:p-10 lg:p-12">
              <div className="max-w-4xl w-full">
                <div className="text-center">
                  <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase mt-1">
                    MORE THAN CLOTHING
                  </h2>
                </div>

                <p className="font-mono text-sm sm:text-base text-zinc-200 leading-7 mt-4">
                  Campaigns, photoshoots, events, cyphers, behind-the-scenes
                  footage and other original media allow HipHop100 to represent
                  the wider lifestyle and creative side of Hip-Hop rather than
                  operating only as a clothing store.
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* CLOTHING RANGES */}
        <section className="bg-black/85 border-4 border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black pb-4 mb-6 text-center">
            <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase">
              EXPLORE THE RANGES
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ranges.map((range) => (
              <Link
                key={range.slug}
                href={`/clothing/ranges/${range.slug}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border-4 border-black hover:border-amber-400 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <img
                  src={range.imageUrl}
                  alt={range.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-hiphop100 text-xl sm:text-3xl uppercase text-white group-hover:text-amber-400 transition-colors">
                    {range.name}
                  </h3>

                  <p className="font-mono text-sm uppercase font-black mt-2">
                    VIEW COLLECTION →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>


      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-12 space-y-12">
        {/* PHOTO GALLERY */}
        <section className="bg-black/85 border-4 border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black pb-4 text-center">
            <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase">
              GALLERY
            </h2>

            <p className="font-mono text-sm sm:text-base text-zinc-200 leading-7 mt-3 max-w-3xl mx-auto">
              Select a HipHop100 collection below to open that photo archive.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {galleryRanges.map((range) => {
                const active = activeGalleryRangeId === range.id;

                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() =>
                      setActiveGalleryRangeId((current) =>
                        current === range.id ? null : range.id
                      )
                    }
                    className={`group overflow-hidden rounded-xl border-4 bg-zinc-950 text-left transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      active
                        ? "border-amber-400"
                        : "border-black hover:border-amber-400"
                    }`}
                  >
                    <div className="aspect-[16/8] overflow-hidden border-b-2 border-black bg-black">
                      <img
                        src={range.bannerUrl}
                        alt={range.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <h3
                          className={`font-hiphop100 text-2xl uppercase ${
                            active ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {range.name}
                        </h3>

                        <p className="font-mono text-sm text-zinc-300 mt-1">
                          {active ? "Click again to close" : "Open collection"}
                        </p>
                      </div>

                      <span
                        className={`text-2xl font-black transition-transform ${
                          active ? "rotate-180 text-amber-400" : "text-white"
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeGalleryRange && (
              <div className="rounded-2xl border-4 border-amber-400 bg-zinc-950 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="border-b-2 border-black px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-hiphop100 text-2xl sm:text-4xl uppercase text-white">
                        {activeGalleryRange.name}
                      </h3>

                      <p className="mt-2 max-w-3xl font-mono text-sm sm:text-base leading-7 text-zinc-200">
                        {activeGalleryRange.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveGalleryRangeId(null)}
                      className="shrink-0 rounded-lg border-2 border-black bg-amber-400 px-4 py-2 font-mono text-sm font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:bg-amber-300"
                    >
                      CLOSE COLLECTION
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {activeGalleryImages.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="group relative overflow-hidden rounded-xl border-2 border-black bg-black text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <CloudinaryGalleryPhoto
                            src={image.src}
                            fallbackSrc={image.fallbackSrc}
                            alt={image.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-90"
                          />
                        </div>

                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                          <span className="rounded-lg border-2 border-white bg-black/80 px-3 py-2 font-mono text-sm font-black uppercase text-white backdrop-blur-sm">
                            VIEW PHOTO
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ADVERTS */}
        <MediaSection
          title="ADVERTS & PROMOS"
          items={advertMedia}
          useVideoThumbnails
        />

        {/* MEDIA */}
        <section className="bg-black/85 border-4 border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black pb-4 mb-6 text-center">
            <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase">
              MEDIA
            </h2>

            <p className="font-mono text-sm text-zinc-300 leading-7 mt-3 max-w-4xl mx-auto">
              Explore the HipHop100 media archive including photoshoot diaries,
              behind-the-scenes footage and original cypher sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <MediaCategoryCard
              title="PHOTOSHOOT DIARIES & VLOGS"
              description="Photoshoot diaries, community features and 4 Elements culture vlogs."
              href="/clothing/hiphop100/media/vlogs"
              imageUrl="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788366713/Photoshoot_diaries_vlogs_image_apq2kh.png"
            />

            <MediaCategoryCard
              title="BEHIND THE SCENES"
              description="Campaign shoots, production days and behind-the-scenes HipHop100 footage."
              href="/clothing/hiphop100/media/bts"
              imageUrl="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788366712/BTS_image_sdale8.png"
            />

            <MediaCategoryCard
              title="CYPHERS & FREESTYLES"
              description="Original HipHop100 cyphers and performance content."
              href="/clothing/hiphop100/media/cyphers"
              imageUrl="https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788366712/cyphers_and_freestyles_image_t5rq3f.png"
            />
          </div>
        </section>

        {/* SHOWCASE CONNECTION */}
        <section className="bg-amber-400 text-black border-4 border-black rounded-2xl p-6 sm:p-10 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase mt-1">
            ALSO FEATURED IN THE RAF SHOWCASE
          </h2>

          <p className="font-mono text-sm sm:text-base font-bold leading-7 max-w-3xl mt-4 mx-auto">
            Selected HipHop100 campaigns and media also appear in the wider RAF
            By Design Showcase alongside music, production, design and other
            projects.
          </p>

          <Link
            href="/showcase"
            className="inline-block mt-6 px-5 py-3 bg-black text-white border-2 border-black rounded-lg font-mono font-black text-sm uppercase"
          >
            VISIT RAF SHOWCASE →
          </Link>
        </section>
      </div>

      {activeGalleryRange &&
        lightboxIndex !== null &&
        activeGalleryImages[lightboxIndex] && (
          <GalleryLightbox
            rangeName={activeGalleryRange.name}
            image={activeGalleryImages[lightboxIndex]}
            index={lightboxIndex}
            total={activeGalleryImages.length}
            onClose={() => setLightboxIndex(null)}
            onPrevious={previousGalleryImage}
            onNext={nextGalleryImage}
          />
        )}
      </div>
    </main>
  );
}


function CloudinaryGalleryPhoto({
  src,
  fallbackSrc,
  alt,
  className,
  loading,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  className: string;
  loading?: "eager" | "lazy";
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (!fallbackUsed && currentSrc !== fallbackSrc) {
          setFallbackUsed(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}


function GalleryLightbox({
  rangeName,
  image,
  index,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  rangeName: string;
  image: {
    id: string;
    src: string;
    fallbackSrc: string;
    alt: string;
  };
  index: number;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${rangeName} photo ${index + 1}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 bg-black text-xl font-black text-white transition hover:border-amber-400 hover:text-amber-400 sm:right-7 sm:top-7"
        aria-label="Close photo"
      >
        ×
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/85 text-3xl font-black text-white transition hover:border-amber-400 hover:text-amber-400 sm:left-7"
            aria-label="Previous photo"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/85 text-3xl font-black text-white transition hover:border-amber-400 hover:text-amber-400 sm:right-7"
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <CloudinaryGalleryPhoto
            key={image.id}
            src={image.src}
            fallbackSrc={image.fallbackSrc}
            alt={image.alt}
            className="max-h-[80vh] max-w-full rounded-xl border-2 border-white/20 object-contain shadow-2xl"
          />
        </div>

        <div className="mt-4 rounded-lg border border-white/15 bg-black/80 px-5 py-3 text-center backdrop-blur-sm">
          <p className="font-hiphop100 text-xl uppercase text-white">
            {rangeName}
          </p>

          <p className="mt-1 font-mono text-sm font-black uppercase tracking-wide text-amber-400">
            PHOTO {index + 1} / {total}
          </p>
        </div>
      </div>
    </div>
  );
}


function MediaCategoryCard({
  title,
  description,
  href,
  imageUrl,
}: {
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border-4 border-black bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:border-amber-400"
    >
      <div className="aspect-[16/8] border-b-2 border-black bg-black">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-contain bg-black transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-4 text-center">
            <span className="font-mono text-sm font-black uppercase tracking-wide text-zinc-400">
              THUMBNAIL COMING SOON
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-hiphop100 text-2xl uppercase text-white transition-colors text-center group-hover:text-amber-400">
          {title}
        </h3>

        <p className="mt-3 flex-1 font-mono text-sm sm:text-base leading-7 text-zinc-200">
          {description}
        </p>

        <div className="mt-5 border-t border-zinc-800 pt-4 text-center">
          <span className="font-mono text-sm font-black uppercase text-white group-hover:text-amber-400">
            OPEN →
          </span>
        </div>
      </div>
    </Link>
  );
}

function MediaSection({
  title,
  items,
  useVideoThumbnails = false,
}: {
  title: string;
  items: MediaItem[];
  useVideoThumbnails?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems =
    items.length <= 2
      ? items
      : [
          items[activeIndex % items.length],
          items[(activeIndex + 1) % items.length],
        ];

  const visibleItems = showAll ? items : carouselItems;

  function previousItems() {
    setActiveIndex((current) =>
      items.length ? (current - 1 + items.length) % items.length : 0
    );
  }

  function nextItems() {
    setActiveIndex((current) =>
      items.length ? (current + 1) % items.length : 0
    );
  }

  return (
    <section className="bg-black/85 border-4 border-black rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="relative border-b-2 border-black pb-3 mb-5 text-center">
        <div>
          <h2 className="font-hiphop100 text-3xl sm:text-5xl uppercase">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative">
        {!showAll && items.length > 2 && (
          <>
            <button
              type="button"
              onClick={previousItems}
              aria-label="Previous adverts"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-black/85 text-2xl font-black text-white shadow-lg transition hover:border-amber-400 hover:text-amber-400 sm:-left-3"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextItems}
              aria-label="Next adverts"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-black/85 text-2xl font-black text-white shadow-lg transition hover:border-amber-400 hover:text-amber-400 sm:-right-3"
            >
              ›
            </button>
          </>
        )}

        <div
          className={
            showAll
              ? "grid sm:grid-cols-2 xl:grid-cols-4 gap-5"
              : "grid md:grid-cols-2 gap-5"
          }
        >
          {visibleItems.map((item) => (
            <MediaVideoCard
              key={item.id}
              item={item}
              compactPreview={useVideoThumbnails}
            />
          ))}
        </div>
      </div>

      {items.length > 2 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black rounded-lg font-mono text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            {showAll ? "▲ SHOW FEWER" : `▼ SHOW ALL (${items.length})`}
          </button>
        </div>
      )}
    </section>
  );
}

function MediaVideoCard({
  item,
  compactPreview = false,
}: {
  item: MediaItem;
  compactPreview?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <article className="overflow-hidden rounded-xl border-2 border-black bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div
        className={`border-b-2 border-black bg-black ${
          compactPreview ? "aspect-[16/6]" : "aspect-[16/7]"
        }`}
      >
        {isPlaying ? (
          <video
            controls
            autoPlay
            preload="metadata"
            playsInline
            poster={item.thumbnailUrl}
            className="h-full w-full object-cover"
          >
            <source src={item.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative h-full w-full overflow-hidden text-left"
            aria-label={`Play ${item.title}`}
          >
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-4 text-center">
                <span className="font-mono text-sm font-black uppercase tracking-wide text-zinc-400">
                  VIDEO THUMBNAIL COMING SOON
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black/80 text-2xl text-white shadow-lg">
                ▶
              </span>
            </div>
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <h3 className="font-mono text-sm font-black uppercase text-white">
          {item.title}
        </h3>

        <p className="font-mono text-sm text-zinc-300 font-bold mt-1">
          {item.subtitle}
        </p>

        {item.description && (
          <p className="mt-2 font-mono text-sm leading-6 text-zinc-400">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
