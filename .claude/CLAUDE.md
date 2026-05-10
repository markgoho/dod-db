# CLAUDE.md

## Project Overview

DoD database project built with Bun and Google AI SDK. Transcribes podcast audio, corrects transcripts with AI, identifies speakers, extracts tags, and generates Hugo episode pages.

## Development Commands

- `bun install` - Install dependencies
- `bun run check` - Run both typecheck and lint (use this to confirm code is error-free)
- `bun test` - Run tests (Bun native test framework, coverage enabled by default)
- `bun run tools` - Start internal tools server (API on :3001, UI on :3000)
- `cd hugo && hugo server` - Preview Hugo site

## Processing Pipeline

**Episode 143+ note:** Starting at episode 143, canonical episode identity/audio comes from the public podcast RSS feed rather than YouTube, because YouTube uploads no longer map 1:1 to podcast episodes. Treat YouTube as legacy/auxiliary for episodes through 142.

**Primary command:**

```bash
bun run src/scripts/process-youtube.ts <youtube-url-or-id> [options]
```

**Options:**

- `--force` - Reprocess even if already processed
- `--start-from=correct` - Resume from correction stage (saves transcription API costs)

**Pipeline stages:** Extract metadata → Download audio → Transcribe (AssemblyAI) → Identify speakers → Save raw transcript → Correct (deterministic + Gemini) → Save final transcript → Extract tags → Detect segments → Update tracking → Generate Hugo page

**Output files:**

- `data/transcripts/YYYY-MM-DD-episode-title-raw.txt` - Raw with speaker names (not committed)
- `data/transcripts/YYYY-MM-DD-episode-title.txt` - Final corrected (committed)

**Other pipeline scripts:**

- `bun run src/scripts/check-new-episodes.ts` - Check for new episodes (GitHub Actions)
- `bun run src/scripts/reprocess-tags.ts` - Reprocess tags after vocabulary changes
- `bun run src/scripts/generate-hugo-episodes.ts --all|--newest|--episode N` - Generate Hugo pages

## Architecture

Pipeline orchestrated by `src/pipeline/youtube-processor.ts`:

1. **Transcription** (`src/pipeline/transcribe.ts`) - AssemblyAI with speaker labels
2. **Speaker ID** (`src/pipeline/identify-speakers.ts`) - Gemini maps speakers to real names
3. **Correction** (`src/pipeline/correct.ts`) - Deterministic find/replace from `src/config/corrections.ts`, then Gemini for remainder. Chunked, parallel processing.
4. **Tag Extraction** (`src/pipeline/extract-tags*.ts`) - Three-tier: deterministic regex → LLM discovery → learning loop. Vocabulary in `src/config/tag-vocabulary.ts`.
5. **Segment Detection** (`src/pipeline/detect-segments.ts`) - Audio jingle matching via librosa/Python
6. **Storage** (`src/storage/`) - Transcripts to `data/transcripts/`, tracking in `data/processed-videos.json`

**Key patterns:**

- Config centralized in `src/config/` (chunking, models, corrections, tag vocabulary)
- Prompts in `src/prompts/`
- AI client in `src/ai.ts` using `@google/genai` SDK
- Structured output via Zod schemas + `zod-to-json-schema`

## Code Conventions

- **Runtime**: Bun is primary. **Always prefer Bun APIs** over Node.js:
  - `Bun.file()`, `Bun.write()` not `fs.readFileSync()`, `fs.writeFileSync()`
  - `Bun.spawn()` not `child_process`
  - `node:path` is fine (no Bun equivalent)
- **TypeScript**: Strict mode, ESNext target, bundler resolution
- **Linting**: ESLint + TypeScript ESLint + Unicorn plugin
- **Google AI SDK**: `@google/genai` for all Gemini calls
- Use `bunx` to run local dependency scripts

## Environment Variables

- `ASSEMBLYAI_API_KEY` - Audio transcription
- `GEMINI_API_KEY` - Gemini models
- `FIREBASE_PROJECT_ID` - (Optional) Experimental Firestore features

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `markgoho/dod-db`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses default five-role label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain docs use a single-context layout. See `docs/agents/domain.md`.
