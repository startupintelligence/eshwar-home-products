import type { APIRoute } from "astro";

// Only published public routes are listed. Privacy and terms pages are not present yet.
const pages = ["", "about", "products", "perambur-millet-store", "kitchen-guides", "blog", "contact", "profile"];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://eshwar-home-products.vercel.app";
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const urls = pages.map((page) => {
    const path = [base, page].filter(Boolean).join("/");
    const pathname = path ? `/${path}/` : "/";
    return `  <url><loc>${origin}${pathname}</loc></url>`;
  }).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};