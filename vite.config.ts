import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({plugins:[react()],base:"/eshwar-home-products/",build:{rollupOptions:{input:{home:"index.html",products:"products/index.html",contact:"contact/index.html",admin:"admin/index.html"}}}});