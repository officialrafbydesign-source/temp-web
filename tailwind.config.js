/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        raf: ["RafFont", "Impact", "Arial Black", "sans-serif"],
        arialCustom: ["ArialCustom", "Arial", "sans-serif"],
      },
      colors: {
        rafRed: {
          500: "#EF4444",
          600: "#DC2626",
        },
        rafWarm: "#F5F2EB",
        rafBrown: "#3D2A1C",
      },
    },
  },
  plugins: [], // Left empty because core line-clamp works out of the box!
};