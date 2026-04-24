import { getGuestSpeakers } from "../hugo/get-guest-speakers.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { parseHugoFile } from "../utils/parse-hugo-file.js";
import { titleToSlug } from "../utils/title-to-slug.js";

interface ParsedArguments {
  guestName: string;
}

interface ExistingGuestPage {
  path: string;
  frontmatter?: Record<string, unknown>;
}

interface GuestEpisode {
  episodeNumber: number;
  title: string;
  date: string;
  slug: string;
}

interface GatheredGuestContext {
  guestName: string;
  guestSlug: string;
  episodeCount: number;
  episodes: GuestEpisode[];
  existingPage?: ExistingGuestPage;
}

function parseArguments(argv: string[]): ParsedArguments {
  const guestName = argv.find(argument => !argument.startsWith("--"))?.trim();

  if (!guestName) {
    throw new TypeError(
      "Usage: bun run src/scripts/gather-guest-page.ts <guest-name>",
    );
  }

  return { guestName };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function matchesGuest(
  video: ProcessedVideo,
  normalizedGuestName: string,
): boolean {
  const canonicalGuests = getGuestSpeakers(video.speakers);
  return canonicalGuests.some(
    name => normalizeName(name) === normalizedGuestName,
  );
}

async function loadExistingPage(
  guestSlug: string,
): Promise<ExistingGuestPage | undefined> {
  const path = `hugo/content/guests/${guestSlug}/_index.md`;

  try {
    const { frontmatter } = await parseHugoFile(path);
    return {
      path,
      frontmatter: frontmatter as unknown as Record<string, unknown>,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return undefined;
    }

    throw error;
  }
}

function toGuestEpisode(video: ProcessedVideo): GuestEpisode {
  const episodeNumber = video.episodeNumber;
  if (!episodeNumber) {
    throw new Error(`Missing episode number for ${video.title}`);
  }

  return {
    episodeNumber,
    title: video.title,
    date: video.publishedAt,
    slug: `episodes/${episodeNumber}`,
  };
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const guestSlug = titleToSlug(args.guestName);
    const normalizedGuestName = normalizeName(args.guestName);
    const videos = await loadProcessedVideos();
    const episodes = videos
      .filter(video => video.episodeNumber !== undefined)
      .filter(video => matchesGuest(video, normalizedGuestName))
      .toSorted((left, right) => {
        const leftNumber = left.episodeNumber ?? 0;
        const rightNumber = right.episodeNumber ?? 0;
        return rightNumber - leftNumber;
      })
      .map(toGuestEpisode);
    const existingPage = await loadExistingPage(guestSlug);

    const result: GatheredGuestContext = {
      guestName: args.guestName,
      guestSlug,
      episodeCount: episodes.length,
      episodes,
      existingPage,
    };

    console.log(JSON.stringify(result, undefined, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
