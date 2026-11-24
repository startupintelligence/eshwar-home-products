import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://eshwar-home-products.vercel.app";
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const prefix = base ? `/${base}` : "";
  const agents = [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Google-Extended",
  ];
  const rules = [
    "Allow: /",
    `Disallow: ${prefix}/admin/`,
    `Disallow: ${prefix}/*?utm_`,
    `Disallow: ${prefix}/*?fbclid=`,
    `Disallow: ${prefix}/*?gclid=`,
    `Disallow: ${prefix}/*?ref=`,
  ];
  const body = [
    ...agents.map((agent) => `User-agent: ${agent}`),
    ...rules,
    "",
    "User-agent: *",
    ...rules,
    "",
    `Sitemap: ${origin}${prefix}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
