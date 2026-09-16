// Google Tag Manager events for the marketing site. The container
// (GTM-WL3FT97F) is shared with the app, so two things keep the two apart:
//
// 1. Every push carries `site_section: "web"` (the app sends "app").
// 2. Every event name starts with `web_`. The app's names are sign_up, login,
//    create_report, share_report, connect_ad_account, begin_checkout,
//    purchase and virtual_page_view. Never reuse one of those here.
//
// The site cannot see a finished signup: that happens on app.adfunnl.com and
// the app reports it as `sign_up`. What the site reports is the click that
// sends someone there. The full event list is in docs/analytics.md.
//
// Never push emails, names or tokens: the container also runs ad pixels.

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

const APP_HOST = "app.adfunnl.com";
const locale = document.documentElement.lang === "ar" ? "ar" : "en";

function push(event: string, params: DataLayerEvent = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ site_section: "web", locale, event, ...params });
}

// ── Where on the page a click happened ─────────────────────────────────
// `data-track-location` wins. Otherwise: nav, footer, the section's id, or
// "hero" for the first section and "section_N" for the rest.
function locationOf(el: Element): string {
  const tagged = el.closest<HTMLElement>("[data-track-location]");
  if (tagged) return tagged.dataset.trackLocation!;
  if (el.closest("header")) return "nav";
  if (el.closest("footer")) return "footer";
  const section = el.closest("section");
  if (!section) return "page";
  if (section.id) return section.id;
  const sections = Array.from(document.querySelectorAll("body section"));
  const i = sections.indexOf(section);
  return i === 0 ? "hero" : `section_${i + 1}`;
}

function textOf(el: Element): string {
  return (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);
}

// ── Clicks ─────────────────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  const target = e.target as Element | null;
  if (!target) return;

  const button = target.closest<HTMLButtonElement>("button[data-billing], button[data-currency]");
  if (button) {
    const { billing, currency } = button.dataset;
    push("web_pricing_toggle", billing ? { toggle: "billing", value: billing } : { toggle: "currency", value: currency });
    return;
  }

  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;
  let url: URL;
  try {
    url = new URL(link.href, location.href);
  } catch {
    return;
  }

  const base = { cta_text: textOf(link), cta_location: locationOf(link), link_url: `${url.origin}${url.pathname}` };

  if (url.host === APP_HOST) {
    if (url.pathname === "/signup") {
      push("web_signup_click", { ...base, plan: url.searchParams.get("plan") || "none" });
    } else if (url.pathname === "/login") {
      push("web_signin_click", base);
    } else {
      push("web_app_link_click", base);
    }
    return;
  }

  if (link.hasAttribute("hreflang") && url.host === location.host) {
    push("web_language_switch", { from_locale: locale, to_locale: link.getAttribute("hreflang") });
    return;
  }

  if (url.host !== location.host && /^https?:$/.test(url.protocol)) {
    push("web_outbound_click", { ...base, link_domain: url.host });
  }
});

// ── Scroll depth ───────────────────────────────────────────────────────
const SCROLL_MARKS = [25, 50, 75, 90];
const scrollSeen = new Set<number>();
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const pct = (window.scrollY / max) * 100;
  for (const mark of SCROLL_MARKS) {
    if (pct >= mark && !scrollSeen.has(mark)) {
      scrollSeen.add(mark);
      push("web_scroll_depth", { percent_scrolled: mark });
    }
  }
}
window.addEventListener("scroll", onScroll, { passive: true });

// ── Time on page ───────────────────────────────────────────────────────
// Counts only time the tab is visible. Milestones are reliable; the exit
// event fires on pagehide and may be lost if the browser closes first.
const TIME_MARKS = [15, 30, 60, 120, 300];
let engagedMs = 0;
let visibleSince: number | null = document.visibilityState === "visible" ? performance.now() : null;
const timeSeen = new Set<number>();

function engagedSeconds() {
  const running = visibleSince === null ? 0 : performance.now() - visibleSince;
  return Math.round((engagedMs + running) / 1000);
}

setInterval(() => {
  if (visibleSince === null) return;
  const s = engagedSeconds();
  for (const mark of TIME_MARKS) {
    if (s >= mark && !timeSeen.has(mark)) {
      timeSeen.add(mark);
      push("web_engaged_time", { engaged_seconds: mark });
    }
  }
}, 1000);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && visibleSince !== null) {
    engagedMs += performance.now() - visibleSince;
    visibleSince = null;
  } else if (document.visibilityState === "visible" && visibleSince === null) {
    visibleSince = performance.now();
  }
});

let exitSent = false;
window.addEventListener("pagehide", () => {
  if (exitSent) return;
  exitSent = true;
  push("web_page_exit", { engaged_seconds: engagedSeconds(), max_scroll_percent: Math.max(0, ...scrollSeen) });
});

// ── Page view ──────────────────────────────────────────────────────────
push("web_page_view", {
  page_path: location.pathname,
  page_title: document.title,
  page_type: pageType(location.pathname),
});

function pageType(path: string): string {
  const p = path.replace(/^\/ar(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  if (p === "/") return "home";
  if (p.startsWith("/for/")) return "persona";
  if (p.startsWith("/features")) return "features";
  if (p === "/pricing") return "pricing";
  if (p === "/privacy" || p === "/terms") return "legal";
  return p.slice(1).replace(/\//g, "_");
}
