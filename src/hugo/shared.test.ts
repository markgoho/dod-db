/**
 * Unit tests for shared Hugo utilities.
 */

import { describe, expect, test } from "bun:test";
import { getEpisodeOutputPath } from "./get-episode-path.js";
import { getGuestSpeakers, getRawGuestSpeakers } from "./get-guest-speakers.js";
import { parseTranscriptLine } from "./parse-transcript-line.js";
import { slugifyTitle } from "./slugify-title.js";

describe("slugifyTitle", () => {
  test("converts title to lowercase", () => {
    const input = "The End(s) of Monotheism";
    expect(slugifyTitle(input)).toBe("the-ends-of-monotheism");
  });

  test("removes apostrophes", () => {
    const input = "God's Wife";
    expect(slugifyTitle(input)).toBe("gods-wife");
  });

  test("removes exclamation marks", () => {
    const input = "Ehrmageddon!";
    expect(slugifyTitle(input)).toBe("ehrmageddon");
  });

  test("replaces spaces with hyphens", () => {
    const input = "Multiple Word Title";
    expect(slugifyTitle(input)).toBe("multiple-word-title");
  });

  test("collapses multiple hyphens", () => {
    const input = "Title   With   Spaces";
    expect(slugifyTitle(input)).toBe("title-with-spaces");
  });
});

describe("getGuestSpeakers", () => {
  test("filters out hosts", () => {
    const speakers = ["Dan McClellan", "Andrew Whitehead", "Dan Beecher"];
    expect(getGuestSpeakers(speakers)).toEqual(["Andrew Whitehead"]);
  });

  test("returns empty array if no speakers", () => {
    expect(getGuestSpeakers([])).toEqual([]);
  });

  test("returns empty array when speakers is undefined", () => {
    // Simulate a variable that might be undefined (e.g., from optional property)
    const maybeVideo: { speakers?: string[] } = {};
    expect(getGuestSpeakers(maybeVideo.speakers)).toEqual([]);
  });

  test("returns all speakers if no hosts present", () => {
    const speakers = ["Guest One", "Guest Two"];
    expect(getGuestSpeakers(speakers)).toEqual(["Guest One", "Guest Two"]);
  });

  test("canonicalizes known guest aliases", () => {
    const speakers = ["Dan McClellan", "David Burnett", "Dan Beecher"];
    expect(getGuestSpeakers(speakers)).toEqual(["David A. Burnett"]);
  });
});

describe("getRawGuestSpeakers", () => {
  test("preserves original guest names for path generation", () => {
    const speakers = ["Dan McClellan", "David Burnett", "Dan Beecher"];
    expect(getRawGuestSpeakers(speakers)).toEqual(["David Burnett"]);
  });

  test("preserves guest honorifics in display names", () => {
    const speakers = ["Dan McClellan", "Rev Karla Kamstra", "Dan Beecher"];
    expect(getRawGuestSpeakers(speakers)).toEqual(["Rev Karla Kamstra"]);
  });
});

describe("getEpisodeOutputPath", () => {
  test("strips guest honorifics from episode path slugs", () => {
    const video = {
      videoId: "abc123",
      title: "Test Episode",
      publishedAt: "2024-01-15T10:00:00Z",
      processedAt: "2024-01-15T12:00:00Z",
      transcriptPath: "data/transcripts/2024-01-15-test-episode.txt",
      episodeNumber: 1,
      speakers: ["Dan McClellan", "Rev Karla Kamstra", "Dan Beecher"],
    };

    expect(getEpisodeOutputPath(video, "Test Episode")).toBe(
      "hugo/content/episodes/1-test-episode-with-karla-kamstra/index.md",
    );
  });
});

describe("parseTranscriptLine", () => {
  test("parses line with milliseconds", () => {
    const line = "[00:05:23.456] Dan McClellan: Hello world";
    const result = parseTranscriptLine(line);

    expect(result).toBeDefined();
    expect(result?.timestamp).toBe("00:05:23");
    expect(result?.totalSeconds).toBe(323.456);
    expect(result?.speaker).toBe("Dan McClellan");
    expect(result?.text).toBe("Hello world");
  });

  test("parses line without milliseconds", () => {
    const line = "[00:05:23] Dan McClellan: Hello world";
    const result = parseTranscriptLine(line);

    expect(result).toBeDefined();
    expect(result?.timestamp).toBe("00:05:23");
    expect(result?.totalSeconds).toBe(323);
    expect(result?.speaker).toBe("Dan McClellan");
    expect(result?.text).toBe("Hello world");
  });

  test("returns undefined for invalid format", () => {
    const line = "This is not a transcript line";
    expect(parseTranscriptLine(line)).toBeUndefined();
  });
});
