---
name: add-segment
description: Add a new podcast segment type to the Data Over Dogma segment detection and verification system. Use when the user asks to add a new segment, create a segment, or add a segment type like "Getting Angelic" or "Getting Demonic".
---

# Add Segment

This skill guides you through adding a new segment type to the Data Over Dogma podcast segment detection and verification system.

## What is a Segment?

Segments are recurring named sections in Data Over Dogma podcast episodes, such as:
- "Chapter and Verse"
- "Could it be Satan?"
- "Getting Angelic"
- "Getting Demonic"

Each segment has:
1. A unique type identifier (kebab-case)
2. A human-readable label
3. A color for UI visualization
4. Detection patterns (regex) for automatic identification in transcripts

## Steps to Add a Segment

When the user asks to add a segment, follow these four steps:

### 1. Update the SegmentType Union

**File:** `src/config/segment-patterns.ts`

Add the new segment type to the union (alphabetically or logically grouped):

```typescript
export type SegmentType =
  | 'intro'
  | 'chapter-and-verse'
  // ... existing segments ...
  | 'your-new-segment'  // Add here (kebab-case)
  | 'advertisement'
  | 'main-content'
  | 'outro';
```

**Naming convention:** Use kebab-case (lowercase with hyphens)

### 2. Add to SEGMENT_LABELS

**File:** `src/config/segment-patterns.ts`

Add a human-readable label:

```typescript
export const SEGMENT_LABELS: Record<SegmentType, string> = {
  intro: 'Intro',
  // ... existing labels ...
  'your-new-segment': 'Your New Segment',  // Title Case
  // ... rest of labels ...
};
```

**Naming convention:** Title Case, can include punctuation (e.g., "What Does That Mean?")

### 3. Add to SEGMENT_COLORS

**File:** `src/config/segment-patterns.ts`

Assign a color using Tailwind CSS color values:

```typescript
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  intro: '#6366f1', // indigo
  // ... existing colors ...
  'your-new-segment': '#10b981', // emerald-500
  // ... rest of colors ...
};
```

**Color guidelines:**
- Use hex color codes from Tailwind CSS palette
- Choose colors that stand out from existing segments
- Consider thematic associations (e.g., golden for angelic, dark red for demonic)
- Add a comment describing the color

**Common Tailwind colors:**
- `#ef4444` - red-500
- `#f59e0b` - amber-500
- `#10b981` - emerald-500
- `#06b6d4` - cyan-500
- `#8b5cf6` - violet-500
- `#ec4899` - pink-500
- `#fbbf24` - amber-400
- `#b91c1c` - red-700

### 4. Add Detection Patterns to SEGMENT_PATTERNS

**File:** `src/config/segment-patterns.ts`

Add regex patterns to automatically detect when this segment starts in transcripts:

```typescript
export const SEGMENT_PATTERNS: Record<
  Exclude<SegmentType, 'intro' | 'main-content'>,
  RegExp[]
> = {
  // ... existing patterns ...
  'your-new-segment': [
    /your new segment/i,
    /welcome to.*your new segment/i,
    /let'?s do.*your new segment/i,
  ],
  // ... rest of patterns ...
};
```

**Pattern guidelines:**
- All patterns are case-insensitive (use `/i` flag)
- First pattern: Direct mention of segment name
- Second pattern: Common intro phrases (e.g., "welcome to...", "coming up...")
- Add variations based on how hosts actually introduce the segment
- Listen to episodes to identify exact phrases

**Common intro patterns:**
- `/segment name/i` - Direct mention
- `/welcome to.*segment name/i` - Standard welcome
- `/let'?s do.*segment name/i` - Action-based intro
- `/coming up.*segment name/i` - Teaser
- `/segment.*segment name/i` - Meta reference

### 5. Verify TypeScript Compilation

Run type checking to ensure no errors:

```bash
bun run --bun tsc --noEmit src/config/segment-patterns.ts
```

### 6. Restart Tools Server

The segment verification UI loads metadata from the server, so restart it:

```bash
# Stop current server (Ctrl+C)
bun run src/scripts/tools-server.ts
```

Then open http://localhost:3000/segment-verification

## What Gets Updated

When you add a segment, it becomes available in:

1. **Segment Type Dropdown** - In the segment verification UI for manual editing
2. **Timeline Visualization** - Shows with assigned color in the visual timeline
3. **Automatic Detection** - Pipeline detects segment boundaries when processing transcripts
4. **Statistics** - Included in segment counts and analytics

## Testing

After adding a segment:

1. Open the Segment Verification UI
2. Select an episode
3. Verify the new segment type appears in the dropdown
4. Check that the color displays correctly in the timeline
5. If you have episodes with this segment, test automatic detection by reprocessing

## Example: Adding "Getting Angelic" and "Getting Demonic"

```typescript
// 1. SegmentType
export type SegmentType =
  | 'by-the-numbers'
  | 'getting-angelic'  // Added here
  | 'getting-demonic'
  | 'advertisement'

// 2. SEGMENT_LABELS
'getting-angelic': 'Getting Angelic',
'getting-demonic': 'Getting Demonic',

// 3. SEGMENT_COLORS
'getting-angelic': '#fbbf24', // amber-400 (golden/heavenly)
'getting-demonic': '#b91c1c', // red-700 (dark red)

// 4. SEGMENT_PATTERNS
'getting-angelic': [
  /getting angelic/i,
  /welcome to.*getting angelic/i,
],
'getting-demonic': [
  /getting demonic/i,
  /welcome to.*getting demonic/i,
],
```

## Notes

- **Intro** and **main-content** segments are special and don't need detection patterns
- Keep segment type names consistent (kebab-case, descriptive)
- Choose colors that work well with the dark UI theme (check contrast)
- Detection patterns can be refined over time as you learn how hosts introduce segments
- Use the "Learn Pattern" feature in the UI to add patterns from verified segments

## Workflow Summary

1. Read `src/config/segment-patterns.ts`
2. Add segment type to `SegmentType` union
3. Add human-readable label to `SEGMENT_LABELS`
4. Add color to `SEGMENT_COLORS`
5. Add detection patterns to `SEGMENT_PATTERNS`
6. Type check with `bun run --bun tsc --noEmit`
7. Inform user to restart tools server
