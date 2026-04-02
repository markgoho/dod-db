import type { PatreonRssItem } from "./patreon-rss-item.js";

const AFTER_PARTY_PATTERN = /after\s*-?\s*party/i;

export function isAfterPartyItem(item: PatreonRssItem): boolean {
  return AFTER_PARTY_PATTERN.test(item.title);
}
