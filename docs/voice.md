# AdFunnl voice guide

Governs every user-visible string on the site: headings, body, labels, meta
descriptions, alt text, button text, FAQ answers.

Section 3 is the important part. It comes from Hussein's own notes on what was
wrong with the copy, and it is written as before/after pairs on purpose,
because the failures it describes are ones that read as fine in isolation.

---

## 1. Hard rules

Duplicated from `CLAUDE.md` because this file is read on its own. If they ever
disagree, `CLAUDE.md` wins.

- No em dashes, no en dashes, anywhere.
- No banned filler (section 2).
- Fixed terminology: blended ROAS; "Meta, TikTok, Snapchat and Google" in that
  order with no Oxford comma; personas are "Account Managers" and "Team Leads".
- CTAs are plain: `Try it now`, `Start free`, `Book a demo`. Nothing else.
- No invented numbers, customers, testimonials or percentages.

## 2. Banned words and constructions

**The list lives in one place: the `BANNED` array in
`.claude/hooks/check-copy.mjs`.** Read it there, and add to it there. It is
deliberately not copied into this file, both to stop the two drifting apart and
because this file cannot contain the words it bans. The hook checks `docs/` too,
and it correctly blocked an earlier draft of this very section.

Why they are banned: they are the default vocabulary of generated marketing
copy. Any sentence that survives with the word removed did not need it, and a
sentence that collapses without it was never saying anything.

## 3. The eight rules that matter

### The slogan

**Connect. Visualize. Share.** That is the brand slogan. It is the one place
the three-beat rhythm belongs, which is exactly why body copy must not imitate
it (see R2).

### R1. One heading per idea

Never stack a kicker and a headline that say the same thing. Pick the one that
carries the meaning and delete the other.

```
WAS:  eyebrow: "The pipeline"
      heading: "From every source to a client-ready report"
NOW:  heading: "From every source to a client-ready report"
RULE: The heading already says it is a pipeline. The eyebrow is the tell of
      generated copy: two labels for one thought, stacked for visual rhythm.
```

An eyebrow is only allowed when it carries information the heading does not,
such as a section's place in a sequence, or a persona label like
"AdFunnl For · Team Leads".

### R2. No three-beat staccato

The single strongest tell. Do not break a thought into three short witty
fragments.

```
WAS:  One currency. Every account. No more guesswork.
NOW:  Every currency, converted into yours
RULE: Three-part rhythm is reserved for the slogan. Everywhere else it reads
      as generated, and it dilutes the slogan by repetition.
```

Also applies inside sentences: "one currency, one template, one version
everyone reads" is the same tic with commas. Watch for lists of three that
exist for cadence rather than because there are three things.

### R3. Real screens, not drawings

Prefer screenshots of the actual app, client names removed, over illustrations
built from scratch. A drawn approximation of a dashboard is a claim about the
product. A screenshot is the product.

Status: open task. The site currently uses hand-built recreations. Replacing
them needs real screenshots from a workspace with demo or anonymised data.

Until then, the copy around them must not claim otherwise. The homepage
carried the heading "Not screenshots. The actual screens." directly above a
paragraph admitting they were recreations. Do not write a claim the picture
cannot back.

### R4. We replace reports, not spreadsheets

Agencies do not merely live in spreadsheets, so an argument built on
spreadsheets misses. What AdFunnl replaces is **the report**, and in practice
that means a PDF. Spreadsheets are one step in the flow, not the enemy.

```
WAS:  Not four exports and a spreadsheet somebody rebuilds every Monday.
NOW:  instead of a report that was already out of date when you sent it.
RULE: Name the real artefact. The reader's pain is the deliverable, not the
      tool they happened to build it in.
```

### R5. CTAs are plain

A button says what happens when you press it. Nothing witty, nothing
metaphorical.

```
WAS:  Put your book on one screen
      Set up one account with me
NOW:  Try it now
RULE: A clever CTA makes the reader decode instead of click. Allowed set:
      Try it now, Start free, Book a demo.
```

### R6. No coined vocabulary

Never invent an insider term and use it as though the reader already knows it.
"The book" appeared eight times on the Team Leads page without ever being
defined.

```
WAS:  Six ways the book goes quiet on you
      One currency across the book
NOW:  Every report is assembled by hand
      One currency, every account
RULE: If a word needs a glossary the reader does not have, it is not shorthand,
      it is noise.
```

Metaphors are welcome, and wanted, when they are brief and land instantly.
"Judging a race by watching each runner separately" is fine, because nobody has
to learn it. The test is whether the reader decodes it or just gets it.

### R7. No defensive captions

If a scenario needs a disclaimer under it, the scenario is the problem.

```
WAS:  An ordinary morning, not a case study. The timings are illustrative.
NOW:  (deleted, and the pseudo-precise timings were softened so no
      disclaimer is needed)
RULE: A caption defending the copy above it adds doubt and no context. Write
      something recognisably true instead, then it needs no defending. The
      honesty rule still stands for numbers: never invent a measured result.
```

### R8. Get the daily pain right

The real friction is not exporting CSVs. Nobody exports Meta Ads Manager four
times a morning. It is:

- Every platform in its own tab, with its own login, its own column names and
  its own attribution window.
- Different currencies, converted in someone's head, unchecked.
- Then assembling all of it into a deliverable by hand.

Write from that. Tab-switching and mental math are the recognisable pain.

### R9. Say the AI part out loud

The assistant is a real shipped capability and the copy keeps omitting it. It
is worth naming on any page about saving time. Verified facts only:

- An in-app assistant on every page, natural-language questions, streamed
  answers that show which data they used, per-workspace memory.
- Plus an MCP server, so Claude, ChatGPT or any MCP client can query the same
  unified data.

### R10. The ask is "start with one, then build the hub"

```
WAS:  Start with the account you're least sure about
NOW:  Start with one account
RULE: Do not open by inviting the reader to think about their worst account.
      The offer is: try one account, then expand into a hub holding every
      brand or client you run.
```

## 4. Page brief: required before drafting

No page copy gets drafted without these three answers. If they are missing,
ask for them.

1. **Who is this for**, specifically enough to exclude someone.
2. **The one promise.** One sentence. If there are two, it is two pages.
3. **The one action** you want taken, and which CTA carries it.

Then draft in this order: hero (h1 plus one supporting line plus CTA), section
headings only, then body under each. Get the headings approved before writing
body copy.

## 5. Open decisions

- **Spelling: British or American?** Currently mixed. "optimise" and
  "fortnight" sit alongside "normalized" and "anonymized". Needs a call.
- **Where the slogan goes.** "Connect. Visualize. Share." appears nowhere on
  the site yet. Hero, footer, or both is a design decision, not a copy one.
- **Screenshots** (R3): needs a source workspace with anonymised data.

## 6. Structural conventions

- One h1 per page. Sentence case for body headings, no title case.
- Every page needs a `description` on `<Layout>`, under 160 characters,
  readable as a sentence.
- Prose lives in `const` blocks in Astro frontmatter, so the whole page's copy
  is reviewable in one screen. Markup consumes those strings.
- Facts about what the app actually does live in
  `../../AdFunnl/adfunnl-landing-copy.md` and the app repo's docs. Use them as
  a source of capability truth, not as a model for voice: that file is written
  in exactly the register this guide rejects.
