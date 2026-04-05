/**
 * Extract the clean episode title from the full video title.
 */

/**
 * Extract the clean episode title from the full video title.
 * Handles formats like:
 * - 'Episode 1 (April 8, 2023), "In the Beginning"' -> 'In the Beginning'
 * - 'Episode 10 (June 12, 2023): "Adam and Steve..."' -> 'Adam and Steve...'
 * - 'Apostlepalooza!' -> 'Apostlepalooza!'
 * - 'Christian Nationalism Ain't Christian: With Andrew Whitehead' -> 'Christian Nationalism Ain't Christian'
 * - 'Episode 47, Introducing History Daily' -> 'Introducing History Daily'
 */
export function extractCleanTitle(fullTitle: string): string {
  // Try to extract quoted portion
  const quotedMatch = /"([^"]+)"/.exec(fullTitle);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  // No quotes - clean up the title
  let title = fullTitle;

  // Strip leading "Episode N," or "Episode N:" patterns
  title = title.replace(/^Episode\s+\d+[,:]\s*/i, "");

  // Strip trailing guest suffixes like ": With Name", "w/ Name", or
  // bare "with Name" when the tail clearly looks like a person name.
  // (guest names are added programmatically from speakers array)
  title = title.replace(
    /(?:[:!,?-]\s*with\s+[\p{L}\w.'’ -]+|\s+w\/\s+[\p{L}\w.'’ -]+|\s+with\s+(?:Prof\.?|Dr\.?)?\s*[A-Z][\p{L}'’.-]+(?:\s+[A-Z][\p{L}'’.-]+){1,})$/iu,
    "",
  );

  return title.trim();
}
