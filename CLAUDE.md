# AdFunnl Website

Astro + Tailwind marketing site for AdFunnl. Dev server: use the `adfunnl-dev`
launch config, not `npx` (the `&` in the repo path breaks npx).

## Copy rules (hard)

These are not preferences. A copy change that breaks one of these is wrong.

1. **No em dashes or en dashes.** Not in page copy, not in code comments, not in
   commit messages. Use a comma, a colon, or two sentences. A middot (`·`) is
   fine in UI labels. The `──` box-drawing dividers in frontmatter comments are
   fine.
2. **No LLM filler.** The banned list is the `BANNED` array in
   `.claude/hooks/check-copy.mjs`, which is also what enforces it. Read it
   there. `docs/voice.md` section 2 explains why.
3. **Terminology is fixed.** "blended ROAS" (never "combined" or "total" ROAS).
   Platforms are written "Meta, TikTok, Snapchat and Google", in that order, no
   Oxford comma. Personas are "Account Managers" and "Team Leads", exactly.
   Never coin an insider term the reader has not been given: no "the book".
   The audience is **media buyers** and **performance marketers**, always
   written in full. Never shorten to "buyers": the whole product is built for
   media buyers, and "buyer" reads as a purchaser.
4. **CTAs are fixed and plain.** The allowed set is `Try it now`, `Start free`
   (both to `${APP_URL}/signup`) and `Book a demo` (to `${APP_URL}/demo`). No
   witty or metaphorical button text.
5. **Never claim a measured result.** No invented case studies, customer names,
   testimonials or percentages. Demo numbers must be anonymised. Do not write a
   scenario so specific it needs a disclaimer underneath, and do not add the
   disclaimer instead of fixing the scenario.
6. **One heading per idea.** No eyebrow plus headline saying the same thing, and
   no three-beat staccato ("One currency. Every account. No more guesswork.").
   The three-beat belongs to the slogan, `Connect. Visualize. Share.`, and
   nowhere else.

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
