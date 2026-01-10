# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a DoD database project built with Bun, Firebase, and the Google AI SDK for AI-powered audio transcript processing. The application transcribes audio files, corrects transcripts using AI, identifies speakers, and indexes the content in Firestore with vector embeddings.

## Development Commands

### Core Development
- `bun install` - Install dependencies
- `bun run src/scripts/process-transcript.ts` - Run the main transcript processing pipeline
- `bun run src/scripts/transcript-qa.ts` - Run Q&A over indexed transcripts

### Firebase Emulators
- `npm run emulators:start` - Start Firebase Auth & Firestore emulators (ports: Auth 9099, Firestore 8080)

### Firebase Functions
- `cd functions && npm run build` - Build Firebase Functions TypeScript
- `cd functions && npm run build:watch` - Watch mode for Functions
- `cd functions && npm run serve` - Build and start Functions emulator
- `cd functions && npm run deploy` - Deploy Functions to Firebase

## Architecture

### Processing Pipeline

The transcript processing pipeline is orchestrated in `src/pipeline/index.ts`:

1. **Audio Transcription** (`src/pipeline/transcribe.ts`)
   - Uses AssemblyAI API with speaker labeling enabled
   - Formats timestamps as `[HH:MM:SS] Speaker N: text`

2. **Transcript Correction** (`src/pipeline/correct.ts`)
   - Uses Gemini 2.5 Flash to clean up transcription errors
   - Chunked processing via `llm-chunk` for long transcripts

3. **Speaker Identification** (`src/pipeline/identify-speakers.ts`)
   - Uses structured JSON output to map "Speaker A, B, C" to real names
   - Returns both the labeled transcript and speaker mapping

4. **Storage** (`src/storage/`)
   - **Firestore**: Vector embeddings stored with `FieldValue.vector()` for semantic search
   - **File**: Local file output for transcript text

### Key Architectural Patterns

- **Centralized Configuration**: All config in `src/config/` (chunking, firebase, models)
- **Google AI Client**: Exported from `src/ai.ts` using `@google/genai` SDK
- **Chunking Strategy**: Uses `llm-chunk` library with sentence-based splitting
  - Correction: 5000-10000 tokens, 200 overlap (maintain context)
  - Embedding: 1000-2000 tokens, 100 overlap (precise retrieval)
- **Prompt Organization**: Prompts in `src/prompts/` with barrel export
- **Structured Output**: Uses Zod schemas with `zod-to-json-schema` for type-safe JSON responses

### Project Structure

```
├── src/
│   ├── config/               # Centralized configuration
│   │   ├── chunking.ts      # Chunk size settings for different use cases
│   │   ├── firebase.ts      # Single Firebase initialization
│   │   ├── models.ts        # Model selections (correction, speaker ID, QA)
│   │   └── index.ts         # Barrel export
│   ├── pipeline/            # Processing pipeline steps
│   │   ├── transcribe.ts    # AssemblyAI transcription
│   │   ├── correct.ts       # LLM-based correction
│   │   ├── identify-speakers.ts  # Speaker name mapping
│   │   └── index.ts         # Main processTranscript function
│   ├── prompts/             # LLM prompts
│   │   ├── correction.ts    # Bible scholarship correction prompt
│   │   ├── speaker-labels.ts # Speaker identification prompt + schema
│   │   └── index.ts         # Barrel export
│   ├── storage/             # Data persistence
│   │   ├── firestore.ts     # Firestore indexing & retrieval
│   │   ├── file.ts          # Local file output
│   │   └── index.ts         # Barrel export
│   ├── flows/               # Additional AI functions
│   │   └── transcript-qa.ts # Q&A over indexed transcripts
│   ├── scripts/             # CLI entry points
│   │   ├── process-transcript.ts # Run full pipeline
│   │   └── transcript-qa.ts     # Run Q&A function
│   ├── ai.ts                # Google AI client configuration
│   └── index.ts             # Main barrel export
├── data/                     # Sample/output data files
│   └── transcript.txt       # Sample processed transcript
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
- **Runtime**: Bun is the primary runtime (uses `Bun.write` for file operations)
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
