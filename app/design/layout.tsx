export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="min-h-screen w-full text-white"
      style={{
        backgroundImage: "url('/images/WEBSITE BACKGROUND BLUE.jpg')",
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "900px auto",
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}