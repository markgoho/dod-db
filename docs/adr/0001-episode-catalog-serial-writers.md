# ADR 0001 — Episode Catalog uses single-writer serial execution

**Status**: Accepted
**Date**: 2026-05-08

## Context

The Episode Catalog (the module that owns `data/processed-videos.json`) is reached from two distinct entry points:

1. The episode processing pipeline (`src/pipeline/youtube-processor.ts`, `src/pipeline/rss-audio-processor.ts`, and the various `src/scripts/*` runners that invoke it).
2. The internal tools server (`src/scripts/tools-server.ts`) that powers the local review/editing UI.

Both can read and write the catalog. A naive concurrency analysis suggests the catalog needs cross-process file locking (compare `src/pipeline/tag-vocabulary-write-lock.ts`, which exists for exactly that reason in the tag world).

## Decision

**The Episode Catalog assumes a single writer at any moment in real time.** It implements no cross-process file lock and no torn-write recovery. The in-process load-once cache is allowed to assume the file does not change underneath it for the lifetime of the process.

## Rationale

The pipeline and the tools server are operationally serialized by convention: the maintainer never runs an episode processing pipeline while the tools server is also writing. Pipeline runs are short-lived and explicit; the tools server is paused or restarted around them. There has been no observed corruption from concurrent writes.

A cross-process lock would defend against a scenario that does not occur in practice, at the cost of:

- Complicating every read site (a long-lived tools server reading stale cached state under lock acquisition is itself a subtle bug class).
- Forcing every catalog operation through async lock acquisition.
- Adding a second locking system parallel to `tag-vocabulary-write-lock`, which a future refactor would likely want to unify.

## Consequences

- The catalog implementation is simpler: a load-once cache, in-memory mutation, atomic file replace on save.
- Any change that breaks the serialization assumption (e.g. running the pipeline as a long-lived service alongside the tools server, or having the tools server fork concurrent writers) requires revisiting this ADR.
- If the project grows multi-author or the tools server gains background write workers, the catalog needs cross-process locking and this ADR should be superseded.

## Re-litigation guard

If a future architecture review suggests adding file locking to the Episode Catalog without first invalidating the single-writer assumption above, that suggestion should be rejected by reference to this ADR.
