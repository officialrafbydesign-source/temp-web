"use client";

import Link from "next/link";
import { useState } from "react";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

const producedItems = [
    {
      id: "prod-1",
      label: "PRODUCED BY RAF",
      title: "A Place I Was Raised",
      subtitle: "Fend Feat. Marvs • Dusty Estate",
      youtubeId: "Sy6TlrWIPF0",
      tags: ["Production"],
    },
    {
      id: "prod-2",
      label: "PRODUCED BY RAF",
      title: "Mary Jane",
      subtitle: "Fend • Dusty Estate",
      youtubeId: "iH05_ZJGh7Y",
      tags: ["Production"],
    },
    {
      id: "prod-3",
      label: "PRODUCED BY RAF",
      title: "Time In This",
      subtitle: "Fend • Dusty Estate",
      youtubeId: "sgPAVy1-4Dk",
      tags: ["Production"],
    },
    {
      id: "prod-4",
      label: "PRODUCED BY RAF",
      title: "RawTrexx Intro",
      subtitle: "Dining Table • Still Dining ",
      youtubeId: "paw4O8zU3TE",
      tags: ["Production"],
    },
    {
      id: "prod-5",
      label: "PRODUCED BY RAF",
      title: "Ain't Tryna Starve",
      subtitle: "Fend, K. Simmz & Prowler • Still Dining",
      youtubeId: "UHMaWB6SqJg",
      tags: ["Production"],
    },
    {
      id: "prod-6",
      label: "PRODUCED BY RAF",
      title: "Grind Time",
      subtitle: "Prowler, Fend • Still Dining ",
      youtubeId: "Tnog9wpoQpE",
      tags: ["Production"],
    },
    {
      id: "prod-7",
      label: "PRODUCED BY RAF",
      title: "Still Dining Outro",
      subtitle: "Prowler, Fned, K. Simmz & Marvs • Still Dining ",
      youtubeId: "iL9MnMmP29U",
      tags: ["Production"],
    },
    {
      id: "prod-8",
      label: "PRODUCED BY RAF",
      title: "Reckless",
      subtitle: "K. Simmz, Cruddz & Fend • Jukebox ",
      youtubeId: "PJIs7ZyjNeU",
      tags: ["Production"],
    },
    {
      id: "prod-9",
      label: "PRODUCED BY RAF",
      title: "Anti Social",
      subtitle: "K. Simmz • Jukebox",
      youtubeId: "DTKxm80oOTU",
      tags: ["Production"],
    }
];

const mixedItems = [
    {
      id: "mix-1",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "UQgKuyAa26g",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-2",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "-6IZERf_-rg",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-3",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "EmREpN0s_Dg",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-4",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "EhmWou8qIMo",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-5",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "YthFD1PuK-o",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-6",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "uOFnFmFXnxA",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-7",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "ukF_BwPnNGE",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-8",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "i7vMH1M7ulA",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-9",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "paw4O8zU3TE",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-10",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "Xx0ZF07XZC0",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-11",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "3nYv0PlBNzQ",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-12",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "Qc-YaEVMGlE",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-13",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "u6q8OnXPcH8",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-14",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "WwoFvipezNE",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-15",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "jgb9p8H2GsY",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-16",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "fdlx80iJxh0",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-17",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "o-jsckEG4tk",
      tags: ["Recording", "Mixdown"],
    },
    {
      id: "mix-18",
      label: "RECORDED / MIXED BY RAF",
      title: "[SONG NAME]",
      subtitle: "[ARTIST NAME] • [PROJECT / ALBUM NAME]",
      youtubeId: "kCZkSu_h95k",
      tags: ["Recording", "Mixdown"],
    }
];

const additionalAudio = [
  {
    id: "cf-1",
    label: "ADDITIONAL AUDIO",
    title: "[UNRELEASED / CLOUDFLARE TRACK 1]",
    subtitle: "[ARTIST NAME] • [PROJECT NAME]",
    audioUrl: "https://your-cloudflare-stream-url.com/track1.mp3",
    tags: ["Production", "Mixdown"],
  },
];

const hiphopAdverts = [
  {
    id: "adv-1",
    label: "ADVERT",
    title: "Summer Launch 2022 Promo",
    subtitle: "HipHop100 #KeepIt100 Advert",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20%23KeepIt%F0%9F%92%AF%20Advert_%20Summer%20Launch%202022%20Promo.mp4",
    tags: ["HipHop100", "Campaign", "Video"],
  },
  {
    id: "adv-2",
    label: "ADVERT",
    title: "4 Elements Advert (Full Version)",
    subtitle: "HipHop100 Official Commercial",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF_%204%20Elements%20Advert%20(Full%20Version).mp4",
    tags: ["HipHop100", "4 Elements", "Campaign"],
  },
  {
    id: "adv-3",
    label: "ADVERT",
    title: "0 to 100 Advert",
    subtitle: "HipHop100 #KeepIt100 Campaign",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20%23KeepIt%F0%9F%92%AF%20Advert_%20_0%20to%20100_.mp4",
    tags: ["HipHop100", "#KeepIt100", "Campaign"],
  },
  {
    id: "adv-4",
    label: "ADVERT",
    title: "0 to 100 Advert Reel Cut 1",
    subtitle: "HipHop100 #KeepIt100 Short Edit",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20_0%20to%20100_%20Advert%20Reel%20Cut%201.mp4",
    tags: ["HipHop100", "Reel", "Short Edit"],
  },
];

const hiphopVlogs = [
  {
    id: "vlog-1",
    label: "PHOTOSHOOT DIARIES",
    title: "EP. 1 - Pilot",
    subtitle: "@rafbydesign and HipHop100",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%201-%20Pilot%20%5BREUPLOAD%5D.mp4",
    tags: ["HipHop100", "Photoshoot", "Vlog"],
  },
  {
    id: "vlog-2",
    label: "PHOTOSHOOT DIARIES",
    title: "EP. 2",
    subtitle: "@rafbydesign and HipHop100",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%202.mp4",
    tags: ["HipHop100", "Photoshoot", "Vlog"],
  },
  {
    id: "vlog-3",
    label: "PHOTOSHOOT DIARIES",
    title: "EP. 3",
    subtitle: "Unity In The Community Special",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%203-%20Unity%20In%20The%20Community%20Special.mp4",
    tags: ["HipHop100", "Community", "Photoshoot"],
  },
  {
    id: "vlog-4",
    label: "PHOTOSHOOT DIARIES",
    title: "EP. 4",
    subtitle: "4 Elements Advert Special",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%204-%204%20ELEMENTS%20ADVERT.mp4",
    tags: ["HipHop100", "4 Elements", "Photoshoot"],
  },
  {
    id: "vlog-5",
    label: "4 ELEMENTS VLOGS",
    title: "B-Boy / B-Girl Vlog",
    subtitle: "Culture & Dance Feature",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20B-Boy_B-Girl%20Vlog.mp4",
    tags: ["HipHop100", "4 Elements", "Dance"],
  },
  {
    id: "vlog-6",
    label: "4 ELEMENTS VLOGS",
    title: "Behind The Scenes [Making Of]",
    subtitle: "Production Behind The Scenes",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Behind%20The%20Scenes%20%5BMaking%20Of%5D%20Vlog.mp4",
    tags: ["HipHop100", "4 Elements", "BTS"],
  },
  {
    id: "vlog-7",
    label: "4 ELEMENTS VLOGS",
    title: "Graff Vlog",
    subtitle: "Graffiti & Visual Art Session",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Graff%20Vlog.mp4",
    tags: ["HipHop100", "4 Elements", "Graffiti"],
  },
];

const hiphopBts = [
  {
    id: "bts-1",
    label: "BEHIND THE SCENES",
    title: "#KeepIt100 BTS Shoot - EP.1",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.1.mp4",
    tags: ["HipHop100", "#KeepIt100", "BTS"],
  },
  {
    id: "bts-2",
    label: "BEHIND THE SCENES",
    title: "#KeepIt100 BTS Shoot - EP.2",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.2.mp4",
    tags: ["HipHop100", "#KeepIt100", "BTS"],
  },
  {
    id: "bts-3",
    label: "BEHIND THE SCENES",
    title: "#KeepIt100 BTS Shoot - EP.3",
    subtitle: "Behind The Scenes Production",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.3.mp4",
    tags: ["HipHop100", "#KeepIt100", "BTS"],
  },
];

const hiphopCyphers = [
  {
    id: "free-1",
    label: "CYPHER / FREESTYLE",
    title: "Cypher Sessions 1 - Fashion Launch Special",
    subtitle: "Leemz x Trexx x K. Simmz x Fend",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions_%20Leemz%20x%20Trexx%20x%20K.%20Simmz%20x%20Fend%20%5BFashion%20Launch%20Event%20Special%5D%20%23keepit%F0%9F%92%AF.mp4",
    tags: ["HipHop100", "Cypher", "Performance"],
  },
  {
    id: "free-2",
    label: "CYPHER / FREESTYLE",
    title: "Cypher Sessions 2",
    subtitle: "Fend x Trexx x K. Simmz",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions%202_%20Fend%20x%20Trexx%20x%20K.%20Simmz.mp4",
    tags: ["HipHop100", "Cypher", "Performance"],
  },
];


type ShowcaseCategory = "music" | "visuals" | "design";
type MusicSubsection = "raf-audio" | "dining-table";
type VisualSubsection = "business" | "hiphop-events";

type MusicMediaItem = {
  id: string;
  label?: string;
  title: string;
  subtitle?: string;
  youtubeId?: string;
  audioUrl?: string;
  tags?: string[];
};

type ShowcaseEpisode = {
  id: string;
  episodeLabel: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
};

const showcaseCategories = [
  {
    id: "music" as ShowcaseCategory,
    number: "01",
    title: "Music",
    text: "Production, recording, mixdown, additional audio and Dining Table Records.",
  },
  {
    id: "visuals" as ShowcaseCategory,
    number: "02",
    title: "RAF Videos / Visuals",
    text: "Business spotlights, video editing and selected HipHop100 event films.",
  },
  {
    id: "design" as ShowcaseCategory,
    number: "03",
    title: "Design Gallery",
    text: "Graphic design portfolio covering RAF design services and visual work.",
  },
];

const businessShowcaseEpisodes: ShowcaseEpisode[] = [
  {
    id: "business-1",
    episodeLabel: "E1",
    title: "Stush Bristol",
    subtitle: "@MdotROfficialVEVO Meet and Greet",
    description:
      "RAF Business Showcase episode featuring Stush Bristol and the @MdotROfficialVEVO meet and greet.",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/RAF%20Business%20showcase%20videos/RAF%20BUSINESS%20SHOWCASE%201%20%20STUSH%20BRISTOL%20WITH%20%40MdotROfficialVEVO%20MEET%20AND%20GREET.mp4",
  },
  {
    id: "business-2",
    episodeLabel: "E2",
    title: "Legacy Kitchen",
    subtitle: "RAF Business Showcase",
    description:
      "A RAF Business Showcase feature focused on Legacy Kitchen.",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/RAF%20Business%20showcase%20videos/RAF%20BUSINESS%20SHOWCASE%202-%20LEGACY%20KITCHEN.mp4",
  },
  {
    id: "business-3",
    episodeLabel: "E3",
    title: "Ringo Vision",
    subtitle: "Cooking For The Homeless • @ringovision",
    description:
      "A community-focused RAF Business Showcase feature following Ringo Vision cooking for the homeless.",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/RAF%20Business%20showcase%20videos/RAF%20BUSINESS%20SHOWCASE%203-%20RINGO%20VISION_%20COOKING%20FOR%20THE%20HOMELESS%20%40ringovision.mp4",
  },
];

const hiphopEventEpisodes: ShowcaseEpisode[] = [
  {
    id: "hiphop-event-unity",
    episodeLabel: "E1",
    title: "Unity In The Community Special",
    subtitle: "Photoshoot Diaries - EP. 3",
    description:
      "Coverage from the Unity In The Community event in Bermondsey, including the HipHop100 presence and other stall traders at the event.",
    thumbnailUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367444/maxresdefault_qaif2a.jpg",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%203-%20Unity%20In%20The%20Community%20Special.mp4",
  },
  {
    id: "hiphop-event-fashion-launch",
    episodeLabel: "E2",
    title: "Fashion Launch Full Documentary",
    subtitle: "HipHop100 Fashion Launch Event",
    description:
      "A full documentary from the HipHop100 fashion launch at Strongroom Bar, showcasing the brand and the event.",
    thumbnailUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788369156/maxresdefault_8_xpceuw.webp",
    videoUrl:
      "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Fashion%20Launch%20Event%20Documentary.mp4",
  },
];


const diningTableProjects = [
  {
    id: "dtr-project-1",
    title: "Still Dining",
    description: "Add the first Dining Table Records project description here.",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788520661/Still_Dining_Front_cwg2x5.png",
    tracks: [
      "RawTrexx Intro",
      "What's On The Menu?",
      "Ain't Tryna Starve",
      "Grind Time",
      "Things I've Been Through",
      "Time For Them",
      "Villians",
      "Growing Up",
      "Dreams",
      "Parddz Skit",
      "Ride Out",
      "Fire In The Cave",
      "Ain't With Em",
      "Format",
      "Water",
      "Digest",
      "Spaced Out",
      "Downhearted",
      "Yacking",
      "Still Dining Outro",

    ],
  },
  {
    id: "dtr-project-2",
    title: "Jukebox",
    description: "Add the second Dining Table Records project description here.",
    imageUrl:
      "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788520660/cover_pmdxtg.png",
    tracks: [
      "Jukebox Intro",
      "Make Or Break",
      "Back In The Lab",
      "Move",
      "Getaway",
      "Seguimos Comiendos",
      "Classic (Remix)",
      "Reckless",
      "Till I'm Rich",
      "Don't Hang About",
      "We Got The Sauce",
      "TLZ Meets Dining Table",
      "Soul Brother",
      "Let's Face It",
      "Active",
      "Froggy",
      "Anti Social",
      "Bandana",
      "Echo",
      "Right Here",
      "Had Enough (Remix)",
      "Dark Riders",
      "Poison",
    ],
  },
];

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] =
    useState<ShowcaseCategory | null>(null);
  const [activeMusicSection, setActiveMusicSection] =
    useState<MusicSubsection | null>(null);
  const [activeVisualSection, setActiveVisualSection] =
    useState<VisualSubsection | null>(null);

  function toggleCategory(category: ShowcaseCategory) {
    setActiveCategory((current) => {
      const next = current === category ? null : category;

      if (next !== "music") setActiveMusicSection(null);
      if (next !== "visuals") setActiveVisualSection(null);

      return next;
    });
  }

  return (
    <main className="showcase-page min-h-screen relative text-black">
      <style jsx global>{`
        .showcase-page {
          font-family: Arial, Helvetica, sans-serif;
        }

        .showcase-page .font-mono,
        .showcase-page .font-clarity {
          font-family: Arial, Helvetica, sans-serif !important;
        }

        .showcase-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-20">
        <section className="w-screen relative left-1/2 -translate-x-1/2 bg-black border-y-4 border-black">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl text-white uppercase">
              Showcase
            </h1>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/all-about-raf"
                className="rounded-xl border-2 border-white bg-black px-7 py-3 text-center text-base font-black text-white transition hover:bg-zinc-900"
              >
                All About RAF
              </Link>

              <Link
                href="/about"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center text-base font-black text-black transition hover:bg-zinc-200"
              >
                About Us
              </Link>

              <Link
                href="/what-we-offer"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center text-base font-black text-black transition hover:bg-zinc-200"
              >
                What We Offer
              </Link>
            </div>
          </div>
        </section>

        <section className="w-screen relative left-1/2 -translate-x-1/2 bg-black">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098193/vlcsnap-2026-08-29-18h11m03s308_yznjps.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788108210/vlcsnap-2026-08-30-17h43m14s587_wcgaj4.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098064/vlcsnap-2026-08-29-17h58m13s345_p7bggd.png",
              ].map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[2/1] overflow-hidden rounded-xl border-2 border-white/10 bg-black"
                >
                  <img
                    src={imageUrl}
                    alt={`RAF By Design showcase ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-10 pt-8 space-y-6">
          <section
            id="portfolio-library"
            className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {showcaseCategories.map((category) => (
              <PortfolioArea
                key={category.id}
                number={category.number}
                title={category.title}
                text={category.text}
                active={activeCategory === category.id}
                onClick={() => toggleCategory(category.id)}
              />
            ))}
          </section>

          {activeCategory === "music" && (
            <DropdownPanel>
              <SubOptionGrid>
                <SubOptionButton
                  title="RAF Music & Audio Work"
                  text="Produced, recorded, mixed and additional audio work in one portfolio."
                  active={activeMusicSection === "raf-audio"}
                  onClick={() =>
                    setActiveMusicSection((current) =>
                      current === "raf-audio" ? null : "raf-audio"
                    )
                  }
                />

                <SubOptionButton
                  title="Dining Table Records"
                  text="Selected label collaboration, release projects, album artwork and track links."
                  active={activeMusicSection === "dining-table"}
                  onClick={() =>
                    setActiveMusicSection((current) =>
                      current === "dining-table" ? null : "dining-table"
                    )
                  }
                />
              </SubOptionGrid>
            </DropdownPanel>
          )}

          {activeCategory === "music" && activeMusicSection === "raf-audio" && (
            <section className="space-y-8">
              <SectionIntro
                title="RAF Music & Audio Work"
                description="Selected work where RAF By Design handled production, recording, mixdown or additional audio work."
              />

              <MusicMediaGroup
                title="Produced By RAF"
                description="Selected tracks where RAF By Design handled music production."
                items={producedItems}
              />

              <MusicMediaGroup
                title="Recorded / Mixed By RAF"
                description="Selected tracks recorded, mixed or edited through RAF By Design."
                items={mixedItems}
              />

              <MusicMediaGroup
                title="Additional Audio"
                description="Additional audio examples and projects outside the main production and studio sections."
                items={additionalAudio}
              />
            </section>
          )}

          {activeCategory === "music" &&
            activeMusicSection === "dining-table" && (
              <DiningTableSection
                onViewRafCredits={() => setActiveMusicSection("raf-audio")}
              />
            )}

          {activeCategory === "visuals" && (
            <DropdownPanel>
              <SubOptionGrid>
                <SubOptionButton
                  title="Business Spotlights & Video Editing"
                  text="RAF Business Showcase episodes and selected business-focused video work."
                  active={activeVisualSection === "business"}
                  onClick={() =>
                    setActiveVisualSection((current) =>
                      current === "business" ? null : "business"
                    )
                  }
                />

                <SubOptionButton
                  title="HipHop100 Events & Showcases"
                  text="Selected HipHop100 event films chosen specifically for the RAF Showcase."
                  active={activeVisualSection === "hiphop-events"}
                  onClick={() =>
                    setActiveVisualSection((current) =>
                      current === "hiphop-events" ? null : "hiphop-events"
                    )
                  }
                />
              </SubOptionGrid>
            </DropdownPanel>
          )}

          {activeCategory === "visuals" &&
            activeVisualSection === "business" && (
              <VideoSeries
                title="Business Spotlights & Video Editing"
                description="RAF Business Showcase videos highlighting businesses, events and community-focused work captured and edited by RAF By Design."
                episodes={businessShowcaseEpisodes}
              />
            )}

          {activeCategory === "visuals" &&
            activeVisualSection === "hiphop-events" && (
              <VideoSeries
                title="HipHop100 Events & Showcases"
                description="Selected HipHop100 event films showing the brand operating in live community and launch environments."
                episodes={hiphopEventEpisodes}
                footer={
                  <Link
                    href="/clothing/hiphop100"
                    className="inline-flex rounded-xl border-2 border-black bg-black px-7 py-3 text-base font-black uppercase text-white transition hover:bg-red-600"
                  >
                    View All HipHop100 Media →
                  </Link>
                }
              />
            )}

          {activeCategory === "design" && (
            <section className="rounded-2xl border-4 border-black bg-black p-6 sm:p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Link
                href="/design/gallery"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white bg-white px-8 py-5 font-raf text-2xl sm:text-3xl uppercase text-black transition hover:bg-red-600 hover:text-white"
              >
                Open Design Gallery →
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-4 border-black bg-white p-5 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {children}
    </section>
  );
}

function SubOptionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function SubOptionButton({
  title,
  text,
  active,
  onClick,
}: {
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full overflow-hidden rounded-xl border-4 border-black text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition ${
        active ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-100"
      }`}
    >
      <div className="bg-zinc-950 px-6 py-5">
        <h2 className="font-raf text-2xl sm:text-3xl uppercase text-white">
          {title}
        </h2>
      </div>

      <div className="px-6 py-5">
        <p
          className={`text-base sm:text-lg leading-7 ${
            active ? "text-zinc-200" : "text-zinc-700"
          }`}
        >
          {text}
        </p>

        <p
          className={`mt-4 text-sm font-black uppercase tracking-widest ${
            active ? "text-red-400" : "text-red-600"
          }`}
        >
          {active ? "SECTION SELECTED" : "VIEW SECTION"} →
        </p>
      </div>
    </button>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-6 sm:px-8 text-center">
        <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-5xl text-base sm:text-lg leading-7 text-zinc-300">
          {description}
        </p>
      </div>
    </section>
  );
}

function MusicMediaGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: MusicMediaItem[];
}) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const activeItem = items.find((item) => item.id === activeItemId) || null;

  return (
    <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-5 sm:px-8 sm:py-6 text-center">
        <h3 className="font-raf text-3xl sm:text-4xl uppercase text-white">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-4xl text-base leading-7 text-zinc-300">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {activeItem && (
          <div className="mb-7 overflow-hidden rounded-xl border-4 border-black bg-zinc-950">
            {activeItem.youtubeId ? (
              <div className="aspect-video">
                <iframe
                  key={activeItem.id}
                  src={`https://www.youtube.com/embed/${activeItem.youtubeId}`}
                  title={activeItem.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : activeItem.audioUrl ? (
              <div className="p-6 sm:p-8">
                <p className="font-raf text-2xl uppercase text-white">
                  {activeItem.title}
                </p>
                <audio
                  key={activeItem.id}
                  src={activeItem.audioUrl}
                  controls
                  className="mt-5 w-full"
                />
              </div>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => {
            const active = item.id === activeItemId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveItemId((current) =>
                    current === item.id ? null : item.id
                  )
                }
                className={`overflow-hidden rounded-xl border-4 border-black text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition ${
                  active
                    ? "bg-black text-white -translate-y-1"
                    : "bg-white text-black hover:-translate-y-1"
                }`}
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-950">
                  {item.youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-5 text-center text-white">
                      <span className="font-raf text-2xl uppercase">Audio</span>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-black/80 text-xl text-white">
                      ▶
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm font-black uppercase tracking-wider text-red-600">
                    {item.label}
                  </p>
                  <h4 className="font-raf mt-2 text-2xl uppercase">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p
                      className={`mt-2 text-base leading-6 ${
                        active ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DiningTableSection({
  onViewRafCredits,
}: {
  onViewRafCredits: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-6 sm:px-8 text-center">
        <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white">
          Dining Table Records
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        <div className="rounded-xl border-2 border-zinc-300 bg-zinc-50 p-6">
          <p className="text-base sm:text-lg leading-8 text-zinc-700">
            Dining Table Records showcase text will be added here. This area is
            ready for the paragraph covering RAF By Design&apos;s work and
            collaboration with the label.
          </p>

          <button
            type="button"
            onClick={onViewRafCredits}
            className="mt-5 rounded-xl border-2 border-black bg-black px-6 py-3 text-base font-black uppercase text-white transition hover:bg-red-600"
          >
            View RAF Production / Recording Credits →
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {diningTableProjects.map((project, index) => (
            <DiningTableProjectCard
              key={project.id}
              projectNumber={String(index + 1).padStart(2, "0")}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              tracks={project.tracks}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DiningTableProjectCard({
  projectNumber,
  title,
  description,
  imageUrl,
  tracks,
}: {
  projectNumber: string;
  title: string;
  description: string;
  imageUrl: string;
  tracks: string[];
}) {
  return (
    <article className="overflow-hidden rounded-xl border-4 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-4 top-4 rounded-lg border-2 border-white bg-black/90 px-3 py-2 text-white">
          <p className="text-sm font-black uppercase tracking-widest text-red-500">
            PROJECT {projectNumber}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-raf text-3xl uppercase text-black">{title}</h3>

        <p className="mt-3 text-base leading-7 text-zinc-700">
          {description}
        </p>

        <div className="mt-5 border-t-2 border-black pt-5">
          <p className="text-sm font-black uppercase tracking-widest text-red-600">
            Track Listing
          </p>

          <div className="mt-4 divide-y-2 divide-zinc-200 border-y-2 border-zinc-200">
            {tracks.map((track, index) => (
              <div
                key={`${projectNumber}-${index}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="min-w-0 text-base font-bold text-black">
                  <span className="mr-2 text-zinc-500">
                    {String(index + 1).padStart(2, "0")}.
                  </span>
                  {track}
                </span>

                <span className="shrink-0 rounded-lg border-2 border-black bg-black px-4 py-2 text-sm font-black uppercase text-white">
                  Listen / Buy →
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function VideoSeries({
  title,
  description,
  episodes,
  footer,
}: {
  title: string;
  description: string;
  episodes: ShowcaseEpisode[];
  footer?: React.ReactNode;
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const activeEpisode =
    episodes.find((episode) => episode.id === activeEpisodeId) || null;

  return (
    <section className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-black px-6 py-6 sm:px-8 text-center text-white">
        <h2 className="font-raf text-3xl sm:text-5xl uppercase">{title}</h2>
        <p className="mx-auto mt-3 max-w-5xl text-base sm:text-lg leading-7 text-zinc-300">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {activeEpisode && (
          <div className="mb-7 overflow-hidden rounded-xl border-4 border-black bg-black">
            <video
              key={activeEpisode.id}
              src={activeEpisode.videoUrl}
              poster={activeEpisode.thumbnailUrl}
              controls
              className="aspect-video w-full bg-black object-contain"
            />
            <div className="border-t-2 border-white/15 p-5 text-white">
              <p className="text-sm font-black uppercase tracking-widest text-red-500">
                {activeEpisode.episodeLabel}
              </p>
              <h3 className="font-raf mt-1 text-3xl uppercase">
                {activeEpisode.title}
              </h3>
              <p className="mt-2 text-base text-zinc-300">
                {activeEpisode.subtitle}
              </p>
              <p className="mt-4 max-w-5xl text-base sm:text-lg leading-7 text-zinc-300">
                {activeEpisode.description}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {episodes.map((episode) => {
            const active = episode.id === activeEpisodeId;

            return (
              <button
                key={episode.id}
                type="button"
                onClick={() =>
                  setActiveEpisodeId((current) =>
                    current === episode.id ? null : episode.id
                  )
                }
                className={`overflow-hidden rounded-xl border-4 border-black text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition ${
                  active
                    ? "bg-black text-white -translate-y-1"
                    : "bg-white text-black hover:-translate-y-1"
                }`}
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-950">
                  {episode.thumbnailUrl ? (
                    <img
                      src={episode.thumbnailUrl}
                      alt={episode.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-white">
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-red-500">
                          {episode.episodeLabel}
                        </p>
                        <p className="font-raf mt-2 text-2xl uppercase">
                          Business Showcase
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-black/80 text-xl text-white">
                      ▶
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm font-black uppercase tracking-widest text-red-600">
                    {episode.episodeLabel}
                  </p>
                  <h3 className="font-raf mt-2 text-2xl sm:text-3xl uppercase">
                    {episode.title}
                  </h3>
                  <p
                    className={`mt-2 text-base font-bold ${
                      active ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {episode.subtitle}
                  </p>
                  <p
                    className={`mt-4 border-t pt-4 text-base leading-7 ${
                      active
                        ? "border-white/20 text-zinc-300"
                        : "border-zinc-200 text-zinc-700"
                    }`}
                  >
                    {episode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {footer && <div className="mt-7 text-center">{footer}</div>}
      </div>
    </section>
  );
}

function PortfolioArea({
  number,
  title,
  text,
  active,
  onClick,
}: {
  number: string;
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-xl border-4 border-black text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition ${
        active
          ? "bg-black text-white -translate-y-1"
          : "bg-white text-black hover:bg-zinc-100 hover:-translate-y-1"
      }`}
    >
      <div className="bg-black px-6 py-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-red-500">{number}</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-lg font-black">
            {active ? "⌃" : "⌄"}
          </span>
        </div>

        <h2 className="font-raf mt-2 text-3xl sm:text-4xl uppercase">
          {title}
        </h2>
      </div>

      <div className="px-6 py-5">
        <p
          className={`text-base sm:text-lg leading-7 ${
            active ? "text-zinc-300" : "text-zinc-700"
          }`}
        >
          {text}
        </p>
        <p
          className={`mt-4 text-sm font-black uppercase tracking-widest ${
            active ? "text-red-400" : "text-red-600"
          }`}
        >
          {active ? "OPTIONS OPEN" : "VIEW OPTIONS"}
        </p>
      </div>
    </button>
  );
}
