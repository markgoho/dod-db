import { describe, expect, test } from "bun:test";
import { baseUrl } from "./render-cards.js";

describe("baseUrl", () => {
  test("defaults to the main checkout's server on 1313", () => {
    expect(baseUrl([], false)).toBe("http://localhost:1313");
  });

  test("takes --base and drops a trailing slash", () => {
    expect(baseUrl(["x", "--base=http://localhost:1360/"], true)).toBe(
      "http://localhost:1360",
    );
  });

  test("a worktree without --base refuses rather than photograph 1313", () => {
    expect(() => baseUrl([], true)).toThrow(
      "This is a git worktree: run `hugo server -p <port>` from its hugo/ and pass --base=http://localhost:<port>.",
    );
  });
});
