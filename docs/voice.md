# AdFunnl voice guide

Governs every user-visible string on the site: headings, body, labels, meta
descriptions, alt text, button text, FAQ answers.

**Status: partially filled.** The mechanical rules below are settled. The voice
section is a stub, because Hussein is not happy with the current site copy, so
the existing pages cannot be used as the reference. Until it is filled in,
treat section 3 as the weakest part of this guide and ask rather than guess.

---

## 1. Hard rules

Duplicated from `CLAUDE.md` because this file is read on its own. If they ever
disagree, `CLAUDE.md` wins.

- No em dashes, no en dashes, anywhere.
- No banned filler (section 2).
- Fixed terminology: blended ROAS; "Meta, TikTok, Snapchat and Google" in that
  order with no Oxford comma; personas are "Account Managers" and "Team Leads".
- Fixed CTAs: `Start free`, `Book a demo`.
- No invented results, customers, testimonials or percentages. Illustrative
  scenarios must label themselves as illustrative.

## 2. Banned words and constructions

Enforced by hook where a regex can catch it. Edit the list in
`.claude/hooks/check-copy.mjs` when you add to it.

**Banned words:** seamlessly, effortlessly, unlock, elevate, leverage, robust,
cutting-edge, game-changer, supercharge, harness, empower, streamline,
revolutionise, delve, "in today's fast-paced", "take it to the next level",
"say goodbye to", "the future of".

Why: they are the default vocabulary of generated marketing copy. Any sentence
that survives with the word removed did not need it, and a sentence that
collapses without it was never saying anything.

**Banned constructions** (not regex-catchable, so this is on the writer):

- `Not X. Y.` The site currently leans on this hard ("Not screenshots. The
  actual screens."). It reads as a tic once you notice it. One per site, maybe.
- The trailing clause that restates the sentence you just finished. Usually
  attached with an em dash, which is why the em dash ban catches most of them.
  Deleting the clause almost always improves the line.
- Three-item lists used for rhythm rather than because there are three things
  ("one currency, one template, one version everyone reads").
- Rhetorical questions as headings.
- Second-person guilt ("You know the feeling"). State the situation, let the
  reader recognise it.

## 3. Voice  <!-- TODO: fill from Hussein's samples -->

Fill this section with before/after pairs, not adjectives. Adjectives like
"confident but not salesy" produce exactly the copy we are trying to replace.
The format that works:

```
SITE SAYS:  Answer client questions with a link, not an evening's work.
SHOULD BE:  <Hussein's version>
RULE:       <the one transferable thing the rewrite demonstrates>
```

Ten of those is a usable guide. Three is better than none.

Open questions to settle here:

- **Spelling: British or American?** Currently mixed, which is a real bug.
  "optimise" and "fortnight" in `for/account-managers.astro` and
  `for/team-leads.astro` are British, while "normalized" and "anonymized"
  are American. Pick one and this file records it.
- Sentence length. Do you want short declaratives, or longer sentences with
  more clauses?
- How much of the reader's job vocabulary to use. The pages currently lean
  heavily on agency vernacular (WhatsApp at 11:47pm, "can you just...").
  Keep, dial up, or dial down?
- Do numbers appear in headings, or only in the product screenshots?

## 4. Page brief: required before drafting

No page copy gets drafted without these three answers. If they are missing,
ask for them.

1. **Who is this for**, specifically enough to exclude someone.
2. **The one promise.** One sentence. If there are two, it is two pages.
3. **The one action** you want taken, and which CTA carries it.

Then draft in this order: hero (h1 plus one supporting line plus CTA), section
headings only, then body under each. Get the headings approved before writing
body copy. Copy block gets reviewed before any markup is written.

## 5. Structural conventions

- One h1 per page. Sentence case for body headings, no title case.
- Every page needs a `description` on `<Layout>`, under 160 characters,
  readable as a sentence, not keyword soup.
- Prose lives in `const` blocks in Astro frontmatter, so the whole page's copy
  is reviewable in one screen. Markup consumes those strings.
- Comments in frontmatter explain what a field is *for* when the field does
  recognition work, so a later edit does not flatten it.
