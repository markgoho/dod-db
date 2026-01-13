/**
 * Unified web server for all DoD tools.
 *
 * Usage:
 *   bun run src/scripts/tools-server.ts
 *   Then open http://localhost:3000
 */

import {
  loadTracker,
  saveTracker,
  getPendingCandidates,
  approveCandidate,
  rejectCandidate,
  type CorrectionCandidate,
} from '../pipeline/correction-tracker.js';
import {
  loadProcessedVideos,
  updateVideoSegments,
  type ProcessedVideo,
  type EpisodeSegment,
} from '../storage/processed-videos.js';
import { tagVocabulary } from '../config/tag-vocabulary.js';
import { reprocessEpisodes } from '../pipeline/reprocess-episodes.js';
import { addTagToEpisodes } from '../pipeline/add-tag-to-episodes.js';
import {
  addTagToVocabulary,
  tagExists,
  updateTagInVocabulary,
  deleteTagFromVocabulary,
  findTag,
  type AddTagParams,
  type UpdateTagParams,
} from '../pipeline/add-tag-to-vocabulary.js';
import {
  SEGMENT_LABELS,
  SEGMENT_COLORS,
  type SegmentType,
} from '../config/segment-patterns.js';
import { youtubeConfig } from '../config/youtube.js';
import type { TagDefinition, TagCategory } from '../config/tag-vocabulary.js';
import * as path from 'node:path';

const PORT = 3000;

// Cache for tag statistics (5 minute TTL)
interface TagStats {
  canonical: string;
  category: string;
  episodeCount: number;
  totalMentions: number;
  averageMentionsPerEpisode: number;
  variations: string[];
}

let statsCache: { data: TagStats[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Migration job tracking
interface MigrationJob {
  id: string;
  status: 'running' | 'completed' | 'failed';
  logs: string[];
  startTime: number;
  endTime?: number;
  exitCode?: number;
}

const migrationJobs = new Map<string, MigrationJob>();

// Helper to add a correction to corrections.ts
async function addToCorrectionFile(
  candidate: CorrectionCandidate,
): Promise<void> {
  const correctionsPath = path.join(
    process.cwd(),
    'src',
    'config',
    'corrections.ts',
  );

  const file = await Bun.file(correctionsPath).text();

  // Find the insertion point (before the closing ];)
  const insertionPoint = file.lastIndexOf('];');
  if (insertionPoint === -1) {
    throw new Error('Could not find insertion point in corrections.ts');
  }

  // Format the new rule
  const newRule = `  [["${candidate.original}"], "${candidate.corrected}"], // ${candidate.category} - confidence: ${candidate.confidence}%\n`;

  // Insert the new rule
  const updatedFile =
    file.slice(0, insertionPoint) + newRule + file.slice(insertionPoint);

  await Bun.write(correctionsPath, updatedFile);
}

// Compute tag statistics across all episodes
async function computeTagStats(): Promise<TagStats[]> {
  // Check cache
  const now = Date.now();
  if (statsCache.data && now - statsCache.timestamp < CACHE_TTL) {
    return statsCache.data;
  }

  const videos = await loadProcessedVideos();

  // Build a map of canonical tag names to vocabulary definitions
  const vocabMap = new Map<string, TagDefinition>();
  for (const term of tagVocabulary) {
    vocabMap.set(term.canonical.toLowerCase(), term);
  }

  // Aggregate statistics per tag
  const statsMap = new Map<
    string,
    {
      episodeCount: number;
      totalMentions: number;
      category: string;
      variations: string[];
    }
  >();

  for (const video of videos) {
    if (!video.tags) continue;

    for (const tag of video.tags) {
      const canonicalLower = tag.tag.toLowerCase();
      const vocab = vocabMap.get(canonicalLower);

      if (!statsMap.has(canonicalLower)) {
        statsMap.set(canonicalLower, {
          episodeCount: 0,
          totalMentions: 0,
          category: vocab?.category || 'unknown',
          variations: vocab?.variations || [],
        });
      }

      const stats = statsMap.get(canonicalLower)!;
      stats.episodeCount++;
      stats.totalMentions += tag.mentions;
    }
  }

  // Convert to array and compute averages
  const result: TagStats[] = [];
  for (const [canonical, stats] of statsMap) {
    result.push({
      canonical,
      category: stats.category,
      episodeCount: stats.episodeCount,
      totalMentions: stats.totalMentions,
      averageMentionsPerEpisode: stats.totalMentions / stats.episodeCount,
      variations: stats.variations,
    });
  }

  // Sort by total mentions descending
  result.sort((a, b) => b.totalMentions - a.totalMentions);

  // Update cache
  statsCache = { data: result, timestamp: now };

  return result;
}

// Run migration with tag-specific tracking (single tag mode)
async function runMigrationWithTagTracking(
  skipLlm = false,
  trackTag?: string,
): Promise<string> {
  const jobId = `migration-${Date.now()}`;
  const job: MigrationJob = {
    id: jobId,
    status: 'running',
    logs: [],
    startTime: Date.now(),
  };
  migrationJobs.set(jobId, job);

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    job.logs.push(args.join(' ') + '\n');
    originalLog(...args);
  };
  console.error = (...args) => {
    job.logs.push('[ERROR] ' + args.join(' ') + '\n');
    originalError(...args);
  };
  console.warn = (...args) => {
    job.logs.push('[WARN] ' + args.join(' ') + '\n');
    originalWarn(...args);
  };

  // Run reprocessing in background
  (async () => {
    try {
      // If tracking a specific tag, use single-tag mode (much faster!)
      if (trackTag) {
        const result = await addTagToEpisodes({
          canonical: trackTag,
          enableLlmVerification: true,
          verbose: false,
        });

        // Show tag-specific results
        job.logs.push(
          `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
        );
        job.logs.push(`📊 "${trackTag}" Results:\n`);
        job.logs.push(`   Found in ${result.episodesWithTag} episodes\n`);
        job.logs.push(`   Total mentions: ${result.totalMentions}\n`);
        if (result.episodesWithTag > 0) {
          job.logs.push(
            `   Average: ${(result.totalMentions / result.episodesWithTag).toFixed(1)} mentions/episode\n`,
          );
        }
        job.logs.push(
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
        );
      } else {
        // Full reprocessing of all tags
        await reprocessEpisodes({ force: true, skipLlm, verbose: false });
      }

      job.status = 'completed';
      job.exitCode = 0;
    } catch (error) {
      job.logs.push(`\n[ERROR] Migration failed: ${error}\n`);
      job.status = 'failed';
      job.exitCode = 1;
    } finally {
      job.endTime = Date.now();
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      // Invalidate stats cache
      statsCache.data = null;
    }
  })();

  return jobId;
}

// Add a new pattern to segment-patterns.ts
async function addPatternToConfig(
  segmentType: string,
  pattern: string,
): Promise<void> {
  const configPath = path.join(
    process.cwd(),
    'src/config/segment-patterns.ts',
  );
  const file = Bun.file(configPath);
  let content = await file.text();

  // Escape special regex characters in the pattern
  const escapedPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/'/g, "\\'");

  // Find the array for this segment type and add the new pattern
  const patterns = [
    new RegExp(`('${segmentType}':\\s*\\[)([^\\]]*)`, 's'),
    new RegExp(`(${segmentType}:\\s*\\[)([^\\]]*)`, 's'),
  ];

  let found = false;
  for (const regex of patterns) {
    const match = content.match(regex);
    if (match && match[2]) {
      // Add new pattern before the closing bracket
      const existingPatterns = match[2].trim();
      const newPattern = `/${escapedPattern}/i`;

      // Check if pattern already exists
      if (existingPatterns.includes(escapedPattern)) {
        console.log(`Pattern already exists for ${segmentType}`);
        return;
      }

      const separator =
        existingPatterns.endsWith(',') || existingPatterns === ''
          ? '\n    '
          : ',\n    ';
      const newContent =
        match[1] + existingPatterns + separator + newPattern + ',\n  ';
      content = content.replace(regex, newContent);
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(
      `Could not find pattern array for segment type: ${segmentType}`,
    );
  }

  await Bun.write(configPath, content);
  console.log(`Added pattern for ${segmentType}: ${pattern}`);
}

// Get audio file path for a video ID
async function getAudioFilePath(videoId: string): Promise<string | null> {
  const audioDir = youtubeConfig.audioDirectory;

  // Try common extensions
  const extensions = ['.webm', '.m4a', '.mp3', '.wav'];

  for (const ext of extensions) {
    const filePath = path.join(audioDir, `${videoId}${ext}`);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return filePath;
    }
  }

  return null;
}

// Serve the unified tools server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // ========================================
    // Landing Page
    // ========================================
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const filePath = path.join(process.cwd(), 'tools', 'index.html');
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // ========================================
    // Validate Timestamps Tool (static HTML)
    // ========================================
    if (url.pathname === '/validate-timestamps') {
      const filePath = path.join(
        process.cwd(),
        'tools',
        'validate-timestamps.html',
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // ========================================
    // Review Corrections Tool
    // ========================================
    if (url.pathname === '/review-corrections') {
      const filePath = path.join(
        process.cwd(),
        'tools',
        'review-corrections.html',
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Review Corrections API: Get pending candidates
    if (url.pathname === '/api/review-corrections/candidates') {
      const tracker = await loadTracker();
      const pending = getPendingCandidates(tracker);
      return Response.json(pending);
    }

    // Review Corrections API: Approve a candidate
    if (url.pathname.startsWith('/api/review-corrections/approve/')) {
      const key = decodeURIComponent(
        url.pathname.replace('/api/review-corrections/approve/', ''),
      );
      const tracker = await loadTracker();

      const candidate = tracker.candidates[key];
      if (!candidate) {
        return Response.json({ error: 'Candidate not found' }, { status: 404 });
      }

      try {
        // Get edited values from query params (if provided)
        const searchParams = new URL(req.url).searchParams;
        const editedOriginal = searchParams.get('original');
        const editedCorrected = searchParams.get('corrected');

        // Use edited values if provided, otherwise use candidate's values
        const finalCandidate = {
          ...candidate,
          original: editedOriginal || candidate.original,
          corrected: editedCorrected || candidate.corrected,
        };

        // Add to corrections.ts
        await addToCorrectionFile(finalCandidate);

        // Mark as approved
        approveCandidate(tracker, key, 'UI Review');
        await saveTracker(tracker);

        return Response.json({ success: true });
      } catch (error) {
        return Response.json(
          {
            error: error instanceof Error ? error.message : 'Failed to approve',
          },
          { status: 500 },
        );
      }
    }

    // Review Corrections API: Reject a candidate
    if (url.pathname.startsWith('/api/review-corrections/reject/')) {
      const key = decodeURIComponent(
        url.pathname.replace('/api/review-corrections/reject/', ''),
      );
      const tracker = await loadTracker();

      if (!tracker.candidates[key]) {
        return Response.json({ error: 'Candidate not found' }, { status: 404 });
      }

      rejectCandidate(tracker, key, 'UI Review');
      await saveTracker(tracker);

      return Response.json({ success: true });
    }

    // ========================================
    // Tag Vocabulary Tool
    // ========================================
    if (url.pathname === '/tag-vocabulary') {
      const filePath = path.join(process.cwd(), 'tools', 'tag-vocabulary.html');
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Tag Vocabulary API: Get all processed episodes with tags
    if (url.pathname === '/api/tag-vocabulary/episodes') {
      const videos = await loadProcessedVideos();
      return Response.json(videos);
    }

    // Tag Vocabulary API: Get tag vocabulary
    if (url.pathname === '/api/tag-vocabulary/vocabulary') {
      return Response.json(tagVocabulary);
    }

    // Tag Vocabulary API: Get tag statistics
    if (url.pathname === '/api/tag-vocabulary/tag-stats') {
      const stats = await computeTagStats();
      return Response.json(stats);
    }

    // Tag Vocabulary API: Add tag to vocabulary
    if (
      url.pathname === '/api/tag-vocabulary/vocabulary/add' &&
      req.method === 'POST'
    ) {
      try {
        const body = (await req.json()) as {
          canonical?: string;
          variations?: string | string[];
          category?: string;
          llmVerify?: boolean;
          description?: string;
        };
        const { canonical, variations, category, llmVerify, description } =
          body;

        // Validate required fields
        if (!canonical || typeof canonical !== 'string') {
          return Response.json(
            { error: 'canonical is required and must be a string' },
            { status: 400 },
          );
        }

        if (!category || typeof category !== 'string') {
          return Response.json(
            { error: 'category is required and must be a string' },
            { status: 400 },
          );
        }

        // Validate llmVerify + description dependency
        if (llmVerify && (!description || typeof description !== 'string')) {
          return Response.json(
            { error: 'description is required when llmVerify is true' },
            { status: 400 },
          );
        }

        // Parse variations (comma-separated string or array)
        let variationsArray: string[] = [];
        if (variations) {
          if (typeof variations === 'string') {
            variationsArray = variations
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
          } else if (Array.isArray(variations)) {
            variationsArray = variations;
          }
        }

        // Check for duplicates
        if (tagExists(canonical)) {
          return Response.json(
            { error: `Tag "${canonical}" already exists in vocabulary` },
            { status: 409 },
          );
        }

        // Add to vocabulary file
        const tagParams: AddTagParams = llmVerify
          ? {
              canonical,
              variations: variationsArray,
              category: category as TagCategory,
              llmVerify: true,
              description: description!, // We validated this is present when llmVerify is true
            }
          : {
              canonical,
              variations: variationsArray,
              category: category as TagCategory,
            };

        await addTagToVocabulary(tagParams);

        // Start reprocessing all episodes (skip LLM to save costs)
        const jobId = await runMigrationWithTagTracking(true, canonical); // skipLlm = true, track this tag

        return Response.json({
          success: true,
          message: `Tag "${canonical}" added successfully`,
          jobId,
        });
      } catch (error) {
        console.error('Error adding tag:', error);
        return Response.json(
          {
            error: error instanceof Error ? error.message : 'Failed to add tag',
          },
          { status: 500 },
        );
      }
    }

    // Tag Vocabulary API: Start migration
    if (
      url.pathname === '/api/tag-vocabulary/migrate' &&
      req.method === 'POST'
    ) {
      try {
        const jobId = await runMigrationWithTagTracking();
        return Response.json({ jobId, status: 'started' });
      } catch (error) {
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to start migration',
          },
          { status: 500 },
        );
      }
    }

    // Tag Vocabulary API: Get migration status
    if (url.pathname.startsWith('/api/tag-vocabulary/migrate-status/')) {
      const jobId = url.pathname.replace(
        '/api/tag-vocabulary/migrate-status/',
        '',
      );
      const job = migrationJobs.get(jobId);

      if (!job) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }

      return Response.json({
        id: job.id,
        status: job.status,
        logs: job.logs.join(''),
        startTime: job.startTime,
        endTime: job.endTime,
        exitCode: job.exitCode,
      });
    }

    // Tag Vocabulary API: Update a tag in vocabulary
    if (
      url.pathname.startsWith('/api/tag-vocabulary/vocabulary/update/') &&
      req.method === 'PUT'
    ) {
      try {
        const originalCanonical = decodeURIComponent(
          url.pathname.replace('/api/tag-vocabulary/vocabulary/update/', ''),
        );
        const body = (await req.json()) as UpdateTagParams;

        await updateTagInVocabulary(originalCanonical, body);

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${originalCanonical}" updated successfully`,
        });
      } catch (error) {
        console.error('Error updating tag:', error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : 'Failed to update tag',
          },
          { status: 500 },
        );
      }
    }

    // Tag Vocabulary API: Approve a proposed tag
    if (
      url.pathname.startsWith('/api/tag-vocabulary/vocabulary/approve/') &&
      req.method === 'POST'
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace('/api/tag-vocabulary/vocabulary/approve/', ''),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return Response.json(
            { error: `Tag "${canonical}" not found` },
            { status: 404 },
          );
        }

        await updateTagInVocabulary(canonical, { status: 'accepted' });

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" approved`,
        });
      } catch (error) {
        console.error('Error approving tag:', error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : 'Failed to approve tag',
          },
          { status: 500 },
        );
      }
    }

    // Tag Vocabulary API: Reject a proposed tag
    if (
      url.pathname.startsWith('/api/tag-vocabulary/vocabulary/reject/') &&
      req.method === 'POST'
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace('/api/tag-vocabulary/vocabulary/reject/', ''),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return Response.json(
            { error: `Tag "${canonical}" not found` },
            { status: 404 },
          );
        }

        await updateTagInVocabulary(canonical, { status: 'rejected' });

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" rejected`,
        });
      } catch (error) {
        console.error('Error rejecting tag:', error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : 'Failed to reject tag',
          },
          { status: 500 },
        );
      }
    }

    // Tag Vocabulary API: Delete a tag from vocabulary
    if (
      url.pathname.startsWith('/api/tag-vocabulary/vocabulary/delete/') &&
      req.method === 'DELETE'
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace('/api/tag-vocabulary/vocabulary/delete/', ''),
        );

        await deleteTagFromVocabulary(canonical);

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" deleted`,
        });
      } catch (error) {
        console.error('Error deleting tag:', error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : 'Failed to delete tag',
          },
          { status: 500 },
        );
      }
    }

    // ========================================
    // Segment Verification Tool
    // ========================================
    if (url.pathname === '/segment-verification') {
      const filePath = path.join(
        process.cwd(),
        'tools',
        'segment-verification.html',
      );
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (!exists) {
        return new Response(
          'UI file not found. Please create tools/segment-verification.html',
          { status: 404 },
        );
      }
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Segment Verification API: Get all episodes with segments
    if (url.pathname === '/api/segment-verification/episodes') {
      const videos = await loadProcessedVideos();
      // Sort by episode number
      const sorted = [...videos].sort(
        (a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0),
      );
      return Response.json(sorted);
    }

    // Segment Verification API: Get segment metadata
    if (url.pathname === '/api/segment-verification/segment-metadata') {
      return Response.json({
        labels: SEGMENT_LABELS,
        colors: SEGMENT_COLORS,
        types: Object.keys(SEGMENT_LABELS),
      });
    }

    // Segment Verification API: Get transcript for an episode
    if (url.pathname.startsWith('/api/segment-verification/transcript/')) {
      const videoId = url.pathname.replace(
        '/api/segment-verification/transcript/',
        '',
      );
      const videos = await loadProcessedVideos();
      const video = videos.find((v) => v.videoId === videoId);

      if (!video) {
        return Response.json({ error: 'Video not found' }, { status: 404 });
      }

      const file = Bun.file(video.transcriptPath);
      const exists = await file.exists();
      if (!exists) {
        return Response.json(
          { error: 'Transcript file not found' },
          { status: 404 },
        );
      }

      const transcript = await file.text();
      return Response.json({ transcript });
    }

    // Segment Verification API: Update segments for an episode
    if (
      url.pathname.startsWith('/api/segment-verification/segments/') &&
      req.method === 'PUT'
    ) {
      const videoId = url.pathname.replace(
        '/api/segment-verification/segments/',
        '',
      );

      try {
        const body = (await req.json()) as { segments: EpisodeSegment[] };

        if (!Array.isArray(body.segments)) {
          return Response.json(
            { error: 'segments must be an array' },
            { status: 400 },
          );
        }

        await updateVideoSegments(videoId, body.segments);
        return Response.json({ success: true });
      } catch (error) {
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update segments',
          },
          { status: 500 },
        );
      }
    }

    // Segment Verification API: Get segment statistics
    if (url.pathname === '/api/segment-verification/stats') {
      const videos = await loadProcessedVideos();

      const stats = {
        totalEpisodes: videos.length,
        episodesWithSegments: 0,
        episodesVerified: 0,
        segmentsByType: {} as Record<string, number>,
        autoDetected: 0,
        verified: 0,
      };

      for (const video of videos) {
        if (video.segments && video.segments.length > 0) {
          stats.episodesWithSegments++;

          const allVerified = video.segments.every(
            (s) => s.confidence === 'verified',
          );
          if (allVerified) {
            stats.episodesVerified++;
          }

          for (const segment of video.segments) {
            stats.segmentsByType[segment.type] =
              (stats.segmentsByType[segment.type] || 0) + 1;

            if (segment.confidence === 'auto') {
              stats.autoDetected++;
            } else {
              stats.verified++;
            }
          }
        }
      }

      return Response.json(stats);
    }

    // Segment Verification API: Add a learned pattern
    if (
      url.pathname === '/api/segment-verification/patterns/add' &&
      req.method === 'POST'
    ) {
      try {
        const body = (await req.json()) as {
          segmentType: string;
          pattern: string;
        };

        if (!body.segmentType || !body.pattern) {
          return Response.json(
            { error: 'segmentType and pattern are required' },
            { status: 400 },
          );
        }

        // Validate segment type
        if (!SEGMENT_LABELS[body.segmentType as SegmentType]) {
          return Response.json(
            { error: `Invalid segment type: ${body.segmentType}` },
            { status: 400 },
          );
        }

        await addPatternToConfig(body.segmentType, body.pattern);
        return Response.json({
          success: true,
          message: `Pattern added for ${body.segmentType}`,
        });
      } catch (error) {
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : 'Failed to add pattern',
          },
          { status: 500 },
        );
      }
    }

    // ========================================
    // Shared Resources
    // ========================================

    // Serve audio files (used by multiple tools)
    if (url.pathname.startsWith('/api/audio/')) {
      const videoId = url.pathname.replace('/api/audio/', '');
      const audioPath = await getAudioFilePath(videoId);

      if (!audioPath) {
        return Response.json({ error: 'Audio not found' }, { status: 404 });
      }

      const file = Bun.file(audioPath);
      const ext = path.extname(audioPath).toLowerCase();

      // Determine content type
      const contentTypes: Record<string, string> = {
        '.webm': 'audio/webm',
        '.m4a': 'audio/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      };

      return new Response(file, {
        headers: {
          'Content-Type': contentTypes[ext] || 'audio/webm',
          'Accept-Ranges': 'bytes',
        },
      });
    }

    // Serve data files (used by multiple tools)
    if (url.pathname === '/data/correction-candidates.json') {
      const filePath = path.join(
        process.cwd(),
        'data',
        'correction-candidates.json',
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`\n🛠️  DoD Tools Server`);
console.log(
  `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
);
console.log(`🌐 Open in browser: http://localhost:${PORT}`);
console.log(`\n📋 Available tools:`);
console.log(`   • Landing Page:           http://localhost:${PORT}/`);
console.log(
  `   • Timestamp Validator:    http://localhost:${PORT}/validate-timestamps`,
);
console.log(
  `   • Correction Review:      http://localhost:${PORT}/review-corrections`,
);
console.log(
  `   • Tag Vocabulary:         http://localhost:${PORT}/tag-vocabulary`,
);
console.log(
  `   • Segment Verification:   http://localhost:${PORT}/segment-verification`,
);
console.log(`\n`);
