---
name: analyze-segments
description: Analyze verified podcast segments for a specific episode and generate instance-level topic labels plus short summaries. Use when the user asks to analyze segments for an episode, enrich segment cards, or run /analyze-segments <episode-number>.
---

# Analyze Segments

Use this skill to generate instance-specific segment descriptions for a processed episode.

## Goal

Given an episode number, analyze each verified non-structural segment and generate:

- `topicLabel` — a 1-2 word label for what that specific segment is about
- `summary` — a short 5-10 word summary of the segment's discussion

If the episode has no analyzable non-structural segments, generate:

- `episodeTopic` — a short human-friendly topic label for the episode's main discussion subject

Segment labels are stored on each `EpisodeSegment` and projected into Hugo segment cards. `episodeTopic` is stored on the episode and projected into the episode topic card.

## Primary command

```bash
bun run src/scripts/analyze-segments.ts <episode-number>
```

Example:

```bash
bun run src/scripts/analyze-segments.ts 6
```

## Options

- `--force` — re-analyze segments even if they already have `topicLabel` and `summary`
- `--dry-run` — show generated results without saving or regenerating Hugo

Examples:

```bash
bun run src/scripts/analyze-segments.ts 6 --force
bun run src/scripts/analyze-segments.ts 6 --dry-run
```

## What the script does

1. Loads the processed episode by episode number
2. Finds verified segments only
3. Skips structural/generic segments:
   - `intro`
   - `outro`
   - `main-content`
   - `advertisement`
   - `segment`
4. Uses transcript context plus segment-type-aware prompting to generate:
   - topic label
   - short summary
5. If no analyzable non-structural segments remain and the episode has guests, generates a `episodeTopic` label for the guest discussion
6. Saves the results back to `data/processed-videos.json`
7. Regenerates the Hugo episode page

## Segment-specific behavior

The prompt includes segment-specific guidance. For example:

- **Chapter and Verse**: prefer the main scripture reference as the topic label when one is clearly central (e.g. `2 Tim 3:16`)
- **What Does That Mean?**: prefer the key term or concept being defined (e.g. `Univocality`)
- **Who's That? / Who Dat?**: prefer the person or figure's name
- **What is That?**: prefer the object or artifact being explained

## Guest episodes

If an episode has guests and no recurring segments were identified, that is often expected behavior rather than a failure. In those cases, generate a `episodeTopic` label for the episode's main discussion subject.

Prefer the full named concept when the transcript makes it clear, not an underspecified single word. Examples:

- `Star of Bethlehem` over `Star`
- `Divine Council` over `Council`
- `Ancient Astronomy` over `Astronomy` when the fuller phrase is the real topic
- Never append `in the Bible` or `and the Bible` to a topic label; the site context already makes that clear

Treat a no-op result on guest episodes as normal unless there is other evidence the episode should contain recurring segments.

## Output expectations

Every run should end with a reviewable text summary for each analyzed segment, including:

- segment type
- start timestamp
- topic label
- short summary
- confidence

This summary is part of the expected output even when the script also updates metadata and regenerates Hugo.

## Verification

After running:

1. Confirm `topicLabel` / `summary` were added to the target episode in `data/processed-videos.json`
2. Confirm the episode page in `hugo/content/episodes/.../index.md` has updated `segmentData`
3. Confirm segment cards use the topic label when available
4. Confirm the command output includes the per-segment review summary

## Related files

- `src/scripts/analyze-segments.ts`
- `src/scripts/describe-segment.ts`
- `src/pipeline/describe-segment.ts`
- `src/prompts/segment-description-prompt.ts`
- `src/storage/update-segment-description.ts`
- `src/hugo/format-segments-for-frontmatter.ts`
