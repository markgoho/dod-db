interface Match {
  start: number;
  end: number;
}

/**
 * Resolve overlapping matches by keeping the longest match at each position.
 * When two matches overlap, keep the one with more characters.
 */
export function resolveOverlaps<T extends Match>(matches: T[]): T[] {
  if (matches.length === 0) return [];

  const sorted = [...matches].toSorted((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  const resolved: T[] = [];
  let lastEnd = -1;

  for (const match of sorted) {
    if (match.start < lastEnd) {
      continue;
    }

    resolved.push(match);
    lastEnd = match.end;
  }

  return resolved;
}
