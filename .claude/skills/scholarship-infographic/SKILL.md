---
name: scholarship-infographic
description: Build an infographic for one Scholarship Page from its reviewed statements: a pictorial block on the page, hand-drawn in SVG or illustrated with Gemini-generated art in a comic layout, that also renders as a shareable image. Use when the user asks for an infographic, diagram, side-by-side or shareable visual for a Scholarship Page, or runs /scholarship-infographic <slug> [idea].
---

# Scholarship Infographic

An **infographic** here is one block on a single Scholarship Page: **Gemini-generated raster illustrations carry the scene** (step 4b, always), and HTML/CSS/SVG carries the frame, the words, the links and any mark that must be exact, such as a count. It has three jobs: look great, convey what the page's statements say, and travel as a single image on social media. It is a view of reviewed text: it restates, it never adds.

It is a **picture first**. The drawing carries the relation; the words caption it. The test, used throughout: cover every word, and the picture still shows the relation (how many, which group, what order, which side).

One source, two forms. On the page it is a live, responsive block. At `#share` the same block becomes a **poster**: a fixed 4:5 canvas (1080 by 1350) with the page title above and a credit below, which a script photographs to a PNG. At `#share-card` it becomes the **card**: a 1200 by 630 view of the lead part, which is the picture a social site shows when someone shares the page's link.

Worked examples, read all four before building; all four are the bar to meet. Each is `hugo/layouts/partials/scholarship-custom/<slug>.html` with its stylesheet `hugo/assets/css/scholarship-custom/<slug>.css`:

- `noahs-ark-and-the-flood`: the best example of the default form below. Four chronological panels, each split by a lightning bolt into the two tellings, with art on both halves and each half's number or label set on the art as a plate.
- `homosexuality-and-the-bible`: the default form with one scene per panel: four Gemini-drawn panels with people in them, each panel's words and scripture tags on a plate in a clear corner of its art. Read it for the illustration manifest, chained reference images, and a plate holding many tags.
- `the-creation-stories-in-genesis`: the default form for a two-sided comparison where order matters. Every panel is bolt-split, Genesis 1 against Genesis 2. The sequence ("Humans last" / "The man first") sits on the plates, because the art can't assert an order. God appears only as light on one side and only as hands on the other, so the art keeps the page's contrast. Read it for 1/2 badges with the source hedge in the legend, regenerating art to clear the bolt, and seven panels (every drawable difference in `differ`) with a double-wide last panel, re-laid out three to a row on the poster with smaller plates.
- `pauline-authorship`: the default form for a count sorted into groups. Four panels in time order, one group per panel; who holds the pen in the art is the group's verdict, and each count ("7 letters") is a plate with one chip per letter. Read it for plates holding many chips, a single bolt-split panel among unsplit ones, and a label that carries its panel's chips.

For exact marks drawn in SVG (a pictogram where the count is the picture, step 2), read the retired Pauline pictogram in git history: `git show 1b3ada8:hugo/layouts/partials/scholarship-custom/pauline-authorship.html` and `git show 1b3ada8:hugo/assets/css/scholarship-custom/pauline-authorship.css`. Take its method (each drawing defined once and reused, every unit sized by one custom property, separate poster and card overrides), not its starburst or its look.

## The default form: an illustrated comic page

Unless the user asks for something else, build this. It is what the owner approved on Homosexuality and the Bible, Noah's Ark and the Creation Stories (2026-11-25).

- **One ink frame** holds everything shared. Inside it, top to bottom:
  - a kicker with the scope and the field's verdict, in the core statement's own words ("Genesis 6–9 · most scholars conclude")
  - the headline, the core claim in lettering
  - a key, when the panels use symbols (P/J badges, the split styles)
  - a grid of panels (see **Panels: count, size, layout**)
  - the AI credit line
- **Panels that tell a story.** Put them in the subject's own order (chronology, or then → now) so the reader moves through it. Panel 1 sets the scene; the last panel pays off something an earlier panel set up (the clean pairs → the sacrifice).
- **Panels: count, size, layout.** Each panel is one difference or beat the statements support _and_ the art can draw. Let the page set the count, not a template:
  - Use as many as the page has drawable beats, usually 3 to 7. Don't pad to fill a grid, and don't drop a drawable beat to stay at four (Creation has seven).
  - A beat that can't be drawn honestly (a writing style, a word choice) doesn't get a panel with invented art. Leave it to the answer below, and name it in the report.
  - Sizes can vary. A panel can span both columns (a double-wide strip, 8:3 art from two 16:9 halves), for the payoff, for a scene that needs width, or to close an odd count. A lead panel can be larger than the rest. Ordinary panels are 4:3.
  - The poster is a fixed 1080 by 1350 canvas, so more panels means smaller ones. Fit them with poster-only overrides (shorter art such as 3:2 panels and a 4:1 strip, tighter gaps) before cutting a panel, and check that the plates still read and still clear faces. Past four, go three to a row on the poster and shrink the plates and labels there (Creation's poster holds six plus a strip).
  - A wide panel's plates sit in a container twice as wide, so halve their `cqi` type and padding to match the other panels.
- **Each panel** has:
  - a narration label flush in the top-left, phrased as a plain question or beat ("Who boards the ark?", "After the flood")
  - generated art filling the panel (4:3 unless the panel is wide)
  - **plates on the art**, not a caption band below it: one comic caption box per side, set in a corner the picture leaves clear (shared `comic-plate` classes in `scholarship.css`). Each plate holds the number or the thing in big lettering ("7 pairs", "150 days", "A dove"), a short hedged sub-line when needed, and the scripture tag. Badges (P, J) go on the plate.
- **Split panels show disagreement.** When the relation is two sides (two tellings, then vs now, two scholars), split each panel's art down the middle with a divider and draw both halves.
  - The divider's style is a claim. Use a lightning bolt where the page assigns each half to a side. Use a plain straight gutter with a ≠ roundel where the page only says two verses disagree.
  - Keep each side in the same position in every panel that uses it, and badge it (P, J).
  - Never let a consistent left/right layout assign something the page doesn't assign.
- **A recurring character.** The same figure appears in every panel (Noah, the scribe), kept consistent by chained reference images (step 4b).
- **Counts:**
  - Either draw the exact count in the art and check it, or draw a crowd too dense to count.
  - The exact number is written on that side's plate, in big lettering ("1 pair", "7 pairs"). No rows of icons or drops: the number is the mark.
- **The card** shows two panels side by side, whatever the poster's count: the lead contrast plus its payoff, or the two halves of the core claim.
- **Keep it plain:** no tilts, nothing hanging off a frame, no nested boxes, and no starburst or scroll pictogram.

Vary the scenes, characters, compositions, and the panels' count and sizes from page to page; keep the frame, labels, plates and split rules.

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
- **No idea given**: list the relations the statements describe, build the strongest one as the comic page, with one beat per panel, and name the others in the report so the user can ask for them.
- **Vary the scenes, not the form.** The comic page above is the default. Each page gets its own characters, settings and compositions; don't reuse the old SVG furniture (the starburst with a number, the shared scroll unit).
- **Illustrated, always.** Every infographic carries generated illustrations (step 4b). Hand-drawn SVG alone is not an option unless the user asks for it. Split the work like this:
  - **Raster art** draws the scene: people, places, objects, the setting of the relation (the ark, the scribe, the modern couple).
  - **HTML/SVG** draws the words, links and any precise diagram.
  - **Counted things can be in the art.** The image models hit an exact count only some of the time (2026-11-25 tests drew seven pairs of sheep exactly once in four tries on each of Nano Banana 2, Pro and 2.1). So use one of these:
    - **Exact and checked.** The art shows the number. Count it in the image yourself and regenerate until it's right. This works for small counts. Ask for clearly separated groups and give the number twice in the prompt (Pro did no better than Flash in the test).
    - **Not asserting a number.** The art is drawn so no count can be read off it: one lone pair against a crowd streaming through a door, a line vanishing into the ark, a rain-streaked sky. The exact number goes on the plate.
    - **The count is the picture.** When the relation is the count itself (a pictogram of 13 letters), draw the units in HTML/SVG, in their own band beside or below the art, never laid over it. Overlays drift off the art across the page, poster, card and phone layouts.
  - A count the art half-shows is a wrong count. Never let art show 6 pairs beside a caption that says 7.

A poster is read in seconds by someone who has never seen the page: one relation leads, and it must make sense with no surrounding text.

Done when you can name: the one relation, the statement ids it comes from, what one drawn unit stands for, and which visual variable carries each distinction.

### 3. Trace every word and every mark

Before writing markup, list each label, note, glyph and encoding with its source: a statement id, or a statement id plus cite number.

- Use the statement's own wording, shortened. Keep its hedges ("in the Documentary Hypothesis", "disputed").
- A hedge covers everything it framed in the source. If a cite says "By this view, X, whereas Y", then X and Y both stay under "by one view". Splitting it into two sentences drops the hedge from the second.
- A mark claims exactly what its caption claims. A hedge in the statement ("most scholars", "some") shows in the mark or sits in a caption beside it: a struck-through name reads as "not his", stronger than "most scholars agree he did not write it", so the caption carries the hedge and the report names the gap.
- Things the statements treat as one group look identical; a visual difference is a claim.
- A drawing shows only what a statement says happened: a line that stops claims an ending.
- Where sources differ (verse ranges, dates), use the `short`'s version.
- Scripture appears as a linked reference, in the comic examples' link form (a BibleGateway NRSVUE link as an ink chip). The page quotes scholars, so the infographic cites verses and leaves their text to the link. Every label carries a chapter or verse, never a bare book name. When the label stands for a whole book (who wrote a letter), link the verse where the book makes the claim the page is about. For authorship that is the opening verse, which names the sender, or, for Hebrews, names none (`Romans 1:1`, `Hebrews 1:1`). That verse is the claim the statement reports ("claim to be written by Paul"). It is not a passage the page quotes.
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
  - **Labels sit on the art, inside their panel's frame**: a narration label flush top-left, and plates in the clear corners. Before placing a plate, look at the art and pick a corner that covers setting, not the subject (the counted sheep, the altar, a face). Keep plates under about 40% of the panel's width and size their type in `cqi` (the figure is an inline-size container) so they scale with the panel on the page, poster, card and phone. If no corner is clear, regenerate the art asking for open sky or ground there. Use a caption band below the art only for a note too long for a plate. Nothing hangs off a frame edge.
  - **No tilts.** Everything stays square to the page.
  - **Things a panel cites go inside that panel**, such as scripture tags on its plates, not floating below it.
- The picture takes most of the block's area. Text is labels, one caption per group and at most one short note.
- Spend the boldness on the relation from step 2; the furniture stays in the same few colours and weights.

Poster: mark anything that only makes sense on the page (the section heading, "cited answers below" links) with `data-share-hide`. The masthead, credit and poster frame come from `single.html` and `scholarship.css`; the credit carries the "not the show's work" line, so the image keeps its provenance when it leaves the page.

Card: mark everything except the lead relation with `data-card-hide`, so the card shows the one thing worth a glance. The link's own title and description sit beside it, so the card carries no title. Link previews crop the image a little (Facebook trims the sides), so the card canvas keeps a safe margin (set in `scholarship.css`); the block fits inside it and nothing sits at the edge.

Both are fixed canvases, so the block needs its own overrides for each, scoped as the comic examples' stylesheets scope them (`.scholarship-share:target` for the poster, `.scholarship-share:has(#share-card:target)` for the card): a smaller unit, tighter gaps, and for the card usually a different arrangement (wider, shorter) of the same parts.

### 4b. Illustrations (every infographic)

Generated with Gemini (`gemini-nano-banana-2.1`, Nano Banana 2.1, by default; `--pro` for `gemini-3-pro-image-preview`), adapted from the mbu repo's image generator.

1. Write `hugo/data/scholarship/illustrations/<slug>.yaml`: one entry per image with `id`, the `statements` it illustrates, `aspect`, `alt`, `prompt`, and optional `refs` (ids of images passed as references).
2. Run `bun --env-file=<main checkout>/.env run scholarship:illustrations <slug> [--id=<id>] [--pro]` (`GEMINI_API_KEY` lives in the main checkout's `.env`, not the worktree). Images go to `hugo/assets/scholarship-art/<slug>/<id>.png`; the partial serves them through Hugo as WebP (`.Process "resize 1200x webp q78"`).
   - **Alt text lives only in the manifest.** The partial reads it with `alt="{{ partial "scholarship-art-alt.html" (dict "slug" "<slug>" "id" .id) }}"` and never writes an alt string itself. (Write the slug as a literal inside a `define`d inline partial, where an outer `$slug` is out of scope.) After inspecting an image (step 4), rewrite its `alt` to describe what was actually drawn. The build fails when a rendered image has no manifest entry or an empty alt; an id with no PNG still drops the picture silently, so check every panel renders.
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

### 7. Land, then report

No acceptance stop: once every step 6 check passes, land. A check that fails blocks landing; fix it or report the failure.

Land on trunk, push, confirm the deploy succeeded, and load the live page to confirm the block is there and its `og:image` URL returns the card: CI's Hugo is older than local, and a missing partial is skipped silently.

Then give the PNG's path and report: the relation shown, what the unit and each mark stand for, the statement ids used, any caveat dropped, any mark that reads stronger than its statement, the runners-up from step 2, and the weak spot at phone width if there is one.
