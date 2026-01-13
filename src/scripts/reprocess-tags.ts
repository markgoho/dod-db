/**
 * CLI script to reprocess episode tags.
 * Thin wrapper around reprocess-episodes business logic.
 *
 * Usage:
 *   bun run src/scripts/reprocess-tags.ts                    # Process episodes without tags
 *   bun run src/scripts/reprocess-tags.ts --force            # Reprocess all episodes (includes LLM)
 *   bun run src/scripts/reprocess-tags.ts --force --skip-llm # Reprocess deterministic only (zero API costs, no verification)
 *   bun run src/scripts/reprocess-tags.ts --force --verbose  # Show detailed per-episode logs
 *   bun run src/scripts/reprocess-tags.ts --force --categories=people        # LLM discovery for specific categories only
 *   bun run src/scripts/reprocess-tags.ts --force --categories=people,place  # Multiple categories
 */

import { reprocessEpisodes } from '../pipeline/reprocess-episodes.js';
import type { TagCategory } from '../config/tag-vocabulary.js';

async function main() {
	console.log('🏷️  Tag Reprocessing Script\n');

	// Parse CLI arguments
	const force = process.argv.includes('--force');
	const skipLlm = process.argv.includes('--skip-llm');
	const verbose = process.argv.includes('--verbose');

	// Parse --categories flag
	const categoriesArgument = process.argv.find((argument) => argument.startsWith('--categories='));
	let categories: TagCategory[] | undefined;
	if (categoriesArgument) {
		const categoryList = categoriesArgument.split('=')[1] ?? '';
		categories = categoryList.split(',').map((c) => c.trim()) as TagCategory[];
	}

	if (force) {
		console.log('⚠️  Force mode: Reprocessing ALL episodes\n');
	}
	if (skipLlm) {
		console.log('⚡ Skip LLM mode: Deterministic matching only, no LLM verification (zero API costs)\n');
	}
	if (categories) {
		console.log(`🎯 Category filter: LLM will only discover tags in [${categories.join(', ')}]\n`);
	}
	if (verbose) {
		console.log('📝 Verbose mode: Showing detailed logs\n');
	}

	// Run reprocessing
	const result = await reprocessEpisodes({ force, skipLlm, categories, verbose });

	// Exit with appropriate code
	if (result.failed > 0) {
		process.exit(1);
	}
}

await main();
