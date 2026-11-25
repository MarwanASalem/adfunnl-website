import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  // The base layer is emitted by src/styles/global.css instead, so the
  // font imports land ahead of it in one stylesheet.
  integrations: [tailwind({ applyBaseStyles: false })],
  output: "static",
  // Short addresses people type or ask an assistant for. Static output writes
  // each as a small page with a canonical link and an instant redirect.
  redirects: {
    "/mcp": "/ai-ad-control",
    "/ar/mcp": "/ar/ai-ad-control",
  },
});
