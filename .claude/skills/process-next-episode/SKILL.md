---
name: process-next-episode
description: Find the next unprocessed canonical RSS episode and, when an audio URL is available, run the RSS audio processing pipeline automatically without asking for confirmation.
---

# Process Next Episode

Use this skill when the user wants to process the next podcast episode from the canonical RSS feed.

## Goal

Help the user move from:

- "what is the next episode we need to process?"

to:

- the next unprocessed canonical RSS episode
- a confirmed processing run through the RSS audio pipeline

## Workflow

### 1. Find the next unprocessed RSS episode

Run:

```bash
bun run src/scripts/next-unprocessed-episode.ts
```

This script should show:

- the next unprocessed canonical RSS episode title
- publish date
- RSS episode number when available
- GUID
- enclosure/audio URL

### 2. Show the episode details and proceed

Show the episode title and enclosure URL clearly.

Do not mention YouTube candidates or channel matching.

Do not ask for confirmation. Proceed directly to Step 3.

### 3. Run the processing pipeline

Once the episode has been identified, run:

```bash
bun run src/scripts/process-next-episode.ts
```

If the user explicitly asks to reprocess, pass `--force`.

If the user explicitly asks to resume from a stage, pass the appropriate flag:

- `--start-from=correct`
- `--start-from=segment-detection`
- `--start-from=extract-tags`

If the user explicitly wants a different RSS feed for this run, pass:

- `--rss-url=URL`

### 4. Report the result

After running the pipeline:

- report whether processing succeeded or failed
- include the processed episode title and transcript path when available
- if it fails, show the real error output rather than summarizing it away

## Important constraints

- This workflow is RSS-audio-only
- Reuse the existing RSS pipeline entrypoint in `src/scripts/process-next-episode.ts`
- Do not implement a separate processing path

## Useful files

- `src/scripts/next-unprocessed-episode.ts`
- `src/scripts/process-next-episode.ts`
- `src/pipeline/rss-audio-processor.ts`
- `src/rss/find-next-unprocessed-episode.ts`
