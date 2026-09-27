import type { Metadata } from "next";
import BeatServicesShell from "./BeatServicesShell";

export const metadata: Metadata = {
  title: "Beat Services | RAF By Design",
  description:
    "Custom beat production, recording, mixdown, and music service requests.",
};

export default function BeatServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BeatServicesShell>{children}</BeatServicesShell>;
}