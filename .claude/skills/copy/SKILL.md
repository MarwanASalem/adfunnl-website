---
name: copy
description: Write or revise user-visible copy for this site. Use for any new page, any rewrite of an existing page's headings or body, hero lines, CTAs, meta descriptions, and pricing or FAQ text. Loads the AdFunnl voice guide and enforces the brief-before-drafting order.
---

# Writing copy for the AdFunnl site

## Step 1: load the rules

Read `docs/voice.md` in full before writing a single line, and read
`docs/what-ships.md` before writing any sentence that says what the product can
do, including its "Do not claim" table. Read `CLAUDE.md` if it is not already in
context. Do not skip this on the grounds that the request is small. A one-line
hero change is exactly where voice drift starts, and a single adjective is where
a false capability claim gets in.

If the copy needs a capability that is not in `what-ships.md`, stop and verify it
in the app repo at `../AdFunnl`, then add it to `what-ships.md` with today's
date. Never write the claim first and check later.

## Step 2: get the brief

Do not draft without all three. If any is missing, ask for it and stop.

1. **Who is this for**, specifically enough that it excludes someone.
2. **The one promise**, in one sentence. Two promises means two pages, so say
   so rather than writing a page that hedges.
3. **The one action**, and which fixed CTA carries it.

If the request is a revision rather than a new page, the brief is still
required, because most bad copy is bad from having no brief rather than from
bad sentences.

## Step 3: draft in stages, stop for review at each one

Never jump to finished prose, and never write markup before the copy is
approved.

- **Stage A: hero.** The h1, one supporting line, the CTA. Give two or three
  distinct options, not variations on one phrasing. Say what is different about
  each in a few words.
- **Stage B: section headings only.** The whole page skeleton as headings, in
  order. This is where structure problems are cheap to fix. Get approval here.
- **Stage C: body under each approved heading.**
- **Stage D: meta.** The `description` for `<Layout>`, under 160 characters,
  reading as a sentence.

Present each stage as plain text for reading, not as code. Markup comes after
Stage D is approved.

## Step 4: self-check before presenting

Against every line you wrote:

- Any em dash or en dash? Any banned word from `docs/voice.md` section 2?
- Any banned construction? Especially `Not X. Y.`, trailing restatement
  clauses, and three-item lists that exist for rhythm.
- Any claim of a measured result, named customer, or invented percentage?
- Does each sentence survive deleting its last clause? If yes, delete it.
- Spelling consistent with the decision recorded in `docs/voice.md` section 3.

## Step 5: after writing markup

Copy strings go in `const` blocks in the Astro frontmatter, not inline in
markup, so the page's copy stays reviewable in one screen.

The copy guard hook runs on write. If it reports a violation, fix the copy.
Never disable the hook and never swap one banned word for another.

## When the voice guide cannot answer the question

`docs/voice.md` section 3 is a stub. If the request turns on a voice judgment
that the guide does not settle, say which judgment it is and ask, rather than
guessing and producing another page that has to be rebuilt. When you get an
answer, add it to section 3 as a before/after pair so the next page inherits
it.
