import type { ReactNode } from "react";
export default function MusicHubFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen pb-32 pt-32 text-white [font-family:Arial,Helvetica,sans-serif]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.93)),url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068302/WEBSITE_BACKGROUND_GREEN_brf8gl.jpg')", backgroundSize: "cover", backgroundAttachment: "fixed", backgroundPosition: "center" }}>
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
  </div>;
}
