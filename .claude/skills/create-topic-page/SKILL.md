---
name: create-topic-page
description: Create a rich Hugo topic landing page from existing transcript, segment, and topic index data. Use when the user asks to create a topic page, write a topic landing page, or generate a new hand-authored topic page.
---

# Create Topic Page

This skill guides you through creating a hand-authored topic landing page for the Hugo site using deterministic context gathering, Claude reasoning, and a save script.

## Input

A topic name, such as `Eschatology` or `YHWH`.

If the user does not provide a topic name, ask for one before proceeding.

## Workflow

### 1. Gather

Run:

```bash
bun run topic-page:gather -- <tag-name>
```

If that script does not exist yet, stop and add or request a package.json script rather than hardcoding paths or relying on the current working directory.

This returns structured JSON with:

- the requested topic name
- the canonical vocabulary entry, including category, variations, and status
- the top 6 episodes by mention count from `hugo/data/tag-episode-index.json`
- matching segment candidates from processed video metadata and Hugo `segmentData`
- transcript excerpts from the top 5 episodes
- any existing topic page at `hugo/content/topics/{slug}/_index.md`

If the script exits with an error, stop and tell the user.

### 2. Reason

Use the gathered JSON to make the authorial decisions.

#### Canonical naming and aliases

- Use the canonical topic name for the page title.
- By default, use the canonical topic name for the slug too.
- If this is the first page being created for an ambiguous canonical name, still use the bare canonical slug.
- Only switch to qualified slugs for ambiguous names after a second distinct entity creates a real collision at the bare slug.
- For person topics that need qualified slugs after such a collision, prefer concise identity qualifiers such as `/tags/james-brother-of-jesus/` or `/tags/james-son-of-zebedee/`.
- Do not reserve the bare ambiguous slug in advance; it should belong to the first page until a later collision requires converting it into a disambiguation page.
- Do not create a disambiguation page as part of this skill unless a real second colliding page is being created or the user explicitly asks for one.
- The gathered `variations` now include `name` and `isAliasCandidate`.
- Treat `isAliasCandidate: true` as the default source for frontmatter `aliases` and visible `knownAs` entries.
- Treat `isAliasCandidate: false` as mechanical forms that should normally stay out of `aliases` and `knownAs`.
- You may still omit a `true` candidate if it would be a poor or misleading redirect target, but do not promote a `false` candidate unless the gathered evidence gives a specific reason.
- When you include an alias, write it as a Hugo path like `/tags/adonai/` in `aliases`, and include the display text like `Adonai` in `knownAs`.
- Do not add the bare ambiguous slug as an alias when that slug should remain available for a disambiguation page.
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
- Make the definition substantial enough to stand on its own: include what the thing is, and when helpful, what it refers to, how it developed, or what distinguishes it from nearby concepts.
- Keep the definition concept-only. Do not use it to explain why the topic matters on the show, how often it comes up, or why it is important for the hosts' larger conversations.
- Do not make the definition self-referential by mentioning the show, episode language, what the hosts do, or phrases like `in the show's treatment`.
- Do not write a generic dictionary definition.
- Do not add a `dek` field. If podcast-specific framing matters, put it in the body.

#### Quotes

- Select 4 substantive quotes, not passing mentions.
- Prefer variety across episodes and angles.
- Choose quotes that are shareable on social media: short enough to stand alone, vivid in wording, and easy to understand without long setup.
- Each quote should reveal something specific, surprising, or especially clarifying about the topic itself, not merely mention it in passing or discuss a loosely related issue.
- Avoid filler quotes, throat-clearing, or quotes whose relevance depends on too much surrounding context.
- When the evidence supports it, prefer including at least one quote about the historicity, literary development, or historical uncertainty of the topic.
- This is especially valuable for character topics, where a strong historicity quote often adds a distinct angle that plot-summary quotes miss.
- Use full speaker names.
- For each chosen quote, provide a short written justification in your response explaining why it earned a spot: what it reveals about the topic, why it is notable, and why it is stronger than nearby alternatives.
- Each quote must include:
  - `text`
  - `speaker`
  - `episode` as an integer
  - `timestamp` as a quoted string like `"HH:MM:SS.mmm"`

#### Body

Write 1 to 2 body paragraphs that convey why this topic matters on the show, drawn tightly from the gathered evidence.

**What the paragraph should do, not how it should sound.** The body's job is to surface the actual reason a listener should care about this topic _on this show_: a specific dispute the hosts return to, a text-critical problem that keeps forcing the question back open, a gap between popular assumption and what the evidence shows, a methodological lever this topic exposes, stakes for how people read scripture or practice faith, or a historical uncertainty that the hosts keep probing. Whichever of these the evidence actually supports is the content of the paragraph.

**Ban the scaffolds.** Do not use any of these opening or structural moves, even in paraphrased form:

- `X keeps resurfacing...`, `recurs...`, `comes up again and again...`, or any "this topic appears often" framing. The page itself already signals frequency via the episode list; do not restate it.
- `sits at the intersection of...`, `serves as a lens for...`, `becomes a flashpoint for...`, `anchors larger arguments about...`, `opens onto...`, `matters less as X than as Y...`
- Any sentence whose backbone is "X [verb] because [list of abstractions]."
- Meta-framing about the show's mission, the hosts' interests, or what the show "does with" the topic.

**Lead with something concrete.** The strongest opening is usually a specific claim, contrast, or fact the hosts have established — something a reader learns in the first sentence, not a thesis sentence promising they'll learn it later. A named dispute, a surprising textual detail, a commonly-held belief the evidence undercuts, a scholarly debate with actual sides. If you cannot write a concrete opening from the evidence, the paragraph is not ready.

**Vary the shape.** Before finalizing, check the two or three most recently created topic pages in `hugo/content/topics/` and make sure your opening sentence does not share its grammatical backbone or rhetorical move with theirs. If it does, rewrite.

Keep the body aligned with the evidence in the gathered context. Do not invent stakes the transcripts do not support.

### 3. Save

Create a JSON object in this shape:

```json
{
  "topicSlug": "eschatology",
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
bun run topic-page:save <<'EOF'
{
  "topicSlug": "eschatology",
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
- body openings that use banned scaffolds (`keeps resurfacing`, `sits at the intersection`, `serves as a lens`, `becomes a flashpoint`, `opens onto`, or any "recurs/comes up often" framing) — rewrite with a concrete specific claim instead
- body openings whose grammatical backbone matches recent topic pages — vary the shape

If any of those are weak, tighten them before concluding.

## Data Sources

- `src/scripts/gather-topic-context.ts` for deterministic context gathering
- `hugo/data/tag-episode-index.json` for topic to episode rankings
- `data/processed-videos.json` for episode metadata, segments, and transcript paths
- `data/transcripts/*.txt` for transcript quotes in `[HH:MM:SS.mmm] Speaker: text` format
- `hugo/content/episodes/*/index.md` for `segmentData` anchors and guest info
- `src/scripts/save-topic-page.ts` for writing the final page
- `src/scripts/move-topic-page.ts` for renaming an existing page's slug

## Disambiguation Mode

Disambiguation is triggered when creating a topic page for a name that already has a page at the bare slug for a **different** entity. For example, creating "James, Son of Zebedee" when `/tags/james/` already exists for "James, Brother of Jesus."

If the existing page is for the **same** entity (just an update), this mode does not apply — update the existing page instead.

### Collision detection

During the Gather step, `existingPage` will be populated if a page already exists at the bare slug. If the existing page's title refers to a different entity than the one being created, enter disambiguation mode.

### Disambiguation steps

1. **Move the existing page** to a qualified slug:

```bash
bun run topic-page:move <bare-slug> <qualified-slug> --add-alias
```

For example: `bun run topic-page:move james james-brother-of-jesus --add-alias`

Use `--add-alias` if the page was previously published so the old URL still resolves.

2. **Create the new specific page** at its own qualified slug using the normal `topic-page:save` flow.

3. **Create a disambiguation page** at the now-vacated bare slug:

```bash
bun run topic-page:save <<'EOF'
{
  "topicSlug": "james",
  "title": "James",
  "definition": "Several figures named James appear in the biblical texts.",
  "isDisambiguation": true,
  "relatedPages": [
    {
      "slug": "james-brother-of-jesus",
      "title": "James, Brother of Jesus",
      "description": "Leader of the Jerusalem church and traditional author of the Epistle of James."
    },
    {
      "slug": "james-son-of-zebedee",
      "title": "James, Son of Zebedee",
      "description": "One of the twelve apostles, brother of John."
    }
  ],
  "body": "The name James refers to several distinct figures in the biblical texts. Select a specific topic below.",
  "quotes": []
}
EOF
```

### Disambiguation page shape

- `isDisambiguation: true` — switches the save script to disambiguation mode (no quotes required, no featured items)
- `relatedPages` — at least 2 entries, each with `slug`, `title`, and optionally `description`
- `definition` — a short sentence explaining the ambiguity
- `body` — a brief paragraph directing readers to the specific pages
- The page uses `layout: disambiguation` in its Hugo frontmatter (set automatically by the save script)

### When NOT to disambiguate

- The existing page is for the same entity — just update it
- There is only one known entity with this name in the show's coverage — use the bare slug directly
- The user has not asked to create a second page for a name that collides

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
