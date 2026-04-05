import { describe, expect, test } from "bun:test";
import { isAfterPartyItem } from "./is-after-party-item.js";

describe("isAfterPartyItem", () => {
  test("matches non-canonical Patreon-only titles", () => {
    expect(
      isAfterPartyItem({
        title: "Episode 113 After Party",
        pubDate: "Sun, 01 Jun 2025 15:14:58 GMT",
        guid: "1",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "Episode 110 After-Party",
        pubDate: "Sun, 11 May 2025 00:00:00 GMT",
        guid: "2",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "*PATRONS ONLY!!!*",
        pubDate: "Sun, 04 Jun 2023 19:45:46 GMT",
        guid: "3",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "Members PLUS Content",
        pubDate: "Sun, 05 Nov 2023 18:20:43 GMT",
        guid: "4",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "Patrons-only! (Because we love you)",
        pubDate: "Sun, 11 Jun 2023 16:46:47 GMT",
        guid: "5",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "Abort! Abort! It's the patrons-only stuff!",
        pubDate: "Mon, 11 Sep 2023 00:09:17 GMT",
        guid: "6",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "Angelic Patrons-Only Content",
        pubDate: "Mon, 16 Oct 2023 06:05:01 GMT",
        guid: "7",
      }),
    ).toBe(true);

    expect(
      isAfterPartyItem({
        title: "ATTENTION ALL PATRONS!",
        pubDate: "Sun, 05 Nov 2023 18:24:55 GMT",
        guid: "8",
      }),
    ).toBe(true);
  });

  test("does not match main episodes", () => {
    expect(
      isAfterPartyItem({
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "3",
      }),
    ).toBe(false);
  });
});
