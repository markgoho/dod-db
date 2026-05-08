# CONTEXT

Domain glossary for the DoD database project. Use these terms exactly in code, comments, ADRs, and architectural discussion. New terms get added here when they crystallize during design work.

## Terms

### Episode

A single podcast episode. The canonical unit of content in the project. From episode 143 onward, identity and audio are sourced from the public podcast RSS feed; episodes 1–142 originated on YouTube.

An episode record holds: id, title, dates, episode number, transcript paths, tags, scriptures, segments, episode topic, and a processing status flag. Persisted in `data/processed-videos.json` (filename retained for historical reasons; the records inside are episode records, not video records).

Use `Episode` in module and type names. Avoid `Video` in new code; treat existing `*-video-*` names as legacy to be migrated.

### Episode Catalog

The module that owns `data/processed-videos.json`. Single seam for all reads and writes of episode records. Owns the file format, the load-once cache, episode-number renumbering, and the lifecycle of an episode through the processing pipeline.

Domain operations on the catalog (not generic updates) name the events in an episode's lifecycle. The catalog exposes:

- **Reads**: `getEpisodeById`, `getEpisodeByNumber`, `isProcessed`, `listEpisodes`, `listEpisodesWithNumbers`.
- **Per-episode writes**: `registerEpisode` (returns the assigned episode number; this is the only operation that triggers renumbering), `recordTags`, `recordScriptures`, `recordSegments`, `setEpisodeTopic`, `updateSegmentDescription`. All per-episode writes throw on missing id.
- **Bulk writes**: `removeTagFromAllEpisodes`, `renameTagInAllEpisodes`; tag re-extraction lives in `addTagToEpisodes`.
- **Generic primitive**: `transact(mutator)` — the bulk methods are implemented on top of it; reserved for the few callers that legitimately need it (e.g. `reprocess-episodes`).

The catalog assumes a single writer at any moment in real time. See [ADR 0001](docs/adr/0001-episode-catalog-serial-writers.md).
