/**
 * Add a single tag to all episodes.
 * More efficient than full reprocessing when you only need to add one new tag.
 */

import {
	loadProcessedVideos,
	saveProcessedVideos,
	type EpisodeTag,
} from '../storage/processed-videos.js';
import { extractSingleTag } from './extract-single-tag.js';

export interface AddTagToEpisodesOptions {
	/** The canonical tag name to add */
	canonical: string;
	/** If true, use LLM to verify ambiguous matches */
	enableLlmVerification?: boolean;
	/** If true, show detailed logs */
	verbose?: boolean;
}

export interface AddTagToEpisodesResult {
	processed: number;
	episodesWithTag: number;
	totalMentions: number;
	failed: number;
}

/**
 * Add a single tag to all episodes by extracting just that tag.
 * Merges with existing tags (updates if exists, adds if new).
 *
 * @param options - Options for adding tag
 * @returns Summary of results
 */
export async function addTagToEpisodes(
	options: AddTagToEpisodesOptions,
): Promise<AddTagToEpisodesResult> {
	const { canonical, enableLlmVerification = true, verbose = false } = options;

	console.log(`Loading episodes for tag "${canonical}"...`);
	const videos = await loadProcessedVideos();

	if (videos.length === 0) {
		throw new Error('No videos loaded');
	}

	console.log(`Processing ${videos.length} episodes for "${canonical}"...\n`);

	let processed = 0;
	let episodesWithTag = 0;
	let totalMentions = 0;
	let failed = 0;

	for (const video of videos) {
		if (verbose) {
			console.log(`\n📄 Processing ${video.videoId}: ${video.title}`);
		} else {
			process.stdout.write('.');
		}

		try {
			// Read transcript
			const transcriptFile = Bun.file(video.transcriptPath);
			if (!(await transcriptFile.exists())) {
				if (verbose) {
					console.error(`  ⚠ Transcript not found: ${video.transcriptPath}`);
				}
				failed++;
				continue;
			}

			const transcript = await transcriptFile.text();

			// Extract just this one tag
			const tagResult = await extractSingleTag(
				transcript,
				canonical,
				enableLlmVerification,
			);

			// Merge with existing tags
			if (!video.tags) {
				video.tags = [];
			}

			// Remove existing instance of this tag if present (case-insensitive)
			video.tags = video.tags.filter((t) => t.tag.toLowerCase() !== canonical.toLowerCase());

			// Add new result if matches found
			if (tagResult) {
				video.tags.push(tagResult);
				video.tags.sort((a, b) => b.mentions - a.mentions); // Keep sorted
				episodesWithTag++;
				totalMentions += tagResult.mentions;

				if (verbose) {
					console.log(`  ✓ Found ${tagResult.mentions} mentions`);
				}
			} else if (verbose) {
				console.log(`  - No matches found`);
			}

			processed++;
		} catch (error) {
			if (verbose) {
				console.error(`  ⚠ Failed to process:`, error);
			}
			failed++;
		}
	}

	if (!verbose) {
		console.log(''); // New line after progress dots
	}

	console.log('\n\nSaving updated processed-videos.json...');
	await saveProcessedVideos(videos);

	console.log('\n✅ Tag addition complete!');
	console.log(`\nSummary:`);
	console.log(`  Processed: ${processed}`);
	console.log(`  Episodes with tag: ${episodesWithTag}`);
	console.log(`  Total mentions: ${totalMentions}`);
	console.log(`  Failed: ${failed}`);

	return {
		processed,
		episodesWithTag,
		totalMentions,
		failed,
	};
}
