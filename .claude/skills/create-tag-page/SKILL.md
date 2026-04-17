---
name: create-tag-page
description: Create a rich Hugo tag landing page from existing transcript, segment, and tag index data. Use when the user asks to create a tag page, write a topic landing page, or generate a new hand-authored tag page.
---

# Create Tag Page

This skill guides you through creating a hand-authored tag landing page for the Hugo site using existing project data.

## Input

A tag name, such as `Eschatology` or `YHWH`.

If the user does not provide a tag name, ask for one before proceeding.

## Workflow

### 1. Look up the tag in `hugo/data/tag-episode-index.json`

- Find the entry matching the requested tag name.
- Record the top 6 episodes by mention count.
- If the tag is not found, stop and tell the user.

### 1b. Check canonical vocabulary and alias candidates

- Read `src/config/tag-vocabulary.ts` and find the canonical entry for the requested tag.
- If the requested name is a variation, use the canonical name for the page title and slug.
- Use judgment when deciding whether any `variations` should become frontmatter `aliases` and visible `knownAs` entries.
- Include names a reader might reasonably search as distinct names, titles, or transliterations.
- Exclude capitalization variants, possessives, simple inflections, and other mechanical forms.
- When you include an alias, write it as a Hugo path like `/tags/adonai/` in `aliases`, and include the display text like `Adonai` in `knownAs`.
- Both `aliases` and `knownAs` are optional.

### 2. Search for a featured segment

- Read `data/processed-videos.json` for the top episodes.
- Search each episode's `segments` array for a likely match in `topicLabel` or `summary`.
- Match fuzzily and case-insensitively.
- Prefer verified segments when available.
- Prefer substantive segment types in this order:
  1. `what-is-that`
  2. `taking-issue`
  3. `chapter-and-verse`
- If you find a candidate segment, read that episode's Hugo frontmatter from `hugo/content/episodes/*/index.md`.
- Use `segmentData` to find the exact `anchor` value for the chosen segment.
- Record:
  - `episodeNumber`
  - `segmentAnchor`
  - `label`

Construct the label from the segment label and topic label, for example `What is That? — Preterism`.

The frontmatter shape is:

```yaml
featuredSegment:
  episodeNumber: 119
  segmentAnchor: what-is-that-1
  label: "What is That? — Preterism"
```

### 2b. Fallback to a featured episode

If no suitable featured segment is found:

- Check the top episodes' Hugo frontmatter for a `guests` field.
- If a good guest episode exists, use it as `featuredEpisode`.
- Include:
  - `number`
  - optional `label`
- If neither a featured segment nor a guest episode is found, omit both fields.

### 3. Write the definition

- Read transcript excerpts from the top 2 to 3 episodes.
- Find transcript paths via `transcriptPath` in `data/processed-videos.json`.
- Search for substantive discussion of the term.
- Write 1 to 3 sentences in plain language describing how the show frames the concept.
- Do not write a generic dictionary definition.
- Do not add a `dek` field. If podcast-specific framing matters, put it in the body.

### 4. Find 4 quotes

- Read transcripts from the strongest episodes first.
- Select substantive quotes, not passing mentions.
- Prefer variety across episodes and angles.
- For each quote, extract:
  - `text`
  - `speaker` using the full name
  - `episode` as an integer
  - `timestamp` as a quoted string like `"HH:MM:SS.mmm"`

### 5. Write the `_index.md` file

Write the page to:

`hugo/content/tags/{tag-slug}/_index.md`

Hugo will lowercase the slug.

Use frontmatter with:

- `title`
- `definition`
- optional `aliases`
- optional `knownAs`
- optional `featuredSegment` or `featuredEpisode`
- `quotes`
- `showTopEpisodes: true`
- `topEpisodesLimit: 6`
- `showAllEpisodes: true`

Then write 1 to 2 body paragraphs explaining why this topic matters on the show.

### 6. Verify

- Run `cd hugo && hugo`.
- Confirm the page builds without errors.
- Check that the generated page renders:
  - the definition
  - featured content
  - quotes
  - top episodes
  - all episodes

## Data Sources

- `hugo/data/tag-episode-index.json` for tag to episode rankings
- `data/processed-videos.json` for episode metadata, segments, and transcript paths
- `data/transcripts/*.txt` for transcript quotes in `[HH:MM:SS.mmm] Speaker: text` format
- `hugo/content/episodes/*/index.md` for `segmentData` anchors and guest info

## Output Rules

- Prefer `featuredSegment` over `featuredEpisode` when a good segment exists.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- Do not include a `dek` field.
- Keep the definition concise and specific to the show's framing.
- Use full speaker names in quotes.

## Final Check

Before finishing, verify the generated page matches the structure used by existing hand-authored tag pages and that Hugo builds cleanly.
