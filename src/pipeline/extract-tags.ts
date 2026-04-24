/**
 * Tag extraction orchestrator using hybrid deterministic + LLM approach.
 *
 * Tier 1: Deterministic matching of known vocabulary (instant, free)
 * Tier 2: LLM discovery of new high-value tags (5+ mentions)
 * Tier 3: Manual learning loop (promote discoveries to vocabulary)
 */

import type { TagCategory } from "../config/tag-vocabulary.js";
import type { EpisodeTag } from "../storage/processed-videos.js";
import { sortTags } from "../utils/tag-utils.js";
import { extractTagsDeterministic } from "./extract-tags-deterministic.js";
import { extractTagsLlm } from "./extract-tags-llm.js";

/**
 * Extract tags from corrected transcript using hybrid approach.
 *
 * @param correctedTranscript - The corrected transcript text
 * @param options - Optional configuration
 * @param options.skipLlm - If true, skip LLM discovery (only use deterministic matching)
 * @param options.categories - If provided, LLM will only discover tags in these categories
 * @param options.enableLlmVerification - If true, use LLM to verify ambiguous tag matches
 * @param options.episodeNumber - If provided, newly discovered tags will be tagged with this episode number
 * @returns Array of Episode Tag objects with canonical names and mention counts
 */
export async function extractTags(
  correctedTranscript: string,
  options: {
    skipLlm?: boolean;
    categories?: TagCategory[];
    enableLlmVerification?: boolean;
    episodeNumber?: number;
  } = {},
): Promise<EpisodeTag[]> {
  console.log("Extracting tags from transcript...");

  // Tier 1: Deterministic matching (all known vocabulary)
  console.log("  Phase 1: Deterministic vocabulary matching...");
  const deterministicTags = await extractTagsDeterministic(
    correctedTranscript,
    {
      enableLlmVerification: options.enableLlmVerification,
    },
  );
  console.log(`  ✓ Found ${deterministicTags.length} known tags`);

  // Tier 2: LLM discovery (new terms with 5+ mentions) - optional
  // NOTE: Discovered tags are NOT included in final results (only reported as suggestions)
  // They must be reviewed and marked as 'accepted' before being used in future processing
  if (options.skipLlm) {
    console.log("  Phase 2: Skipped (skipLlm option enabled)");
  } else {
    const categoryInfo = options.categories
      ? ` [${options.categories.join(", ")} only]`
      : "";
    console.log(
      `  Phase 2: LLM discovery of new tags (5+ mentions)${categoryInfo}...`,
    );
    const discoveredTags = await extractTagsLlm(
      correctedTranscript,
      deterministicTags,
      options.categories,
      options.episodeNumber,
    );
    console.log(`  ✓ Discovered ${discoveredTags.length} new potential tags`);

    // Report discovered tags as vocabulary suggestions
    if (discoveredTags.length > 0) {
      console.log("\n📋 NEW TAG SUGGESTIONS (not in vocabulary):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      for (const tag of discoveredTags.toSorted(
        (a, b) => b.mentions - a.mentions,
      )) {
        console.log(`  • ${tag.tag} (${tag.mentions} mentions)`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("💡 Consider adding these to src/config/tag-vocabulary.ts");
      console.log(
        "   or use the Web UI: bun run src/scripts/tag-vocabulary-ui.ts\n",
      );
    }
  }

  // Only return deterministic tags (LLM-discovered tags are just suggestions)
  const allTags = deterministicTags;

  // Sort by mention count (descending), then alphabetically for stable ordering
  sortTags(allTags);

  console.log(`✓ Tag extraction complete: ${allTags.length} total tags`);

  return allTags;
}
