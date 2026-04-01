import { getBookByAnyName } from "../config/get-book-by-any-name.js";

function normalizeCandidate(candidate: string): string {
  return candidate.trim().replaceAll(/\s+/g, " ");
}

function stripReferenceSuffix(candidate: string): string {
  return candidate.replace(/\s+\d+(?:(?::\d+(?:-\d+)?)|(?:-\d+))?$/, "");
}

function stripBookPrefixes(candidate: string): string {
  return candidate.replace(/^(?:gospel|book) of\s+/i, "");
}

function matchesBook(candidate: string): boolean {
  return getBookByAnyName(candidate) !== undefined;
}

export function isScriptureTag(candidate: string): boolean {
  const normalized = normalizeCandidate(candidate);
  if (!normalized) {
    return false;
  }

  const normalizedWithoutPrefix = stripBookPrefixes(normalized);
  if (matchesBook(normalized) || matchesBook(normalizedWithoutPrefix)) {
    return true;
  }

  const stripped = stripReferenceSuffix(normalizedWithoutPrefix);
  if (stripped === normalizedWithoutPrefix) {
    return false;
  }

  return matchesBook(stripped);
}
