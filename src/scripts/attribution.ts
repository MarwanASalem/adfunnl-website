// Where did this visitor first come from? The app records the source of every
// signup, but people usually reach it through this site, so all the app could
// see was "came from adfunnl.com": the ad, post or search that brought them
// was lost on the way. This script remembers the first visit here and adds it
// to every link into the app, where web/src/lib/signup-source.ts in the app
// repo reads it back.
//
// What travels: utm_source, utm_medium, utm_campaign, utm_content (from the
// link they arrived on, or worked out from an ad platform's click id), src_ref
// (the site that sent them, or "direct") and src_lp (the first page they
// opened here). Never anything personal.
//
// First visit wins for 30 days, the same rule the app uses.

const STORAGE_KEY = "adfunnl.siteSource";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const APP_HOST = "app.adfunnl.com";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const MAX_LENGTH = 120;

// Ad platforms add their own click id when the link carries no utm tags.
const CLICK_IDS: [param: string, source: string, medium: string][] = [
  ["gclid", "google", "cpc"],
  ["fbclid", "facebook", "paid"],
  ["ttclid", "tiktok", "paid"],
  ["sccid", "snapchat", "paid"],
  ["ScCid", "snapchat", "paid"],
  ["li_fat_id", "linkedin", "paid"],
];

type Source = Record<string, string>;
interface Stored { source: Source; captured_at: number }

function clip(value: string): string {
  return value.trim().slice(0, MAX_LENGTH);
}

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function capture(): Source {
  const existing = readStored();
  if (existing && Date.now() - existing.captured_at < MAX_AGE_MS) return existing.source;

  const source: Source = {};
  const params = new URLSearchParams(location.search);
  if (params.get("utm_source")) {
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) source[key] = clip(value);
    }
  } else {
    const click = CLICK_IDS.find(([param]) => params.has(param));
    if (click) {
      source.utm_source = click[1];
      source.utm_medium = click[2];
    }
  }

  let referrer = "";
  try {
    if (document.referrer) referrer = new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch { /* malformed referrer */ }
  // A visit from our own pages or the app is not a source.
  const ours = /(^|\.)adfunnl\.com$/.test(referrer) || referrer === location.hostname.replace(/^www\./, "");
  source.src_ref = referrer && !ours ? clip(referrer) : "direct";
  source.src_lp = clip(location.pathname);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ source, captured_at: Date.now() }));
  } catch { /* private mode: still works for links on this page */ }
  return source;
}

let source: Source = {};
try {
  source = capture();
} catch { /* never break the page over this */ }

// Add the source to an app link just before it is followed. Done on press,
// not once on load, so links added later and middle-clicks are covered too.
function tag(event: Event) {
  const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
  if (!link) return;
  let url: URL;
  try {
    url = new URL(link.href, location.href);
  } catch {
    return;
  }
  if (url.host !== APP_HOST) return;

  // A link that already carries its own campaign tags keeps them.
  const hasOwnTags = url.searchParams.has("utm_source");
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith("utm_") && hasOwnTags) continue;
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  link.href = url.toString();
}

document.addEventListener("pointerdown", tag, true);
document.addEventListener("click", tag, true);
document.addEventListener("keydown", (e) => { if (e.key === "Enter") tag(e); }, true);
