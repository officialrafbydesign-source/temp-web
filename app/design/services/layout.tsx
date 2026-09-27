import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

export const metadata: Metadata = {
  title:
    "Design Services | RAF By Design",

  description:
    "Branding, artwork, and digital design services",
};

type DesignServicesLayoutProps = {
  children: ReactNode;
};

export default function DesignServicesLayout({
  children,
}: DesignServicesLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-repeat"
      style={{
        backgroundImage:
          "url('/images/WEBSITE BACKGROUND BLUE.jpeg')",
      }}
    >
      <main className="flex-grow relative z-10">
        {children}
      </main>
    </div>
  );
}