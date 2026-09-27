export default function LicensesPage() {
  return (
    <div className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">
        Beat Licensing
      </h1>

      <div className="space-y-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <img
            src="/images/Leasing.png"
            alt="Leasing License"
            className="mb-4"
          />
          <p className="text-red-200">
            Non-exclusive · MP3 + WAV · Limited streams
          </p>
        </div>

        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <img
            src="/images/Exclusive.png"
            alt="Exclusive License"
            className="mb-4"
          />
          <p className="text-red-200">
            Exclusive · Stems included · Unlimited use
          </p>
        </div>
      </div>
    </div>
  );
}
