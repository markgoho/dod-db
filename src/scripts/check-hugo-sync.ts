/**
 * Diagnostic script to check if Hugo episode frontmatter is in sync with processed-videos.json.
 * Reports episodes where tags in processed-videos.json don't match Hugo frontmatter.
 *
 * Usage:
 *   bun run src/scripts/check-hugo-sync.ts
 */

import { tagVocabulary } from "../config/tag-vocabulary.js";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { getEpisodeOutputPath } from "../hugo/get-episode-path.js";
import { getProcessedVideosWithNumbers } from "../storage/get-processed-videos-with-numbers.js";
import { parseHugoFile } from "../utils/parse-hugo-file.js";
import { titleToSlug } from "../utils/title-to-slug.js";

async function loadTopicSlugs(): Promise<Set<string>> {
  const topicSlugs = new Set<string>();

  for await (const path of new Bun.Glob("*/_index.md").scan({
    cwd: new URL("../../hugo/content/topics/", import.meta.url).pathname,
  })) {
    const slug = path.split("/")[0];
    if (slug) {
      topicSlugs.add(slug);
    }
  }

  return topicSlugs;
}

function buildCanonicalNameBySlug(): Map<string, string> {
  return new Map(
    tagVocabulary.map(entry => [titleToSlug(entry.canonical), entry.canonical]),
  );
}

function deriveExpectedTaxonomies(
  rawTags: string[],
  topicSlugs: Set<string>,
  canonicalNameBySlug: Map<string, string>,
): { topics: string[]; tags: string[] } {
  const topics: string[] = [];
  const tags: string[] = [];

  for (const tag of rawTags) {
    const slug = titleToSlug(tag);
    if (topicSlugs.has(slug)) {
      topics.push(canonicalNameBySlug.get(slug) ?? tag);
    } else {
      tags.push(tag);
    }
  }

  return {
    topics: topics.toSorted(),
    tags: tags.toSorted(),
  };
}

async function checkSync(): Promise<void> {
  console.log("🔍 Checking Hugo frontmatter sync...\n");

  const [videos, topicSlugs] = await Promise.all([
    getProcessedVideosWithNumbers(),
    loadTopicSlugs(),
  ]);
  const canonicalNameBySlug = buildCanonicalNameBySlug();

  let totalEpisodes = 0;
  let inSync = 0;
  let mismatched = 0;
  let missingTags = 0;
  let extraTags = 0;
  let missingTopics = 0;
  let extraTopics = 0;

  for (const video of videos) {
    if (video.episodeNumber === undefined) {
      continue;
    }

    totalEpisodes++;

    const rawTags = (video.tags || []).map(t => t.tag);
    const expected = deriveExpectedTaxonomies(
      rawTags,
      topicSlugs,
      canonicalNameBySlug,
    );

    const cleanTitle = extractCleanTitle(video.title);
    const hugoPath = getEpisodeOutputPath(video, cleanTitle);
    const hugoFile = Bun.file(hugoPath);

    if (!(await hugoFile.exists())) {
      console.log(`❌ Episode ${video.episodeNumber}: Hugo file not found`);
      mismatched++;
      continue;
    }

    const { frontmatter } = await parseHugoFile(hugoPath);
    const actualTopics = [...(frontmatter.topics ?? [])].toSorted();
    const actualTags = [...(frontmatter.tags ?? [])].toSorted();

    const expectedTopicSet = new Set(expected.topics);
    const actualTopicSet = new Set(actualTopics);
    const expectedTagSet = new Set(expected.tags);
    const actualTagSet = new Set(actualTags);

    const missingDerivedTopics = expected.topics.filter(
      topic => !actualTopicSet.has(topic),
    );
    const extraDerivedTopics = actualTopics.filter(
      topic => !expectedTopicSet.has(topic),
    );
    const missingDerivedTags = expected.tags.filter(
      tag => !actualTagSet.has(tag),
    );
    const extraDerivedTags = actualTags.filter(tag => !expectedTagSet.has(tag));

    if (
      missingDerivedTopics.length === 0 &&
      extraDerivedTopics.length === 0 &&
      missingDerivedTags.length === 0 &&
      extraDerivedTags.length === 0
    ) {
      console.log(
        `✓ Episode ${video.episodeNumber}: In sync (${expected.topics.length} topics, ${expected.tags.length} tags)`,
      );
      inSync++;
    } else {
      console.log(`✗ Episode ${video.episodeNumber}: Mismatch`);
      console.log(
        `  Expected: ${expected.topics.length} topics, ${expected.tags.length} tags`,
      );
      console.log(
        `  Actual: ${actualTopics.length} topics, ${actualTags.length} tags`,
      );

      if (missingDerivedTopics.length > 0) {
        console.log(
          `  Missing topics in Hugo: ${missingDerivedTopics.join(", ")}`,
        );
        missingTopics += missingDerivedTopics.length;
      }

      if (extraDerivedTopics.length > 0) {
        console.log(`  Extra topics in Hugo: ${extraDerivedTopics.join(", ")}`);
        extraTopics += extraDerivedTopics.length;
      }

      if (missingDerivedTags.length > 0) {
        console.log(`  Missing tags in Hugo: ${missingDerivedTags.join(", ")}`);
        missingTags += missingDerivedTags.length;
      }

      if (extraDerivedTags.length > 0) {
        console.log(`  Extra tags in Hugo: ${extraDerivedTags.join(", ")}`);
        extraTags += extraDerivedTags.length;
      }

      mismatched++;
    }
  }

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Summary:");
  console.log(`  Total episodes: ${totalEpisodes}`);
  console.log(`  ✓ In sync: ${inSync}`);
  console.log(`  ✗ Mismatched: ${mismatched}`);

  if (mismatched > 0) {
    console.log(`  Missing topics in Hugo: ${missingTopics}`);
    console.log(`  Extra topics in Hugo: ${extraTopics}`);
    console.log(`  Missing tags in Hugo: ${missingTags}`);
    console.log(`  Extra tags in Hugo: ${extraTags}`);

    console.log("\n💡 To fix mismatches, run:");
    console.log("  bun run src/scripts/generate-hugo-episodes.ts --all");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Exit with error code if mismatched
  if (mismatched > 0) {
    process.exit(1);
  }
}

await checkSync();
