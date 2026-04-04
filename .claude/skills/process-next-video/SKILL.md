---
name: process-next-video
description: Find the next unprocessed Patreon episode, show likely YouTube matches, ask the user to confirm a URL or candidate, then run the YouTube processing pipeline.
---

# Process Next Video

Use this skill when the user wants to process the next podcast episode but does not know the YouTube URL yet.

## Goal

Help the user move from:

- "what is the next episode we need to process?"

to:

- a confirmed YouTube URL or video ID
- a started processing pipeline

## Workflow

### 1. Find the next unprocessed episode and likely YouTube matches

Run:

```bash
bun run src/scripts/next-unprocessed-episode.ts
```

This script should show:

- the next unprocessed canonical Patreon RSS episode title
- publish date
- RSS episode number when available
- likely YouTube candidates from the channel

### 2. Present the candidates to the user

Do not guess which YouTube match is correct.

If likely matches are found:

- show the episode title and candidate URLs clearly
- ask the user which candidate to use
- allow the user to paste a different YouTube URL or bare video ID instead

If no likely matches are found:

- tell the user no likely YouTube match was found
- ask the user to paste the YouTube URL or bare video ID manually

### 3. After user confirmation, run the processing pipeline

Once the user confirms the candidate or provides a URL/ID, run:

```bash
bun run src/scripts/process-youtube.ts <youtube-url-or-id>
```

If the user explicitly asks to reprocess, pass `--force`.

If the user explicitly asks to resume from a stage, pass the appropriate flag:

- `--start-from=correct`
- `--start-from=segment-detection`
- `--start-from=extract-tags`

### 4. Report the result

After running the pipeline:

- report whether processing succeeded or failed
- include the processed video title and transcript path when available
- if it fails, show the real error output rather than summarizing it away

## Important constraints

- The YouTube candidate list is only a suggestion; the user must confirm before processing
- Do not auto-run the pipeline based solely on title matching
- Reuse the existing pipeline entrypoint in `src/scripts/process-youtube.ts`
- Do not implement a separate processing path

## Useful files

- `src/scripts/next-unprocessed-episode.ts`
- `src/scripts/process-youtube.ts`
- `src/pipeline/youtube-processor.ts`
- `src/rss/find-next-unprocessed-episode.ts`
