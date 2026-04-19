---
name: create-tag-page
description: Create a rich Hugo topic landing page from existing transcript, segment, and topic index data. Use when the user asks to create a topic page, write a topic landing page, or generate a new hand-authored topic page.
---

# Create Tag Page

This skill guides you through creating a hand-authored topic landing page for the Hugo site using deterministic context gathering, Claude reasoning, and a save script.

## Input

A topic name, such as `Eschatology` or `YHWH`.

If the user does not provide a topic name, ask for one before proceeding.

## Workflow

### 1. Gather

Run:

```bash
bun run tag-page:gather -- <tag-name>
```

If that script does not exist yet, stop and add or request a package.json script rather than hardcoding paths or relying on the current working directory.

This returns structured JSON with:

- the requested topic name
- the canonical vocabulary entry, including category, variations, and status
- the top 6 episodes by mention count from `hugo/data/tag-episode-index.json`
- matching segment candidates from processed video metadata and Hugo `segmentData`
- transcript excerpts from the top 5 episodes
- any existing topic page at `hugo/content/tags/{slug}/_index.md`

If the script exits with an error, stop and tell the user.

### 2. Reason

Use the gathered JSON to make the authorial decisions.

#### Canonical naming and aliases

- Use the canonical topic name for the page title and slug.
- The gathered `variations` now include `name` and `isAliasCandidate`.
- Treat `isAliasCandidate: true` as the default source for frontmatter `aliases` and visible `knownAs` entries.
- Treat `isAliasCandidate: false` as mechanical forms that should normally stay out of `aliases` and `knownAs`.
- You may still omit a `true` candidate if it would be a poor or misleading redirect target, but do not promote a `false` candidate unless the gathered evidence gives a specific reason.
- When you include an alias, write it as a Hugo path like `/tags/adonai/` in `aliases`, and include the display text like `Adonai` in `knownAs`.
- Both `aliases` and `knownAs` are optional.

#### Featured items

- Featured content may include multiple items, using `featuredItems`.
- Prefer 1 to 2 featured items total.
- Featured items should come from different episodes.
- Do not include both a segment and its parent episode as separate featured items.
- Prefer verified segments when available.
- If a verified segment's `topicLabel` directly matches the topic you are building, treat that as the default first featured item.
- Only skip that direct-match segment if the evidence shows it is weak, incidental, or less central than another verified segment.
- Prefer substantive segment types in this order:
  1. `what-is-that`
  2. `taking-issue`
  3. `chapter-and-verse`
- When you choose a segment, use the provided `anchor` value.
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

#### Definition

- Use the transcript excerpts from the strongest episodes.
- Write 1 to 3 sentences in plain language defining the concept itself as a concept.
- Do not make the definition self-referential by mentioning the show, episode language, what the hosts do, or phrases like `in the show's treatment`.
- Do not write a generic dictionary definition.
- Do not add a `dek` field. If podcast-specific framing matters, put it in the body.

#### Quotes

- Select 4 substantive quotes, not passing mentions.
- Prefer variety across episodes and angles.
- Choose quotes that are shareable on social media: short enough to stand alone, vivid in wording, and easy to understand without long setup.
- Each quote should reveal something specific, surprising, or especially clarifying about the topic itself, not merely mention it in passing or discuss a loosely related issue.
- Avoid filler quotes, throat-clearing, or quotes whose relevance depends on too much surrounding context.
- Use full speaker names.
- For each chosen quote, provide a short written justification in your response explaining why it earned a spot: what it reveals about the topic, why it is notable, and why it is stronger than nearby alternatives.
- Each quote must include:
  - `text`
  - `speaker`
  - `episode` as an integer
  - `timestamp` as a quoted string like `"HH:MM:SS.mmm"`

#### Body

- Write 1 to 2 body paragraphs explaining why this topic matters on the show.
- Start with the explanation itself, not a framing clause like `X matters on the show because`.
- Jump directly into the substantive claim, for example `Samson sits at...` rather than `Samson matters on the show because...`.
- Prefer the topic itself as the grammatical subject of the opening sentence when that reads naturally.
- Keep the body aligned with the evidence in the gathered context.

### 3. Save

Create a JSON object in this shape:

```json
{
  "tagSlug": "eschatology",
  "title": "Eschatology",
  "definition": "The study of end times and final things...",
  "aliases": ["/tags/end-times/"],
  "knownAs": ["End Times"],
  "featuredItems": [
    {
      "type": "segment",
      "episodeNumber": 42,
      "segmentAnchor": "what-is-that-1",
      "label": "What is That? — Eschatology"
    }
  ],
  "quotes": [
    {
      "text": "Quote text here...",
      "speaker": "Dan McClellan",
      "episode": 42,
      "timestamp": "00:12:34.000"
    }
  ],
  "showTopEpisodes": true,
  "topEpisodesLimit": 6,
  "showAllEpisodes": true,
  "body": "Eschatology is a recurring topic on the show..."
}
```

Then save it with stdin using a quoted heredoc:

```bash
bun run tag-page:save <<'EOF'
{
  "tagSlug": "eschatology",
  "title": "Eschatology"
}
EOF
```

If that script does not exist yet, stop and add or request a package.json script rather than hardcoding paths or relying on the current working directory.

Prefer stdin via a quoted heredoc for this skill. Avoid inline `printf` JSON because quotes and apostrophes inside the payload can break shell parsing. Do not create temporary JSON files unless stdin is genuinely unavailable.

### 4. Verify

Run:

```bash
bun run build:hugo
```

Confirm the page builds without errors and matches the structure used by existing hand-authored topic pages.

### 5. Editorial pass

After the build succeeds, do one short editorial review of the generated page itself before finishing.

Check for:

- weak, filler, or non-shareable quotes that do not clearly illuminate the topic
- quotes that are relevant but not specific or noteworthy enough to justify featuring on the page
- aliases that are mechanical or not actually useful search targets
- featured items that are merely acceptable instead of the strongest available choices
- any missed direct-match verified segment that should have been featured first
- body or definition wording that feels vague, repetitive, or less sharp than existing strong topic pages

If any of those are weak, tighten them before concluding.

## Data Sources

- `src/scripts/gather-tag-context.ts` for deterministic context gathering
- `hugo/data/tag-episode-index.json` for topic to episode rankings
- `data/processed-videos.json` for episode metadata, segments, and transcript paths
- `data/transcripts/*.txt` for transcript quotes in `[HH:MM:SS.mmm] Speaker: text` format
- `hugo/content/episodes/*/index.md` for `segmentData` anchors and guest info
- `src/scripts/save-tag-page.ts` for writing the final page

## Output Rules

- Use `featuredItems` when adding featured content.
- Prefer a strong segment first, then optionally add one more featured item from a different episode.
- Never include both a segment and its parent episode as separate featured items.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- Do not include a `dek` field.
- Keep the definition concise, concept-first, and aligned with the show's framing without mentioning the show itself.
- Use full speaker names in quotes.
- Ensure exactly 4 quotes are provided to the save script.

## Final Check

Before finishing, verify the generated page matches the structure used by existing hand-authored topic pages and that Hugo builds cleanly.
