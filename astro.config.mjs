import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://startupintelligence.github.io",
  base: "/eshwar-home-products",
  trailingSlash: "always",
  output: "static",
  integrations: [react()],
});
