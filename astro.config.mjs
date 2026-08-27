import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  // The base layer is emitted by src/styles/global.css instead, so the
  // font imports land ahead of it in one stylesheet.
  integrations: [tailwind({ applyBaseStyles: false })],
  output: "static",
});
