---
name: create-book-page
description: Create a rich Hugo scripture book landing page from existing episode, segment, and transcript data. Use when the user asks to create a book page, write a scripture book landing page, or generate a hand-authored book page.
---

# Create Book Page

This skill guides you through creating a hand-authored scripture book landing page for the Hugo site using deterministic context gathering, Claude reasoning, and a save script.

## Input

A scripture book name, such as `Genesis`, `Jude`, or `1 Samuel`.

If the user does not provide a book name, ask for one before proceeding.

## Workflow

### 1. Gather

Run:

```bash
bun run book-page:gather -- "<book-name>"
```

If that script does not exist yet, stop and add or request a package.json script rather than hardcoding paths or relying on the current working directory.

This returns structured JSON with:

- the requested book name
- the canonical book name, testament, abbreviations, and variants
- the canonical book slug
- the prebuilt NRSVUE Bible Gateway URL
- chapter-and-verse segment candidates for that book
- other segment candidates whose topic labels mention that book
- episodes whose `books:` frontmatter includes the canonical book
- transcript excerpts from the strongest matching episodes
- any existing page at `hugo/content/books/{slug}/_index.md`

If the script exits with an error, stop and tell the user.

### 2. Reason

Use the gathered JSON to make the authorial decisions.

#### Canonical naming

- Use the canonical book name for the page title.
- Use the gathered `bookSlug` for the page slug.
- Preserve the gathered `nrsvueUrl` exactly.

#### Definition

- Write 1 to 3 sentences on the book as a literary and historical artifact.
- Focus on authorship, composition, dating, canon status, genre, redaction, or textual history when those are relevant.
- Keep the definition concept-first. Do not mention the show, episodes, or how often the hosts discuss it.

#### Featured items

- Prefer 1 to 2 featured items total.
- Prefer a strong chapter-and-verse segment for this book as item 1.
- If available, prefer an authorship, historicity, canon, or composition-history segment as item 2.
- Keep featured items in different episodes.
- Do not include both a segment and its parent episode as separate featured items.
- If no suitable segment stands out, use up to one strong episode instead.
- Treat the section as a reference list for the book, not just a minimal shortlist: include all specifically called-out book references surfaced by gather, especially chapter-and-verse segments and other direct book-labeled segments.
- When multiple featured items are included, order them by ascending episode number.

The frontmatter shape is:

```yaml
featuredItems:
  - type: segment
    episodeNumber: 1
    segmentAnchor: chapter-and-verse-1
    label: "Chapter and Verse — Gen 1"
  - type: episode
    number: 42
    label: "Guest Episode Title"
```

#### Quotes

- Select exactly 4 quotes.
- Weight choices toward historicity, authorship, composition history, redaction, canon formation, and other strong `data over dogma` angles.
- Prefer quotes that directly answer some mix of: when was this written, how was it composed, how historical is it, and what larger scholarly frame best explains it.
- Check `.claude/skills/create-book-page/quote-bank.md` first for reusable high-value quotes and quote-selection heuristics.
- Avoid plot-summary quotes unless they make a sharp historical point.
- Avoid merely adjacent quotes that mention an artifact or motif from the book without illuminating the book's dating, authorship, composition, or historicity.
- Prefer variety across episodes and angles.
- Use full speaker names.
- Each quote must include:
  - `text`
  - `speaker`
  - `episode` as an integer
  - `timestamp` as a quoted string like `"HH:MM:SS.mmm"`
- You may add short bracketed clarifications inside `text` when needed to preserve readability, such as replacing vague references like `that period` with `[the period of the judges]`.
- Keep clarifications minimal and purely editorial. Do not change the quote's substantive meaning, tone, or claim.
- Prefer clarifying pronouns, ellipsed referents, or period labels rather than rewriting syntax.

#### Body

- Write 1 to 2 paragraphs on the book's recurring role on the show.
- Focus on why the hosts return to it: interpretive disputes, authorship questions, historicity, textual issues, canon debates, or recurring misconceptions.
- Keep the body aligned with the gathered evidence.

### 3. Review

Before saving, review every selected quote against the source episode content.

For each of the 4 quotes:

- confirm the cited `episode` exists and is the episode you actually sourced the quote from
- confirm the `timestamp` exists in that episode transcript or episode page
- confirm the quoted wording matches the source at that timestamp
- if you added bracketed clarification, confirm the unbracketed source text still matches and the clarification is minimal
- if the quote cannot be verified quickly and directly, replace it rather than guessing

This review is required because quote links are generated from `episode` plus `timestamp`, so a correct quote with the wrong episode number still produces a broken link.

### 4. Save

Create a JSON object in this shape:

```json
{
  "bookSlug": "genesis",
  "title": "Genesis",
  "bookName": "Genesis",
  "testament": "old",
  "nrsvueUrl": "https://www.biblegateway.com/passage/?search=Genesis&version=NRSVUE",
  "definition": "Genesis is the first book of the Pentateuch...",
  "featuredItems": [
    {
      "type": "segment",
      "episodeNumber": 1,
      "segmentAnchor": "chapter-and-verse-1",
      "label": "Chapter and Verse — Gen 1"
    }
  ],
  "quotes": [
    {
      "text": "Quote text here...",
      "speaker": "Dan McClellan",
      "episode": 1,
      "timestamp": "00:04:00.940"
    }
  ],
  "showAllEpisodes": true,
  "body": "Genesis returns on the show because..."
}
```

Then save it with stdin using a quoted heredoc:

```bash
bun run book-page:save <<'EOF'
{
  "bookSlug": "genesis",
  "title": "Genesis"
}
EOF
```

If that script does not exist yet, stop and add or request a package.json script rather than hardcoding paths or relying on the current working directory.

Prefer stdin via a quoted heredoc for this skill. Avoid inline `printf` JSON because quotes and apostrophes inside the payload can break shell parsing. Do not create temporary JSON files unless stdin is genuinely unavailable.

### 5. Verify

Run:

```bash
bun run build:hugo
```

Then load `/books/<slug>/` locally and confirm the hero, NRSVUE link, featured items, quotes, and episode grid render correctly.

### 5. Refresh mode

If `existingPage` is populated:

- treat this as a refresh rather than a first draft
- preserve `definition`, `body`, `title`, and `nrsvueUrl` unless the user asks to change them
- re-audit featured items against newly available strong segments
- allow at most one quote swap when adding or changing a featured episode

## Data Sources

- `src/scripts/gather-book-context.ts` for deterministic context gathering
- `src/config/scripture-books.ts` for canonical book naming
- `data/processed-videos.json` for episode metadata, segments, and transcript paths
- `hugo/content/episodes/*/index.md` for `books` frontmatter, segment anchors, and guests
- `data/transcripts/*.txt` for transcript quotes in `[HH:MM:SS.mmm] Speaker: text` format
- `src/scripts/save-book-page.ts` for writing the final page
- `hugo/layouts/books/term.html` for rendering the page

## Output Rules

- Use the gathered canonical book name and slug.
- Preserve the gathered NRSVUE URL exactly.
- Use `featuredItems` when adding featured content.
- Prefer a strong chapter-and-verse segment first.
- Never include both a segment and its parent episode as separate featured items.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- Ensure exactly 4 quotes are provided to the save script.
- Before saving, verify each quote's episode number and timestamp against the source episode so generated quote links resolve correctly.

## Final Check

Before finishing, verify the generated page matches the structure used by existing hand-authored topic pages and that Hugo builds cleanly.
