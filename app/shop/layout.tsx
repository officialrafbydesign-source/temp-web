"use client";

import { SectionThemeProvider } from "@/app/context/SectionThemeContext";

export default function ClothingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionThemeProvider>
      <div
        className="min-h-screen bg-cover bg-repeat"
        style={{
          backgroundImage: "url('/images/WEBSITE BACKGROUND YELLOW.jpeg')",
        }}
      >
        {children}
      </div>
    </SectionThemeProvider>
  );
}
