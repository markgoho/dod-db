---
name: scholarship-infographic
description: Build an infographic for one Scholarship Page from its reviewed statements: a pictorial block on the page, hand-drawn in SVG or illustrated with Gemini-generated art in a comic layout, that also renders as a shareable image. Use when the user asks for an infographic, diagram, side-by-side or shareable visual for a Scholarship Page, or runs /scholarship-infographic <slug> [idea].
---

# Scholarship Infographic

An **infographic** here is one block on a single Scholarship Page: **Gemini-generated raster illustrations carry the scene** (step 4b, always), and HTML/CSS/SVG carries the frame, the words, the links and any mark that must be exact, such as a count. It has three jobs: look great, convey what the page's statements say, and travel as a single image on social media. It is a view of reviewed text: it restates, it never adds.

It is a **picture first**. The drawing carries the relation; the words caption it. The test, used throughout: cover every word, and the picture still shows the relation (how many, which group, what order, which side).

One source, two forms. On the page it is a live, responsive block. At `#share` the same block becomes a **poster**: a fixed 4:5 canvas (1080 by 1350) with the page title above and a credit below, which a script photographs to a PNG. At `#share-card` it becomes the **card**: a 1200 by 630 view of the lead part, which is the picture a social site shows when someone shares the page's link.

Worked examples, read all three before building. The first is the bar to meet; the other two predate raster art and show how exact marks are built. Each is `hugo/layouts/partials/scholarship-custom/<slug>.html` with its stylesheet `hugo/assets/css/scholarship-custom/<slug>.css`:

- `homosexuality-and-the-bible`: the bar to meet. An illustrated comic page: four Gemini-drawn panels with people in them, inside one ink frame, with labels, captions and scripture tags in HTML. Read it for the illustration manifest, chained reference images and the comic layout rules in step 4.
- `pauline-authorship`: exact marks. A pictogram: one drawn scroll per letter, the seal on each scroll is its group's verdict. Read it for how a drawing is made once and reused, sized by one unit, and re-laid out for the poster and the card.
- `the-creation-stories-in-genesis`: a two-sided comparison as a table, with lines tracing each thing between the sides. Read it for table semantics and scripture links.

## Input

A Scholarship Page slug, and optionally the user's idea for what to show ("the four sources as layers", "a map of the route").

## Workflow

### 1. Read the page

In a worktree, read `hugo/content/scholarship/<slug>.md`: every statement's `text`, `short` and cited `quote`s. This is the only material the infographic may use.

### 2. Choose the relation and its picture

An infographic earns its place when the statements describe a relation that prose flattens. Choose the relation and the drawn form together; a relation with no picture is a table of text.

| Relation in the statements                                | Picture                                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| A count sorted into groups                                | Pictogram: one identical drawn unit per thing, a mark on each for its group |
| An order or a route                                       | A path with drawn stops                                                     |
| Layers or sources                                         | Strata, or strands woven into one                                           |
| Many narrowing to one                                     | Lines running side by side, one carried on                                  |
| Two sides                                                 | Facing columns, with lines tracing what moves between them                  |
| A place                                                   | A drawn map                                                                 |
| Parts of a whole                                          | The whole drawn once, its parts marked                                      |
| A contrast across time, or people holding different views | Comic panels with illustrated figures, one beat per panel                   |

- **The unit** is a drawn object from the subject's own world (a scroll for a letter, a tablet for a law, a jar for a manuscript find), detailed enough to be recognised: outline, shadow, a few inner lines.
- **A count is a claim.** Draw exactly as many units as the statements count. Where they give no number ("several", "many"), draw a loose spread with no number in the headline.
- **Each distinction gets a visual variable** that works without colour: a mark on the unit, its fill, its outline (solid or dashed), its position. Colour repeats the distinction; it never carries it alone.
- **The user gave an idea**: test it against the statements. Build it if they support every part. If they support only some, say which parts have no statement behind them and build the supported part.
- **No idea given**: list the relations the statements describe, build the strongest one, and name the others in the report so the user can ask for them.
- **Vary the look.** Read the existing `scholarship-custom` partials first and don't repeat their furniture (the starburst with a number, the shared scroll unit). Each page gets a picture form of its own.
- **Illustrated, always.** Every infographic carries generated illustrations (step 4b). Hand-drawn SVG alone is not an option unless the user asks for it. Split the work like this:
  - **Raster art** draws the scene: people, places, objects, the setting of the relation (the ark, the scribe, the modern couple).
  - **HTML/SVG** draws only what must be exact: counts, labels, links, a precise diagram. Gemini cannot draw exactly seven pairs.
  - **A count gets its own band.** Put counted units in an HTML/SVG band of their own, below or beside the art, never laid over it. An overlay can't stay on a painted gangway at three layouts (page, poster, card) and at phone width, where a long row wraps.
  - **The art leaves out what is counted.** If the relation counts animals, the art prompt names no animals at all, or Gemini adds stray ones that read as a count. Leave the strip where they would go empty, or show the scene without them.

A poster is read in seconds by someone who has never seen the page: one relation leads, and it must make sense with no surrounding text.

Done when you can name: the one relation, the statement ids it comes from, what one drawn unit stands for, and which visual variable carries each distinction.

### 3. Trace every word and every mark

Before writing markup, list each label, note, glyph and encoding with its source: a statement id, or a statement id plus cite number.

- Use the statement's own wording, shortened. Keep its hedges ("in the Documentary Hypothesis", "disputed").
- A mark claims exactly what its caption claims. A hedge in the statement ("most scholars", "some") shows in the mark or sits in a caption beside it: a struck-through name reads as "not his", stronger than "most scholars agree he did not write it", so the caption carries the hedge and the report names the gap.
- Things the statements treat as one group look identical; a visual difference is a claim.
- A drawing shows only what a statement says happened: a line that stops claims an ending.
- Where sources differ (verse ranges, dates), use the `short`'s version.
- Scripture appears as a linked reference, in the Creation example's link form. The page quotes scholars, so the infographic cites verses and leaves their text to the link.
- A claim that only one cited author makes stays in the answer below, attributed there.
- Generated art is traced too. Every figure and prop in it is either something a statement supports or neutral setting (a wall, a desk). An illustration of what a statement names (a same-sex couple for "the modern concept of sexual orientation") is fine; an invented detail that reads as evidence (a tablet the scribe is comparing against) is not.
- A caveat in the statement that the infographic drops goes in the report, so the owner can decide.

Done when every visible string and every mark has a source in the list. An idea that needs a fact with no source is a request for a new statement and its review, which is separate work: say so and file the issue.

### 4. Build

Two files, keyed by slug. `hugo/layouts/scholarship/single.html` picks both up when they exist and renders the block after the provenance notice, above the questions:

- `hugo/layouts/partials/scholarship-custom/<slug>.html`
- `hugo/assets/css/scholarship-custom/<slug>.css`

Front matter, statements and the review record stay as they are.

Shape:

- A `cloud-section` with a `type-section-title`, the block in a `panel`, and a closing line linking to the statement anchors (`#<statement id>`) it draws from.
- Compose the site's primitives and tokens (`panel`, `type-eyebrow`, `chip`, spacing, colour and type tokens). Page CSS covers only what is bespoke, in native CSS, prefixed with a class of its own.
- Real semantics under the drawing: a `<ul>` or `<ol>` of the units, each with its name as text; group headings as headings; a `<table>` with headers for compared data (a table laid out as a grid carries explicit ARIA roles). The drawings are `aria-hidden`; the text beside them says what they show.
- Its own container and a container query (literal length). At phone width the things being compared stay together.

Graphics: the generated art (step 4b) plus inline SVG for exact marks and comic furniture, all in the site's comic style:

- Thick ink outlines, hard offset shadows, flat fills in ink, paper, amber and rust.
- Draw each thing once and reuse it, so the same thing looks the same everywhere. Every unit is the same size, set by one custom property, so rows count themselves.
- Comic furniture frames the picture: headline lettering, panels, narration boxes, caption bands. Keep it restrained:
  - **One unifying ink frame** holds the whole shared block (title, panels, credit), so the poster and the card read as one image. The page-only "cited answers below" line sits outside it.
  - **Panels go straight inside that frame.** Don't nest a box in a panel in a box.
  - **Labels and captions sit inside their panel's frame**: a narration label flush in a corner, a caption band along the bottom. Nothing hangs off a frame edge.
  - **No tilts.** Everything stays square to the page.
  - **Things a panel cites go inside that panel**, such as scripture tags in its caption band, not floating below it.
- The picture takes most of the block's area. Text is labels, one caption per group and at most one short note.
- Spend the boldness on the relation from step 2; the furniture stays in the same few colours and weights.

Poster: mark anything that only makes sense on the page (the section heading, "cited answers below" links) with `data-share-hide`. The masthead, credit and poster frame come from `single.html` and `scholarship.css`; the credit carries the "not the show's work" line, so the image keeps its provenance when it leaves the page.

Card: mark everything except the lead relation with `data-card-hide`, so the card shows the one thing worth a glance. The link's own title and description sit beside it, so the card carries no title. Link previews crop the image a little (Facebook trims the sides), so the card canvas keeps a safe margin (set in `scholarship.css`); the block fits inside it and nothing sits at the edge.

Both are fixed canvases, so the block needs its own overrides for each, scoped as the Pauline stylesheet scopes them (`.scholarship-share:target` for the poster, `.scholarship-share:has(#share-card:target)` for the card): a smaller unit, tighter gaps, and for the card usually a different arrangement (wider, shorter) of the same parts.

### 4b. Illustrations (every infographic)

Generated with Gemini (`gemini-3.1-flash-image-preview` by default, `--pro` for `gemini-3-pro-image-preview`), adapted from the mbu repo's image generator.

1. Write `data/scholarship-illustrations/<slug>.yaml`: one entry per image with `id`, the `statements` it illustrates, `aspect`, `alt`, `prompt`, and optional `refs` (ids of images passed as references).
2. Run `bun --env-file=<main checkout>/.env run scholarship:illustrations <slug> [--id=<id>] [--pro]` (`GEMINI_API_KEY` lives in the main checkout's `.env`, not the worktree). Images go to `hugo/assets/scholarship-art/<slug>/<id>.png`; the partial serves them through Hugo as WebP (`.Process "resize 1200x webp q78"`).
3. **Chain references for continuity.** Generate the anchor image first, then pass it as a `ref` to the next, so a character or object (the scribe, the card) stays the same across panels. Regenerating an image means regenerating the ones that use it as a reference.
4. **Inspect every image** with Read before using it. Regenerate when any of these show up:
   - text beyond the words the prompt asked for
   - a prop no statement supports
   - a real, identifiable person
   - anything sexual or violent
   - a figure that doesn't match its earlier panel

   The script's shared style preamble and content rules cover the palette, halftone and "no text"; a scene prompt names only what to draw.

5. **The words stay in HTML.** Labels, captions, links and the headline live in the partial, traced in step 3, and are never baked into the art. The one exception is a word the picture is about (the card's "homosexuality"), which you check by eye.
6. **Credit the art.** Inside the shared frame, carry "Illustrations generated with AI (Google Gemini). Words, captions and sources are the page's own." The card may hide it.
7. Generated art has its own paper margin, so crop it inside the panel (`overflow: hidden` on the art box, `scale` on the image).
8. Hugo's dev server caches processed images. After you regenerate a PNG, delete `hugo/resources/_gen/images/scholarship-art/<slug>` and restart the server, or the old WebP keeps being served. CI builds fresh.

### 5. Render the image

With the worktree's Hugo server running:

```bash
bun run scholarship:infographic <slug> --base=http://localhost:<port>
```

This writes two committed images to `hugo/static/assets/scholarship/`: `<slug>.png` (the poster; the page then shows a "Save as an image" link) and `<slug>-card.png` (the card; `opengraph.html` then uses it as the page's `og:image`). Read both. Re-render after every change to the block.

Done when:

- The poster and the card show the generated art, not SVG alone.

- The poster holds the title, the whole block and the credit with nothing clipped; the card holds the lead relation with nothing clipped. If the block overflows, shrink the unit, then cut text; the poster does not grow.
- Both are legible at phone size.
- The words-covered test passes on the poster: the drawing alone shows the relation. If what remains is boxes of text, go back to step 2.
- Every unit is the same size, and units in one group are identical.

### 6. Verify

Preview from the worktree with its own `hugo server` on a free port, in Claude in Chrome.

- The poster and card views (`#share`, `#share-card`) match the PNGs.
- The page's `og:image` points at the card; another Scholarship Page without an infographic has no `og:image`.
- Desktop and about 375px: no horizontal scroll, no clipped or split words, every unit the same measured width, lines and glyphs land where they should.
- Semantics: lists, headings and any table report their roles (`computedRole`); each unit's name is text, not only a drawing.
- Another Scholarship Page is unchanged.
- `bun run check`, `bun run check:scholarship`, `bun test`. `check:scholarship` does not read the partial; step 3's list is the content check.

### 7. Show, then land

Leave the page open in the browser, give the PNG's path, and report: the relation shown, what the unit and each mark stand for, the statement ids used, any caveat dropped, any mark that reads stronger than its statement, the runners-up from step 2, and the weak spot at phone width if there is one.

When the user accepts it, land on trunk, push, and load the live page to confirm the block is there and its `og:image` URL returns the card: CI's Hugo is older than local, and a missing partial is skipped silently.
