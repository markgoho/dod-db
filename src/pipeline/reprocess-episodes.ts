/**
 * Core business logic for reprocessing episode tags.
 * Can be called from CLI scripts, UI servers, or tests.
 */

import {
	loadProcessedVideos,
	saveProcessedVideos,
	type ProcessedVideo,
} from '../storage/processed-videos.js';
import { extractTags } from './extract-tags.js';

export interface ReprocessOptions {
	/** If true, reprocess episodes that already have tags */
	force?: boolean;
	/** If true, skip LLM discovery (only use deterministic matching) */
	skipLlm?: boolean;
	/** If true, use LLM to verify ambiguous tag matches (for tags with llmVerify: true) */
	enableLlmVerification?: boolean;
	/** If true, show detailed per-episode logs. Default: false (quiet mode) */
	verbose?: boolean;
}

export interface ReprocessResult {
	processed: number;
	skipped: number;
	failed: number;
	total: number;
}

/**
 * Reprocess tags for episodes.
 * Reads existing transcripts and re-extracts tags.
 *
 * @param options - Reprocessing options
 * @returns Summary of reprocessing results
 */
export async function reprocessEpisodes(
	options: ReprocessOptions = {},
): Promise<ReprocessResult> {
	const {
		force = false,
		skipLlm = false,
		enableLlmVerification = true,
		verbose = false,
	} = options;

	console.log('Loading processed videos...');
	const videos = await loadProcessedVideos();
	console.log(`Found ${videos.length} processed videos\n`);

	// Safety check: don't proceed if no videos loaded (likely validation error)
	if (videos.length === 0) {
		throw new Error(
			'No videos loaded - possible validation error in processed-videos.json',
		);
	}

	const missing = videos.filter((v) => !v.tags || v.tags.length === 0).length;
	console.log(`Videos without tags: ${missing}`);

	if (missing === 0 && !force) {
		console.log('✅ All videos already have tags');
		return {
			processed: 0,
			skipped: videos.length,
			failed: 0,
			total: videos.length,
		};
	}

	const toProcess = force ? videos.length : missing;
	console.log(`\nProcessing ${toProcess} videos...\n`);

	let processed = 0;
	let skipped = 0;
	let failed = 0;

	// Process each video
	for (const video of videos) {
		// Skip if already has tags (unless force mode)
		if (!force && video.tags && video.tags.length > 0) {
			if (verbose) {
				console.log(`⊘ Skipping ${video.videoId} (already has tags)`);
			}
			skipped++;
			continue;
		}

		if (verbose) {
			console.log(`\n📄 Processing ${video.videoId}: ${video.title}`);
		} else {
			// Show progress dots in quiet mode
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

			// Extract tags (suppress logs unless verbose)
			const originalLog = console.log;
			if (!verbose) {
				console.log = () => {}; // Suppress
			}

			const tags = await extractTags(transcript, {
				skipLlm,
				enableLlmVerification,
			});

			if (!verbose) {
				console.log = originalLog; // Restore
			}

			// Update video
			video.tags = tags;

			if (verbose) {
				console.log(`  ✓ Extracted ${tags.length} tags`);
				if (tags.length > 0) {
					const topTags = tags
						.slice(0, 5)
						.map((t) => `${t.tag} (${t.mentions})`)
						.join(', ');
					console.log(`  Top 5: ${topTags}`);
				}
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

	console.log('\n✅ Reprocessing complete!');
	console.log(`\nSummary:`);
	console.log(`  Processed: ${processed}`);
	console.log(`  Skipped: ${skipped}`);
	console.log(`  Failed: ${failed}`);
	console.log(`  Total: ${videos.length}`);

	return {
		processed,
		skipped,
		failed,
		total: videos.length,
	};
}
