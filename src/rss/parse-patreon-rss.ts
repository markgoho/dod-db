import {
  PatreonRssItemSchema,
  type PatreonRssItem,
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

export function parsePatreonRss(xml: string): PatreonRssItem[] {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks.map(block =>
    PatreonRssItemSchema.parse({
      title: extractTag(block, "title"),
      pubDate: extractTag(block, "pubDate"),
      guid: extractTag(block, "guid"),
      enclosureUrl: extractAttribute(block, "enclosure", "url"),
      itunesEpisode: (() => {
        const value = extractTag(block, "itunes:episode");
        return value ? Number.parseInt(value, 10) : undefined;
      })(),
    }),
  );
}
