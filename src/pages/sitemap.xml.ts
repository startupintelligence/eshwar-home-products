import type { APIRoute } from "astro";

// Dates are the latest Git commit timestamps for each route's source file.
// Keep these aligned with the source history when route content changes.
const pages = [
  { path: "", lastmod: "2026-11-23T13:41:40Z" },
  { path: "about", lastmod: "2026-11-18T16:17:12Z" },
  { path: "products", lastmod: "2026-11-20T13:54:09Z" },
  { path: "perambur-millet-store", lastmod: "2026-11-20T15:49:58Z" },
  { path: "kitchen-guides", lastmod: "2026-11-19T13:24:17Z" },
  { path: "blog", lastmod: "2026-11-18T16:17:12Z" },
  { path: "contact", lastmod: "2026-11-20T15:49:58Z" },
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://eshwar-home-products.vercel.app";
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const urls = pages.map(({ path, lastmod }) => {
    const route = [base, path].filter(Boolean).join("/");
    const pathname = route ? `/${route}/` : "/";
    return `  <url><loc>${origin}${pathname}</loc><lastmod>${lastmod}</lastmod></url>`;
  }).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
