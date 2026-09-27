import HipHop100SeriesLibrary, {
  type HipHop100Series,
} from "@/components/hiphop100/HipHop100SeriesLibrary";

const series: HipHop100Series[] = [
  {
    id: "cypher-sessions",
    title: "HIPHOP100 CYPHER SESSIONS",
    description:
      "HipHop100 cypher sessions bringing artists together for live performances, freestyles and collaborative Hip-Hop moments connected to the brand.",
    episodes: [
      {
        id: "free-1",
        episodeLabel: "E1",
        title: "Fashion Launch Event Special",
        subtitle: "Leemz x Trexx x K. Simmz x Fend",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788368708/maxresdefault_9_zdfeqr.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions_%20Leemz%20x%20Trexx%20x%20K.%20Simmz%20x%20Fend%20%5BFashion%20Launch%20Event%20Special%5D%20%23keepit%F0%9F%92%AF.mp4",
      },
      {
        id: "free-2",
        episodeLabel: "E2",
        title: "Cypher Sessions 2",
        subtitle: "Fend x Trexx x K. Simmz",
        thumbnailUrl:
          "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788368837/maxresdefault_2_w417sp.webp",
        videoUrl:
          "https://pub-8494bca8e27d43e9b31322d1b7a4dba1.r2.dev/hiphop100/HipHop%F0%9F%92%AF%20Cypher%20Sessions%202_%20Fend%20x%20Trexx%20x%20K.%20Simmz.mp4",
      },
    ],
  },
];

export default function HipHop100CyphersPage() {
  return (
    <HipHop100SeriesLibrary
      pageTitle="CYPHERS & FREESTYLES"
      pageDescription="Select a HipHop100 cypher series to open its episode library."
      series={series}
    />
  );
}
