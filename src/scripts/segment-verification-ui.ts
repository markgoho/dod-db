/**
 * Web UI for segment verification and editing.
 *
 * Usage:
 *   bun run src/scripts/segment-verification-ui.ts
 *   Then open http://localhost:3002
 */

import * as path from "node:path";
import {
  SEGMENT_COLORS,
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import { youtubeConfig } from "../config/youtube.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateVideoSegments } from "../storage/update-video-segments.js";

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
  // Look for: 'segment-type': [ or segment-type: [
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

const PORT = 3002;

// Get audio file path for a video ID
async function getAudioFilePath(videoId: string): Promise<string | null> {
  const audioDir = youtubeConfig.audioDirectory;

  // Try common extensions
  const extensions = [".webm", ".m4a", ".mp3", ".wav"];

  for (const extension of extensions) {
    const filePath = path.join(audioDir, `${videoId}${extension}`);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return filePath;
    }
  }

  return null;
}

// Serve the web UI
Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // Serve the main UI
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const filePath = path.join(
        process.cwd(),
        "tools",
        "segment-verification.html",
      );
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (!exists) {
        return new Response(
          "UI file not found. Please create tools/segment-verification.html",
          {
            status: 404,
          },
        );
      }
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API: Get all episodes with segments
    if (url.pathname === "/api/episodes") {
      const videos = await loadProcessedVideos();
      // Sort by episode number
      const sorted = [...videos].toSorted(
        (a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0),
      );
      return Response.json(sorted);
    }

    // API: Get segment metadata (labels, colors)
    if (url.pathname === "/api/segment-metadata") {
      return Response.json({
        labels: SEGMENT_LABELS,
        colors: SEGMENT_COLORS,
        types: Object.keys(SEGMENT_LABELS),
      });
    }

    // API: Get transcript for an episode
    if (url.pathname.startsWith("/api/transcript/")) {
      const videoId = url.pathname.replace("/api/transcript/", "");
      const videos = await loadProcessedVideos();
      const video = videos.find(v => v.videoId === videoId);

      if (!video) {
        return Response.json({ error: "Video not found" }, { status: 404 });
      }

      const file = Bun.file(video.transcriptPath);
      const exists = await file.exists();
      if (!exists) {
        return Response.json(
          { error: "Transcript file not found" },
          { status: 404 },
        );
      }

      const transcript = await file.text();
      return Response.json({ transcript });
    }

    // API: Get audio file for an episode
    if (url.pathname.startsWith("/api/audio/")) {
      const videoId = url.pathname.replace("/api/audio/", "");
      const audioPath = await getAudioFilePath(videoId);

      if (!audioPath) {
        return Response.json({ error: "Audio not found" }, { status: 404 });
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

    // API: Update segments for an episode
    if (url.pathname.startsWith("/api/segments/") && request.method === "PUT") {
      const videoId = url.pathname.replace("/api/segments/", "");

      try {
        const body = (await request.json()) as { segments: EpisodeSegment[] };

        if (!Array.isArray(body.segments)) {
          return Response.json(
            { error: "segments must be an array" },
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
                : "Failed to update segments",
          },
          { status: 500 },
        );
      }
    }

    // API: Get segment statistics
    if (url.pathname === "/api/stats") {
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

      return Response.json(stats);
    }

    // API: Add a learned pattern
    if (url.pathname === "/api/patterns/add" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          segmentType: string;
          pattern: string;
        };

        if (!body.segmentType || !body.pattern) {
          return Response.json(
            { error: "segmentType and pattern are required" },
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
              error instanceof Error ? error.message : "Failed to add pattern",
          },
          { status: 500 },
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`\n🎬 Segment Verification UI`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🌐 Open in browser: http://localhost:${PORT}`);
console.log(`\n📊 View segments, verify boundaries, and edit timestamps\n`);
