---
paths: "src/**/*.test.ts"
---

# Testing Strategy

## Framework

Use **Bun's native test framework** for all unit tests.

```typescript
import { describe, test, expect } from "bun:test";
```

## File Organization

**Test files are siblings to the files they test:**

```
src/hugo/
├── extract-clean-title.ts
├── extract-clean-title.test.ts
├── shared.ts
├── shared.test.ts
└── __fixtures__/
    ├── frontmatter-complete.md
    └── frontmatter-minimal.md
```

## Snapshot/Fixture Testing

**Prefer exact output matching over weak assertions.**

### ❌ BAD - Weak assertions

```typescript
expect(frontmatter).toContain("title: Test");
expect(frontmatter).toContain("tags:");
```

### ✅ GOOD - Exact snapshot matching

```typescript
const actual = generateFrontmatter(video, "Test");
const expected = await Bun.file(
  "src/hugo/__fixtures__/frontmatter-complete.md",
).text();
expect(actual).toBe(expected);
```

**Why?** Weak assertions miss formatting bugs, missing newlines, trailing spaces, etc. Exact matching catches everything.

## Fixture Files

Store reference output in `__fixtures__/` directories:

- Use descriptive names: `frontmatter-complete.md`, `frontmatter-minimal.md`
- Commit fixture files to git
- Update fixtures when intentionally changing output format
- Fixtures document expected behavior better than comments

## Running Tests

Bun is configured via `bunfig.toml` to look for tests in the `src/` directory.

```bash
# Run all tests (automatically finds tests in src/)
# Shows coverage report by default
bun test

# Run specific test file
bun test src/hugo/generate-frontmatter.test.ts

# Run tests in a directory
bun test src/hugo/

# Before committing
bun run check  # typecheck + lint
```

**Coverage reporting** is enabled by default in `bunfig.toml`. Every test run shows which files are covered and line coverage percentages.

## What to Test

**Test public interfaces, not implementation details:**

- Test exported functions
- Test edge cases (empty arrays, undefined values, missing properties)
- Test error conditions
- Don't test private/internal functions (test them through public APIs)

## Test Data

Use realistic test data that matches production types:

```typescript
const video: ProcessedVideo = {
  videoId: "abc123",
  title: 'Episode 1, "Test Episode"',
  publishedAt: "2024-01-15T10:00:00Z",
  processedAt: "2024-01-15T12:00:00Z",
  transcriptPath: "data/transcripts/2024-01-15-test-episode.txt",
  episodeNumber: 1,
  tags: [
    { tag: "theology", mentions: 5 },
    { tag: "Torah", mentions: 10 },
  ],
  speakers: ["Dan McClellan", "Dan Beecher"],
};
```

## When to Write Tests

**Write tests when:**

- Creating new utilities or functions
- Refactoring existing code (write tests first!)
- Fixing bugs (write a failing test, then fix it)
- Output format matters (use fixtures)

**Tests help catch bugs during refactoring** - like when we caught the Date serialization issue and missing newline in frontmatter generation.

## Test Quality Wins

During the js-yaml → Bun.YAML migration, snapshot tests caught:

1. **Date serialization bug** - Date objects serialized as `{}` instead of ISO strings
2. **Missing newline** - Frontmatter closing `---` was missing a newline separator

These bugs would have been missed by weak `.toContain()` assertions.
