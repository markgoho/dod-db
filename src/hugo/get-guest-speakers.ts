import { GUEST_NAME_ALIASES, HOSTS } from "./shared.js";

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns original guest names in the order they appear.
 */
export function getRawGuestSpeakers(speakers: string[] | undefined): string[] {
  if (!speakers) return [];
  return speakers.filter(speaker => !HOSTS.has(speaker));
}

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns canonical guest names in the order they appear.
 */
export function getGuestSpeakers(speakers: string[] | undefined): string[] {
  return getRawGuestSpeakers(speakers).map(
    speaker => GUEST_NAME_ALIASES.get(speaker) ?? speaker,
  );
}
