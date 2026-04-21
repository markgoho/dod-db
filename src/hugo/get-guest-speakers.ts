import { GUEST_NAME_ALIASES, HOSTS } from "./shared.js";

const LEADING_GUEST_HONORIFIC =
  /^(?:rev\.?|dr\.?|prof\.?|professor|rabbi|pastor)\s+/i;

function stripGuestHonorific(name: string): string {
  return name.replace(LEADING_GUEST_HONORIFIC, "").trim();
}

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
  return getRawGuestSpeakers(speakers).map(speaker => {
    const strippedSpeaker = stripGuestHonorific(speaker);
    return GUEST_NAME_ALIASES.get(strippedSpeaker) ?? strippedSpeaker;
  });
}
