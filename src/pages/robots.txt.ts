import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://eshwar-home-products.vercel.app";
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const prefix = base ? `/${base}` : "";
  const body = [
    "User-agent: *",
    "Allow: /",
    `Disallow: ${prefix}/admin/`,
    `Disallow: ${prefix}/thank-you/`,
    "",
    `Sitemap: ${origin}${prefix}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
