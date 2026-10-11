import type { ReactNode } from "react";

export default function PageBanner({
  title, description, fullWidth = false, children,
}: {
  title: string;
  description: string;
  fullWidth?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`${fullWidth ? "relative left-1/2 w-screen max-w-none -translate-x-1/2" : "w-full"} bg-black/60 backdrop-blur-sm border-b-4 border-black`}>
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h1 className="font-raf text-3xl md:text-5xl lg:text-6xl tracking-wide uppercase text-white">{title}</h1>
        <p className="mt-3 mx-auto max-w-3xl text-xs sm:text-sm text-white/80 font-bold" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>{description}</p>
        {children}
      </div>
    </header>
  );
}
