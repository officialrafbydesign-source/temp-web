export default function HipHop100Background() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1784486578/1280x1024-black-solid-color-background_kzpt0v.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />

      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dcrkpsnn9/image/upload/v1787679478/hiphop100_logo_white_mono_f5su4k.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "140px auto",
          backgroundPosition: "24px 24px",
        }}
      />
    </>
  );
}