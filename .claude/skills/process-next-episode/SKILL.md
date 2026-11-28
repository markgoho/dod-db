---
name: process-next-episode
description: Find the next unprocessed canonical RSS episode and, when an audio URL is available, run the RSS audio processing pipeline automatically without asking for confirmation, then verify and analyze the new episode's segments, create a guest page for any new guest, report candidate Trigger Claims for Scholarship Pages and Timeline Entries, and log subject suggestions, conflicts and guest Leads to the Scholarship candidate file.
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
- Scholarship Page quotes added under their question and Timeline quotes under their entry (soft cap 10 each); subject or statement suggestions and conflicts logged in `data/scholarship-candidates.yaml`, and new-entry suggestions in issue #108

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

### 5. Find candidate Trigger Claims

If the pipeline succeeded, run `bun run synthesis:gather <n>`. Do this even when Step 4 stopped early. Its JSON gives:

- `targets`: each Scholarship Page (`page`), Timeline Entry (`entry`) and candidate subject (`subject`) with read `windows`. A window spans `from`–`to` (lines `firstLine`–`lastLine`) and lists the `terms` that hit, each `via: watch` (a `watch` term) or `via: related` (a tag or topic from the target's `related` field that the Episode mentions at least `minMentions` times).
- `sweep`: lines with consensus or date wording. `near` names targets with a window close by: a hint for which subject the line is about.
- `subjectEpisodes`: distinct Episodes behind each candidate subject's triggers, this one included when it has a hit.
- `guests` and `noWatch` (candidate subjects the gather cannot see).

For each window, read the final Transcript from `windowSeconds` before `from` to `windowSeconds` after `to`. A candidate is a Speaker's assertion about the target's subject, quoted verbatim with any hedge from the next sentence kept. A passing mention, or a `related` term where the subject is not discussed, is dismissed. Then read every `sweep` line the same way: a consensus or dated assertion is a candidate for a `near` target when it is about that subject, else a new-subject or new-entry suggestion.

Done when every window and every `sweep` line is a candidate, a suggestion or dismissed.

A **page candidate** is about a subject a page already states. Name the statement (question) it most directly bears on, or none when it frames the page as a whole. Each question keeps a **soft cap** of 10 quotes: count the items with that `statement:` in `hugo/data/scholarship/triggers/<slug>.yaml` (page-level quotes, with no `statement:`, share one cap of 10).

- **Under the cap**: add it now through the accept flow below.
- **At the cap**: compare it with that question's quotes. If it is more valuable than the weakest (a clearer or more direct assertion, a hedge kept, a guest scholar where the question has only host quotes), replace the weakest: remove that item and its review key, then add the candidate through the accept flow. Otherwise discard it.

A page candidate that contradicts one of the page's statements is a **conflict**. It never attaches to the page. Log it under `statements` in `data/scholarship-candidates.yaml` as `{ page, question, triggers, notes }`, with the statement's question and `notes: "Conflict with <id>: <how the quote differs>"`, so the owner's next re-review weighs it.

Every other Scholarship candidate is a **suggestion**, and you append it to `data/scholarship-candidates.yaml` in this run, as a Trigger Claim pointer (`episode`, `speaker`, `timestamp`, `text`, same shape as a triggers file):

- **Statement a page lacks**: under `statements`, as `{ page, question, triggers }`. It never goes onto the page.
- **Subject already in the file**: add the pointer to that entry's `triggers`. If the entry is `held` for a Trigger Claim, set `status: candidate` and clear `missing`; the sourcing test checks the pointer.
- **New subject**: append to `subjects` with `slug`, `subject`, `status: candidate`, `core` (the Speaker's thesis), `basis: "Ep <n>, process-next-episode"` and `triggers`. First check the file's slugs and subjects and the existing pages, so a subject lands once.

Then run `bun run check:scholarship`. The file's header comment defines every field.

A `subjectEpisodes` entry at 3 or more Episodes is a **promotion flag**: report it. The file order stays as it is; the owner picks.

A **Timeline candidate** is about a Timeline Entry's subject or date. Note the side it `states`: `critical`, `tradition` or `both`. It follows the same soft cap, per entry: count that `entry:` in `hugo/data/timeline/triggers.yaml`; under 10, add it through the accept flow; at 10, replace a weaker quote or discard it. A quote that disagrees with an entry's date is added like any other: a new Episode never changes a date.

A dated claim about a subject no Timeline Entry covers is a **new-entry suggestion**. Report it as such and comment it on issue #108 (`gh issue comment 108`) as a Trigger Claim pointer plus the date the Speaker gives.

**Accept flow.** Run it in this run for every page or Timeline candidate the cap rules above keep:

1. Append it to `hugo/data/scholarship/triggers/<slug>.yaml`, a plain top-level list: `episode`, `speaker`, `timestamp` (`"HH:MM:SS.mmm"` from the Transcript line), `text`, and `statement` (the question's id; omit for page-level). A Timeline candidate goes to `hugo/data/timeline/triggers.yaml` instead, with `entry:` (the entry id) and `states:` added.
2. Record it under `triggers` in `data/scholarship-reviews/<slug>.yaml` (Timeline: `data/timeline-reviews/<entry>.yaml`), keyed `<episode>@HH:MM:SS`, as `{ agent: pass|flag, owner: "", note: "" }`.
3. Run the Trigger-Claim-only check (#93): confirm Speaker, text, subject, any dropped hedge and (Timeline) `states` against the Transcript; set `agent` and explain any `flag` in `note`. The owner sets `owner`. No statement, date, `read` date or `sourcesRead` changes.
4. Run `bun run check:scholarship` (Timeline: `bun run check:timeline`).

### 6. Create guest pages

If the pipeline succeeded and the episode has a guest, follow the `create-guest-page` skill (`.claude/skills/create-guest-page/SKILL.md`) for each guest. Do not ask before starting.

Guests are the episode's `speakers` in `data/processed-videos.json`, minus the hosts Dan McClellan and Dan Beecher. The pipeline log line `Guest episode detected` and the `guestNames` array from gather (in `episode-topic` mode) are other signals.

Before you create a page, run `bun run guest-page:gather -- "<name>"`. If the output includes `existingPage`, the guest is returning. Skip creating the page, because the episode grid picks up the new appearance on its own. Only create a page when the guest has none.

Do this step even when Step 4 stopped early. The guest page does not depend on segment labels.

Then, for each guest, match their Selected Works against the Step 5 targets with a candidate or suggestion. A work that bears on that subject is a **Lead**: append it to a candidate subject's `leads` as one string (full citation, then the subject it bears on), or, for a Scholarship Page or Timeline Entry, report it. Leads stay out of `hugo/data/external-sources.yaml`, which holds cited sources only.

### 7. Report the result

The owner reads only decisions. Open with "Done, nothing for you" when there are none; otherwise list just the decisions, or a failure with its real error output.

Everything else (segments, guest page, quotes added, replaced or discarded, suggestions and #108 comments) lives in the commit message and files; end with "committed and pushed (sha), deploy ok".

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
- `src/scripts/gather-synthesis-candidates.ts`, `src/hugo/synthesis-candidates.ts`
- `hugo/content/scholarship/`, `hugo/data/scholarship/triggers/`, `data/scholarship-reviews/`
- `hugo/content/timeline/`, `hugo/data/timeline/triggers.yaml`, `data/timeline-reviews/`
