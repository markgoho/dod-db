---
name: analyze-segments
description: Analyze verified podcast segments for a specific episode and generate instance-level topic labels plus short summaries. Use when the user asks to analyze segments for an episode, enrich segment cards, or run /analyze-segments <episode-number>.
---

# Analyze Segments

Use this skill to generate instance-specific segment descriptions for a processed episode.

## Goal

Given an episode number, analyze each verified non-structural segment and generate:

- `topicLabel` — a 1-2 word label for what that specific segment instance is about
- `summary` — a short 5-10 word summary of the segment's discussion

If the episode has no analyzable non-structural segments, generate:

- `episodeTopic` — a short human-friendly topic label for the episode's main discussion subject

Never add or keep an `episodeTopic` when the episode already has analyzable non-structural segments. In that case, focus only on segment-level results.

## Workflow

1. Gather deterministic context:
   ```bash
   bun run src/scripts/gather-segment-context.ts <episode-number> [--force]
   ```
2. Reason directly in the agent from the JSON output.
3. Save results with stdin using a quoted heredoc:
   ```bash
   bun run src/scripts/save-segment-results.ts <<'EOF'
   {
     "mode": "episode-topic",
     "episodeNumber": 6,
     "videoId": "...",
     "episodeTopic": "Divine Council"
   }
   EOF
   ```
   Prefer stdin via a quoted heredoc. Avoid inline `printf` JSON because quotes and apostrophes inside the payload can break shell parsing. Do not create temporary JSON files unless stdin is genuinely unavailable.
4. Check the stable review summary printed by the save script and make sure it matches the intended outcome before reporting completion. Do not assume the save did the right thing without verifying the output.

## Gather output

The gather script returns one of these modes:

- `segments` — includes a `segments` array with gathered transcript context
- `episode-topic` — includes `guestNames` and `transcriptPath`
- `no-op` — nothing needs updating

For `segments`, each item includes:

- `segmentType`
- `startTimestamp`
- `segmentLabel`
- `segmentDescription`
- `contextText`
- `scriptureCandidates`
- `primaryScriptureCandidate`
- `forwardScriptureCandidate`
- `fallbackScriptureCandidate`

## Segment reasoning rules

General rules:

- Be specific to this segment instance, not the generic segment type.
- Prefer concrete concepts or terms stated in the transcript.
- Do not use quotation marks.
- Do not repeat the generic segment label unless that is genuinely the topic.
- Keep `topicLabel` to 1-2 words maximum.
- Keep `summary` to 5-10 words maximum.
- Return `confidence` from 0 to 100.
- Include brief `reasoning`.

Segment-specific rules:

- `chapter-and-verse`
  - Prefer the single most central scripture reference when one is clearly central.
  - Treat `primaryScriptureCandidate` as definitive when present unless the transcript clearly introduces a different main passage.
  - Next prefer references explicitly introduced as the verse or passage under discussion.
  - Deprioritize examples, comparisons, and side mentions.
  - If the topic label is a scripture reference, the summary should describe the interpretive issue or claim about that passage.
- `what-does-that-mean`
  - Prefer the key term or concept being defined.
  - The summary should explain what the term means or why it matters.
- `conspiracy-watch`
  - Prefer a compact recognizable shorthand for the claim, symbol, or entity being debunked.
  - Avoid vague labels and generic framing like `Conspiracy`.
- `archaeology-of-israel`
  - Prefer the most specific site, inscription, artifact, or excavation.
  - Avoid generic labels like `Archaeology` or `Israel`.
- `watch-your-language`
  - Prefer the word, phrase, or language issue under discussion.
- `what-is-that`
  - Prefer the object, artifact, or item being explained.
- `whos-that` / `who-dat`
  - Prefer the person or figure's full name.
- default
  - Prefer the most concrete focal concept, term, text, figure, or artifact named in the transcript.

## Episode-topic mode

If gather returns `episode-topic`, read the transcript from `transcriptPath` and produce one short topic label for the central discussion.

Only use `episode-topic` mode when gather actually returns `episode-topic`. If `--force` reveals analyzable segments, do not save an episode topic; save segment results instead.

Rules:

- Return a concise human-friendly label, usually 1-3 words.
- Prefer the full named concept when the transcript makes it clear.
- Prefer `Star of Bethlehem` over `Star`.
- Prefer `Divine Council` over `Council`.
- Prefer `Ancient Astronomy` over `Astronomy` when that is the real topic.
- Prefer a broad topic area or named concept, not a sentence.
- Do not return the guest's name.
- Do not return a segment title like `Guest Topic`.
- Pick the dominant topic, not a minor tangent.
- Avoid vague single-word labels when a clearer multi-word concept is evident.
- Never append `in the Bible` or `and the Bible`.
- Only save an `episodeTopic` when it adds real value beyond the episode title.
- If the best label would just restate or lightly normalize the episode title without improving searchability, canonical wording, or clarity, treat it as a no-op instead of saving it.
- Save an `episodeTopic` when it meaningfully improves on the title by being shorter, more canonical, less rhetorical, or more discoverable.

## Save input shape

For `segments` mode, send JSON like:

```json
{
  "mode": "segments",
  "episodeNumber": 6,
  "videoId": "...",
  "segmentResults": [
    {
      "startTimestamp": "00:05:23",
      "segmentType": "chapter-and-verse",
      "topicLabel": "Rom 1:26",
      "summary": "Paul's rhetoric on same-sex relations in Romans",
      "confidence": 90,
      "reasoning": "The hosts center the discussion on Romans 1:26.",
      "primaryScriptureCandidate": "Rom 1:26",
      "forwardScriptureCandidate": "Rom 1:26",
      "fallbackScriptureCandidate": "Rom 1:26"
    }
  ]
}
```

For `episode-topic` mode, send JSON like:

```json
{
  "mode": "episode-topic",
  "episodeNumber": 6,
  "videoId": "...",
  "episodeTopic": "Divine Council",
  "episodeTopicConfidence": 0.9
}
```

## Expected output

Every successful save prints a stable review summary for manual inspection. Treat guest-episode no-op outcomes as normal unless other evidence suggests recurring segments were missed.
