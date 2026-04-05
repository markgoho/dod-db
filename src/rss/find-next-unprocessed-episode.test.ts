import { describe, expect, test } from "bun:test";
import {
  rankCandidates,
  shouldPreferAudio,
} from "./find-next-unprocessed-episode.js";

describe("rankCandidates", () => {
  test("ranks exact normalized title matches ahead of weaker substring matches", () => {
    const item = {
      title: "Jezebel!",
      pubDate: "Sun, 10 Aug 2025 16:16:07 GMT",
      guid: "136166014",
    };

    const candidates = rankCandidates(item, [
      { id: "audio123", title: "Jezebel! Audio Podcast" },
      { id: "video123", title: "Jezebel!" },
      { id: "other123", title: "Completely Different Episode" },
    ]);

    expect(candidates).toEqual([
      {
        id: "video123",
        title: "Jezebel!",
        url: "https://www.youtube.com/watch?v=video123",
        score: 100,
        videoType: "unknown",
      },
      {
        id: "audio123",
        title: "Jezebel! Audio Podcast",
        url: "https://www.youtube.com/watch?v=audio123",
        score: 80,
        videoType: "unknown",
      },
    ]);
  });

  test("scores reverse substring matches below direct substring matches", () => {
    const item = {
      title: "Jezebel! Audio Podcast",
      pubDate: "Sun, 10 Aug 2025 16:16:07 GMT",
      guid: "136166014",
    };

    expect(
      rankCandidates(item, [
        { id: "video123", title: "Jezebel!" },
        { id: "audio123", title: "Jezebel! Audio Podcast Full Episode" },
      ]),
    ).toEqual([
      {
        id: "audio123",
        title: "Jezebel! Audio Podcast Full Episode",
        url: "https://www.youtube.com/watch?v=audio123",
        score: 80,
        videoType: "unknown",
      },
      {
        id: "video123",
        title: "Jezebel!",
        url: "https://www.youtube.com/watch?v=video123",
        score: 60,
        videoType: "unknown",
      },
    ]);
  });

  test("returns an empty list when nothing plausibly matches", () => {
    const item = {
      title: "Jezebel!",
      pubDate: "Sun, 10 Aug 2025 16:16:07 GMT",
      guid: "136166014",
    };

    expect(
      rankCandidates(item, [
        { id: "other123", title: "Another Episode Entirely" },
      ]),
    ).toEqual([]);
  });

  test("limits candidates to the top five and breaks ties alphabetically", () => {
    const item = {
      title: "Jezebel!",
      pubDate: "Sun, 10 Aug 2025 16:16:07 GMT",
      guid: "136166014",
    };

    expect(
      rankCandidates(item, [
        { id: "f", title: "Jezebel! F" },
        { id: "d", title: "Jezebel! D" },
        { id: "b", title: "Jezebel! B" },
        { id: "e", title: "Jezebel! E" },
        { id: "a", title: "Jezebel! A" },
        { id: "c", title: "Jezebel! C" },
      ]),
    ).toEqual([
      {
        id: "a",
        title: "Jezebel! A",
        url: "https://www.youtube.com/watch?v=a",
        score: 80,
        videoType: "unknown",
      },
      {
        id: "b",
        title: "Jezebel! B",
        url: "https://www.youtube.com/watch?v=b",
        score: 80,
        videoType: "unknown",
      },
      {
        id: "c",
        title: "Jezebel! C",
        url: "https://www.youtube.com/watch?v=c",
        score: 80,
        videoType: "unknown",
      },
      {
        id: "d",
        title: "Jezebel! D",
        url: "https://www.youtube.com/watch?v=d",
        score: 80,
        videoType: "unknown",
      },
      {
        id: "e",
        title: "Jezebel! E",
        url: "https://www.youtube.com/watch?v=e",
        score: 80,
        videoType: "unknown",
      },
    ]);
  });
});

describe("shouldPreferAudio", () => {
  test("prefers audio when there are no candidates", () => {
    expect(shouldPreferAudio([])).toBe(true);
  });

  test("prefers audio when no candidate is classified as real video", () => {
    expect(
      shouldPreferAudio([
        {
          id: "audio1",
          title: "Audio one",
          url: "https://www.youtube.com/watch?v=audio1",
          score: 80,
          videoType: "audio-only",
        },
        {
          id: "unknown1",
          title: "Unknown one",
          url: "https://www.youtube.com/watch?v=unknown1",
          score: 60,
          videoType: "unknown",
        },
      ]),
    ).toBe(true);
  });

  test("does not prefer audio when a real video candidate exists", () => {
    expect(
      shouldPreferAudio([
        {
          id: "video1",
          title: "Video one",
          url: "https://www.youtube.com/watch?v=video1",
          score: 100,
          videoType: "video",
        },
      ]),
    ).toBe(false);
  });
});
