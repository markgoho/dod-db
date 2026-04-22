---
name: refresh-topic-page
description: Refresh an existing Hugo topic landing page with a conservative full-page second pass, re-auditing definition, quotes, and featured items while preserving existing content unless a closer review justifies changes. Use when the user asks to refresh, re-audit, or update an existing topic page.
---

# Refresh Topic Page

This skill guides you through a conservative full-page second pass on an existing hand-authored topic landing page using the existing topic-page gather and save scripts.

Assume the current page is probably good. Only change something when a closer look finds an inconsistency, a weaker editorial choice, or stronger new material from newly gathered episodes.

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

Capture and review:

- current `definition`
- current `featuredItems`
- current `quotes`
- aliases / knownAs and the rest of the frontmatter
- body content

Preserve all existing material by default. Only propose changes when the gathered evidence supports a clearly better wording, a stronger quote set, or a better featured-item mix.

### 3. Re-audit the page

Use the gathered JSON to re-check the page holistically.

#### Definition review

Review the current definition against the strongest gathered transcript evidence.

- Keep the existing definition if it is already accurate, clear, and proportionate.
- Propose a revision only if the current wording is inconsistent with the gathered evidence, misses a clearer core distinction, or can be materially improved without expanding into body copy.
- Keep the definition focused on what the topic is, not why it matters.

#### Quote review

Review existing quotes against the gathered transcript evidence.

- Preserve the current quotes if they are already strong, direct, and non-redundant.
- Consider additions or swaps when newly gathered episodes provide clearer, more directly on-topic lines.
- Prefer quotes that explicitly name the topic or a defining distinction within it.
- Avoid padding the quote list with adjacent but weaker material.

#### Featured-item review

Use `topEpisodes[*].segments` from the gathered JSON.

#### Candidate rules

Use the same featured-item conventions as `create-topic-page`, then apply these refresh-specific constraints:

- Only consider verified segments.
- Treat a segment as a direct match when its `topicLabel` contains the canonical topic name as a case-insensitive substring.
- Only add a candidate when its parent episode is not already represented in `featuredItems`.
- Construct labels as `<Segment Label> — <Topic Label>`.
- Cap total featured items at 2.

If the re-audit finds no justified changes, report that no changes are needed and exit without writing.

### 4. Propose before saving

Before saving, show the user:

- current `definition`, `featuredItems`, and `quotes`
- proposed definition changes, if any, with a short reason
- proposed featured-item additions, removals, or replacements, including episode number, anchor, segment label, topicLabel, and confidence
- proposed quote additions or swaps, including the exact quote text, speaker, episode, and timestamp
- reasoning for each proposed change:
  - direct evidence from gathered transcript material
  - clearer definition or stronger direct-match quote
  - different episode than currently featured items, when relevant
  - reduction of redundancy or correction of inconsistency, when relevant

Ask the user to confirm before saving. Keep a human in the loop for editorial choices.

### 5. Save

Prepare the full save payload before asking for confirmation, then save only after approval.

Preserve the current values for:

- `title`
- `topicName`
- `aliases`
- `knownAs`
- `showTopEpisodes`
- `topEpisodesLimit`
- `showAllEpisodes`
- `body`

Update only the editorial fields you explicitly proposed and the user approved, typically from this set:

- `definition`
- `featuredItems`
- `quotes`

Use the smallest justified edit set. If only quotes change, leave the definition and featured items untouched. If only the definition improves, leave quotes and featured items untouched.

Save with stdin using a quoted heredoc:

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
- It does not rewrite the body wholesale or expand into a from-scratch page rewrite unless the user explicitly asks.
- It does not re-rank the top-episodes block rendered from Hugo data.
- It does not make speculative edits just to make the page different; every change should be grounded in a closer review.

## Data sources

- `src/scripts/gather-topic-context.ts` for deterministic context gathering
- `src/scripts/save-topic-page.ts` for writing the updated page
- `src/utils/parse-hugo-file.ts` for reading the existing page structure
- `hugo/content/topics/{slug}/_index.md` for the authored page being refreshed

## Output rules

- Preserve the existing page body unless the user explicitly asks for body edits.
- Preserve existing editorial choices by default; only change what a closer review clearly improves.
- Prefer 1 to 2 featured items total.
- Never include both a segment and its parent episode as separate featured items.
- Always use `segmentAnchor`, not `segmentType`, when linking to a segment.
- Keep definitions concise and concept-focused.
- Prefer direct-match quotes over adjacent thematic quotes when making additions or swaps.
- Prefer reducing redundancy when selecting multiple quotes.
- If no clear improvement emerges from the re-audit, do not write the page.

## Final check

Before finishing, confirm the page still builds cleanly and that any proposed definition, quote, or featured-item changes genuinely improve the page rather than merely changing it.
