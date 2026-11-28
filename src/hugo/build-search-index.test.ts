import { describe, expect, test } from "bun:test";
import {
  extractTimelineEntries,
  timelineEntryDocument,
} from "./build-search-index.js";

const page = `<!doctype html><html><body>
<header><a href="/">Site</a></header>
<h1 class="page-hero__title">Timeline</h1>
<ol class="timeline-axis" data-pagefind-ignore>
  <li class="timeline-era" id="era-1"><h2>Era</h2>
    <ol>
      <li class="timeline-entry" id="flood" data-entry-url="/timeline/flood">
        <div class="timeline-entry__card panel">
          <h3 class="timeline-entry__title"><span>Noah’s
            Flood</span></h3>
          <ul><li>nested cite</li></ul>
          <p>Scholars read two sources.</p>
        </div>
      </li>
      <li class="timeline-entry timeline-entry--moved" id="flood-tradition"
        data-entry-url="/timeline/flood" data-pagefind-ignore>
        <p>Tradition marker</p>
      </li>
    </ol>
  </li>
</ol>
<ul class="timeline-unplaced" data-pagefind-ignore>
  <li class="timeline-entry" id="job" data-entry-url=/timeline/job><h3 class=timeline-entry__title>Job &amp; "friends"</h3></li>
</ul>
</body></html>`;

describe("extractTimelineEntries", () => {
  const { timelineTitle, entries } = extractTimelineEntries(page);

  test("reads the Timeline's title from its h1", () => {
    expect(timelineTitle).toBe("Timeline");
  });

  test("takes each entry row, placed or not, and skips Tradition markers", () => {
    expect(entries.map(entry => entry.url)).toEqual([
      "/timeline/flood",
      "/timeline/job",
    ]);
  });

  test("titles come from the card heading, whitespace collapsed and decoded", () => {
    expect(entries.map(entry => entry.title)).toEqual([
      "Noah’s Flood",
      'Job & "friends"',
    ]);
  });

  test("markup is the whole row, nested lists included", () => {
    expect(entries[1]?.markup).toBe(
      '<li class="timeline-entry" id="job" data-entry-url=/timeline/job><h3 class=timeline-entry__title>Job &amp; "friends"</h3></li>',
    );
    const flood = entries[0]?.markup ?? "";
    expect(flood.slice(0, 71)).toBe(
      '<li class="timeline-entry" id="flood" data-entry-url="/timeline/flood">',
    );
    expect(flood.endsWith("</p>\n        </div>\n      </li>")).toBe(true);
  });

  test("an entry without a title fails loudly", () => {
    const bad = `<h1>Timeline</h1><ol><li data-entry-url="/timeline/x" id="x"><p>no title</p></li></ol>`;
    expect(() => extractTimelineEntries(bad)).toThrow("x has no title");
  });

  test("a page without an h1 fails loudly", () => {
    expect(() => extractTimelineEntries("<p>nothing</p>")).toThrow("no <h1>");
  });
});

describe("timelineEntryDocument", () => {
  test("makes the row the only indexed body, titled and filtered as Timeline", () => {
    const html = timelineEntryDocument(
      {
        url: "/timeline/job",
        title: 'Job & "friends"',
        markup: "<li>Job</li>",
      },
      "Timeline",
    );
    expect(html).toBe(
      '<!doctype html><html lang="en"><head><title>Timeline · Job &amp; &quot;friends&quot;</title></head><body><ol data-pagefind-body data-pagefind-meta="title:Timeline · Job &amp; &quot;friends&quot;" data-pagefind-filter="type:Timeline"><li>Job</li></ol></body></html>',
    );
  });
});
