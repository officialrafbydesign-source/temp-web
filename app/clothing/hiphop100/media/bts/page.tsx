import HipHop100SeriesLibrary, {
  type HipHop100Series,
} from "@/components/hiphop100/HipHop100SeriesLibrary";

const series: HipHop100Series[] = [
  {
    id: "keepit100-bts",
    title: "#KEEPIT100 BEHIND THE SCENES",
    description:
      "Behind-the-scenes footage from the #KeepIt100 campaign, following the shoots, production days and extra edits created around the range.",
    episodes: [
      {
        id: "bts-1",
        episodeLabel: "E1",
        title: "#KeepIt100 BTS Shoot - EP.1",
        subtitle: "Behind The Scenes Production",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788368467/KeepIt100_BTS_image_jwl7ir.png",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.1.mp4",
      },
      {
        id: "bts-2",
        episodeLabel: "E2",
        title: "#KeepIt100 BTS Shoot - EP.2",
        subtitle: "Behind The Scenes Production",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788368043/maxresdefault_7_i13trx.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.2.mp4",
      },
      {
        id: "bts-3",
        episodeLabel: "E3",
        title: "#KeepIt100 BTS Shoot - EP.3",
        subtitle: "Behind The Scenes Production",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788368044/maxresdefault_3_v7o6xw.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20Behind%20The%20Scenes%20Shoot-%20EP.3.mp4",
      },
      {
        id: "bts-4",
        episodeLabel: "E4",
        title: "0 to 100 Advert Reel Cut 1",
        subtitle: "#KeepIt100 Short Edit",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788365471/0_To_100_Reel_Cut_khbltt.png",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/%23KeepIt%F0%9F%92%AF%20_0%20to%20100_%20Advert%20Reel%20Cut%201.mp4",
      },
    ],
  },
  {
    id: "4-elements-bts",
    title: "4 ELEMENTS BEHIND THE SCENES",
    description:
      "Extra behind-the-scenes and culture-focused footage connected to the HipHop100 4 Elements range and campaign.",
    episodes: [
      {
        id: "vlog-5",
        episodeLabel: "E1",
        title: "B-Boy / B-Girl Vlog",
        subtitle: "Culture & Dance Feature",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788367443/maxresdefault_1_p3bmsl.jpg",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/4%20Elements_%20B-Boy_B-Girl%20Vlog.mp4",
      },
    ],
  },
];

export default function HipHop100BTSPage() {
  return (
    <HipHop100SeriesLibrary
      pageTitle="BEHIND THE SCENES"
      pageDescription="Select a HipHop100 behind-the-scenes series to open its episode library."
      series={series}
    />
  );
}
