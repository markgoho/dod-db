/**
 * Web UI for tag vocabulary management and episode viewing.
 *
 * Usage:
 *   bun run src/scripts/tag-vocabulary-ui.ts
 *   Then open http://localhost:3001
 */

import { loadProcessedVideos } from '../storage/processed-videos.js';
import { tagVocabulary } from '../config/tag-vocabulary.js';
import type { ProcessedVideo, EpisodeTag } from '../storage/processed-videos.js';
import type { TagDefinition } from '../config/tag-vocabulary.js';
import * as path from 'node:path';

const PORT = 3001;

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
  const statsMap = new Map<string, {
    episodeCount: number;
    totalMentions: number;
    category: string;
    variations: string[];
  }>();

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

// Run migration script
async function runMigration(): Promise<string> {
  const jobId = `migration-${Date.now()}`;
  const job: MigrationJob = {
    id: jobId,
    status: 'running',
    logs: [],
    startTime: Date.now(),
  };
  migrationJobs.set(jobId, job);

  // Spawn the migration script
  const proc = Bun.spawn(['bun', 'run', 'src/scripts/migrate-tags.ts'], {
    cwd: process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
  });

  // Capture stdout
  const stdoutReader = proc.stdout.getReader();
  const stderrReader = proc.stderr.getReader();
  const decoder = new TextDecoder();

  // Read stdout in background
  (async () => {
    try {
      while (true) {
        const { done, value } = await stdoutReader.read();
        if (done) break;
        const text = decoder.decode(value);
        job.logs.push(text);
      }
    } catch (error) {
      job.logs.push(`Error reading stdout: ${error}`);
    }
  })();

  // Read stderr in background
  (async () => {
    try {
      while (true) {
        const { done, value } = await stderrReader.read();
        if (done) break;
        const text = decoder.decode(value);
        job.logs.push(`[stderr] ${text}`);
      }
    } catch (error) {
      job.logs.push(`Error reading stderr: ${error}`);
    }
  })();

  // Wait for process to complete in background
  proc.exited.then((exitCode) => {
    job.status = exitCode === 0 ? 'completed' : 'failed';
    job.exitCode = exitCode;
    job.endTime = Date.now();

    // Invalidate stats cache
    statsCache.data = null;
  });

  return jobId;
}

// Serve the web UI
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve the main UI
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const filePath = path.join(
        process.cwd(),
        'tools',
        'tag-vocabulary.html',
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // API: Get all processed episodes with tags
    if (url.pathname === '/api/episodes') {
      const videos = await loadProcessedVideos();
      return Response.json(videos);
    }

    // API: Get tag vocabulary
    if (url.pathname === '/api/vocabulary') {
      return Response.json(tagVocabulary);
    }

    // API: Get tag statistics
    if (url.pathname === '/api/tag-stats') {
      const stats = await computeTagStats();
      return Response.json(stats);
    }

    // API: Start migration
    if (url.pathname === '/api/migrate' && req.method === 'POST') {
      try {
        const jobId = await runMigration();
        return Response.json({ jobId, status: 'started' });
      } catch (error) {
        return Response.json(
          {
            error: error instanceof Error ? error.message : 'Failed to start migration',
          },
          { status: 500 },
        );
      }
    }

    // API: Get migration status
    if (url.pathname.startsWith('/api/migrate-status/')) {
      const jobId = url.pathname.replace('/api/migrate-status/', '');
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

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`\n🏷️  Tag Vocabulary Management`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🌐 Open in browser: http://localhost:${PORT}`);
console.log(`\n📊 View episodes, manage vocabulary, and analyze tag usage\n`);
