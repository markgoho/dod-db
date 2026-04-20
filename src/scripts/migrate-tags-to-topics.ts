import { tagVocabulary } from "../config/tag-vocabulary.js";
import { parseHugoFile } from "../utils/parse-hugo-file.js";
import { titleToSlug } from "../utils/title-to-slug.js";

const REPO_ROOT = new URL("../../", import.meta.url);
const TOPICS_DIR = new URL("../../hugo/content/topics/", import.meta.url)
  .pathname;
const EPISODES_GLOB = new Bun.Glob("hugo/content/episodes/*/index.md");

type CanonicalNameBySlug = Map<string, string>;

function buildCanonicalNameBySlug(): CanonicalNameBySlug {
  return new Map(
    tagVocabulary.map(entry => [titleToSlug(entry.canonical), entry.canonical]),
  );
}

async function loadTopicSlugs(): Promise<Set<string>> {
  const topicSlugs = new Set<string>();

  for await (const path of new Bun.Glob("*/_index.md").scan({
    cwd: TOPICS_DIR,
  })) {
    const slug = path.split("/")[0];
    if (slug) {
      topicSlugs.add(slug);
    }
  }

  return topicSlugs;
}

function renderFrontmatter(frontmatter: Record<string, unknown>): string {
  return Bun.YAML.stringify(frontmatter, undefined, 2)
    .replaceAll(/ +\n/g, "\n")
    .trimEnd();
}

async function migrateEpisode(
  filePath: string,
  topicSlugs: Set<string>,
  canonicalNameBySlug: CanonicalNameBySlug,
): Promise<boolean> {
  const { frontmatter, content } = await parseHugoFile(filePath);
  const currentTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  if (currentTags.length === 0) {
    return false;
  }

  const topics: string[] = [];
  const tags: string[] = [];

  for (const value of currentTags) {
    if (typeof value !== "string") {
      continue;
    }

    const slug = titleToSlug(value);
    if (topicSlugs.has(slug)) {
      topics.push(canonicalNameBySlug.get(slug) ?? value);
    } else {
      tags.push(value);
    }
  }

  const nextFrontmatter: Record<string, unknown> = { ...frontmatter };
  if (topics.length > 0) {
    nextFrontmatter.topics = topics;
  } else {
    delete nextFrontmatter.topics;
  }

  if (tags.length > 0) {
    nextFrontmatter.tags = tags;
  } else {
    delete nextFrontmatter.tags;
  }

  const nextContent = `---\n${renderFrontmatter(nextFrontmatter)}\n---\n${content}`;
  const currentContent = await Bun.file(filePath).text();
  if (currentContent === nextContent) {
    return false;
  }

  await Bun.write(filePath, nextContent);
  return true;
}

async function main(): Promise<void> {
  const topicSlugs = await loadTopicSlugs();
  const canonicalNameBySlug = buildCanonicalNameBySlug();
  let updatedCount = 0;

  for await (const relativePath of EPISODES_GLOB.scan({
    cwd: REPO_ROOT.pathname,
  })) {
    const filePath = new URL(relativePath, REPO_ROOT).pathname;
    const updated = await migrateEpisode(
      filePath,
      topicSlugs,
      canonicalNameBySlug,
    );
    if (updated) {
      updatedCount += 1;
    }
  }

  console.log(`Updated ${updatedCount} episode files`);
}

await main();
