/**
 * Gather where an Episode's Transcript may hold Trigger Claims for
 * Scholarship Pages, Timeline Entries and candidate subjects, plus consensus
 * and date wording for new subjects (process-next-episode Step 5).
 *
 * Usage: bun run synthesis:gather <episode-number>
 */

import { Glob } from "bun";
import path from "node:path";
import { CandidatesSchema } from "../hugo/check-scholarship.js";
import { getGuestSpeakers } from "../hugo/get-guest-speakers.js";
import {
  findTargetHits,
  MIN_MENTIONS,
  parseTranscript,
  sweep,
  WINDOW_SECONDS,
  type Target,
} from "../hugo/synthesis-candidates.js";
import { readFrontmatter, readYaml } from "../hugo/synthesis-check.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";

const RelatedFields = ["books", "tags", "topics"] as const;

function toTarget(
  kind: Target["kind"],
  id: string,
  frontmatter: unknown,
): Target {
  const fm = frontmatter as {
    watch?: string[];
    related?: Partial<Record<(typeof RelatedFields)[number], string[]>>;
  };
  return {
    kind,
    id,
    watch: fm.watch ?? [],
    related: {
      books: fm.related?.books ?? [],
      tags: fm.related?.tags ?? [],
      topics: fm.related?.topics ?? [],
    },
  };
}

async function loadTargets(dir: string, kind: Target["kind"]) {
  const files = await Array.fromAsync(new Glob("*.md").scan({ cwd: dir }));
  return Promise.all(
    files
      .filter(f => f !== "_index.md")
      .toSorted()
      .map(async f =>
        toTarget(
          kind,
          f.replace(/\.md$/, ""),
          await readFrontmatter(path.join(dir, f)),
        ),
      ),
  );
}

async function main(): Promise<void> {
  const episodeNumber = Number(process.argv[2]);
  if (!Number.isInteger(episodeNumber)) {
    throw new TypeError("Usage: bun run synthesis:gather <episode-number>");
  }
  const video = (await loadProcessedVideos()).find(
    v => v.episodeNumber === episodeNumber,
  );
  if (!video?.transcriptPath) {
    throw new Error(`Episode ${episodeNumber} has no processed Transcript`);
  }

  const candidates = CandidatesSchema.parse(
    await readYaml("data/scholarship-candidates.yaml"),
  );
  const subjects = candidates.subjects.filter(s => s.status !== "dropped");
  const targets = [
    ...(await loadTargets("hugo/content/scholarship", "page")),
    ...(await loadTargets("hugo/content/timeline", "entry")),
    ...subjects
      .filter(s => (s.watch ?? []).length > 0)
      .map(s => ({
        kind: "subject" as const,
        id: s.slug,
        watch: s.watch ?? [],
      })),
  ];

  const lines = parseTranscript(await Bun.file(video.transcriptPath).text());
  const episode = {
    tags: video.tags ?? [],
    scriptures: (video.scriptures ?? []).map(s => ({
      book: s.book,
      mentions: s.mentions,
    })),
  };
  const targetHits = findTargetHits(lines, episode, targets);

  // Promotion signal: distinct Episodes behind each subject's triggers,
  // counting this one when the subject has a hit.
  const hitSubjects = new Set(
    targetHits.filter(t => t.kind === "subject").map(t => t.id),
  );
  const subjectEpisodes = subjects
    .map(s => {
      const episodes = new Set((s.triggers ?? []).map(t => t.episode));
      if (hitSubjects.has(s.slug)) episodes.add(episodeNumber);
      return { slug: s.slug, status: s.status, episodes: episodes.size };
    })
    .filter(s => s.episodes > 0)
    .toSorted((a, b) => b.episodes - a.episodes);

  console.log(
    JSON.stringify(
      {
        episode: episodeNumber,
        title: video.title,
        transcriptPath: video.transcriptPath,
        guests: getGuestSpeakers(video.speakers ?? []),
        minMentions: MIN_MENTIONS,
        windowSeconds: WINDOW_SECONDS,
        targets: targetHits,
        noWatch: subjects
          .filter(s => (s.watch ?? []).length === 0)
          .map(s => s.slug),
        subjectEpisodes,
        sweep: sweep(lines, targetHits),
      },
      undefined,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
