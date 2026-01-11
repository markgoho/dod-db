# Transcript Correction Learning Workflow

This document explains how the two-pass correction system learns and improves over time.

## Overview

The correction system has a **learning feedback loop** where corrections made by the LLM are identified and can be added to the deterministic list, making future corrections faster and cheaper.

## The Learning Loop

```
┌─────────────────────────────────────────────────────────┐
│  1. Original Transcript                                  │
│     "The Torrah was written..."                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Pass 1: Deterministic + LLM Correction              │
│     - Deterministic: (no match for "Torrah")            │
│     - LLM corrects: "The **Torah** was written..."      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Pass 2: Review & Confirm                            │
│     - Confirms "Torah" is correct                       │
│     - Removes markers: "The Torah was written..."       │
│     - Suggests: "Torah occurred 5 times"                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. Manual Review                                        │
│     - Check original: "Torrah" → "Torah"                │
│     - Add to src/config/corrections.ts:                 │
│       [["Torrah", "Tora"], "Torah"]                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  5. Next Run: Deterministic Fix                         │
│     - "Torrah" instantly corrected to "Torah"           │
│     - No LLM needed! (faster & cheaper)                 │
└─────────────────────────────────────────────────────────┘
```

## Step-by-Step Workflow

### 1. Run Correction on Episode

```bash
bun run src/scripts/process-transcript.ts
```

The output will show:
```
Pass 1 complete: 17 deterministic, 169 marked by LLM
Pass 2 complete: 169 confirmed, 0 revised

💡 Suggested additions to deterministic corrections:
   (Add frequently occurring corrections to src/config/corrections.ts)

   "Torah" occurred 5 time(s)
   "Bereshit" occurred 3 time(s)
   "raqia" occurred 2 time(s)
   ...
```

### 2. Find Original Terms

Use the helper script to see what the original incorrect terms were:

```bash
bun run src/scripts/suggest-corrections.ts "data/transcripts/episode-1-original.txt" "Torah"
```

Output:
```
Suggested correction rule for "Torah":

  [["Torrah", "Tora"], "Torah"],

Found 2 variant(s):
  torrah → Torah
  tora → Torah
```

### 3. Add to Deterministic List

Edit `src/config/corrections.ts`:

```typescript
export const globalCorrections: CorrectionRule[] = [
  // ... existing rules ...

  // New rules learned from Episode 1
  [['Torrah', 'Tora'], 'Torah'],
  [['Berashit', 'Beresheet'], 'Bereshit'],
  [['rakeea', 'rakea'], 'raqia'],
];
```

### 4. Next Episode is Faster

On the next episode:
- "Torrah" → instantly corrected to "Torah" (deterministic)
- No LLM call needed for this correction
- Cheaper and faster!

## Benefits

1. **Progressive Learning**: Each episode improves the system
2. **Cost Reduction**: More deterministic = fewer LLM calls
3. **Consistency**: Same mistakes always corrected the same way
4. **Speed**: Deterministic corrections are instant

## Best Practices

### High-Priority Additions

Add corrections that:
- **Occur frequently** (5+ times per episode)
- **Are consistent** (same correction every time)
- **Are proper nouns** (names, places, books)
- **Are technical terms** (Hebrew/Greek/Aramaic words)

### Low-Priority Additions

Don't add:
- **One-off corrections** (occur only once)
- **Context-dependent** (different correction depending on context)
- **Subjective edits** (style changes, not factual corrections)

## Example Correction Rules

```typescript
// Host names (very common, always wrong)
[['Dan McLellan', 'Dan McLellen'], 'Dan McClellan'],

// Biblical books (common transcription errors)
[['Septuigent', 'Septugiant'], 'Septuagint'],
[['Deuteronomist'], 'Deuteronomy'],

// Hebrew terms (consistent transliteration)
[['Torrah', 'Tora'], 'Torah'],
[['Berashit', 'Beresheet'], 'Bereshit'],
[['rakeea', 'rakea'], 'raqia'],

// Greek terms
[['LXX'], 'Septuagint'],

// Scholars (consistent names)
[['Frank More Cross'], 'Frank Moore Cross'],
```

## Monitoring Progress

Track improvement over time:

| Episode | Deterministic | LLM Marked | Cost Savings |
|---------|--------------|------------|--------------|
| 1       | 17           | 169        | 9% deterministic |
| 2       | 45           | 120        | 27% deterministic |
| 3       | 78           | 85         | 48% deterministic |
| 10      | 150          | 20         | 88% deterministic |

**Goal**: Get to 80%+ deterministic corrections for maximum efficiency.

## Automation Ideas (Future)

Potential enhancements:
1. **Auto-suggest script** that diffs original vs corrected and outputs correction rules
2. **Frequency threshold** - auto-add corrections that occur 10+ times
3. **ML-based learning** - train a model on correction patterns
4. **Per-podcast configs** - different rules for different podcast series

## Summary

The learning workflow transforms the correction system from:
- **Initial**: Slow, expensive, LLM-heavy
- **After learning**: Fast, cheap, mostly deterministic

Each episode you process improves the system for all future episodes!
