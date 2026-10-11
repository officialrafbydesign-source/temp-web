export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className="min-h-screen w-full text-white overflow-x-clip"
      style={{
        backgroundImage: "url('/images/WEBSITE BACKGROUND BLUE.jpg')",
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "900px auto",
      }}
    >
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}