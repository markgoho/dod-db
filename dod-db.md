# Data over Dogma Knowledge Base

A public platform for Dan McClellan's content (Data over Dogma podcast, YouTube channel, and potentially books/papers) - a searchable, cross-referenced knowledge base for biblical scholarship topics. The goal is to make Dan's extensive content discoverable and accessible through powerful search, topic pages, and episode exploration.

## Technical Pipeline

- **Input**: YouTube links, podcast episodes
- **Intermediary output**: Transcription with timestamps and speaker identification
- **Final output**: Vectorized information for AI-based RAG search, full-text search, and topic tagging

## Existing Work:

- **index.ts** - Standalone AssemblyAI transcription script with speaker labels and timestamp formatting
- **genkit/index.ts** - Main processTranscript flow orchestrating transcription → correction → speaker ID → Firestore indexing
- **tools/transcribe-audio.ts** - Reusable AssemblyAI wrapper function for audio transcription with speaker labels
- **genkit/correct-transcript.ts** - Chunks and corrects raw transcripts using Gemini 2.5 Flash to fix transcription errors
- **tools/add-speaker-labels.ts** - Replaces generic "Speaker A/B/C" labels with actual speaker names
- **genkit/firestore-rag/index-in-firestore.ts** - Chunks corrected transcripts and stores with text-embedding-004 vectors in Firestore
- **genkit/firestore-rag/retrieve-from-firestore.ts** - Retrieves relevant transcript chunks from Firestore using semantic search
- **genkit/transcript-qa.ts** - RAG-based Q&A flow that answers questions about indexed transcripts
- **tools/write-to-file.ts** - Simple utility for writing content to files using Bun
- **prompts/** - Directory containing prompt templates for transcript correction and speaker identification

## Work to Be Done

1. Build UI to expose search interface (probably SSR Angular, but open to other options)
2. Build UI for Episode Pages
3. Build automations to transcribe/vectorize podcasts as they get published
4. Enhance quality of transcriptions
5. Add/Enhance metadata of transcriptions, e.g. episode number, speakers, segment names, general content description, among others
6. Figure out best destination and technology for vectorization (not tied to Firestore at all)
7. Build topic/concept pages system - pages for topics (e.g. "univocality") that auto-populate with tagged content and cross-reference related topics
8. Implement topic extraction pipeline - let topics emerge organically from content, then consolidate/organize
9. Add clip/quote sharing - share specific segments with timestamped links back to original YouTube/podcast
10. Build user favorites system - allow bookmarking content (localStorage-based initially, no accounts needed)
11. Integrate analytics - Pirsch.io for privacy-focused usage tracking and search insights
12. Add user feedback mechanism - report errors, suggest improvements
13. Support additional content types - extend beyond podcast to YouTube videos, potentially books/papers
14. Create landing page and site navigation - overall site structure and discovery UX
15. Add source citation system - academic/biblical reference linking
