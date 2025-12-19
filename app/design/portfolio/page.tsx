export default function DesignPortfolioPage() {
  const portfolioItems = [
    {
      id: 1,
      title: "Album Cover – Dark Trap Edition",
      image: "/portfolio/sample1.jpg",
    },
    {
      id: 2,
      title: "Logo Design – Urban Clothing Brand",
      image: "/portfolio/sample2.jpg",
    },
    {
      id: 3,
      title: "Single Artwork – Alternative R&B",
      image: "/portfolio/sample3.jpg",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">🎨 Graphic Design Portfolio</h1>
      <p className="text-gray-600 mb-8">
        A selection of past artwork, branding projects and visual designs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <div key={item.id} className="rounded shadow hover:shadow-lg transition">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-64 object-cover rounded-t"
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{item.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
