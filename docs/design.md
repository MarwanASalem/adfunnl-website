# Visual style guide

The reference section is **"6 ways AdFunnl helps you"** on the homepage,
`src/components/UseCases.astro`. New sections should look like they belong
next to it. `docs/voice.md` covers the words; this file covers the look.

## 1. Illustrations: frosted lavender glass

Small objects drawn as SVG, never clip art or emoji, never cartoon colours.

- **One material, one hue.** Every object is frosted lavender glass. Do not give
  objects their own bright colours (no green, amber or rose bodies). Colour
  belongs to data, not to decoration.
- **Four layers per shape**, via the `glass()` helper in `UseCases.astro`:
  1. body: diagonal gradient, white `#fff` to `#ece7fd` to `#a796ef`, slightly translucent
  2. depth wash: transparent at the top to `#5738c9` at about 40% at the bottom
  3. rim light: a 1px stroke, white at the top, fading, then white again at the bottom
  4. one soft specular highlight: a blurred white ellipse near the top edge
- **Grounding:** a faint lavender radial glow behind the object and a blurred
  contact shadow (`#4b32b5`, about 20%) under it.
- **Accents:** at most one small four-point white glint. No sparkle clusters.
- **Shapes stay simple:** bars, cards, an arrow, a plane, a switch, a battery.
  Rounded corners, no outlines except the rim light.
- **Size:** about 6rem in a card. The 120 x 120 viewBox is the standard.
- SVG ids must be unique per drawing on a page (the helpers take a number).

What failed before, so it does not come back: chunky isometric blocks in
primary colours read as cartoonish. Copying a competitor's layout one to one
read as stolen. The fix for both was one quiet material plus our own content.

## 2. Cards

- Background: a soft gradient, `#ffffff` to `#f7f5fe` to `#eae5fc` (165deg).
- Radius about 1.6rem, a 1px white border, a hairline brand ring
  (`rgba(87,56,201,.06)`) and a long soft shadow
  (`0 18px 34px -20px rgba(43,29,97,.28)`).
- Title: about 1.15rem, bold, tight tracking, colour `#1e1b4b`.
- Body: about 13px, `#71717a`, short. Trim copy rather than grow the card.

## 3. Every card proves its claim

A card is not finished with an icon and a sentence. It carries a small piece
of the real app (a mini screen in HTML) that shows the job being done:
bars growing, a verdict chip popping in, Approve flipping to Applied.

- At rest the mini screen shows its **finished state**, so it still explains
  itself without motion and for reduced-motion users.
- It plays from the start on hover or focus (desktop) and when swiped into
  view (phones). Keyframes only define the `from` state and use
  `animation-fill-mode: both`, so nothing is hidden by default.
- Demo data is anonymised and reuses the homepage's existing demo numbers.

## 4. Interaction

- Hover or focus lifts a card (`translateY(-16px) scale(1.07)`), straightens
  it, deepens the shadow and nudges neighbours aside.
- The lifted card leans a few degrees toward the mouse, and the object's
  layers drift at different depths (shadow, body, glint). Mouse only.
- Easing: `cubic-bezier(.2,.8,.2,1)`, around .45s. Pops use a small overshoot.
- Always respect `prefers-reduced-motion`: no tilt, no playback.

## 5. Layout and height

- **Compact over sprawling.** A section should cost about one row of height on
  desktop. Do not add a second panel when the card can carry the content.
- **Phones: carousels, not stacks.** Any row of equal cards becomes a swipeable
  row under 768px. Use the `m-snap` class from `src/styles/global.css` on the
  grid, or the same scroll-snap pattern for custom rows, with the next card
  peeking in from the edge.

## 6. Arabic

The same look, mirrored. Rotations and neighbour shifts flip under
`[dir="rtl"]`, bar fills grow from the right, numbers with symbols sit in
`<bdi dir="ltr">`.
