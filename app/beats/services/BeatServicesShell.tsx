"use client";

import type {
  ReactNode,
} from "react";

import {
  SectionThemeProvider,
} from "@/app/context/SectionThemeContext";

type BeatServicesShellProps = {
  children: ReactNode;
};

export default function BeatServicesShell({
  children,
}: BeatServicesShellProps) {
  return (
    <SectionThemeProvider>
      {children}
    </SectionThemeProvider>
  );
}