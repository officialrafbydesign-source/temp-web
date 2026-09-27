"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SectionTheme = "red" | "green" | "blue" | "yellow";

type SectionThemeContextType = {
  theme: SectionTheme;
  setTheme: (theme: SectionTheme) => void;
};

const SectionThemeContext = createContext<SectionThemeContextType | undefined>(
  undefined
);

export function SectionThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<SectionTheme>("red");

  return (
    <SectionThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </SectionThemeContext.Provider>
  );
}

export function useSectionTheme() {
  const context = useContext(SectionThemeContext);
  if (!context) {
    throw new Error(
      "useSectionTheme must be used inside SectionThemeProvider"
    );
  }
  return context;
}
