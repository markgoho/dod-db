---
name: refresh-topic-page
description: Refresh an existing Hugo topic landing page by auditing featured items only and proposing stronger direct-match additions. Use when the user asks to refresh, re-audit, or update featured items on an existing topic page.
---

# Refresh Topic Page

This skill guides you through a lightweight second pass on an existing hand-authored topic landing page using the existing topic-page gather and save scripts.

## Input

A topic name, such as `Easter`.

If the user does not provide a topic name, ask for one before proceeding.

## Workflow

### 1. Gather

Run:

```bash
bun run topic-page:gather -- <topic-name>
```

Confirm the gathered JSON includes `existingPage`.

If `existingPage` is missing, stop and tell the user to run `/create-topic-page` instead.

### 2. Read the existing page

Read `existingPage.path` with the same frontmatter-and-body split used by `src/utils/parse-hugo-file.ts`.

Capture and preserve:

- current `featuredItems`
- the rest of the current frontmatter
- body content

Do not rewrite non-featured editorial fields unless the user explicitly asks.

### 3. Audit featured items

Use `topEpisodes[*].segments` from the gathered JSON.

#### Candidate rules

Use the same featured-item conventions as `create-topic-page`, then apply these refresh-specific constraints:

- Only consider verified segments.
- Treat a segment as a direct match when its `topicLabel` contains the canonical topic name as a case-insensitive substring.
- Only add a candidate when its parent episode is not already represented in `featuredItems`.
- Construct labels as `<Segment Label> — <Topic Label>`.
- Cap total featured items at 2.

If the audit finds no addition worth making, report that no changes are needed and exit without writing.

### 4. Propose before saving

Before saving, show the user:

- current `featuredItems`
- proposed additions, including episode number, anchor, segment label, topicLabel, and confidence
- any suggested quote swap when a proposed addition introduces a new featured episode not currently represented in `quotes`; prefer the strongest direct-match quote from that episode, ideally one that names the topic or the specific subtopic clearly, and replace the weakest or most redundant existing quote
- reasoning for each proposed addition:
  - direct topicLabel match
  - segment-type priority
  - different episode than currently featured items

Ask the user to confirm before saving. Keep a human in the loop for editorial choices.

### 5. Save

Prepare the full save payload before asking for confirmation, then save only after approval.

Preserve the current values for:

- `title`
- `topicName`
- `definition`
- `aliases`
- `knownAs`
- `showTopEpisodes`
- `topEpisodesLimit`
- `showAllEpisodes`
- `body`

Preserve current `quotes` by default, but when adding a featured item from a new episode, consider proposing a single quote swap so the quotes better represent the refreshed featured set. Prefer the strongest direct-match quote from the new featured episode, ideally one that explicitly names the topic or the narrower subtopic, and swap out the weakest or most redundant existing quote.

Update `featuredItems` and only the minimal `quotes` change you explicitly proposed and the user approved, then save with stdin using a quoted heredoc:

```bash
bun run topic-page:save <<'EOF'
{
  "topicSlug": "easter",
  "title": "Easter"
}
EOF
```

Prefer stdin via a quoted heredoc for this skill. Avoid inline `printf` JSON because quotes and apostrophes inside the payload can break shell parsing. Do not create temporary JSON files unless stdin is genuinely unavailable.

### 6. Verify

If you wrote the page, run:

```bash
bun run build:hugo
```

Then report the topic URL for spot-checking, for example:

```text
http://localhost:1313/topics/easter/
```

## What this skill does not do

- It does not create a new page. If `existingPage` is missing, direct the user to `/create-topic-page`.
- It does not rewrite the definition, body, or aliases unless the user explicitly asks.
- It does not rewrite quotes wholesale; at most, it may propose a single quote swap when a newly added featured episode is otherwise unrepresented.
- It does not re-rank the top-episodes block rendered from Hugo data.

## Data sources

- `src/scripts/gather-topic-context.ts` for deterministic context gathering
- `src/scripts/save-topic-page.ts` for writing the updated page
- `src/utils/parse-hugo-file.ts` for reading the existing page structure
- `hugo/content/topics/{slug}/_index.md` for the authored page being refreshed

## Output rules

- Preserve the existing page body and non-featured editorial fields.
- Prefer 1 to 2 featured items total.
- Never include both a segment and its parent episode as separate featured items.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- If a new featured item comes from an episode not represented in `quotes`, consider proposing one quote from that episode as a swap, not an expansion.
- Prefer a replacement quote that directly matches the topic or subtopic named by the new featured item, rather than a looser adjacent observation.
- Prefer replacing the weakest or most redundant existing quote, especially one that repeats a point already covered elsewhere on the page.
- If there is no strong new featured item to add, do not write the page.

## Final check

Before finishing, confirm the page still builds cleanly and that the proposed featured items actually improve the page rather than merely changing it.
