import type { APIRoute } from "astro";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://eshwar-home-products.vercel.app";
  const base = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const prefix = base ? `/${base}` : "";
  const disallowRules = [
    `Disallow: ${prefix}/admin/`,
    `Disallow: ${prefix}/thank-you/`,
    `Disallow: ${prefix}/*?utm_`,
    `Disallow: ${prefix}/*?gclid=`,
    `Disallow: ${prefix}/*?fbclid=`,
  ];

  const lines = [
    ...AI_CRAWLERS.flatMap((agent) => [
      `User-agent: ${agent}`,
      "Allow: /",
      ...disallowRules,
      "",
    ]),
    "User-agent: *",
    "Allow: /",
    ...disallowRules,
    "",
    `Sitemap: ${origin}${prefix}/sitemap.xml`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
