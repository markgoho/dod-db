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

### 2. Find featured items

- Featured content may include multiple items, using `featuredItems`.
- Prefer 1 to 2 featured items total.
- Featured items should come from different episodes.
- Do not include both a segment and its parent episode as separate featured items.
- Read `data/processed-videos.json` for the top episodes.
- Search each episode's `segments` array for likely matches in `topicLabel` or `summary`.
- Also read the top episodes' Hugo frontmatter from `hugo/content/episodes/*/index.md` and check `segmentData` directly, since it may be more specific than processed segment metadata.
- Match fuzzily and case-insensitively.
- Prefer verified segments when available.
- Prefer substantive segment types in this order:
  1. `what-is-that`
  2. `taking-issue`
  3. `chapter-and-verse`
- When you choose a segment, use `segmentData` to find the exact `anchor` value.
- Construct the label from the segment label and topic label, for example `What is That? — Preterism`.
- If you need an additional featured item after choosing the best segment, prefer a distinct strong episode from another top episode, often a guest episode or another especially central discussion.
- If no suitable segment is found, choose up to one strong `episode` item instead.
- If nothing stands out, omit featured content.

The frontmatter shape is:

```yaml
featuredItems:
  - type: segment
    episodeNumber: 119
    segmentAnchor: what-is-that-1
    label: "What is That? — Preterism"
  - type: episode
    number: 143
    label: "Guest Episode Title"
```

### 3. Write the definition

- Read transcript excerpts from the top 2 to 3 episodes.
- Find transcript paths via `transcriptPath` in `data/processed-videos.json`.
- Search for substantive discussion of the term.
- Write 1 to 3 sentences in plain language defining the concept itself in a way that aligns with the show's treatment of it.
- Do not make the definition self-referential by mentioning the show, episode language, or what the hosts do.
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
- optional `featuredItems`
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

- Use `featuredItems` when adding featured content.
- Prefer a strong segment first, then optionally add one more featured item from a different episode.
- Never include both a segment and its parent episode as separate featured items.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- Do not include a `dek` field.
- Keep the definition concise, concept-first, and aligned with the show's framing without mentioning the show itself.
- Use full speaker names in quotes.

## Final Check

Before finishing, verify the generated page matches the structure used by existing hand-authored tag pages and that Hugo builds cleanly.
