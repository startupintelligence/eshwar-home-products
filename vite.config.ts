import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({plugins:[react()],base:"/eshwar-home-products/",build:{rollupOptions:{input:{home:"index.html",about:"about.html",products:"products.html",gallery:"gallery.html",contact:"contact.html"}}}});