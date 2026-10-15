// ── Blog index ──────────────────────────────────────────────────────────
// One entry per post, newest first. The blog index pages read this list, so a
// new post is listed by adding it here. The post's own copy lives in its page
// frontmatter, like every other page; only the title, description and date
// are repeated here, and they must match the page.
export interface BlogEntry {
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  published: string;
  updated?: string;
  en: { title: string; description: string };
  ar: { title: string; description: string };
}

export const POSTS: BlogEntry[] = [
  {
    slug: "how-to-calculate-blended-roas",
    published: "2026-10-15",
    en: {
      title: "How to calculate blended ROAS across every ad platform",
      description:
        "How to calculate blended ROAS across Meta, TikTok, Snapchat and Google, without counting a sale twice or mixing currencies. Worked example inside.",
    },
    ar: {
      title: "كيف تحسب blended ROAS عبر كل منصاتك الإعلانية",
      description:
        "طريقة حساب blended ROAS عبر Meta وTikTok وSnapchat وGoogle دون أن تُحسب عملية البيع مرتين ودون خلط العملات، مع مثال محلول.",
    },
  },
];

// ── Post copy shape ─────────────────────────────────────────────────────
// What a post page hands to src/components/BlogArticle.astro.
export type Block =
  | { type: "p"; text: string }
  | { type: "formula"; text: string }
  | { type: "list"; items: { lead: string; text: string }[] }
  | { type: "table"; head: string[]; rows: string[][]; foot?: string[] };

export interface Post {
  slug: string;
  published: string;
  updated?: string;
  title: string;
  seoTitle: string;
  description: string;
  lead: string;
  sections: { id: string; heading: string; blocks: Block[] }[];
  faq: { id: string; heading: string; items: { q: string; a: string }[] };
  close: { id: string; heading: string; body: string };
}
