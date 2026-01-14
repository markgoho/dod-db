/**
 * URL utilities for DoD Tools
 */

// Get video ID from current URL path
export function getVideoIdFromUrl(): string | undefined {
  const path = globalThis.location.pathname;
  const match = /\/episode\/([^/]+)/.exec(path);
  return match?.[1];
}

// Get subpage from current URL path
export function getSubpageFromUrl(): string | undefined {
  const path = globalThis.location.pathname;
  const match = /\/episode\/[^/]+\/([^/]+)/.exec(path);
  return match?.[1];
}
