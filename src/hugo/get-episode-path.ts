/**
 * Get the Hugo content file path for an episode.
 */

import * as path from "node:path";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { getRawGuestSpeakers } from "./get-guest-speakers.js";
import { HUGO_CONTENT_DIR } from "./shared.js";
import { slugifyTitle } from "./slugify-title.js";

const LEADING_GUEST_HONORIFIC =
  /^(?:rev\.?|dr\.?|prof\.?|professor|rabbi|pastor)\s+/i;

function stripGuestHonorific(name: string): string {
  return name.replace(LEADING_GUEST_HONORIFIC, "").trim();
}

/**
 * Get the output path for an episode's Hugo content file.
 * Returns the directory path with slug-based naming.
 */
export function getEpisodeOutputPath(
  video: ProcessedVideo,
  cleanTitle: string,
): string {
  const guests = getRawGuestSpeakers(video.speakers).map(stripGuestHonorific);
  const titleSlug = slugifyTitle(cleanTitle);
  const guestSlug =
    guests.length > 0 ? `-with-${slugifyTitle(guests.join("-and-"))}` : "";
  const outputDir = path.join(
    HUGO_CONTENT_DIR,
    `${video.episodeNumber}-${titleSlug}${guestSlug}`,
  );
  return path.join(outputDir, "index.md");
}
