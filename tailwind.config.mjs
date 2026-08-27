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
      // ── Families ────────────────────────────────────────────────────
      // Verbatim from the app. Archivo is the sans everywhere; it was
      // picked over Readex Pro because it has real tabular figures.
      // `display` is an alias, not a second typeface: the site had a
      // separate display face before and the class name is used in a lot
      // of markup, so it now resolves to Archivo like everything else.
      fontFamily: {
        sans: [
          "Archivo Variable", "Zain",
          "ui-sans-serif", "system-ui", "sans-serif",
        ],
        display: [
          "Archivo Variable", "Zain",
          "ui-sans-serif", "system-ui", "sans-serif",
        ],
        mono: [
          "DM Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace",
        ],
      },
      // ── Scale ───────────────────────────────────────────────────────
      // xs through 2xl are the app's tiers, unchanged, so shared UI reads
      // identically in both products. `ui` is the app's 14px control tier
      // that stock Tailwind lacks.
      //
      // 3xl and up are the marketing sizes the app has no use for. They
      // carry the ladder upward in the same spirit: same family, leading
      // closing on the cap height and tracking tightening as the size
      // grows, on the curve the app's metric sizes set.
      fontSize: {
        xs:   ["0.8125rem", { lineHeight: "1.125rem" }],
        ui:   ["0.875rem",  { lineHeight: "1.25rem" }],
        sm:   ["0.9375rem", { lineHeight: "1.3125rem" }],
        base: ["1.0625rem", { lineHeight: "1.5rem" }],
        lg:   ["1.1875rem", { lineHeight: "1.6875rem" }],
        xl:   ["1.3125rem", { lineHeight: "1.8125rem" }],
        "2xl": ["1.5625rem", { lineHeight: "2rem" }],
        "3xl": ["1.9375rem", { lineHeight: "2.375rem", letterSpacing: "-0.018em" }],
        "4xl": ["2.375rem",  { lineHeight: "2.625rem", letterSpacing: "-0.022em" }],
        "5xl": ["3rem",      { lineHeight: "3.25rem",  letterSpacing: "-0.026em" }],
        "6xl": ["3.75rem",   { lineHeight: "3.9375rem", letterSpacing: "-0.03em" }],
        "7xl": ["4.5rem",    { lineHeight: "4.625rem", letterSpacing: "-0.032em" }],

        // The app's display type is a number. Any large numeral on the
        // site (a price, a stat, a counter) uses these, and picks up
        // tabular figures from the base layer in global.css.
        "metric-sm": ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "metric":    ["1.625rem", { lineHeight: "2rem",    letterSpacing: "-0.018em" }],
        "metric-lg": ["2.375rem", { lineHeight: "2.75rem", letterSpacing: "-0.026em" }],
      },
    },
  },
};
