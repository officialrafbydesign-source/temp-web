export default function RafAboutBackground() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.7)), url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784068289/hero-bg_i9wczh.jpg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
          backgroundAttachment: "fixed",
        }}
      />
    </>
  );
}
