/**
 * CLI script to reprocess episode tags.
 * Thin wrapper around reprocess-episodes business logic.
 *
 * Usage:
 *   bun run src/scripts/reprocess-tags.ts                    # Process episodes without tags
 *   bun run src/scripts/reprocess-tags.ts --force            # Reprocess all episodes (includes LLM)
 *   bun run src/scripts/reprocess-tags.ts --force --skip-llm # Reprocess deterministic only (no API costs)
 *   bun run src/scripts/reprocess-tags.ts --force --verbose  # Show detailed per-episode logs
 */

import { reprocessEpisodes } from '../pipeline/reprocess-episodes.js';

async function main() {
	console.log('🏷️  Tag Reprocessing Script\n');

	// Parse CLI arguments
	const force = process.argv.includes('--force');
	const skipLlm = process.argv.includes('--skip-llm');
	const verbose = process.argv.includes('--verbose');

	if (force) {
		console.log('⚠️  Force mode: Reprocessing ALL episodes\n');
	}
	if (skipLlm) {
		console.log('⚡ Skip LLM mode: Using only deterministic matching (no API costs)\n');
	}
	if (verbose) {
		console.log('📝 Verbose mode: Showing detailed logs\n');
	}

	// Run reprocessing
	const result = await reprocessEpisodes({ force, skipLlm, verbose });

	// Exit with appropriate code
	if (result.failed > 0) {
		process.exit(1);
	}
}

await main();
