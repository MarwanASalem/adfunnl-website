// Sitemap, built from the pages on disk so a new page (and its Arabic twin)
// is listed without anyone remembering to add it. A page that passes
// `noindex` to <Layout> is left out.
import type { APIRoute } from "astro";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://www.adfunnl.com";
const PAGES_DIR = join(process.cwd(), "src", "pages");
const pages = Object.keys(import.meta.glob("./**/*.astro"));

// "./ar/for/team-leads.astro" becomes "/ar/for/team-leads", an index is its folder.
const toRoute = (key: string) =>
  key.slice(1).replace(/\.astro$/, "").replace(/\/index$/, "") || "/";
const abs = (route: string) => `${SITE}${route === "/" ? "/" : route}`;
const toEn = (route: string) => route.replace(/^\/ar(?=\/|$)/, "") || "/";
const toAr = (route: string) => (route === "/" ? "/ar" : `/ar${route}`);

const git = (...args: string[]) => {
  try {
    return execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};
// A shallow clone dates every file to the one commit it has, which would stamp
// the whole site as changed on each deploy. No lastmod beats a wrong one.
const datable = git("rev-parse", "--is-shallow-repository") === "false";

const entries = pages
  .map((key) => {
    const file = join(PAGES_DIR, key);
    return { route: toRoute(key), file, source: readFileSync(file, "utf8") };
  })
  .filter((p) => !/<Layout\b[^>]*\bnoindex\b/s.test(p.source))
  .sort((a, b) => toEn(a.route).localeCompare(toEn(b.route)) || a.route.localeCompare(b.route));

const routes = new Set(entries.map((p) => p.route));

export const GET: APIRoute = () => {
  const urls = entries.map(({ route, file }) => {
    const en = toEn(route);
    const arRoute = toAr(en);
    const alternates = routes.has(en) && routes.has(arRoute)
      ? [
          `    <xhtml:link rel="alternate" hreflang="en" href="${abs(en)}" />`,
          `    <xhtml:link rel="alternate" hreflang="ar" href="${abs(arRoute)}" />`,
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(en)}" />`,
        ]
      : [];
    const lastmod = datable ? git("log", "-1", "--format=%cs", "--", file) : "";
    return [
      "  <url>",
      `    <loc>${abs(route)}</loc>`,
      ...alternates,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      "  </url>",
    ].join("\n");
  });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
    "",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
