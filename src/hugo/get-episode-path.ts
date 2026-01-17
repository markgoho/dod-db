/**
 * Get the Hugo content file path for an episode.
 */

import * as path from "node:path";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { getGuestSpeakers } from "./get-guest-speakers.js";
import { HUGO_CONTENT_DIR } from "./shared.js";
import { slugifyTitle } from "./slugify-title.js";

/**
 * Get the output path for an episode's Hugo content file.
 * Returns the directory path with slug-based naming.
 */
export function getEpisodeOutputPath(
  video: ProcessedVideo,
  cleanTitle: string,
): string {
  const guests = getGuestSpeakers(video.speakers);
  const titleSlug = slugifyTitle(cleanTitle);
  const guestSlug =
    guests.length > 0 ? `-with-${slugifyTitle(guests.join("-and-"))}` : "";
  const outputDir = path.join(
    HUGO_CONTENT_DIR,
    `${video.episodeNumber}-${titleSlug}${guestSlug}`,
  );
  return path.join(outputDir, "index.md");
}
