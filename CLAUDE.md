# AdFunnl Website

Astro + Tailwind marketing site for AdFunnl. Dev server: use the `adfunnl-dev`
launch config, not `npx` (the `&` in the repo path breaks npx).

## Copy rules (hard)

These are not preferences. A copy change that breaks one of these is wrong.

1. **No em dashes or en dashes.** Not in page copy, not in code comments, not in
   commit messages. Use a comma, a colon, or two sentences. A middot (`·`) is
   fine in UI labels. The `──` box-drawing dividers in frontmatter comments are
   fine.
2. **No LLM filler.** Never "seamlessly", "effortlessly", "unlock", "elevate",
   "leverage", "robust", "supercharge", "empower", "streamline",
   "game-changer", "in today's fast-paced". See `docs/voice.md` for the full
   list and the reasons.
3. **Terminology is fixed.** "blended ROAS" (never "combined" or "total" ROAS).
   Platforms are written "Meta, TikTok, Snapchat and Google", in that order, no
   Oxford comma. Personas are "Account Managers" and "Team Leads", exactly.
4. **CTAs are fixed.** Primary is `Start free` to `${APP_URL}/signup`. Secondary
   is `Book a demo` to `${APP_URL}/demo`. Do not invent new CTA wording.
5. **Never claim a measured result.** No invented case studies, customer names,
   testimonials or percentages. Demo numbers must be anonymised, and any
   illustrative scenario has to say out loud that it is illustrative.

A hook checks rules 1 and 2 on every write to `src/`. If it blocks you, fix the
copy, do not work around the hook.

## Before writing or revising any page copy

Read `docs/voice.md` first. It is the voice guide, and it governs every
user-visible string. Do not draft page copy without it, and do not write markup
for a new page until the copy block has been reviewed.

## Page structure convention

Page data and prose live in `const` blocks in the Astro frontmatter, so a whole
page's copy can be read and revised in one screen without touching markup. Keep
new pages to that pattern: strings at the top, markup consumes them.
