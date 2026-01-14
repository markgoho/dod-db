/**
 * LLM prompt and schema for identifying segment types from transcript context.
 */

import { z } from 'zod';
import {
	type SegmentType,
	SEGMENT_LABELS,
	SEGMENT_DESCRIPTIONS,
} from '../config/segment-patterns.js';

/**
 * Schema for a single segment identification result.
 */
const SegmentIdentificationResultSchema = z.object({
	index: z.number().describe('The index of the segment being identified'),
	segmentType: z.string().describe('The identified segment type slug'),
	confidence: z
		.number()
		.min(0)
		.max(100)
		.describe('Confidence percentage (0-100)'),
	reasoning: z
		.string()
		.describe('Brief explanation of why this type was chosen'),
});

/**
 * Schema for the full LLM response.
 */
export const SegmentIdentificationSchema = z.object({
	identifications: z.array(SegmentIdentificationResultSchema),
});

export type SegmentIdentificationResult = z.infer<
	typeof SegmentIdentificationSchema
>;

/**
 * Context for a segment that needs identification.
 */
export interface SegmentContext {
	index: number;
	timestamp: string;
	contextText: string;
}

/**
 * Segment types that are excluded from LLM identification.
 * These are either structural (intro/outro) or placeholders.
 */
type ExcludedSegmentTypes =
	| 'segment'
	| 'intro'
	| 'outro'
	| 'main-content'
	| 'advertisement';

/**
 * Segment types that can be identified by the LLM.
 */
export type IdentifiableSegmentType = Exclude<SegmentType, ExcludedSegmentTypes>;

/**
 * Set of excluded segment types for runtime filtering.
 */
const EXCLUDED_SEGMENT_TYPES = new Set<ExcludedSegmentTypes>([
	'segment',
	'intro',
	'outro',
	'main-content',
	'advertisement',
]);

/**
 * Get the list of valid segment types for identification.
 * Excludes 'segment' (placeholder) and structural types (intro/outro/main-content).
 */
function getIdentifiableSegmentTypes(): IdentifiableSegmentType[] {
	return (Object.keys(SEGMENT_LABELS) as SegmentType[]).filter(
		(type): type is IdentifiableSegmentType =>
			!EXCLUDED_SEGMENT_TYPES.has(type as ExcludedSegmentTypes),
	);
}

/**
 * Build the segment type reference section for the prompt.
 */
function buildSegmentTypeReference(): string {
	const types = getIdentifiableSegmentTypes();
	return types
		.map((type) => `- "${type}": ${SEGMENT_DESCRIPTIONS[type]}`)
		.join('\n');
}

/**
 * Build LLM prompt for segment type identification.
 *
 * @param contexts - Array of segment contexts to identify
 * @returns Formatted prompt string
 */
export function segmentIdentificationPrompt(
	contexts: SegmentContext[],
): string {
	const segmentTypeReference = buildSegmentTypeReference();

	const contextSections = contexts
		.map(
			(context) =>
				`[${context.index}] Timestamp: ${context.timestamp}\n${context.contextText}`,
		)
		.join('\n\n---\n\n');

	return `You are an expert at identifying segment types in the "Data Over Dogma" podcast.

<podcast-context>
The "Data Over Dogma" podcast is about biblical scholarship hosted by Dan McClellan (biblical scholar) and Dan Beecher.

The podcast has recurring segments, each introduced with a musical jingle. The hosts typically announce the segment name BEFORE the jingle plays, sometimes repeating it after.
</podcast-context>

<valid-segment-types>
${segmentTypeReference}
</valid-segment-types>

<task>
Below are ${contexts.length} transcript excerpts from around detected jingle timestamps. For each, identify which segment type is being introduced.

Look for:
- Direct mentions of the segment name (e.g., "let's do Chapter and Verse", "McClellan 911")
- Descriptions that match a segment type's purpose
- Context clues about what the segment will cover

If you cannot confidently identify a segment type, use "segment" as a fallback.
</task>

<contexts>
${contextSections}
</contexts>

<output-format>
For each context, provide:
- "index": The context number
- "segmentType": One of the valid segment type slugs listed above (or "segment" if unknown)
- "confidence": Your confidence level 0-100 (use <50 if uncertain)
- "reasoning": Brief explanation (1-2 sentences)
</output-format>`;
}

/**
 * Get the list of valid segment type slugs for validation.
 */
export function getValidSegmentTypes(): string[] {
	return Object.keys(SEGMENT_LABELS);
}
