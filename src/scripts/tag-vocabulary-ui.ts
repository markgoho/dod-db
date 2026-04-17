/**
 * Web UI for tag vocabulary management and episode viewing.
 *
 * Usage:
 *   bun run src/scripts/tag-vocabulary-ui.ts
 *   Then open http://localhost:3001
 */

import * as path from "node:path";
import type { TagCategory, TagDefinition } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { addTagToEpisodes } from "../pipeline/add-tag-to-episodes.js";
import {
  addTagToVocabulary,
  type AddTagParams as AddTagParameters,
} from "../pipeline/add-tag-to-vocabulary.js";
import { deleteTagFromVocabulary } from "../pipeline/delete-tag-from-vocabulary.js";
import { findTag } from "../pipeline/find-tag.js";
import { reprocessEpisodes } from "../pipeline/reprocess-episodes.js";
import { tagExists } from "../pipeline/tag-exists.js";
import {
  updateTagInVocabulary,
  type UpdateTagParams as UpdateTagParameters,
} from "../pipeline/update-tag-in-vocabulary.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";

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
  status: "running" | "completed" | "failed";
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
          category: vocab?.category || "unknown",
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
async function runMigrationWithTagTracking(trackTag?: string): Promise<string> {
  const jobId = `migration-${Date.now()}`;
  const job: MigrationJob = {
    id: jobId,
    status: "running",
    logs: [],
    startTime: Date.now(),
  };
  migrationJobs.set(jobId, job);

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...arguments_) => {
    job.logs.push(arguments_.join(" ") + "\n");
    originalLog(...arguments_);
  };
  console.error = (...arguments_) => {
    job.logs.push("[ERROR] " + arguments_.join(" ") + "\n");
    originalError(...arguments_);
  };
  console.warn = (...arguments_) => {
    job.logs.push("[WARN] " + arguments_.join(" ") + "\n");
    originalWarn(...arguments_);
  };

  // Run reprocessing in background
  (async () => {
    try {
      // If tracking a specific tag, use single-tag mode (much faster!)
      if (trackTag) {
        const result = await addTagToEpisodes({
          canonical: trackTag,
          enableLlmVerification: true,
          verbose: true,
        });

        // Show tag-specific results
        job.logs.push(
          `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`,
          `📊 "${trackTag}" Results:\n`,
          `   Found in ${result.episodesWithTag} episodes\n`,
          `   Total mentions: ${result.totalMentions}\n`,
        );
        if (result.episodesWithTag > 0) {
          job.logs.push(
            `   Average: ${(result.totalMentions / result.episodesWithTag).toFixed(1)} mentions/episode\n`,
          );
        }
        job.logs.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      } else {
        // Full reprocessing of all tags
        await reprocessEpisodes({
          force: true,
          skipLlm: false,
          verbose: false,
        });
      }

      job.status = "completed";
      job.exitCode = 0;
    } catch (error) {
      job.logs.push(`\n[ERROR] Migration failed: ${error}\n`);
      job.status = "failed";
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

// Run migration (reprocess all episodes)
async function runMigration(skipLlm = false): Promise<string> {
  const jobId = `migration-${Date.now()}`;
  const job: MigrationJob = {
    id: jobId,
    status: "running",
    logs: [],
    startTime: Date.now(),
  };
  migrationJobs.set(jobId, job);

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...arguments_) => {
    job.logs.push(arguments_.join(" ") + "\n");
    originalLog(...arguments_);
  };
  console.error = (...arguments_) => {
    job.logs.push("[ERROR] " + arguments_.join(" ") + "\n");
    originalError(...arguments_);
  };
  console.warn = (...arguments_) => {
    job.logs.push("[WARN] " + arguments_.join(" ") + "\n");
    originalWarn(...arguments_);
  };

  // Run reprocessing in background
  (async () => {
    try {
      await reprocessEpisodes({ force: true, skipLlm, verbose: false });
      job.status = "completed";
      job.exitCode = 0;
    } catch (error) {
      job.logs.push(`\n[ERROR] Migration failed: ${error}\n`);
      job.status = "failed";
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

// Serve the web UI
const _server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // Serve the main UI
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const filePath = path.join(process.cwd(), "tools", "tag-vocabulary.html");
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API: Get all processed episodes with tags
    if (url.pathname === "/api/episodes") {
      const videos = await loadProcessedVideos();
      return Response.json(videos);
    }

    // API: Get tag vocabulary
    if (url.pathname === "/api/vocabulary") {
      return Response.json(tagVocabulary);
    }

    // API: Get tag statistics
    if (url.pathname === "/api/tag-stats") {
      const stats = await computeTagStats();
      return Response.json(stats);
    }

    // API: Add tag to vocabulary
    if (url.pathname === "/api/vocabulary/add" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          canonical?: string;
          variations?: string | string[];
          category?: string;
          llmVerify?: boolean;
          caseSensitive?: boolean;
          description?: string;
        };
        const {
          canonical,
          variations,
          category,
          llmVerify,
          caseSensitive,
          description,
        } = body;

        // Validate required fields
        if (!canonical || typeof canonical !== "string") {
          return Response.json(
            { error: "canonical is required and must be a string" },
            { status: 400 },
          );
        }

        if (!category || typeof category !== "string") {
          return Response.json(
            { error: "category is required and must be a string" },
            { status: 400 },
          );
        }

        // Validate llmVerify + description dependency
        if (llmVerify && (!description || typeof description !== "string")) {
          return Response.json(
            { error: "description is required when llmVerify is true" },
            { status: 400 },
          );
        }

        // Parse variations (comma-separated string or array)
        let variationsArray: string[] = [];
        if (variations) {
          if (typeof variations === "string") {
            variationsArray = variations
              .split(",")
              .map(v => v.trim())
              .filter(v => v.length > 0);
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
        const tagParameters: AddTagParameters = llmVerify
          ? {
              canonical,
              variations: variationsArray,
              category: category as TagCategory,
              llmVerify: true,
              description: description!, // We validated this is present when llmVerify is true
              caseSensitive,
            }
          : {
              canonical,
              variations: variationsArray,
              category: category as TagCategory,
              caseSensitive,
            };

        await addTagToVocabulary(tagParameters);

        const jobId = await runMigrationWithTagTracking(canonical);

        return Response.json({
          success: true,
          message: `Tag "${canonical}" added successfully`,
          jobId,
        });
      } catch (error) {
        console.error("Error adding tag:", error);
        return Response.json(
          {
            error: error instanceof Error ? error.message : "Failed to add tag",
          },
          { status: 500 },
        );
      }
    }

    // API: Start migration
    if (url.pathname === "/api/migrate" && request.method === "POST") {
      try {
        const jobId = await runMigration();
        return Response.json({ jobId, status: "started" });
      } catch (error) {
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to start migration",
          },
          { status: 500 },
        );
      }
    }

    // API: Get migration status
    if (url.pathname.startsWith("/api/migrate-status/")) {
      const jobId = url.pathname.replace("/api/migrate-status/", "");
      const job = migrationJobs.get(jobId);

      if (!job) {
        return Response.json({ error: "Job not found" }, { status: 404 });
      }

      return Response.json({
        id: job.id,
        status: job.status,
        logs: job.logs.join(""),
        startTime: job.startTime,
        endTime: job.endTime,
        exitCode: job.exitCode,
      });
    }

    // API: Update a tag in vocabulary
    if (
      url.pathname.startsWith("/api/vocabulary/update/") &&
      request.method === "PUT"
    ) {
      try {
        const originalCanonical = decodeURIComponent(
          url.pathname.replace("/api/vocabulary/update/", ""),
        );
        const body = (await request.json()) as UpdateTagParameters;

        await updateTagInVocabulary(originalCanonical, body);

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${originalCanonical}" updated successfully`,
        });
      } catch (error) {
        console.error("Error updating tag:", error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : "Failed to update tag",
          },
          { status: 500 },
        );
      }
    }

    // API: Approve a proposed tag (change status to accepted)
    if (
      url.pathname.startsWith("/api/vocabulary/approve/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/vocabulary/approve/", ""),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return Response.json(
            { error: `Tag "${canonical}" not found` },
            { status: 404 },
          );
        }

        await updateTagInVocabulary(canonical, { status: "accepted" });

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" approved`,
        });
      } catch (error) {
        console.error("Error approving tag:", error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : "Failed to approve tag",
          },
          { status: 500 },
        );
      }
    }

    // API: Reject a proposed tag (change status to rejected)
    if (
      url.pathname.startsWith("/api/vocabulary/reject/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/vocabulary/reject/", ""),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return Response.json(
            { error: `Tag "${canonical}" not found` },
            { status: 404 },
          );
        }

        await updateTagInVocabulary(canonical, { status: "rejected" });

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" rejected`,
        });
      } catch (error) {
        console.error("Error rejecting tag:", error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : "Failed to reject tag",
          },
          { status: 500 },
        );
      }
    }

    // API: Delete a tag from vocabulary
    if (
      url.pathname.startsWith("/api/vocabulary/delete/") &&
      request.method === "DELETE"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/vocabulary/delete/", ""),
        );

        await deleteTagFromVocabulary(canonical);

        // Invalidate stats cache
        statsCache.data = null;

        return Response.json({
          success: true,
          message: `Tag "${canonical}" deleted`,
        });
      } catch (error) {
        console.error("Error deleting tag:", error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : "Failed to delete tag",
          },
          { status: 500 },
        );
      }
    }

    // API: Reprocess a single tag across all episodes
    if (
      url.pathname.startsWith("/api/vocabulary/reprocess-tag/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/vocabulary/reprocess-tag/", ""),
        );

        const jobId = await runMigrationWithTagTracking(canonical);

        return Response.json({
          success: true,
          message: `Started reprocessing for tag "${canonical}"`,
          jobId,
        });
      } catch (error) {
        console.error("Error reprocessing tag:", error);
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to reprocess tag",
          },
          { status: 500 },
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`\n🏷️  Tag Vocabulary Management`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🌐 Open in browser: http://localhost:${PORT}`);
console.log(`\n📊 View episodes, manage vocabulary, and analyze tag usage\n`);
