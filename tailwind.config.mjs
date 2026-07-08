/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f2f0fd",
          100: "#e6e1fb",
          200: "#cfc6f6",
          300: "#b0a1ef",
          400: "#8b73e6",
          500: "#6549dd",
          600: "#5738c9",
          700: "#422a96",
          800: "#352279",
          900: "#2b1d61",
        },
        ink:    "#02020b",
        cream:  "#f7f4ea",
        accent: "#ff9f1c",
      },
      fontFamily: {
        sans: [
          "Inter", "-apple-system", "BlinkMacSystemFont",
          "Segoe UI", "sans-serif",
        ],
      },
    },
  },
};
