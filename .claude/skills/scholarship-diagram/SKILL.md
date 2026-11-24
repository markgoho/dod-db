---
name: scholarship-diagram
description: Build a hand-made visual block (comparison, sequence, diagram) for one Scholarship Page from its reviewed statements. Use when the user asks for a diagram, side-by-side, visual or custom content on a Scholarship Page, or runs /scholarship-diagram <slug> [idea].
---

# Scholarship Diagram

A **diagram** here is one hand-built HTML/CSS/SVG block on a single Scholarship Page that shows what its statements say. It is a view of reviewed text: it restates, it never adds.

Worked example, read it before building: `hugo/layouts/partials/scholarship-custom/the-creation-stories-in-genesis.html` and its stylesheet `hugo/assets/css/scholarship-custom/the-creation-stories-in-genesis.css`.

## Input

A Scholarship Page slug, and optionally the user's idea for what to show ("the four sources as layers", "a map of the route").

## Workflow

### 1. Read the page

In a worktree, read `hugo/content/scholarship/<slug>.md`: every statement's `text`, `short` and cited `quote`s. This is the only material the diagram may use.

### 2. Choose what to show

A diagram earns its place when the statements describe a relation that prose flattens: an order, a two-sided comparison, layers, a structure, a place, an overlap.

- **The user gave an idea**: test it against the statements. Build it if they support every part. If they support only some, say which parts have no statement behind them and build the supported part.
- **No idea given**: list the relations the statements describe, build the strongest one, and name the others in the report so the user can ask for them.

Done when you can name the one relation the diagram shows and the statement ids it comes from.

### 3. Trace every word

Before writing markup, list each label, cell and note with its source: a statement id, or a statement id plus cite number.

- Use the statement's own wording, shortened. Keep its hedges ("in the Documentary Hypothesis", "disputed").
- Where sources differ (verse ranges, dates), use the `short`'s version.
- Scripture appears as a linked reference, in the worked example's link form. The page quotes scholars, so the diagram cites verses and leaves their text to the link.
- A claim that only one cited author makes stays in the answer below, attributed there.
- A caveat in the statement that the diagram drops goes in the report, so the owner can decide.

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

Graphics: inline SVG only, in the site's comic style — flat ink shapes in `currentColor`, thick lines, the amber and rust accents. Draw each glyph once as a `<symbol>` and reuse it, so the same thing looks the same everywhere. A glyph stands for something a statement names. Spend the boldness on the one relation from step 2; keep the rest quiet.

### 5. Verify

Preview from the worktree with its own `hugo server` on a free port, in Claude in Chrome.

- Desktop and about 375px: no horizontal scroll, no clipped or split words, lines and glyphs land where they should.
- Roles: the table, rows, headers and cells report their roles (`computedRole`).
- Another Scholarship Page is unchanged.
- `bun run check`, `bun run check:scholarship`, `bun test`. `check:scholarship` does not read the partial; step 3's list is the content check.

### 6. Show, then land

Leave the page open in the browser and report: the relation shown, the statement ids used, any caveat dropped, the runners-up from step 2, and the weak spot at phone width if there is one.

When the user accepts it, land on trunk, push, and load the live page to confirm the block is there: CI's Hugo is older than local, and a missing partial is skipped silently.
