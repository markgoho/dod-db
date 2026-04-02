import { describe, expect, test } from "bun:test";
import { isAfterPartyItem } from "./is-after-party-item.js";

describe("isAfterPartyItem", () => {
  test("matches after party titles", () => {
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
