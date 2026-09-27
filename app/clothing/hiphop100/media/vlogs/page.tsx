import HipHop100SeriesLibrary, {
  type HipHop100Series,
} from "@/components/hiphop100/HipHop100SeriesLibrary";

const series: HipHop100Series[] = [
  {
    id: "photoshoot-diaries",
    title: "PHOTOSHOOT DIARIES",
    description:
      "Behind-the-scenes access to HipHop100 photoshoots, campaign days and the people involved in bringing each visual project together.",
    episodes: [
      {
        id: "vlog-1",
        episodeLabel: "E1",
        title: "Pilot",
        subtitle: "@rafbydesign and HipHop100",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367444/maxresdefault_4_u8douy.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%201-%20Pilot%20%5BREUPLOAD%5D.mp4",
      },
      {
        id: "vlog-2",
        episodeLabel: "E2",
        title: "Photoshoot Diaries - EP. 2",
        subtitle: "@rafbydesign and HipHop100",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367444/sddefault_1_kc5yd0.jpg",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%202.mp4",
      },
      {
        id: "vlog-3",
        episodeLabel: "E3",
        title: "Unity In The Community Special",
        subtitle: "Photoshoot Diaries - EP. 3",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367444/maxresdefault_qaif2a.jpg",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%203-%20Unity%20In%20The%20Community%20Special.mp4",
      },
      {
        id: "vlog-4",
        episodeLabel: "E4",
        title: "4 Elements Advert Special",
        subtitle: "Photoshoot Diaries - EP. 4",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367416/maxresdefault_jr5a3k.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%40rafbydesign%20and%20HipHop%F0%9F%92%AF-%20%20Photoshoot%20Diaries-%20EP.%204-%204%20ELEMENTS%20ADVERT.mp4",
      },
    ],
  },
  {
    id: "fashion-launch-documentary",
    title: "FASHION LAUNCH DOCUMENTARY",
    description:
      "A full documentary covering the HipHop100 fashion launch event, bringing together the clothing, performances, people and atmosphere from the day.",
    episodes: [
      {
        id: "vlog-fashion-launch-doc",
        episodeLabel: "E1",
        title: "Fashion Launch Full Documentary",
        subtitle: "HipHop100 Fashion Launch Event Documentary",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788369156/maxresdefault_8_xpceuw.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Fashion%20Launch%20Event%20Documentary.mp4",
      },
    ],
  },
  {
    id: "4-elements-vlogs",
    title: "4 ELEMENTS VLOGS",
    description:
      "A closer look at the people, creative process and Hip-Hop culture behind the 4 Elements clothing range and campaign.",
    episodes: [
      {
        id: "vlog-6",
        episodeLabel: "E1",
        title: "Behind The Scenes [Making Of]",
        subtitle: "Production Behind The Scenes",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367540/sddefault_e9egwd.jpg",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Behind%20The%20Scenes%20%5BMaking%20Of%5D%20Vlog.mp4",
      },
      {
        id: "vlog-7",
        episodeLabel: "E2",
        title: "Graff Vlog",
        subtitle: "Graffiti & Visual Art Session",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367445/maxresdefault_6_ug5za3.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20Graff%20Vlog.mp4",
      },
    ],
  },
];

export default function HipHop100VlogsPage() {
  return (
    <HipHop100SeriesLibrary
      pageTitle="VLOGS & DIARIES"
      pageDescription="Select a HipHop100 series to open its episode library."
      series={series}
    />
  );
}
