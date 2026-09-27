"use client";

import { usePathname } from "next/navigation";

// Cloudinary Background Assets
const BACKGROUNDS = {
  default:
    "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg",
  red: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_RED_uipmtc.jpg",
  green:
    "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_GREEN.jpg", // Replace with your exact Cloudinary link if different
  blue: "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_BLUE.jpg", // Replace with your exact Cloudinary link if different
  yellow:
    "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068305/WEBSITE_BACKGROUND_YELLOW.jpg", // Replace with your exact Cloudinary link if different
};

export default function BackgroundLayer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let background = BACKGROUNDS.default;

  if (pathname.startsWith("/beats")) {
    background = BACKGROUNDS.red;
  } else if (pathname.startsWith("/music")) {
    background = BACKGROUNDS.green;
  } else if (pathname.startsWith("/design") || pathname.startsWith("/services/design")) {
    background = BACKGROUNDS.blue;
  } else if (pathname.startsWith("/clothing")) {
    background = BACKGROUNDS.yellow;
  }

  return (
    <div
      className="min-h-screen flex flex-col w-full relative overflow-x-hidden transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.80)), url('${background}')`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      {children}
    </div>
  );
}