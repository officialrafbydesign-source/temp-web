export default function DesignServicesPage() {
  const services = [
    {
      id: 1,
      title: "Album Cover Design",
      description:
        "High-quality album artwork designed for Spotify, Apple Music, and physical release.",
      startingPrice: 80,
    },
    {
      id: 2,
      title: "Logo & Branding",
      description:
        "Professional logo creation and brand identity packages tailored to your style.",
      startingPrice: 120,
    },
    {
      id: 3,
      title: "Social Media Packs",
      description:
        "Banners, templates, promos, and visual branding for IG, TikTok, YouTube.",
      startingPrice: 50,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">🛠️ Graphic Design Services</h1>
      <p className="text-gray-600 mb-8">
        Choose from a range of creative services tailored for artists and businesses.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg p-6 shadow hover:shadow-lg transition bg-white"
          >
            <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="font-semibold text-lg mb-4">
              Starting from £{service.startingPrice}
            </p>

            <a
              href="/design/book"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Book This Service
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
