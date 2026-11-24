---
name: scholarship-infographic
description: Build an infographic for one Scholarship Page from its reviewed statements: a hand-made block on the page that also renders as a shareable image. Use when the user asks for an infographic, diagram, side-by-side or shareable visual for a Scholarship Page, or runs /scholarship-infographic <slug> [idea].
---

# Scholarship Infographic

An **infographic** here is one hand-built HTML/CSS/SVG block on a single Scholarship Page. It has three jobs: look great, convey what the page's statements say, and travel as a single image on social media. It is a view of reviewed text: it restates, it never adds.

One source, two forms. On the page it is a live, responsive block. At `#share` the same block becomes a **poster**: a fixed 4:5 canvas (1080 by 1350) with the page title above and a credit below, which a script photographs to a PNG. At `#share-card` it becomes the **card**: a 1200 by 630 crop of the lead part, which is the picture a social site shows when someone shares the page's link.

Worked example, read it before building: `hugo/layouts/partials/scholarship-custom/the-creation-stories-in-genesis.html` and its stylesheet `hugo/assets/css/scholarship-custom/the-creation-stories-in-genesis.css`.

## Input

A Scholarship Page slug, and optionally the user's idea for what to show ("the four sources as layers", "a map of the route").

## Workflow

### 1. Read the page

In a worktree, read `hugo/content/scholarship/<slug>.md`: every statement's `text`, `short` and cited `quote`s. This is the only material the infographic may use.

### 2. Choose what to show

An infographic earns its place when the statements describe a relation that prose flattens: an order, a two-sided comparison, layers, a structure, a place, an overlap.

- **The user gave an idea**: test it against the statements. Build it if they support every part. If they support only some, say which parts have no statement behind them and build the supported part.
- **No idea given**: list the relations the statements describe, build the strongest one, and name the others in the report so the user can ask for them.

A poster is read in seconds by someone who has never seen the page: one relation leads, and it must make sense with no surrounding text.

Done when you can name the one relation the infographic shows and the statement ids it comes from.

### 3. Trace every word

Before writing markup, list each label, cell and note with its source: a statement id, or a statement id plus cite number.

- Use the statement's own wording, shortened. Keep its hedges ("in the Documentary Hypothesis", "disputed").
- Where sources differ (verse ranges, dates), use the `short`'s version.
- Scripture appears as a linked reference, in the worked example's link form. The page quotes scholars, so the infographic cites verses and leaves their text to the link.
- A claim that only one cited author makes stays in the answer below, attributed there.
- A caveat in the statement that the infographic drops goes in the report, so the owner can decide.

Done when every visible string has a source in the list. An idea that needs a fact with no source is a request for a new statement and its review, which is separate work: say so and file the issue.

### 4. Build

Two files, keyed by slug. `hugo/layouts/scholarship/single.html` picks both up when they exist and renders the block after the provenance notice, above the questions:

- `hugo/layouts/partials/scholarship-custom/<slug>.html`
- `hugo/assets/css/scholarship-custom/<slug>.css`

Front matter, statements and the review record stay as they are.

Shape:

- A `cloud-section` with a `type-section-title`, the block in a `panel`, and a closing line linking to the statement anchors (`#<statement id>`) it draws from.
- Compose the site's primitives and tokens (`panel`, `type-eyebrow`, `chip`, spacing, colour and type tokens). Page CSS covers only what is bespoke, in native CSS, prefixed with a class of its own.
- Real semantics: a `<table>` with headers for compared data, an `<ol>` for a sequence. A table laid out as a grid carries explicit ARIA roles.
- Its own container and a container query (literal length). At phone width the pairs being compared stay together.
- Two sides are told apart by more than colour.

Card: mark everything except the lead relation with `data-card-hide`, so the card shows the one thing worth a glance. The link's own title and description sit beside it, so the card carries no title.

Poster: mark anything that only makes sense on the page (the section heading, "cited answers below" links) with `data-share-hide`. The masthead, credit and poster frame come from `single.html` and `scholarship.css`; the credit carries the "not the show's work" line, so the image keeps its provenance when it leaves the page.

Graphics: inline SVG only, in the site's comic style — flat ink shapes in `currentColor`, thick lines, the amber and rust accents. Draw each glyph once as a `<symbol>` and reuse it, so the same thing looks the same everywhere. A glyph stands for something a statement names. Spend the boldness on the one relation from step 2; keep the rest quiet.

### 5. Render the image

With the worktree's Hugo server running:

```bash
bun run scholarship:infographic <slug> --base=http://localhost:<port>
```

This writes two committed images to `hugo/static/assets/scholarship/`: `<slug>.png` (the poster; the page then shows a "Save as an image" link) and `<slug>-card.png` (the card; `opengraph.html` then uses it as the page's `og:image`). Read both. Done when the poster holds the title, the whole block and the credit with nothing clipped, the card holds the lead relation with nothing clipped, and both are legible at phone size. If the block overflows, cut or shorten rows; the poster does not grow. Re-render after every change to the block.

### 6. Verify

Preview from the worktree with its own `hugo server` on a free port, in Claude in Chrome.

- The poster and card views (`#share`, `#share-card`) match the PNGs.
- The page's `og:image` points at the card; another Scholarship Page has no `og:image`.
- Desktop and about 375px: no horizontal scroll, no clipped or split words, lines and glyphs land where they should.
- Roles: the table, rows, headers and cells report their roles (`computedRole`).
- Another Scholarship Page is unchanged.
- `bun run check`, `bun run check:scholarship`, `bun test`. `check:scholarship` does not read the partial; step 3's list is the content check.

### 7. Show, then land

Leave the page open in the browser, give the PNG's path, and report: the relation shown, the statement ids used, any caveat dropped, the runners-up from step 2, and the weak spot at phone width if there is one.

When the user accepts it, land on trunk, push, and load the live page to confirm the block is there and its `og:image` URL returns the card: CI's Hugo is older than local, and a missing partial is skipped silently.
