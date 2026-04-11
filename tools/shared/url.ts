/**
 * URL utilities for DoD Tools
 */

// Get video ID from current URL
export function getVideoIdFromUrl(): string | undefined {
  return new URLSearchParams(globalThis.location.search).get("id") || undefined;
}

// Get subpage from current URL path
export function getSubpageFromUrl(): string | undefined {
  const parts = globalThis.location.pathname.split("/").filter(Boolean);
  const lastPart = parts.at(-1);
  return lastPart === "index" ? undefined : lastPart;
}
