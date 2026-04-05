/**
 * API server for DoD tools.
 * Handles all /api/* endpoints only.
 *
 * Static HTML/TS/CSS files are served separately via:
 *   cd tools && bun index.html tag-vocabulary.html ...
 *
 * Usage:
 *   bun run src/scripts/tools-server.ts
 */

import * as path from "node:path";
import {
  SEGMENT_COLORS,
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import type { TagCategory, TagDefinition } from "../config/tag-vocabulary.js";
import { TAG_CATEGORIES, tagVocabulary } from "../config/tag-vocabulary.js";
import { youtubeConfig } from "../config/youtube.js";
import { addTagToEpisodes } from "../pipeline/add-tag-to-episodes.js";
import {
  addTagToVocabulary,
  type AddTagParams as AddTagParameters,
} from "../pipeline/add-tag-to-vocabulary.js";
import { approveCandidate } from "../pipeline/approve-candidate.js";
import type { CorrectionCandidate } from "../pipeline/correction-tracker.js";
import { deleteTagFromVocabulary } from "../pipeline/delete-tag-from-vocabulary.js";
import { findTag } from "../pipeline/find-tag.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import { generateTranscriptFilename } from "../pipeline/generate-transcript-filename.js";
import { getPendingCandidates } from "../pipeline/get-pending-candidates.js";
import { loadTracker } from "../pipeline/load-tracker.js";
import { rejectCandidate } from "../pipeline/reject-candidate.js";
import { reprocessEpisodes } from "../pipeline/reprocess-episodes.js";
import { saveTracker } from "../pipeline/save-tracker.js";
import { tagExists } from "../pipeline/tag-exists.js";
import {
  updateTagInVocabulary,
  type UpdateTagParams as UpdateTagParameters,
} from "../pipeline/update-tag-in-vocabulary.js";
import { getProcessedVideosWithNumbers } from "../storage/get-processed-videos-with-numbers.js";
import { getVideoById } from "../storage/get-video-by-id.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { saveProcessedVideos } from "../storage/save-processed-videos.js";
import { updateVideoSegments } from "../storage/update-video-segments.js";
import { isScriptureTag } from "../utils/is-scripture-tag.js";
import { removeTagFromEpisode } from "../utils/remove-tag-from-episode.js";

type TagVocabularyResponse = TagDefinition & {
  duplicateOf?: string;
};

type TagMigrationResult = {
  episodeNumbers?: number[];
};

function getTagTerms(tag: TagDefinition): string[] {
  return [tag.canonical, ...tag.variations];
}

function findAcceptedDuplicate(tag: TagDefinition): string | undefined {
  if (tag.status !== "proposed") {
    return undefined;
  }

  const proposedTerms = new Set(
    getTagTerms(tag).map(term => term.toLowerCase()),
  );

  return tagVocabulary.find(candidate => {
    if (candidate.status === "proposed" || candidate.status === "rejected") {
      return false;
    }

    if (candidate.canonical.toLowerCase() === tag.canonical.toLowerCase()) {
      return false;
    }

    return getTagTerms(candidate).some(term =>
      proposedTerms.has(term.toLowerCase()),
    );
  })?.canonical;
}

function getVocabularyResponse(): TagVocabularyResponse[] {
  return tagVocabulary
    .filter(
      tag => !(tag.status === "proposed" && isScriptureTag(tag.canonical)),
    )
    .map(tag => ({
      ...tag,
      duplicateOf: findAcceptedDuplicate(tag),
    }));
}

function mergeVariationsCaseInsensitive(
  acceptedTag: TagDefinition,
  proposedTag: TagDefinition,
): { mergedVariations: string[]; addedVariations: string[] } {
  const mergedVariations = [...acceptedTag.variations];
  const addedVariations: string[] = [];
  const existingTerms = new Set(
    [acceptedTag.canonical, ...acceptedTag.variations].map(term =>
      term.toLowerCase(),
    ),
  );

  for (const variation of getTagTerms(proposedTag)) {
    const lowerVariation = variation.toLowerCase();
    if (existingTerms.has(lowerVariation)) {
      continue;
    }

    mergedVariations.push(variation);
    addedVariations.push(variation);
    existingTerms.add(lowerVariation);
  }

  return { mergedVariations, addedVariations };
}

function getMergeMessage(
  proposedCanonical: string,
  acceptedCanonical: string,
  addedVariations: string[],
): string {
  if (addedVariations.length === 0) {
    return `Merged "${proposedCanonical}" into "${acceptedCanonical}". No new variations were added; the proposal was already covered.`;
  }

  const variationLabel =
    addedVariations.length === 1 ? "variation" : "variations";
  return `Merged "${proposedCanonical}" into "${acceptedCanonical}". Added ${addedVariations.length} new ${variationLabel}: ${addedVariations.join(", ")}.`;
}

function getMergeLogLine(addedVariations: string[]): string {
  if (addedVariations.length === 0) {
    return "No new variations were added; accepted tag already covered the proposal.";
  }

  return `Added variations: ${addedVariations.join(", ")}`;
}

function formatMergeResult(
  proposedCanonical: string,
  acceptedCanonical: string,
  addedVariations: string[],
) {
  return {
    success: true,
    message: getMergeMessage(
      proposedCanonical,
      acceptedCanonical,
      addedVariations,
    ),
    addedVariations,
    addedVariationCount: addedVariations.length,
    mergeTarget: acceptedCanonical,
    mergeSource: proposedCanonical,
    logLine: getMergeLogLine(addedVariations),
  };
}

const PORT = 3001; // API server on separate port

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

// Helper to add a correction to corrections.ts
async function addToCorrectionFile(
  candidate: CorrectionCandidate,
): Promise<boolean> {
  const correctionsPath = path.join(
    process.cwd(),
    "src",
    "config",
    "corrections.ts",
  );

  const file = await Bun.file(correctionsPath).text();

  // Find the insertion point (before the closing ];)
  const insertionPoint = file.lastIndexOf("];");
  if (insertionPoint === -1) {
    throw new Error("Could not find insertion point in corrections.ts");
  }

  const rulePrefix = `  [[${JSON.stringify(candidate.original)}], ${JSON.stringify(candidate.corrected)}],`;
  if (file.includes(rulePrefix)) {
    return false;
  }

  // Format the new rule
  const newRule = `${rulePrefix} // ${candidate.category} - confidence: ${candidate.confidence}%\n`;

  // Insert the new rule
  const updatedFile =
    file.slice(0, insertionPoint) + newRule + file.slice(insertionPoint);

  await Bun.write(correctionsPath, updatedFile);
  return true;
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
async function runMigrationWithTagTracking(
  skipLlm = false,
  trackTag?: string,
): Promise<{ jobId: string; completion: Promise<TagMigrationResult> }> {
  const jobId = `migration-${Date.now()}`;
  const job: MigrationJob = {
    id: jobId,
    status: "running",
    logs: [],
    startTime: Date.now(),
  };
  migrationJobs.set(jobId, job);

  let resolveCompletion!: (result: TagMigrationResult) => void;
  let rejectCompletion!: (error: unknown) => void;
  const completion = new Promise<TagMigrationResult>((resolve, reject) => {
    resolveCompletion = resolve;
    rejectCompletion = reject;
  });

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
      let migrationResult: TagMigrationResult = {};

      // If tracking a specific tag, use single-tag mode (much faster!)
      if (trackTag) {
        const result = await addTagToEpisodes({
          canonical: trackTag,
          enableLlmVerification: !skipLlm,
          verbose: false,
        });
        migrationResult = { episodeNumbers: result.episodeNumbers };

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
        await reprocessEpisodes({ force: true, skipLlm, verbose: false });
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Regenerate all Hugo episode pages (silent, fast, idempotent)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const allVideos = await getProcessedVideosWithNumbers();
      for (const video of allVideos) {
        await generateHugoEpisode(video, { silent: true });
      }
      job.logs.push(`✓ Front matter updated\n`);

      job.status = "completed";
      job.exitCode = 0;
      resolveCompletion(migrationResult);
    } catch (error) {
      job.logs.push(`\n[ERROR] Migration failed: ${error}\n`);
      job.status = "failed";
      job.exitCode = 1;
      rejectCompletion(error);
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

  return { jobId, completion };
}

// Add a new pattern to segment-patterns.ts
async function addPatternToConfig(
  segmentType: string,
  pattern: string,
): Promise<void> {
  const configPath = path.join(process.cwd(), "src/config/segment-patterns.ts");
  const file = Bun.file(configPath);
  let content = await file.text();

  // Escape special regex characters in the pattern
  const escapedPattern = pattern
    .replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    .replaceAll("'", String.raw`\'`);

  // Find the array for this segment type and add the new pattern
  const patterns = [
    new RegExp(String.raw`('${segmentType}':\s*\[)([^\]]*)`, "s"),
    new RegExp(String.raw`(${segmentType}:\s*\[)([^\]]*)`, "s"),
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
        existingPatterns.endsWith(",") || existingPatterns === ""
          ? "\n    "
          : ",\n    ";
      const newContent =
        match[1] + existingPatterns + separator + newPattern + ",\n  ";
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

// Get audio file path for a processed record
async function getAudioFilePath(videoId: string): Promise<string | null> {
  const audioDir = youtubeConfig.audioDirectory;

  // Try common extensions for legacy YouTube-backed episodes
  const extensions = [".webm", ".m4a", ".mp3", ".wav"];

  for (const extension of extensions) {
    const filePath = path.join(audioDir, `${videoId}${extension}`);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return filePath;
    }
  }

  // RSS-backed episodes store audio using the generated transcript filename stem
  const videos = await loadProcessedVideos();
  const video = videos.find(item => item.videoId === videoId);
  if (!video) {
    return null;
  }

  const filename = generateTranscriptFilename(video.title, video.publishedAt);
  const rssAudioPath = path.join(
    audioDir,
    `rss-${filename.replace(/\.txt$/, "")}.mp3`,
  );

  if (await Bun.file(rssAudioPath).exists()) {
    return rssAudioPath;
  }

  if (video.audioUrl) {
    const audioFiles = [...new Bun.Glob("rss-*.mp3").scanSync(audioDir)];
    const matchingFile = audioFiles.find(fileName =>
      fileName.includes(filename.replace(/\.txt$/, "")),
    );
    if (matchingFile) {
      return path.join(audioDir, matchingFile);
    }
  }

  return null;
}

// API-only server
const _server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers for cross-origin requests from static file server
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper to return JSON with CORS
    const jsonResponse = (data: unknown, status = 200) => {
      return Response.json(data, { status, headers: corsHeaders });
    };

    // Only handle /api/* routes
    if (!url.pathname.startsWith("/api/")) {
      return jsonResponse(
        {
          error:
            "Not Found - This is an API-only server. Serve HTML files with: cd tools && bun index.html",
        },
        404,
      );
    }

    // Review Corrections API: Get pending candidates
    if (url.pathname === "/api/review-corrections/candidates") {
      const tracker = await loadTracker();
      const pending = getPendingCandidates(tracker);
      return jsonResponse(pending);
    }

    // Review Corrections API: Approve a candidate
    if (url.pathname.startsWith("/api/review-corrections/approve/")) {
      const key = decodeURIComponent(
        url.pathname.replace("/api/review-corrections/approve/", ""),
      );
      const tracker = await loadTracker();

      const candidate = tracker.candidates[key];
      if (!candidate) {
        return jsonResponse({ error: "Candidate not found" }, 404);
      }

      try {
        // Get edited values from query params (if provided)
        const searchParameters = new URL(request.url).searchParams;
        const editedOriginal = searchParameters.get("original");
        const editedCorrected = searchParameters.get("corrected");

        // Use edited values if provided, otherwise use candidate's values
        const finalCandidate = {
          ...candidate,
          original: editedOriginal || candidate.original,
          corrected: editedCorrected || candidate.corrected,
        };

        const wasAdded = await addToCorrectionFile(finalCandidate);

        try {
          approveCandidate(tracker, key, "UI Review");
          await saveTracker(tracker);
        } catch (error) {
          console.error(
            "Failed to save approved correction to tracker:",
            error,
          );
          return jsonResponse({
            success: true,
            warning:
              "Correction was added to corrections.ts, but the review tracker did not update.",
            wasAdded,
          });
        }

        return jsonResponse({ success: true, wasAdded });
      } catch (error) {
        return jsonResponse(
          {
            error: error instanceof Error ? error.message : "Failed to approve",
          },
          500,
        );
      }
    }

    // Review Corrections API: Reject a candidate
    if (url.pathname.startsWith("/api/review-corrections/reject/")) {
      const key = decodeURIComponent(
        url.pathname.replace("/api/review-corrections/reject/", ""),
      );
      const tracker = await loadTracker();

      if (!tracker.candidates[key]) {
        return jsonResponse({ error: "Candidate not found" }, 404);
      }

      try {
        rejectCandidate(tracker, key, "UI Review");
        await saveTracker(tracker);

        return jsonResponse({ success: true });
      } catch (error) {
        console.error("Failed to save rejected correction to tracker:", error);
        return jsonResponse(
          {
            error: error instanceof Error ? error.message : "Failed to reject",
          },
          500,
        );
      }
    }

    // ========================================
    // Tag Vocabulary API
    // ========================================

    // Tag Vocabulary API: Get all processed episodes with tags
    if (url.pathname === "/api/tag-vocabulary/episodes") {
      const videos = await getProcessedVideosWithNumbers();
      return jsonResponse(videos);
    }

    // Tag Vocabulary API: Get tag vocabulary
    if (url.pathname === "/api/tag-vocabulary/vocabulary") {
      return jsonResponse(getVocabularyResponse());
    }

    // Tag Vocabulary API: Get available categories
    if (url.pathname === "/api/tag-vocabulary/categories") {
      return jsonResponse(TAG_CATEGORIES);
    }

    // Tag Vocabulary API: Get tag statistics
    if (url.pathname === "/api/tag-vocabulary/tag-stats") {
      const stats = await computeTagStats();
      return jsonResponse(stats);
    }

    // Tag Vocabulary API: Add tag to vocabulary
    if (
      url.pathname === "/api/tag-vocabulary/vocabulary/add" &&
      request.method === "POST"
    ) {
      try {
        const body = (await request.json()) as {
          canonical?: string;
          variations?: string | string[];
          category?: string;
          llmVerify?: boolean;
          description?: string;
          episodes?: number[];
        };
        const {
          canonical,
          variations,
          category,
          llmVerify,
          description,
          episodes,
        } = body;

        // Validate required fields
        if (!canonical || typeof canonical !== "string") {
          return jsonResponse(
            { error: "canonical is required and must be a string" },
            400,
          );
        }

        if (!category || typeof category !== "string") {
          return jsonResponse(
            { error: "category is required and must be a string" },
            400,
          );
        }

        // Validate llmVerify + description dependency
        if (llmVerify && (!description || typeof description !== "string")) {
          return jsonResponse(
            { error: "description is required when llmVerify is true" },
            400,
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
          return jsonResponse(
            { error: `Tag "${canonical}" already exists in vocabulary` },
            409,
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
              episodes,
            }
          : {
              canonical,
              variations: variationsArray,
              category: category as TagCategory,
              episodes,
            };

        await addTagToVocabulary(tagParameters);

        // Start reprocessing all episodes (skip LLM to save costs)
        const { jobId, completion } = await runMigrationWithTagTracking(
          true,
          canonical,
        ); // skipLlm = true, track this tag
        void completion
          .then(async result => {
            if (result.episodeNumbers) {
              await updateTagInVocabulary(canonical, {
                episodes: result.episodeNumbers,
              });
            }
          })
          .catch(error => {
            console.error(
              `Error persisting episodes for tag "${canonical}":`,
              error,
            );
          });

        return jsonResponse({
          success: true,
          message: `Tag "${canonical}" added successfully`,
          jobId,
        });
      } catch (error) {
        console.error("Error adding tag:", error);
        return jsonResponse(
          {
            error: error instanceof Error ? error.message : "Failed to add tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Start migration
    if (
      url.pathname === "/api/tag-vocabulary/migrate" &&
      request.method === "POST"
    ) {
      try {
        const { jobId } = await runMigrationWithTagTracking();
        return jsonResponse({ jobId, status: "started" });
      } catch (error) {
        return jsonResponse(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to start migration",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Get migration status
    if (url.pathname.startsWith("/api/tag-vocabulary/migrate-status/")) {
      const jobId = url.pathname.replace(
        "/api/tag-vocabulary/migrate-status/",
        "",
      );
      const job = migrationJobs.get(jobId);

      if (!job) {
        return jsonResponse({ error: "Job not found" }, 404);
      }

      return jsonResponse({
        id: job.id,
        status: job.status,
        logs: job.logs.join(""),
        startTime: job.startTime,
        endTime: job.endTime,
        exitCode: job.exitCode,
      });
    }

    // Tag Vocabulary API: Update a tag in vocabulary
    if (
      url.pathname.startsWith("/api/tag-vocabulary/vocabulary/update/") &&
      request.method === "PUT"
    ) {
      try {
        const originalCanonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/vocabulary/update/", ""),
        );
        const body = (await request.json()) as UpdateTagParameters & {
          episodes?: number[];
        };

        // Check if status is changing to 'accepted' (for auto-reprocessing)
        const existingTag = findTag(originalCanonical);
        const wasProposed = existingTag?.status === "proposed";
        const isBeingAccepted = body.status === "accepted";

        await updateTagInVocabulary(originalCanonical, body);

        // Invalidate stats cache
        statsCache.data = null;

        // If tag was proposed and is now being accepted, reprocess all episodes
        if (wasProposed && isBeingAccepted) {
          const canonical = body.canonical || originalCanonical;
          const shouldSkipLlm = body.llmVerify !== true;
          const { jobId, completion } = await runMigrationWithTagTracking(
            shouldSkipLlm,
            canonical,
          );
          void completion
            .then(async result => {
              if (result.episodeNumbers) {
                await updateTagInVocabulary(canonical, {
                  episodes: result.episodeNumbers,
                });
              }
            })
            .catch(error => {
              console.error(
                `Error persisting episodes for tag "${canonical}":`,
                error,
              );
            });

          return jsonResponse({
            success: true,
            message: `Tag "${canonical}" updated and reprocessing started`,
            jobId,
          });
        }

        return jsonResponse({
          success: true,
          message: `Tag "${originalCanonical}" updated successfully`,
        });
      } catch (error) {
        console.error("Error updating tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to update tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Approve a proposed tag
    if (
      url.pathname.startsWith("/api/tag-vocabulary/vocabulary/approve/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/vocabulary/approve/", ""),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return jsonResponse({ error: `Tag "${canonical}" not found` }, 404);
        }

        await updateTagInVocabulary(canonical, { status: "accepted" });

        // Invalidate stats cache
        statsCache.data = null;

        // Trigger reprocessing for this tag across all episodes (like manual add does)
        const updatedTag = findTag(canonical);
        const shouldSkipLlm = updatedTag?.llmVerify !== true;
        const { jobId, completion } = await runMigrationWithTagTracking(
          shouldSkipLlm,
          canonical,
        );
        void completion
          .then(async result => {
            if (result.episodeNumbers) {
              await updateTagInVocabulary(canonical, {
                episodes: result.episodeNumbers,
              });
            }
          })
          .catch(error => {
            console.error(
              `Error persisting episodes for tag "${canonical}":`,
              error,
            );
          });

        return jsonResponse({
          success: true,
          message: `Tag "${canonical}" approved and reprocessing started`,
          jobId,
        });
      } catch (error) {
        console.error("Error approving tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to approve tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Dismiss a proposed tag
    if (
      url.pathname.startsWith("/api/tag-vocabulary/vocabulary/dismiss/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/vocabulary/dismiss/", ""),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return jsonResponse({ error: `Tag "${canonical}" not found` }, 404);
        }

        if (tag.status !== "proposed") {
          return jsonResponse(
            { error: `Only proposed tags can be dismissed` },
            400,
          );
        }

        await deleteTagFromVocabulary(canonical);

        statsCache.data = null;

        return jsonResponse({
          success: true,
          message: `Tag "${canonical}" dismissed`,
        });
      } catch (error) {
        console.error("Error dismissing tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to dismiss tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Merge a proposed tag into an accepted tag
    if (
      url.pathname === "/api/tag-vocabulary/vocabulary/merge" &&
      request.method === "POST"
    ) {
      try {
        const body = (await request.json()) as {
          proposedCanonical?: string;
          acceptedCanonical?: string;
        };
        const { proposedCanonical, acceptedCanonical } = body;

        if (!proposedCanonical || !acceptedCanonical) {
          return jsonResponse(
            {
              error: "proposedCanonical and acceptedCanonical are required",
            },
            400,
          );
        }

        const proposedTag = findTag(proposedCanonical);
        if (!proposedTag) {
          return jsonResponse(
            { error: `Tag "${proposedCanonical}" not found` },
            404,
          );
        }

        if (proposedTag.status !== "proposed") {
          return jsonResponse(
            { error: `Only proposed tags can be merged` },
            400,
          );
        }

        const acceptedTag = findTag(acceptedCanonical);
        if (!acceptedTag) {
          return jsonResponse(
            { error: `Tag "${acceptedCanonical}" not found` },
            404,
          );
        }

        if (
          acceptedTag.status === "proposed" ||
          acceptedTag.status === "rejected"
        ) {
          return jsonResponse(
            { error: `Merge target must be an accepted tag` },
            400,
          );
        }

        const { mergedVariations, addedVariations } =
          mergeVariationsCaseInsensitive(acceptedTag, proposedTag);

        await updateTagInVocabulary(acceptedCanonical, {
          variations: mergedVariations,
        });
        await deleteTagFromVocabulary(proposedCanonical);

        statsCache.data = null;

        return jsonResponse(
          formatMergeResult(
            proposedCanonical,
            acceptedCanonical,
            addedVariations,
          ),
        );
      } catch (error) {
        console.error("Error merging tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to merge tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Reject a proposed tag
    if (
      url.pathname.startsWith("/api/tag-vocabulary/vocabulary/reject/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/vocabulary/reject/", ""),
        );
        const tag = findTag(canonical);

        if (!tag) {
          return jsonResponse({ error: `Tag "${canonical}" not found` }, 404);
        }

        await updateTagInVocabulary(canonical, { status: "rejected" });

        // Remove tag from all episodes in processed-videos.json
        console.log(`Removing "${canonical}" from all episodes...`);
        const videos = await loadProcessedVideos();
        const affectedVideos: typeof videos = [];

        for (const video of videos) {
          if (video.tags) {
            const initialLength = video.tags.length;
            // Remove this tag (case-insensitive)
            video.tags = video.tags.filter(
              t => t.tag.toLowerCase() !== canonical.toLowerCase(),
            );
            if (video.tags.length < initialLength) {
              affectedVideos.push(video);
            }
          }
        }

        // Save updated videos
        await saveProcessedVideos(videos);
        console.log(
          `✓ Removed "${canonical}" from ${affectedVideos.length} episodes`,
        );

        // Update Hugo frontmatter ONLY for affected episodes (surgical update)
        if (affectedVideos.length > 0) {
          console.log(
            `Updating Hugo frontmatter for ${affectedVideos.length} episodes...`,
          );
          for (const video of affectedVideos) {
            const removed = await removeTagFromEpisode({
              video,
              tagToRemove: canonical,
            });
            if (!removed) {
              console.warn(
                `  Warning: Tag "${canonical}" not found in Hugo frontmatter for episode ${video.episodeNumber}`,
              );
            }
          }
        }

        // Invalidate stats cache
        statsCache.data = null;

        return jsonResponse({
          success: true,
          message: `Tag "${canonical}" rejected and removed from ${affectedVideos.length} episodes`,
        });
      } catch (error) {
        console.error("Error rejecting tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to reject tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Reprocess a single tag
    if (
      url.pathname.startsWith("/api/tag-vocabulary/reprocess-tag/") &&
      request.method === "POST"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/reprocess-tag/", ""),
        );

        // Verify tag exists
        const tag = findTag(canonical);
        if (!tag) {
          return jsonResponse({ error: `Tag "${canonical}" not found` }, 404);
        }

        // Start reprocessing for this tag (with LLM verification enabled)
        const { jobId, completion } = await runMigrationWithTagTracking(
          false,
          canonical,
        ); // skipLlm = false, track this tag
        void completion
          .then(async result => {
            if (result.episodeNumbers) {
              await updateTagInVocabulary(canonical, {
                episodes: result.episodeNumbers,
              });
            }
          })
          .catch(error => {
            console.error(
              `Error persisting episodes for tag "${canonical}":`,
              error,
            );
          });

        return jsonResponse({
          success: true,
          message: `Reprocessing started for tag "${canonical}"`,
          jobId,
        });
      } catch (error) {
        console.error("Error reprocessing tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to reprocess tag",
          },
          500,
        );
      }
    }

    // Tag Vocabulary API: Delete a tag from vocabulary
    if (
      url.pathname.startsWith("/api/tag-vocabulary/vocabulary/delete/") &&
      request.method === "DELETE"
    ) {
      try {
        const canonical = decodeURIComponent(
          url.pathname.replace("/api/tag-vocabulary/vocabulary/delete/", ""),
        );

        // Delete from vocabulary file
        await deleteTagFromVocabulary(canonical);

        // Remove tag from all episodes in processed-videos.json
        console.log(`Removing "${canonical}" from all episodes...`);
        const videos = await loadProcessedVideos();
        const affectedVideos: typeof videos = [];

        for (const video of videos) {
          if (video.tags) {
            const initialLength = video.tags.length;
            // Remove this tag (case-insensitive)
            video.tags = video.tags.filter(
              t => t.tag.toLowerCase() !== canonical.toLowerCase(),
            );
            if (video.tags.length < initialLength) {
              affectedVideos.push(video);
            }
          }
        }

        // Save updated videos
        await saveProcessedVideos(videos);
        console.log(
          `✓ Removed "${canonical}" from ${affectedVideos.length} episodes`,
        );

        // Update Hugo frontmatter ONLY for affected episodes (surgical update)
        if (affectedVideos.length > 0) {
          console.log(
            `Updating Hugo frontmatter for ${affectedVideos.length} episodes...`,
          );
          for (const video of affectedVideos) {
            const removed = await removeTagFromEpisode({
              video,
              tagToRemove: canonical,
            });
            if (!removed) {
              console.warn(
                `  Warning: Tag "${canonical}" not found in Hugo frontmatter for episode ${video.episodeNumber}`,
              );
            }
          }
        }

        // Invalidate stats cache
        statsCache.data = null;

        return jsonResponse({
          success: true,
          message: `Tag "${canonical}" deleted from vocabulary and removed from ${affectedVideos.length} episodes`,
        });
      } catch (error) {
        console.error("Error deleting tag:", error);
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to delete tag",
          },
          500,
        );
      }
    }

    // ========================================
    // Segment Verification API
    // ========================================

    // Segment Verification API: Get all episodes with segments
    if (url.pathname === "/api/segment-verification/episodes") {
      const videos = await getProcessedVideosWithNumbers();
      const videosWithAudio = await Promise.all(
        videos.map(async video => ({
          ...video,
          hasAudio: !!(await getAudioFilePath(video.videoId)),
        })),
      );

      // Sort by episode number
      const sorted = [...videosWithAudio].sort(
        (a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0),
      );
      return jsonResponse(sorted);
    }

    // Segment Verification API: Get segment metadata
    if (url.pathname === "/api/segment-verification/segment-metadata") {
      return jsonResponse({
        labels: SEGMENT_LABELS,
        colors: SEGMENT_COLORS,
        types: Object.keys(SEGMENT_LABELS),
      });
    }

    // Segment Verification API: Get transcript for an episode
    if (url.pathname.startsWith("/api/segment-verification/transcript/")) {
      const videoId = url.pathname.replace(
        "/api/segment-verification/transcript/",
        "",
      );
      const videos = await loadProcessedVideos();
      const video = videos.find(v => v.videoId === videoId);

      if (!video) {
        return jsonResponse({ error: "Video not found" }, 404);
      }

      const file = Bun.file(video.transcriptPath);
      const exists = await file.exists();
      if (!exists) {
        return jsonResponse({ error: "Transcript file not found" }, 404);
      }

      const transcript = await file.text();
      return jsonResponse({ transcript });
    }

    // Segment Verification API: Update segments for an episode
    if (
      url.pathname.startsWith("/api/segment-verification/segments/") &&
      request.method === "PUT"
    ) {
      const videoId = url.pathname.replace(
        "/api/segment-verification/segments/",
        "",
      );

      try {
        const body = (await request.json()) as { segments: EpisodeSegment[] };

        if (!Array.isArray(body.segments)) {
          return jsonResponse({ error: "segments must be an array" }, 400);
        }

        await updateVideoSegments(videoId, body.segments);

        // Regenerate Hugo episode page with updated segments
        const video = await getVideoById(videoId);
        if (video) {
          await generateHugoEpisode(video);
        }

        return jsonResponse({ success: true });
      } catch (error) {
        return jsonResponse(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to update segments",
          },
          500,
        );
      }
    }

    // Segment Verification API: Get segment statistics
    if (url.pathname === "/api/segment-verification/stats") {
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
            s => s.confidence === "verified",
          );
          if (allVerified) {
            stats.episodesVerified++;
          }

          for (const segment of video.segments) {
            stats.segmentsByType[segment.type] =
              (stats.segmentsByType[segment.type] || 0) + 1;

            if (segment.confidence === "auto") {
              stats.autoDetected++;
            } else {
              stats.verified++;
            }
          }
        }
      }

      return jsonResponse(stats);
    }

    // Segment Verification API: Add a learned pattern
    if (
      url.pathname === "/api/segment-verification/patterns/add" &&
      request.method === "POST"
    ) {
      try {
        const body = (await request.json()) as {
          segmentType: string;
          pattern: string;
        };

        if (!body.segmentType || !body.pattern) {
          return jsonResponse(
            { error: "segmentType and pattern are required" },
            400,
          );
        }

        // Validate segment type
        if (!SEGMENT_LABELS[body.segmentType as SegmentType]) {
          return jsonResponse(
            { error: `Invalid segment type: ${body.segmentType}` },
            400,
          );
        }

        await addPatternToConfig(body.segmentType, body.pattern);
        return jsonResponse({
          success: true,
          message: `Pattern added for ${body.segmentType}`,
        });
      } catch (error) {
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : "Failed to add pattern",
          },
          500,
        );
      }
    }

    // ========================================
    // Shared Resources
    // ========================================

    // Serve audio files (used by multiple tools)
    if (url.pathname.startsWith("/api/audio/")) {
      const videoId = url.pathname.replace("/api/audio/", "");
      const audioPath = await getAudioFilePath(videoId);

      if (!audioPath) {
        return jsonResponse({ error: "Audio not found" }, 404);
      }

      const file = Bun.file(audioPath);
      const extension = path.extname(audioPath).toLowerCase();

      // Determine content type
      const contentTypes: Record<string, string> = {
        ".webm": "audio/webm",
        ".m4a": "audio/mp4",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
      };

      return new Response(file, {
        headers: {
          "Content-Type": contentTypes[extension] || "audio/webm",
          "Accept-Ranges": "bytes",
        },
      });
    }

    // ========================================
    // Per-Episode API
    // ========================================

    // Episode API: Get single episode data
    if (
      /^\/api\/episode\/[^/]+$/.test(url.pathname) &&
      request.method === "GET"
    ) {
      const videoId = url.pathname.replace("/api/episode/", "");
      const videos = await getProcessedVideosWithNumbers();
      const video = videos.find(v => v.videoId === videoId);

      if (!video) {
        return jsonResponse({ error: "Episode not found" }, 404);
      }

      // Check audio availability
      const audioPath = await getAudioFilePath(videoId);

      return jsonResponse({
        ...video,
        hasAudio: !!audioPath,
      });
    }

    // Episode API: Get corrections scoped to an episode
    if (
      /^\/api\/episode\/[^/]+\/corrections$/.test(url.pathname) &&
      request.method === "GET"
    ) {
      const videoId = url.pathname.split("/")[3] ?? "";
      const tracker = await loadTracker();

      // Filter candidates that include this episode
      const episodeCandidates = Object.entries(tracker.candidates)
        .filter(
          ([, c]) =>
            c.episodeIds?.includes(videoId) ||
            c.episodes?.some((e: string) => e.includes(videoId)),
        )
        .map(([key, candidate]) => ({ key, ...candidate }));

      return jsonResponse(episodeCandidates);
    }

    return jsonResponse({ error: "API endpoint not found" }, 404);
  },
});

console.log(`\n🔌 DoD API Server`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🌐 API Server running: http://localhost:${PORT}`);
console.log(`\n📋 API Endpoints available:`);
console.log(`   • /api/review-corrections/*`);
console.log(`   • /api/tag-vocabulary/*`);
console.log(`   • /api/segment-verification/*`);
console.log(`   • /api/episode/*`);
console.log(`\n📄 To serve HTML/TS/CSS files, run in separate terminal:`);
console.log(
  `   cd tools && bun index.html tag-vocabulary.html segment-verification.html`,
);
console.log(
  `\n   This will start a static file server on http://localhost:3000`,
);
console.log(`\n`);
