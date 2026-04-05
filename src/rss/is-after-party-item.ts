import type { PodcastRssItem } from "./patreon-rss-item.js";

const NON_CANONICAL_PATREON_PATTERNS = [
  /after\s*-?\s*party/i,
  /\bpatrons?\s*-?\s*only\b/i,
  /\bmembers?\s+plus\s+content\b/i,
  /\battention\s+all\s+patrons\b/i,
];

export function isAfterPartyItem(item: PodcastRssItem): boolean {
  return NON_CANONICAL_PATREON_PATTERNS.some(pattern =>
    pattern.test(item.title),
  );
}
