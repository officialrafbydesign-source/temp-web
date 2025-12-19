export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
      {/* Construction image */}
      <img
        src="/images/image.jpg"
        alt="Under Construction"
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mb-6 object-contain"
      />

      {/* Optional construction icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 sm:h-16 sm:w-16 mb-4 text-yellow-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
        />
      </svg>

      <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-center">
        Website Under Construction
      </p>
      <p className="text-gray-400 text-center text-sm sm:text-base md:text-lg max-w-xl">
        We're working on something awesome. Stay tuned!
      </p>
    </div>
  );
}
