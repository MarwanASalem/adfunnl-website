// Small marks for the AI assistants AdFunnl connects to, as SVG strings, so
// they can sit in markup (AssistantMark.astro) or in a data attribute for the
// headline rotator (AssistantRotator.astro) without adding page text.
//
// Simplified shapes, not the official artwork: swap each one for the owner's
// published SVG when the press kit files are added to the repo. Always
// aria-hidden: the assistant's name is written next to the mark.

export type Assistant = "claude" | "chatgpt";

// Claude: a starburst of twelve tapered rays of uneven length.
const rays = [10, 8, 9.5, 7.5, 10, 8.5, 9, 7.5, 10, 8, 9.5, 8.5].map((len, i) => {
  const a = (i / 12) * Math.PI * 2;
  const w = 0.13;
  const p = (r: number, t: number) => `${(12 + r * Math.cos(t)).toFixed(2)} ${(12 + r * Math.sin(t)).toFixed(2)}`;
  return `M${p(1.2, a - w * 3)} L${p(len, a - w * 0.35)} L${p(len, a + w * 0.35)} L${p(1.2, a + w * 3)} Z`;
}).join(" ");

const inner: Record<Assistant, string> = {
  claude: `<path d="${rays}" fill="#D97757"/><circle cx="12" cy="12" r="2.1" fill="#D97757"/>`,
  chatgpt: `<g fill="none" stroke="#0d0d0d" stroke-width="1.55" stroke-linejoin="round">${[0, 60, 120, 180, 240, 300]
    .map((d) => `<rect x="9.2" y="3.2" width="5.6" height="11" rx="2.8" transform="rotate(${d} 12 12)"/>`)
    .join("")}</g>`,
};

export const markSvg = (assistant: Assistant, cls: string) =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner[assistant]}</svg>`;
