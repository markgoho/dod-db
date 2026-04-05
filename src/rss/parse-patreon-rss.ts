import {
  PodcastRssItemSchema,
  type PodcastRssItem,
} from "./patreon-rss-item.js";

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function extractTag(block: string, tag: string): string | undefined {
  const match = new RegExp(
    String.raw`<${tag}[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/${tag}>`,
    "i",
  ).exec(block);

  if (!match?.[1]) {
    return undefined;
  }

  return decodeXmlEntities(match[1]);
}

function extractAttribute(
  block: string,
  tag: string,
  attribute: string,
): string | undefined {
  const match = new RegExp(
    String.raw`<${tag}[^>]*\s${attribute}="([^"]+)"[^>]*>`,
    "i",
  ).exec(block);

  if (!match?.[1]) {
    return undefined;
  }

  return decodeXmlEntities(match[1]);
}

export function parsePodcastRss(xml: string): PodcastRssItem[] {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks.map(block =>
    PodcastRssItemSchema.parse({
      title: extractTag(block, "title"),
      pubDate: extractTag(block, "pubDate"),
      guid: extractTag(block, "guid"),
      enclosureUrl: extractAttribute(block, "enclosure", "url"),
      itunesEpisode: (() => {
        const value = extractTag(block, "itunes:episode");
        if (!value) {
          return;
        }

        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
      })(),
    }),
  );
}

export const parsePatreonRss = parsePodcastRss;
