# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a DoD database project built with Bun, Firebase, and the Google AI SDK for AI-powered audio transcript processing. The application transcribes audio files, corrects transcripts using AI, identifies speakers, and indexes the content in Firestore with vector embeddings.

## Development Commands

use `bunx` to run local dependency scripts

### Core Development

- `bun install` - Install dependencies
- `bun run typecheck` - Run TypeScript type checking
- `bun run lint` - Run ESLint
- `bun run check` - Run both typecheck and lint (use this to confirm code is error-free)

### Processing Pipeline

**Primary command for processing YouTube episodes:**

```bash
bun run src/scripts/process-youtube.ts <youtube-url> [options]
```

This is the canonical way to kick off the full pipeline. It:

1. Extracts video ID and checks if already processed
2. Fetches metadata from YouTube (title, date, description)
3. Downloads audio to `data/audio/`
4. Transcribes with AssemblyAI (with speaker labels)
5. Identifies speakers using metadata and podcast context
6. Saves raw transcript with speaker names (`-raw.txt`, not committed, for learning comparisons)
7. Corrects transcript (deterministic + Gemini 3.0 Flash)
8. Saves final transcript (`.txt`, committed to git)
9. Updates `data/processed-videos.json` tracking

**Options:**

- `--force` - Reprocess video even if already in processed-videos.json
- `--start-from=STAGE` - Resume from a specific stage to save API costs
  - Supported stages: `correct` (skip transcription and speaker identification)

**Output files per episode:**

- `data/transcripts/YYYY-MM-DD-episode-title-raw.txt` - Raw with speaker names (not committed)
- `data/transcripts/YYYY-MM-DD-episode-title.txt` - Final corrected (committed)

**Examples:**

```bash
# Process a new episode
bun run src/scripts/process-youtube.ts "https://www.youtube.com/watch?v=833s6y6kW2k"

# Reprocess an already-processed episode
bun run src/scripts/process-youtube.ts "https://www.youtube.com/watch?v=833s6y6kW2k" --force

# Process with just video ID
bun run src/scripts/process-youtube.ts 833s6y6kW2k

# Resume from correction stage (when IDE crashes or to re-run correction)
bun run src/scripts/process-youtube.ts 833s6y6kW2k --start-from=correct

# Reprocess only the correction stage
bun run src/scripts/process-youtube.ts 833s6y6kW2k --force --start-from=correct
```

**Staged Pipeline (Cost Savings):**
The `--start-from=correct` flag allows resuming from the correction stage when the raw transcript already exists. This is useful when:

- IDE crashes after transcription/speaker-ID complete
- Re-running correction with updated deterministic rules
- Testing correction improvements without re-transcribing

Cost savings:

- Skips AssemblyAI transcription (~$0.42/minute of audio)
- Skips Gemini speaker identification (1 API call)
- Only runs Gemini correction (15+ chunks, necessary stage)

**Other pipeline scripts:**

- `bun run src/scripts/transcript-qa.ts` - Run Q&A over indexed transcripts
- `bun run src/scripts/check-new-episodes.ts` - Check for and process new episodes (used by GitHub Actions)
- `bun run src/scripts/reprocess-tags.ts` - Reprocess tags for all episodes after vocabulary changes

### Internal Tools

- `bun run src/scripts/tools-server.ts` (or `npm run tools`) - Start unified tools server at http://localhost:3000
  - **Landing Page**: Dashboard with links to all tools
  - **Timestamp Validator**: Load transcripts and audio files to validate timestamp accuracy
  - **Correction Review**: Review and approve correction candidates across episodes
  - **Tag Vocabulary Management**: Manage tag vocabulary, view episode analytics, run migrations
  - **Segment Verification**: View segments, verify boundaries, edit timestamps

### Firebase Emulators

- `npm run emulators:start` - Start Firebase Auth & Firestore emulators (ports: Auth 9099, Firestore 8080)

### Firebase Functions

- `cd functions && npm run build` - Build Firebase Functions TypeScript
- `cd functions && npm run build:watch` - Watch mode for Functions
- `cd functions && npm run serve` - Build and start Functions emulator
- `cd functions && npm run deploy` - Deploy Functions to Firebase

## Architecture

### Processing Pipeline

The transcript processing pipeline is orchestrated via `src/pipeline/youtube-processor.ts`:

1. **Audio Transcription** (`src/pipeline/transcribe.ts`)
   - Downloads YouTube audio via yt-dlp (if YouTube URL)
   - Uses AssemblyAI API with speaker labeling enabled
   - Formats timestamps as `[HH:MM:SS] Speaker N: text`

2. **Transcript Correction** (`src/pipeline/correct.ts`)
   - **Step 1**: Applies deterministic find/replace from `src/config/corrections.ts` (instant, no cost)
   - **Step 2**: Uses Gemini 3.0 Flash Preview for remaining errors
   - Chunked processing via `llm-chunk` (5K-10K tokens, 200 overlap)
   - **Parallel Network I/O**: All chunks processed concurrently via `Promise.all()` (7x speedup)
   - Deduplicates overlap when concatenating chunks (timestamp-aware)
   - Uses plain Latin characters (no diacritics)
   - **Learning Loop**: Compare raw vs corrected transcripts to identify frequent corrections, then add to deterministic list

3. **Speaker Identification** (`src/pipeline/identify-speakers.ts`)
   - Uses structured JSON output to map "Speaker A, B, C" to real names
   - Leverages video metadata (title, description) for context
   - Returns both the labeled transcript and speaker mapping

4. **Tag Extraction** (`src/pipeline/extract-tags*.ts`)
   - **Hybrid three-tier approach** for extracting topical tags from transcripts
   - **Tier 1: Deterministic matching** (`extract-tags-deterministic.ts`)
     - Case-sensitive regex matching against known vocabulary (instant, free)
     - Overlap detection: longer patterns matched first to prevent double-counting
     - Example: "biblical canon" + "canon" variation won't double-count "biblical canon" phrase
     - Optional LLM verification for ambiguous tags (see below)
   - **Tier 2: LLM discovery** (`extract-tags-llm.ts`)
     - Gemini identifies new high-value tags NOT in vocabulary (5+ mentions threshold)
     - Can be skipped with `--skip-llm` flag to save API costs
   - **Tier 3: Learning loop** - Promote discovered tags to vocabulary for free future matching
   - **Orchestrator** (`extract-tags.ts`) - Combines both tiers and merges results

   **LLM Verification for Ambiguous Tags:**
   - For common names (David, John, Mary), use `llmVerify: true` in vocabulary
   - Requires `description` field to provide context (discriminated union enforced)
   - Extracts 15 words before/after each match and verifies with Gemini
   - Batched API calls (all matches per episode in one call)
   - Example: "David" finds 672 regex matches, LLM verifies 24 are King David, rejects 648 modern references

   **Tag Categories (7 total):**
   - `character` - Biblical, mythological, and literary characters who may or may not have historically existed (Moses, Jesus, Tiamat, Marduk, Baal, Asherah)
   - `person` - Historical people who verifiably lived (Bart Ehrman, Andrew Whitehead, Athanasius of Alexandria)
   - `place` - All geographic locations (Jerusalem, Ugarit, Elephantine, Carthage, Canaan)
   - `people` - People groups/nations (Israelites, Canaanites, Amorites, Philistines, Moabites)
   - `literature` - Written works (Torah, Septuagint, Gospel of John, Dead Sea Scrolls)
   - `theology` - Doctrines and concepts (resurrection, divine council, YHWH, monotheism)
   - `scholarship` - Academic methods and terms (textual criticism, source criticism, redaction criticism)

5. **Storage** (`src/storage/`)
   - **File**: Saves to `data/transcripts/` with date-slug naming
   - **Tracking**: Updates `data/processed-videos.json` with tags array
   - **Firestore**: Vector embeddings stored with `FieldValue.vector()` for semantic search (TBD)

### Episode Number Tracking

Episode numbers are automatically assigned based on `publishedAt` date order:

- **Sequential numbering**: Earliest episode = 1, next = 2, etc.
- **All episodes included**: Even those without numbers in titles (like "Apostlepalooza!")
- **Stored permanently**: In `data/processed-videos.json` as `episodeNumber` field
- **Computed automatically**: When processing new videos via `markVideoAsProcessed()`
- **Manual overrides**: Respected (set `episodeNumber` directly in JSON)
- **Deterministic**: Same dates use videoId as tiebreaker for stable ordering

**One-time migration**: Run `bun run src/scripts/migrate-episode-numbers.ts` to backfill existing episodes.

**Utility functions** (in `src/storage/processed-videos.ts`):

- `getProcessedVideosWithNumbers()` - Get all videos with episode numbers
- `getVideoByEpisodeNumber(number)` - Find video by episode number
- `getEpisodeNumber(videoId)` - Get episode number for a video ID

### Correction Learning Workflow

The correction system includes a **learning feedback loop** that improves efficiency over time:

1. **Process episodes** - Run pipeline with `bun run src/scripts/process-youtube.ts <url>`
   - Creates `-raw.txt` (after speaker ID, before correction) - not committed
   - Creates `.txt` (final corrected) - committed to git

2. **Compare transcripts** - Diff shows ONLY corrections (speaker names already matched):

   ```bash
   diff data/transcripts/episode-1-raw.txt data/transcripts/episode-1.txt
   ```

   Example output:

   ```diff
   - The Torrah was written
   + The Torah was written
   - The Septuigent translation
   + The Septuagint translation
   ```

3. **Identify patterns** - Look for frequently occurring corrections
4. **Add to deterministic list** - Update `src/config/corrections.ts`:
   ```typescript
   [["Torrah", "Tora"], "Torah"],
   [["Septuigent"], "Septuagint"],
   ```
5. **Next episode is faster** - Previously-learned corrections now happen instantly (no LLM cost!)

**Goal**: Achieve 80%+ deterministic corrections for maximum efficiency. See `CORRECTION-WORKFLOW.md` for detailed documentation.

### Tag Vocabulary Management

**Tag vocabulary** (`src/config/tag-vocabulary.ts`) contains 100+ predefined terms organized by category. Tags are extracted during pipeline processing and stored in `data/processed-videos.json`.

**Vocabulary structure:**

```typescript
type TagDefinition =
  | { canonical; variations; category; llmVerify: true; description } // Ambiguous tags
  | { canonical; variations; category }; // Standard tags
```

**Reprocessing tags after vocabulary updates:**

```bash
# Reprocess all episodes (deterministic only, no API costs)
bun run src/scripts/reprocess-tags.ts --force --skip-llm

# Reprocess with LLM discovery (finds new tags)
bun run src/scripts/reprocess-tags.ts --force

# Detailed per-episode logs
bun run src/scripts/reprocess-tags.ts --force --skip-llm --verbose
```

**Web UI for tag management:**

```bash
# Start the Tag Vocabulary Management UI
bun run src/scripts/tag-vocabulary-ui.ts
# Open http://localhost:3001
```

The UI provides:

- **Episode Viewer**: Browse all episodes with tags, search, filter by tag, sort by various criteria
- **Vocabulary Browser**: View 100+ vocabulary terms organized by 7 categories
- **Analytics Dashboard**: Top used tags, category distribution, underused vocabulary
- **Add Tag Form**: Add new tags with optional LLM verification for ambiguous names
  - Canonical name, variations (comma-separated), category (dropdown)
  - "Use LLM verification" checkbox for ambiguous names (requires description)
  - Automatically reprocesses all episodes and shows tag-specific results
- **Migration Tools**: Reprocess all episodes after manual vocabulary edits

**Adding tags with LLM verification:**

- Use for common names where context matters (David, John, Mary, Paul)
- Check "Use LLM context verification" and provide description
- Example: canonical="David", description="King David of Israel, second king, defeated Goliath"
- System analyzes context around each match to filter false positives
- Much more accurate than regex-only matching

**Key implementation details:**

- **Case-sensitive matching**: "Lot" (character) vs "lot" in "a lot" (phrase)
- **Overlap detection**: "biblical canon" + "canon" variation won't double-count
- **Single-tag extraction**: When adding a tag, only that tag is processed (fast, efficient)
- **Removed generic tags**: "Bible" removed from vocabulary (too generic, appears in all episodes)
- **Vocabulary files**: `src/config/tag-vocabulary.ts` (100+ terms), `src/prompts/tag-extraction.ts` (LLM discovery rules)

### Key Architectural Patterns

- **Centralized Configuration**: All config in `src/config/` (chunking, firebase, models, corrections)
- **Google AI Client**: Exported from `src/ai.ts` using `@google/genai` SDK
- **Chunking Strategy**: Uses `llm-chunk` library with sentence-based splitting
  - Correction: 5000-10000 tokens, 200 overlap (maintain context)
  - Embedding: 1000-2000 tokens, 100 overlap (precise retrieval)
- **Prompt Organization**: Prompts in `src/prompts/` with barrel export
- **Structured Output**: Uses Zod schemas with `zod-to-json-schema` for type-safe JSON responses
- **Learning System**: Deterministic corrections + LLM with manual learning loop for continuous improvement

### Parallel Network I/O

The transcript correction pipeline uses **parallel network I/O** to achieve ~7x speedup over sequential processing.

**Why parallelization works:**
- LLM API calls are **I/O-bound** (waiting for network responses), not CPU-bound
- `Promise.all()` overlaps waiting time without additional CPU cost
- No semaphore or concurrency limiting needed - Gemini handles rate limiting

**Implementation pattern:**
```typescript
// Process all chunks concurrently
const results = await Promise.all(
  chunks.map((chunk, index) => processChunk(chunk, index, chunks.length)),
);
// Sort by index to maintain order for deduplication
results.sort((a, b) => a.index - b.index);
```

**Performance results** (Episode 5, 13 chunks):
| Method | Wall Clock | Speedup |
|--------|-----------|---------|
| Sequential | 815s (~13.6 min) | 1x |
| Parallel (4) | 210s (~3.5 min) | 3.4x |
| Parallel (full) | 88s (~1.5 min) | 7.4x |

**Key considerations:**
- Results must be sorted by index after parallel completion (chunks complete out of order)
- Deduplication depends on correct chunk ordering
- Cost remains constant (~$0.08/episode) regardless of parallelization
- See issue #39 for ongoing cost tracking

### Experiments Framework

The `experiments/` directory contains tools for benchmarking and optimizing the pipeline:

```
experiments/
├── config/
│   └── experiment-config.ts     # Pricing, thresholds, sample list
├── lib/
│   ├── accuracy.ts              # Levenshtein, line-match, timestamp checks
│   ├── cost-calculator.ts       # Token counting from API responses
│   ├── parallel-corrector.ts    # Concurrency-limited parallel processing
│   └── results-reporter.ts      # JSON output formatting
├── runners/
│   ├── baseline.ts              # Measure current sequential approach
│   ├── parallel-experiment.ts   # Test concurrency levels
│   ├── model-comparison.ts      # Compare models
│   └── verify-results.ts        # Validate experiment results
└── results/                     # Output directory (gitignored)
```

**Running experiments:**
```bash
# Baseline (sequential processing)
bun run experiments/runners/baseline.ts --all

# Parallel experiments (test different concurrency levels)
bun run experiments/runners/parallel-experiment.ts --concurrency=4
bun run experiments/runners/parallel-experiment.ts --concurrency=full

# Model comparison
bun run experiments/runners/model-comparison.ts --all
```

**Official Gemini pricing** (per 1M tokens):
| Model | Input | Output |
|-------|-------|--------|
| gemini-2.0-flash | $0.10 | $0.40 |
| gemini-2.5-flash | $0.30 | $2.50 |
| gemini-3-flash-preview | $0.50 | $3.00 |

**Token counting:** Use `response.usageMetadata.promptTokenCount` and `candidatesTokenCount` for accurate counts.

### Project Structure

```
├── src/
│   ├── config/               # Centralized configuration
│   │   ├── chunking.ts      # Chunk size settings for different use cases
│   │   ├── firebase.ts      # Single Firebase initialization
│   │   ├── models.ts        # Model selections (correction, speaker ID, QA)
│   │   ├── tag-vocabulary.ts # 100+ predefined tags with categories
│   │   └── index.ts         # Barrel export
│   ├── pipeline/            # Processing pipeline steps
│   │   ├── transcribe.ts    # AssemblyAI transcription
│   │   ├── correct.ts       # LLM-based correction
│   │   ├── identify-speakers.ts  # Speaker name mapping
│   │   ├── extract-tags-deterministic.ts # Regex tag matching (case-sensitive, overlap detection)
│   │   ├── extract-tags-llm.ts # LLM discovery of new tags
│   │   ├── extract-tags.ts  # Tag extraction orchestrator (hybrid approach)
│   │   ├── verify-tag-matches.ts # LLM context verification for ambiguous tags
│   │   ├── extract-single-tag.ts # Extract one specific tag (efficient for adding tags)
│   │   ├── reprocess-episodes.ts # Core reprocessing logic (reusable)
│   │   ├── add-tag-to-vocabulary.ts # Add tag to vocabulary file
│   │   ├── add-tag-to-episodes.ts # Add single tag to all episodes
│   │   └── index.ts         # Main processTranscript function
│   ├── prompts/             # LLM prompts
│   │   ├── correction.ts    # Bible scholarship correction prompt
│   │   ├── speaker-labels.ts # Speaker identification prompt + schema
│   │   ├── tag-extraction.ts # Tag discovery prompt + schema
│   │   └── index.ts         # Barrel export
│   ├── storage/             # Data persistence
│   │   ├── firestore.ts     # Firestore indexing & retrieval
│   │   ├── file.ts          # Local file output
│   │   ├── processed-videos.ts # Episode tracking with tags
│   │   └── index.ts         # Barrel export
│   ├── flows/               # Additional AI functions
│   │   └── transcript-qa.ts # Q&A over indexed transcripts
│   ├── scripts/             # CLI entry points
│   │   ├── process-youtube.ts # Run full YouTube processing pipeline
│   │   ├── reprocess-tags.ts # Reprocess tags for all episodes
│   │   ├── tools-server.ts # Unified web tools server (port 3000)
│   │   └── transcript-qa.ts     # Run Q&A function
│   ├── ai.ts                # Google AI client configuration
│   └── index.ts             # Main barrel export
├── data/                     # Sample/output data files
│   ├── transcripts/         # Processed episode transcripts
│   └── processed-videos.json # Episode tracking with tags and metadata
├── tools/                    # Internal web tools
│   ├── index.html           # Tools dashboard (landing page)
│   ├── validate-timestamps.html # Timestamp validation tool
│   ├── review-corrections.html # Correction review tool
│   ├── tag-vocabulary.html  # Tag vocabulary management UI
│   └── segment-verification.html # Segment verification tool
├── experiments/              # Pipeline optimization experiments
│   ├── config/              # Experiment configuration (pricing, samples)
│   ├── lib/                 # Shared utilities (accuracy, cost, parallel)
│   ├── runners/             # Experiment scripts (baseline, parallel, model)
│   └── results/             # Experiment output (gitignored)
├── functions/                # Firebase Cloud Functions
└── firebase.json             # Firebase project configuration
```

## Environment Variables

Required environment variables:

- `ASSEMBLYAI_API_KEY` - AssemblyAI API key for audio transcription
- `GEMINI_API_KEY` - Google AI API key for Gemini models
- `FIREBASE_PROJECT_ID` - Firebase project identifier (for Firestore indexing)

## Code Conventions

- **TypeScript**: Strict mode enabled with bundler module resolution (target: ESNext)
- **Linting**: ESLint with TypeScript ESLint and Unicorn plugin
  - Exception: `unicorn/consistent-function-scoping` set to not check arrow functions (for reactive contexts)
- **Runtime**: Bun is the primary runtime
  - **IMPORTANT**: Always prefer Bun APIs over Node.js APIs
  - File operations: Use `Bun.file()`, `Bun.write()` instead of `fs.readFileSync()`, `fs.writeFileSync()`
  - Process spawning: Use `Bun.spawn()` instead of `child_process`
  - Path operations: `node:path` is acceptable (no Bun equivalent)
  - See: https://bun.sh/docs/api/file-io
- **Firebase Admin**: Initialized with project ID from environment for Firestore access
- **Google AI SDK**: Uses `@google/genai` for text generation and embeddings

## Important Implementation Notes

- The main transcript processing function (`processTranscript` in `src/pipeline/index.ts`) orchestrates: transcription → correction → speaker identification → Firestore indexing
- Firestore uses vector embeddings (`FieldValue.vector()`) for semantic search capabilities
- Vector retrieval is TBD - `retrieveFromFirestore` currently returns an empty array pending vector DB solution selection
- The project uses Google Drive URLs for audio input (format: `https://drive.google.com/uc?export=download&id={fileId}`)
- All configuration is centralized in `src/config/` - modify chunking settings, models, or Firebase config there
- Structured output uses Zod schemas converted via `zod-to-json-schema` for the Google AI SDK

## Project Management

This project uses GitHub Projects for planning and tracking. See `dod-db.md` for the high-level work items.

**Project URL**: https://github.com/users/markgoho/projects/3

### GitHub CLI Project Commands

The `gh project` commands require the `project` scope. If needed, run:

```bash
gh auth refresh -s project
```

#### List Items in Project

```bash
gh project item-list 3 --owner markgoho
gh project item-list 3 --owner markgoho --format json  # JSON output
```

#### Add Issue to Project

```bash
gh project item-add 3 --owner markgoho --url https://github.com/markgoho/dod-db/issues/<number>
```

#### List Project Fields (needed for editing)

```bash
gh project field-list 3 --owner markgoho
gh project field-list 3 --owner markgoho --format json  # Get field IDs
```

#### Edit Item Field Values

Editing requires IDs (item ID, field ID, project ID). Get these from JSON output of list commands.

```bash
# Update a text field
gh project item-edit --id <item-id> --field-id <field-id> --project-id <project-id> --text "value"

# Update a single-select field (like Status)
gh project item-edit --id <item-id> --field-id <field-id> --project-id <project-id> --single-select-option-id <option-id>

# Clear a field value
gh project item-edit --id <item-id> --field-id <field-id> --project-id <project-id> --clear
```

#### View Project in Browser

```bash
gh project view 3 --owner markgoho --web
```

### Issue Management

```bash
# List all issues
gh issue list

# Create a new issue
gh issue create --title "Title" --body "Description"

# View an issue
gh issue view <number>

# Close an issue
gh issue close <number>
```

### Sub-Issue Management

This project uses **parent issues** to group features and **sub-issues** to track individual work items within each feature. Parent issues have generic titles (e.g., "Transcription", "Search") and sub-issues contain the specific implementation tasks.

The `gh-sub-issue` extension (https://github.com/yahsan2/gh-sub-issue) is installed for CLI sub-issue management:

```bash
# List sub-issues of a parent
gh sub-issue list <parent-issue-number> --repo markgoho/dod-db

# Add existing issue as sub-issue
gh sub-issue add <parent-issue-number> <child-issue-number> --repo markgoho/dod-db

# Create new sub-issue directly under a parent
gh sub-issue create <parent-issue-number> --title "Title" --body "Description" --repo markgoho/dod-db

# Remove sub-issue link
gh sub-issue remove <parent-issue-number> <child-issue-number> --repo markgoho/dod-db
```
