import { slugifyTitle } from "../hugo/slugify-title.js";

/**
 * Manual episode number corrections for known bad platform metadata.
 */
export const EPISODE_NUMBER_OVERRIDES: Record<string, number> = {
  [slugifyTitle("Bibliomancy! The Biblical Dance with the Devil?")]: 113,
};
