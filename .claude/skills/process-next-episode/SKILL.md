---
name: process-next-episode
description: Find the next unprocessed canonical RSS episode and, when an audio URL is available, run the RSS audio processing pipeline automatically without asking for confirmation, then verify and analyze the new episode's segments and create a guest page for any new guest.
---

# Process Next Episode

Use this skill when the user wants to process the next podcast episode from the canonical RSS feed.

## Goal

Help the user move from:

- "what is the next episode we need to process?"

to:

- the next unprocessed canonical RSS episode
- a confirmed processing run through the RSS audio pipeline
- verified segments with topic labels and summaries
- a guest page for any new guest

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

### 4. Analyze the segments

If the pipeline succeeded, follow the `analyze-segments` skill (`.claude/skills/analyze-segments/SKILL.md`) for the new episode. Take the episode number from the pipeline output line `✓ Assigned episode number: N`. If the pipeline failed, skip this step.

Do not ask before starting. Gather will return `unverified-segments`, because new episodes arrive with every segment set to `auto`. Follow that skill's "Unverified segments" rules. Check every segment type against the transcript, including types the pipeline already assigned. Detection goes wrong in two known ways:

- Pattern detection can match a segment name the hosts say in the intro preview instead of the announcement at the segment start. In episode 188 it labeled Chapter and Verse as `taking-issue` this way.
- Audio detection can leave a generic `segment` type, or log `No transcript line found within tolerance`.

Correct wrong types in the `verify-segments.ts` payload. Do not hand-edit `data/processed-videos.json`.

If any of that skill's stop conditions applies, stop after verification. Report what blocked you and do not save labels.

### 5. Create guest pages

If the pipeline succeeded and the episode has a guest, follow the `create-guest-page` skill (`.claude/skills/create-guest-page/SKILL.md`) for each guest. Do not ask before starting.

Guests are the episode's `speakers` in `data/processed-videos.json`, minus the hosts Dan McClellan and Dan Beecher. The pipeline log line `Guest episode detected` and the `guestNames` array from gather (in `episode-topic` mode) are other signals.

Before you create a page, run `bun run guest-page:gather -- "<name>"`. If the output includes `existingPage`, the guest is returning. Skip creating the page, because the episode grid picks up the new appearance on its own. Only create a page when the guest has none.

Do this step even when Step 4 stopped early. The guest page does not depend on segment labels.

### 6. Report the result

- report whether processing succeeded or failed
- include the processed episode title and transcript path when available
- if it fails, show the real error output rather than summarizing it away
- list each verified segment, the transcript line that confirms it, and any type you corrected
- include the save script's review summary of labels and summaries, or the reason you stopped
- for each guest, report the guest page you created, or that one already existed

## Important constraints

- This workflow is RSS-audio-only
- Reuse the existing RSS pipeline entrypoint in `src/scripts/process-next-episode.ts`
- Do not implement a separate processing path
- Segment analysis reuses the `analyze-segments` skill and its scripts. Do not write a separate labeling path.

## Useful files

- `src/scripts/next-unprocessed-episode.ts`
- `src/scripts/process-next-episode.ts`
- `src/pipeline/rss-audio-processor.ts`
- `src/rss/find-next-unprocessed-episode.ts`
- `.claude/skills/analyze-segments/SKILL.md`
- `src/scripts/gather-segment-context.ts`
- `src/scripts/verify-segments.ts`
- `src/scripts/save-segment-results.ts`
- `.claude/skills/create-guest-page/SKILL.md`
