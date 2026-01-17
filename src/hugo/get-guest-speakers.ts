import { HOSTS } from "./shared.js";

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns guest names in the order they appear.
 */
export function getGuestSpeakers(speakers: string[] | undefined): string[] {
  if (!speakers) return [];
  return speakers.filter(speaker => !HOSTS.has(speaker));
}
