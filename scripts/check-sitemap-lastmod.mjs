import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const sitemapSource = readFileSync("src/pages/sitemap.xml.ts", "utf8");
const routeSources = new Map([
  ["", "src/pages/index.astro"],
  ["about", "src/pages/about.astro"],
  ["products", "src/pages/products.astro"],
  ["perambur-millet-store", "src/pages/perambur-millet-store.astro"],
  ["kitchen-guides", "src/pages/kitchen-guides.astro"],
  ["blog", "src/pages/blog/index.astro"],
  ["contact", "src/pages/contact.astro"],
]);

const entries = [...sitemapSource.matchAll(/\{\s*path:\s*"([^"]*)",\s*lastmod:\s*"([^"]+)"\s*\}/g)];
if (entries.length !== routeSources.size) {
  throw new Error(`Expected ${routeSources.size} sitemap entries, found ${entries.length}.`);
}

const failures = [];
for (const [, route, declaredLastmod] of entries) {
  const sourcePath = routeSources.get(route);
  if (!sourcePath) {
    failures.push(`No route-source mapping for sitemap path "${route}".`);
    continue;
  }

  let latestSourceDate;
  try {
    latestSourceDate = execFileSync(
      "git",
      ["log", "-1", "--format=%aI", "HEAD", "--", sourcePath],
      { encoding: "utf8" },
    ).trim();
  } catch {
    failures.push(`Could not read Git history for ${sourcePath}.`);
    continue;
  }

  if (!latestSourceDate) {
    failures.push(`No Git history found for ${sourcePath}.`);
  } else if (Date.parse(declaredLastmod) !== Date.parse(latestSourceDate)) {
    failures.push(
      `${route || "/"}: sitemap has ${declaredLastmod}, but ${sourcePath} last changed at ${latestSourceDate}.`,
    );
  }
}

if (failures.length) {
  console.error("Sitemap lastmod validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Update only the lastmod entries for route sources that changed.");
  process.exitCode = 1;
} else {
  console.log(`Sitemap lastmod dates match Git history for all ${entries.length} routes.`);
}
