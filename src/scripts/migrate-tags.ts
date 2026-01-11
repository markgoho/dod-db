/**
 * One-time migration to add tags to all existing episodes.
 * Reads corrected transcripts and extracts tags using the hybrid extraction system.
 *
 * Usage: bun run src/scripts/migrate-tags.ts
 */

import {
	loadProcessedVideos,
	saveProcessedVideos,
} from '../storage/processed-videos.js';
import { extractTags } from '../pipeline/extract-tags.js';

async function migrate() {
	console.log('🏷️  Tag Migration Script\n');
	console.log('Loading processed videos...');
	const videos = await loadProcessedVideos();

	console.log(`Found ${videos.length} processed videos\n`);

	const missing = videos.filter((v) => !v.tags || v.tags.length === 0).length;
	console.log(`Videos without tags: ${missing}`);

	if (missing === 0) {
		console.log('✅ All videos already have tags');
		return;
	}

	console.log(`\nProcessing ${missing} videos without tags...\n`);

	let processed = 0;
	let skipped = 0;
	let failed = 0;

	// Process each video
	for (const video of videos) {
		// Skip if already has tags
		if (video.tags && video.tags.length > 0) {
			console.log(`⊘ Skipping ${video.videoId} (already has tags)`);
			skipped++;
			continue;
		}

		console.log(`\n📄 Processing ${video.videoId}: ${video.title}`);

		try {
			// Read transcript
			const transcriptFile = Bun.file(video.transcriptPath);
			if (!(await transcriptFile.exists())) {
				console.error(`  ⚠ Transcript not found: ${video.transcriptPath}`);
				failed++;
				continue;
			}

			const transcript = await transcriptFile.text();

			// Extract tags
			const tags = await extractTags(transcript);

			// Update video
			video.tags = tags;

			console.log(`  ✓ Extracted ${tags.length} tags`);
			if (tags.length > 0) {
				const topTags = tags
					.slice(0, 5)
					.map((t) => `${t.tag} (${t.mentions})`)
					.join(', ');
				console.log(`  Top 5: ${topTags}`);
			}

			processed++;
		} catch (error) {
			console.error(`  ⚠ Failed to process:`, error);
			failed++;
		}
	}

	console.log('\n\nSaving updated processed-videos.json...');
	await saveProcessedVideos(videos);

	console.log('\n✅ Migration complete!');
	console.log(`\nSummary:`);
	console.log(`  Processed: ${processed}`);
	console.log(`  Skipped: ${skipped}`);
	console.log(`  Failed: ${failed}`);
	console.log(`  Total: ${videos.length}`);
}

await migrate();
