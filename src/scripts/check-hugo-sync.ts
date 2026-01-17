/**
 * Diagnostic script to check if Hugo episode frontmatter is in sync with processed-videos.json.
 * Reports episodes where tags in processed-videos.json don't match Hugo frontmatter.
 *
 * Usage:
 *   bun run src/scripts/check-hugo-sync.ts
 */

import { getProcessedVideosWithNumbers } from '../storage/processed-videos.js';
import { extractCleanTitle } from '../hugo/extract-clean-title.js';
import { getEpisodeOutputPath } from '../hugo/get-episode-path.js';

/**
 * Parse YAML frontmatter from Hugo content file.
 * Returns just the tags array for comparison.
 */
function parseFrontmatterTags(content: string): string[] {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		return [];
	}

	const frontmatter = frontmatterMatch[1];
	if (!frontmatter) {
		return [];
	}

	// Extract tags array (simple YAML parsing for tags only)
	const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s{2}- .+\n?)*)/);
	if (!tagsMatch?.[1]) {
		return [];
	}

	// Parse tags list
	const tags = tagsMatch[1]
		.split('\n')
		.map(line => line.trim())
		.filter(line => line.startsWith('- '))
		.map(line => line.slice(2).trim())
		.filter(tag => tag.length > 0);

	return tags;
}

/**
 * Compare tags between processed-videos.json and Hugo frontmatter.
 */
async function checkSync(): Promise<void> {
	console.log('🔍 Checking Hugo frontmatter sync...\n');

	const videos = await getProcessedVideosWithNumbers();

	let totalEpisodes = 0;
	let inSync = 0;
	let mismatched = 0;
	let missingTags = 0;
	let extraTags = 0;

	const mismatchedEpisodes: Array<{
		episodeNumber: number;
		videoId: string;
		title: string;
		expectedTags: string[];
		actualTags: string[];
		missing: string[];
		extra: string[];
	}> = [];

	for (const video of videos) {
		if (video.episodeNumber === undefined) {
			continue;
		}

		totalEpisodes++;

		// Get expected tags from processed-videos.json
		const expectedTags = (video.tags || [])
			.map(t => t.tag)
			.sort();

		// Read Hugo frontmatter
		const cleanTitle = extractCleanTitle(video.title);
		const hugoPath = getEpisodeOutputPath(video, cleanTitle);
		const hugoFile = Bun.file(hugoPath);

		if (!(await hugoFile.exists())) {
			console.log(`❌ Episode ${video.episodeNumber}: Hugo file not found`);
			mismatched++;
			continue;
		}

		const hugoContent = await hugoFile.text();
		const actualTags = parseFrontmatterTags(hugoContent).sort();

		// Compare tags
		const expectedSet = new Set(expectedTags);
		const actualSet = new Set(actualTags);

		const missing = expectedTags.filter(tag => !actualSet.has(tag));
		const extra = actualTags.filter(tag => !expectedSet.has(tag));

		if (missing.length === 0 && extra.length === 0) {
			// In sync
			console.log(`✓ Episode ${video.episodeNumber}: In sync (${expectedTags.length} tags)`);
			inSync++;
		} else {
			// Mismatch
			console.log(`✗ Episode ${video.episodeNumber}: Mismatch`);
			console.log(`  Expected: ${expectedTags.length} tags`);
			console.log(`  Actual: ${actualTags.length} tags`);

			if (missing.length > 0) {
				console.log(`  Missing in Hugo: ${missing.join(', ')}`);
				missingTags += missing.length;
			}

			if (extra.length > 0) {
				console.log(`  Extra in Hugo: ${extra.join(', ')}`);
				extraTags += extra.length;
			}

			mismatched++;

			mismatchedEpisodes.push({
				episodeNumber: video.episodeNumber,
				videoId: video.videoId,
				title: video.title,
				expectedTags,
				actualTags,
				missing,
				extra,
			});
		}
	}

	// Summary
	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('📊 Summary:');
	console.log(`  Total episodes: ${totalEpisodes}`);
	console.log(`  ✓ In sync: ${inSync}`);
	console.log(`  ✗ Mismatched: ${mismatched}`);

	if (mismatched > 0) {
		console.log(`  Missing tags in Hugo: ${missingTags}`);
		console.log(`  Extra tags in Hugo: ${extraTags}`);

		console.log('\n💡 To fix mismatches, run:');
		console.log('  bun run src/scripts/generate-hugo-episodes.ts --all');
	}

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

	// Exit with error code if mismatched
	if (mismatched > 0) {
		process.exit(1);
	}
}

await checkSync();
