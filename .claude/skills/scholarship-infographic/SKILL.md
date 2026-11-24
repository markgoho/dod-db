---
name: scholarship-infographic
description: Build an infographic for one Scholarship Page from its reviewed statements: a hand-drawn pictorial block on the page that also renders as a shareable image. Use when the user asks for an infographic, diagram, side-by-side or shareable visual for a Scholarship Page, or runs /scholarship-infographic <slug> [idea].
---

# Scholarship Infographic

An **infographic** here is one hand-built HTML/CSS/SVG block on a single Scholarship Page. It has three jobs: look great, convey what the page's statements say, and travel as a single image on social media. It is a view of reviewed text: it restates, it never adds.

It is a **picture first**. The drawing carries the relation; the words caption it. The test, used throughout: cover every word, and the picture still shows the relation (how many, which group, what order, which side).

One source, two forms. On the page it is a live, responsive block. At `#share` the same block becomes a **poster**: a fixed 4:5 canvas (1080 by 1350) with the page title above and a credit below, which a script photographs to a PNG. At `#share-card` it becomes the **card**: a 1200 by 630 view of the lead part, which is the picture a social site shows when someone shares the page's link.

Worked examples, read both before building. Each is `hugo/layouts/partials/scholarship-custom/<slug>.html` with its stylesheet `hugo/assets/css/scholarship-custom/<slug>.css`:

- `pauline-authorship`: the pictorial bar to meet. A pictogram: one drawn scroll per letter, the seal on each scroll is its group's verdict. Read it for how a drawing is made once and reused, sized by one unit, and re-laid out for the poster and the card.
- `the-creation-stories-in-genesis`: a two-sided comparison as a table, with lines tracing each thing between the sides. Read it for table semantics and scripture links.

## Input

A Scholarship Page slug, and optionally the user's idea for what to show ("the four sources as layers", "a map of the route").

## Workflow

### 1. Read the page

In a worktree, read `hugo/content/scholarship/<slug>.md`: every statement's `text`, `short` and cited `quote`s. This is the only material the infographic may use.

### 2. Choose the relation and its picture

An infographic earns its place when the statements describe a relation that prose flattens. Choose the relation and the drawn form together; a relation with no picture is a table of text.

| Relation in the statements | Picture                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| A count sorted into groups | Pictogram: one identical drawn unit per thing, a mark on each for its group |
| An order or a route        | A path with drawn stops                                                     |
| Layers or sources          | Strata, or strands woven into one                                           |
| Many narrowing to one      | Lines running side by side, one carried on                                  |
| Two sides                  | Facing columns, with lines tracing what moves between them                  |
| A place                    | A drawn map                                                                 |
| Parts of a whole           | The whole drawn once, its parts marked                                      |

- **The unit** is a drawn object from the subject's own world (a scroll for a letter, a tablet for a law, a jar for a manuscript find), detailed enough to be recognised: outline, shadow, a few inner lines.
- **A count is a claim.** Draw exactly as many units as the statements count. Where they give no number ("several", "many"), draw a loose spread with no number in the headline.
- **Each distinction gets a visual variable** that works without colour: a mark on the unit, its fill, its outline (solid or dashed), its position. Colour repeats the distinction; it never carries it alone.
- **The user gave an idea**: test it against the statements. Build it if they support every part. If they support only some, say which parts have no statement behind them and build the supported part.
- **No idea given**: list the relations the statements describe, build the strongest one, and name the others in the report so the user can ask for them.

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

Graphics, inline SVG only, in the site's comic style:

- Thick ink outlines, hard offset shadows, flat fills in ink, paper, amber and rust.
- Draw each thing once and reuse it, so the same thing looks the same everywhere. Every unit is the same size, set by one custom property, so rows count themselves.
- Comic furniture frames the picture: a headline strip with the key number in a starburst, each group in its own panel with a halftone corner, verdicts in caption boxes.
- The picture takes most of the block's area. Text is labels, one caption per group and at most one short note.
- Spend the boldness on the relation from step 2; the furniture stays in the same few colours and weights.

Poster: mark anything that only makes sense on the page (the section heading, "cited answers below" links) with `data-share-hide`. The masthead, credit and poster frame come from `single.html` and `scholarship.css`; the credit carries the "not the show's work" line, so the image keeps its provenance when it leaves the page.

Card: mark everything except the lead relation with `data-card-hide`, so the card shows the one thing worth a glance. The link's own title and description sit beside it, so the card carries no title. Link previews crop the image a little (Facebook trims the sides), so the card canvas keeps a safe margin (set in `scholarship.css`); the block fits inside it and nothing sits at the edge.

Both are fixed canvases, so the block needs its own overrides for each, scoped as the Pauline stylesheet scopes them (`.scholarship-share:target` for the poster, `.scholarship-share:has(#share-card:target)` for the card): a smaller unit, tighter gaps, and for the card usually a different arrangement (wider, shorter) of the same parts.

### 5. Render the image

With the worktree's Hugo server running:

```bash
bun run scholarship:infographic <slug> --base=http://localhost:<port>
```

This writes two committed images to `hugo/static/assets/scholarship/`: `<slug>.png` (the poster; the page then shows a "Save as an image" link) and `<slug>-card.png` (the card; `opengraph.html` then uses it as the page's `og:image`). Read both. Re-render after every change to the block.

Done when:

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
