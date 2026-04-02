import { describe, expect, test } from "bun:test";
import { parsePatreonRss } from "./parse-patreon-rss.js";

describe("parsePatreonRss", () => {
  test("parses RSS items with optional itunes episode", () => {
    const xml = `<?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title><![CDATA[Bibliomancy! The Biblical Dance with the Devil?]]></title>
            <pubDate>Sun, 01 Jun 2025 15:12:05 GMT</pubDate>
            <guid>130431711</guid>
            <itunes:episode>116</itunes:episode>
            <enclosure url="https://cdn.example.com/audio.mp3" />
          </item>
          <item>
            <title>Episode 113 After Party</title>
            <pubDate>Sun, 01 Jun 2025 15:14:58 GMT</pubDate>
            <guid>130431712</guid>
          </item>
        </channel>
      </rss>`;

    expect(parsePatreonRss(xml)).toEqual([
      {
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "130431711",
        itunesEpisode: 116,
        enclosureUrl: "https://cdn.example.com/audio.mp3",
      },
      {
        title: "Episode 113 After Party",
        pubDate: "Sun, 01 Jun 2025 15:14:58 GMT",
        guid: "130431712",
      },
    ]);
  });

  test("returns an empty array when there are no items", () => {
    const xml = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    expect(parsePatreonRss(xml)).toEqual([]);
  });
});
