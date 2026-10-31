// ── Plan and add-on prices ──────────────────────────────────────────────
// The one place the site's prices live. The pricing pages (both locales) and
// the SoftwareApplication schema on the home and pricing pages read them from
// here, so a price change is one edit. public/pricing.md and public/llms.txt
// are hand-written and still need the same change by hand.
// Monthly prices. Annual is ANNUAL_MONTHS times the monthly price.

export const ANNUAL_MONTHS = 10;

export type PlanKey = "free" | "solo" | "growth" | "agency";

export const PLAN_PRICES: Record<PlanKey, { name: string; usd: number; egp: number }> = {
  free:   { name: "Free",   usd: 0,  egp: 0 },
  solo:   { name: "Solo",   usd: 25, egp: 1490 },
  growth: { name: "Growth", usd: 49, egp: 2990 },
  agency: { name: "Agency", usd: 99, egp: 5990 },
};

// From 1 November 2026 Solo includes the AI assistant, so there is no AI
// add-on. Extra AI is sold only as credit packs (CREDIT_PACKS).
export const ADDON_PRICES = {
  adControl: { usd: 10, egp: 590 },
  seat:      { usd: 8,  egp: 490 },
};

// One-off AI credit top-ups. Mirrors PlanConfig::CREDIT_PACKS in the app repo.
export const CREDIT_PACKS = [
  { credits: "500",   egp: 690,  usd: 12 },
  { credits: "1,500", egp: 2390, usd: 39,  popular: true },
  { credits: "5,000", egp: 7790, usd: 129 },
];

const SITE = "https://www.adfunnl.com";

const DESCRIPTION = {
  en: "Ad reporting and marketing analytics for agencies, media buyers and performance marketers. AdFunnl brings Meta, TikTok, Snapchat and Google together with store revenue in one live dashboard.",
  ar: "AdFunnl منصة لتقارير الإعلانات وتحليلات التسويق للوكالات والـ Media Buyers، تجمع Meta وTikTok وSnapchat وGoogle مع إيرادات المتجر في لوحة مباشرة واحدة.",
};

/** The SoftwareApplication node with one Offer per plan and currency. Every
 *  page that carries it shares the same @id, so search engines read it as one
 *  product. */
export function softwareApplication(locale: "en" | "ar" = "en") {
  const ar = locale === "ar";
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#software`,
    name: "AdFunnl",
    url: ar ? `${SITE}/ar` : `${SITE}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: ["en", "ar"],
    description: DESCRIPTION[locale],
    publisher: { "@id": `${SITE}/#organization` },
    offers: Object.values(PLAN_PRICES).flatMap((p) =>
      (["USD", "EGP"] as const).map((currency) => {
        const price = currency === "USD" ? p.usd : p.egp;
        return {
          "@type": "Offer",
          name: p.name,
          price,
          priceCurrency: currency,
          url: ar ? `${SITE}/ar/pricing` : `${SITE}/pricing`,
          priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: currency, unitCode: "MON" },
        };
      }),
    ),
  };
}

/** A FAQPage node from the question and answer pairs a page already shows.
 *  Only pass pairs that are visible on the page. */
export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
