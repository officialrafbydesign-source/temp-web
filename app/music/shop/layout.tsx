export default function MusicShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        backgroundImage: "url('/images/WEBSITE BACKGROUND GREEN.jpg')",
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "900px auto",
      }}
    >
      {children}
    </div>
  );
}