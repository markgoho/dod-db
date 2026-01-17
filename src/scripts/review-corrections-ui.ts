/**
 * Web UI for reviewing correction candidates.
 *
 * Usage:
 *   bun run src/scripts/review-corrections-ui.ts
 *   Then open http://localhost:3000
 */

import * as path from "node:path";
import { approveCandidate } from "../pipeline/approve-candidate.js";
import type { CorrectionCandidate } from "../pipeline/correction-tracker.js";
import { getPendingCandidates } from "../pipeline/get-pending-candidates.js";
import { loadTracker } from "../pipeline/load-tracker.js";
import { rejectCandidate } from "../pipeline/reject-candidate.js";
import { saveTracker } from "../pipeline/save-tracker.js";

const PORT = 3000;

// Helper to add a correction to corrections.ts
async function addToCorrectionFile(
  candidate: CorrectionCandidate,
): Promise<void> {
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

  // Format the new rule
  const newRule = `  [["${candidate.original}"], "${candidate.corrected}"], // ${candidate.category} - confidence: ${candidate.confidence}%\n`;

  // Insert the new rule
  const updatedFile =
    file.slice(0, insertionPoint) + newRule + file.slice(insertionPoint);

  await Bun.write(correctionsPath, updatedFile);
}

// Serve the web UI
const _server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // Serve the main UI (correction review)
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const filePath = path.join(
        process.cwd(),
        "tools",
        "review-corrections.html",
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Serve data files
    if (url.pathname === "/data/correction-candidates.json") {
      const filePath = path.join(
        process.cwd(),
        "data",
        "correction-candidates.json",
      );
      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serve audio files
    if (url.pathname.startsWith("/audio/")) {
      const videoId = url.pathname.replace("/audio/", "");
      const audioDir = path.join(process.cwd(), "data", "audio");

      // Find the audio file (could be .webm, .m4a, .opus, etc.)
      const { readdir } = await import("node:fs/promises");
      try {
        const files = await readdir(audioDir);
        const audioFile = files.find(f => f.startsWith(videoId));

        if (audioFile) {
          const filePath = path.join(audioDir, audioFile);
          const file = Bun.file(filePath);
          return new Response(file, {
            headers: { "Content-Type": "audio/webm" },
          });
        }
      } catch {
        // Fall through to 404
      }
    }

    // API: Get pending candidates
    if (url.pathname === "/api/candidates") {
      const tracker = await loadTracker();
      const pending = getPendingCandidates(tracker);
      return Response.json(pending);
    }

    // API: Approve a candidate
    if (url.pathname.startsWith("/api/approve/")) {
      const key = decodeURIComponent(url.pathname.replace("/api/approve/", ""));
      const tracker = await loadTracker();

      const candidate = tracker.candidates[key];
      if (!candidate) {
        return Response.json({ error: "Candidate not found" }, { status: 404 });
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

        // Add to corrections.ts
        await addToCorrectionFile(finalCandidate);

        // Mark as approved
        approveCandidate(tracker, key, "UI Review");
        await saveTracker(tracker);

        return Response.json({ success: true });
      } catch (error) {
        return Response.json(
          {
            error: error instanceof Error ? error.message : "Failed to approve",
          },
          { status: 500 },
        );
      }
    }

    // API: Reject a candidate
    if (url.pathname.startsWith("/api/reject/")) {
      const key = decodeURIComponent(url.pathname.replace("/api/reject/", ""));
      const tracker = await loadTracker();

      if (!tracker.candidates[key]) {
        return Response.json({ error: "Candidate not found" }, { status: 404 });
      }

      rejectCandidate(tracker, key, "UI Review");
      await saveTracker(tracker);

      return Response.json({ success: true });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`\n🎨 Correction Review UI`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🌐 Open in browser: http://localhost:${PORT}`);
console.log(`\n📝 Review and approve/reject correction candidates`);
console.log(
  `✅ Approved corrections will be added to src/config/corrections.ts\n`,
);
