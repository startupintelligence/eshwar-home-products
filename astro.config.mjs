import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const isVercel = process.env.VERCEL === "1";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const site = isVercel
  ? "https://eshwar-home-products.vercel.app"
  : "https://startupintelligence.github.io";

const base = isVercel ? "/" : isGitHubPages ? "/eshwar-home-products" : "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  output: "static",
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  integrations: [react()],
  vite: {
    envPrefix: ["PUBLIC_", "VITE_"],
  },
});
