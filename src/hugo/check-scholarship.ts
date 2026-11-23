/**
 * Validate Scholarship Pages and their data against the #92 rules, and the
 * #96 candidate file.
 *
 * Usage: bun run check:scholarship
 */

import { Glob } from "bun";
import path from "node:path";
import { z } from "zod";
import { taxonomyFolderSlug } from "../utils/title-to-slug.js";

const dateValue = z.union([z.string(), z.date()]);

const CiteSchema = z.object({
  source: z.string(),
  locator: z.string(),
  quote: z.string(),
  url: z.string().optional(),
  read: dateValue,
});

const StatementSchema = z.object({
  id: z.string(),
  group: z.string(),
  question: z.string(),
  short: z.string(),
  text: z.string(),
  cites: z.array(CiteSchema),
});

export const PageSchema = z.object({
  title: z.string(),
  dek: z.string(),
  draft: z.boolean().default(false),
  core: z.string(),
  sourcesRead: dateValue.nullish(),
  related: z.object({
    books: z.array(z.string()),
    tags: z.array(z.string()),
    topics: z.array(z.string()),
  }),
  watch: z.array(z.string()).optional(),
  statements: z.array(StatementSchema),
});

const SourceSchema = z.object({
  author: z.string().nullable(),
  title: z.string(),
  series: z.string().nullable(),
  publisher: z.string().nullable(),
  year: z.number().nullable(),
  edition: z.string().nullable(),
  class: z.enum(["Scholarly", "Reference", "Tradition"]),
  kind: z.enum([
    "book",
    "article",
    "publisher-summary",
    "lecture",
    "study-bible",
    "trade-book",
  ]),
  access: z.string(),
  url: z.string(),
  hostAuthored: z.boolean(),
  tradition: z.string().nullable(),
});

export const RegistrySchema = z.record(z.string(), SourceSchema);

const TriggerSchema = z.object({
  episode: z.number().int(),
  speaker: z.string(),
  timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/),
  text: z.string(),
});

export const TriggersSchema = z.array(TriggerSchema);

const ReviewItemSchema = z.object({
  agent: z.string().optional(),
  owner: z.string(),
  note: z.string().optional(),
  edition: z.string().optional(),
});

const ReviewSectionSchema = z.record(z.string(), ReviewItemSchema).default({});

export const ReviewSchema = z.object({
  review: dateValue.nullish(),
  citations: ReviewSectionSchema,
  triggers: ReviewSectionSchema,
  rules: ReviewSectionSchema,
  sources: ReviewSectionSchema,
  leads: z.array(z.string()).default([]),
  uncited: z.array(z.string()).default([]),
});

const CandidateSubjectSchema = z
  .object({
    slug: z.string(),
    subject: z.string(),
    status: z.enum(["candidate", "passed", "held", "dropped"]),
    core: z.string().optional(),
    basis: z.string(),
    missing: z.string().optional(),
    reason: z.string().optional(),
    watch: z.array(z.string()).optional(),
    triggers: z.array(TriggerSchema).optional(),
    tested: dateValue.optional(),
    found: z.array(z.string()).optional(),
    leads: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .strict();

const CandidateStatementSchema = z
  .object({
    page: z.string(),
    question: z.string(),
    triggers: z.array(TriggerSchema).min(1),
    notes: z.string().optional(),
  })
  .strict();

export const CandidatesSchema = z
  .object({
    subjects: z.array(CandidateSubjectSchema).default([]),
    statements: z.array(CandidateStatementSchema).default([]),
  })
  .strict();

export type Candidates = z.infer<typeof CandidatesSchema>;

const EpisodesSchema = z.array(
  z.object({ episodeNumber: z.number().int().optional() }),
);

const TAXONOMIES = ["books", "tags", "topics"] as const;
type Taxonomy = (typeof TAXONOMIES)[number];
/** Term keys per taxonomy, as Hugo keys term pages (taxonomyFolderSlug). */
type Terms = Record<Taxonomy, Set<string>>;

const EpisodeTermsSchema = z.object({
  books: z.array(z.string()).nullish(),
  tags: z.array(z.string()).nullish(),
  topics: z.array(z.string()).nullish(),
});

export type Page = z.infer<typeof PageSchema>;
export type Registry = z.infer<typeof RegistrySchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type Review = z.infer<typeof ReviewSchema>;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

export async function readYaml(filePath: string): Promise<unknown> {
  return Bun.YAML.parse(await Bun.file(filePath).text());
}

export async function readFrontmatter(filePath: string): Promise<unknown> {
  const match = FRONTMATTER.exec(await Bun.file(filePath).text());
  if (!match?.[1]) throw new Error("no front matter");
  return Bun.YAML.parse(match[1]);
}

function rel(root: string, filePath: string): string {
  return path.relative(root, filePath);
}

/** Parse with a schema; on failure, push one error per issue and return undefined. */
function parseWith<T>(
  schema: z.ZodType<T>,
  value: unknown,
  label: string,
  errors: string[],
): T | undefined {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    errors.push(
      `${label}: ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
  }
  return undefined;
}

async function loadOptional(
  filePath: string,
  root: string,
  errors: string[],
  read: (p: string) => Promise<unknown>,
): Promise<unknown> {
  if (!(await Bun.file(filePath).exists())) {
    errors.push(`${rel(root, filePath)}: file not found`);
    return undefined;
  }
  try {
    return await read(filePath);
  } catch (error) {
    errors.push(`${rel(root, filePath)}: ${(error as Error).message}`);
    return undefined;
  }
}

/**
 * The term pages Hugo builds: one per value in an Episode's books/tags/topics
 * front matter, plus each hand-authored hugo/content/<taxonomy>/<key>/_index.md.
 */
async function loadTerms(root: string, errors: string[]): Promise<Terms> {
  const terms: Terms = { books: new Set(), tags: new Set(), topics: new Set() };
  const content = path.join(root, "hugo/content");
  const episodeFiles = await Array.fromAsync(
    new Glob("episodes/*/index.md").scan({ cwd: content }),
  );
  for (const file of episodeFiles) {
    const filePath = path.join(content, file);
    const episode = parseWith(
      EpisodeTermsSchema,
      await loadOptional(filePath, root, errors, readFrontmatter),
      rel(root, filePath),
      errors,
    );
    for (const taxonomy of TAXONOMIES) {
      for (const term of episode?.[taxonomy] ?? []) {
        terms[taxonomy].add(taxonomyFolderSlug(term));
      }
    }
  }
  for (const taxonomy of TAXONOMIES) {
    const bundles = await Array.fromAsync(
      new Glob(`${taxonomy}/*/_index.md`).scan({ cwd: content }),
    );
    for (const bundle of bundles) {
      terms[taxonomy].add(path.basename(path.dirname(bundle)));
    }
  }
  return terms;
}

/** Page rules the review checks (#93 order of work). */
export const PAGE_RULES = [
  "publish-rule",
  "consensus-wording",
  "dissent-attributed",
  "tradition-named",
];

/** Review key for a Trigger Claim: `<episode>@HH:MM:SS`. */
export function triggerKey(trigger: Trigger): string {
  return `${trigger.episode}@${trigger.timestamp.slice(0, 8)}`;
}

function checkPage(
  slug: string,
  page: Page,
  registry: Registry,
  triggers: Trigger[] | undefined,
  review: Review | undefined,
  episodes: Set<number>,
  terms: Terms,
): string[] {
  const errors: string[] = [];
  const at = `scholarship/${slug}`;

  // Same rule as hugo/layouts/partials/scholarship-related-term.html.
  for (const taxonomy of TAXONOMIES) {
    for (const entry of page.related[taxonomy]) {
      if (!terms[taxonomy].has(taxonomyFolderSlug(entry))) {
        errors.push(`${at}: related ${taxonomy} "${entry}" names no term page`);
      }
    }
  }

  for (const statement of page.statements) {
    for (const [index, cite] of statement.cites.entries()) {
      if (!registry[cite.source]) {
        errors.push(
          `${at}: citation ${statement.id}/${index + 1} names unknown source "${cite.source}"`,
        );
      }
    }
  }

  for (const trigger of triggers ?? []) {
    if (!episodes.has(trigger.episode)) {
      errors.push(
        `${at}: Trigger Claim ${triggerKey(trigger)} names Episode ${trigger.episode}, not in data/processed-videos.json`,
      );
    }
  }

  const core = page.statements.find(s => s.id === page.core);
  if (!core) errors.push(`${at}: core "${page.core}" names no statement`);

  if (!page.draft) {
    errors.push(...checkPublishRule(at, page, core, registry));
  }

  for (const statement of page.statements) {
    const cited = new Set(statement.cites.map(c => c.source));
    for (const id of cited) {
      const source = registry[id];
      if (source?.class !== "Tradition") continue;
      const name = source.tradition ?? "";
      if (!name || !statement.text.includes(name)) {
        errors.push(
          `${at}: statement "${statement.id}" cites Tradition source "${id}" but doesn't name "${name}"`,
        );
      }
    }
  }

  if (!page.draft && review) {
    errors.push(...checkOwnerPass(at, page, triggers ?? [], review));
  }

  return errors;
}

/**
 * The independent sources among `ids`, one entry per distinct author: the
 * author's name, or the source id for a source with no author.
 */
export function independentSources(
  ids: string[],
  registry: Registry,
): string[] {
  return [...new Set(ids.map(id => registry[id]?.author ?? id))];
}

/**
 * #84: ≥3 statements; core claim on ≥2 independent sources, one Scholarly or
 * Reference, not only Host-authored. Sources sharing an author count once; a
 * source with no author counts on its own.
 */
function checkPublishRule(
  at: string,
  page: Page,
  core: Page["statements"][number] | undefined,
  registry: Registry,
): string[] {
  const errors: string[] = [];
  if (page.statements.length < 3) {
    errors.push(
      `${at}: publish rule: ${page.statements.length} statements; needs at least 3`,
    );
  }
  if (!core) return errors;

  const ids = [...new Set(core.cites.map(c => c.source))];
  const sources = ids.flatMap(id => (registry[id] ? [registry[id]] : []));
  const rule = `${at}: publish rule: core claim "${core.id}"`;
  const independent = independentSources(ids, registry).length;
  if (independent < 2) {
    const noun = independent === 1 ? "source" : "sources";
    errors.push(
      `${rule} cites ${independent} independent ${noun} (sources sharing an author count once); needs at least 2`,
    );
  }
  if (!sources.some(s => s.class === "Scholarly" || s.class === "Reference")) {
    errors.push(`${rule} cites no Scholarly or Reference source`);
  }
  if (sources.length > 0 && sources.every(s => s.hostAuthored)) {
    errors.push(`${rule} cites only Host-authored sources`);
  }
  return errors;
}

/** #93: every citation, Trigger Claim, cited source and rule has `owner: pass`. */
function checkOwnerPass(
  at: string,
  page: Page,
  triggers: Trigger[],
  review: Review,
): string[] {
  const errors: string[] = [];
  const required: Record<
    "citations" | "triggers" | "rules" | "sources",
    string[]
  > = {
    citations: page.statements.flatMap(s =>
      s.cites.map((_, index) => `${s.id}/${index + 1}`),
    ),
    triggers: triggers.map(triggerKey),
    rules: PAGE_RULES,
    sources: [
      ...new Set(page.statements.flatMap(s => s.cites.map(c => c.source))),
    ],
  };
  for (const [section, keys] of Object.entries(required)) {
    const entries = review[section as keyof typeof required];
    for (const key of keys) {
      if (!entries[key])
        errors.push(`${at}: review has no ${section}.${key} entry`);
    }
  }
  for (const section of [
    "citations",
    "triggers",
    "rules",
    "sources",
  ] as const) {
    for (const [key, item] of Object.entries(review[section])) {
      if (item.owner !== "pass") {
        errors.push(
          `${at}: review ${section}.${key} has owner "${item.owner}", not pass`,
        );
      }
    }
  }
  return errors;
}

/**
 * #96 candidate file: unique slugs; `held` says what is missing and
 * `dropped` why; a slug that is already a page is only a page returned by a
 * #93 cut (`held`); proposed statements name a page; Trigger Claim pointers
 * name real Episodes.
 */
export function checkCandidates(
  candidates: Candidates,
  pages: Set<string>,
  episodes: Set<number>,
): string[] {
  const errors: string[] = [];
  const at = "data/scholarship-candidates.yaml";
  const seen = new Set<string>();
  for (const subject of candidates.subjects) {
    const entry = `${at}: subject "${subject.slug}"`;
    if (seen.has(subject.slug)) errors.push(`${entry} is listed twice`);
    seen.add(subject.slug);
    if (subject.status === "held" && !subject.missing?.trim()) {
      errors.push(`${entry} is held with no missing`);
    }
    if (subject.status === "dropped" && !subject.reason?.trim()) {
      errors.push(`${entry} is dropped with no reason`);
    }
    if (pages.has(subject.slug) && subject.status !== "held") {
      errors.push(
        `${entry} is already a page; only a page cut below the publish rule returns, as held`,
      );
    }
  }
  for (const [index, statement] of candidates.statements.entries()) {
    if (!pages.has(statement.page)) {
      errors.push(
        `${at}: statements.${index} names page "${statement.page}", not in hugo/content/scholarship`,
      );
    }
  }
  const triggers = [
    ...candidates.subjects.flatMap(s => s.triggers ?? []),
    ...candidates.statements.flatMap(s => s.triggers),
  ];
  for (const trigger of triggers) {
    if (!episodes.has(trigger.episode)) {
      errors.push(
        `${at}: Trigger Claim ${triggerKey(trigger)} names Episode ${trigger.episode}, not in data/processed-videos.json`,
      );
    }
  }
  return errors;
}

/**
 * Check every Scholarship Page under `root` (a repo checkout).
 * Returns one message per problem; empty means the check passes.
 */
export async function checkScholarship(root: string): Promise<string[]> {
  const errors: string[] = [];
  const contentDir = path.join(root, "hugo/content/scholarship");
  const registryPath = path.join(root, "hugo/data/external-sources.yaml");
  const episodesPath = path.join(root, "data/processed-videos.json");

  const registry =
    parseWith(
      RegistrySchema,
      await loadOptional(registryPath, root, errors, readYaml),
      rel(root, registryPath),
      errors,
    ) ?? {};

  // The publish rule counts sources by author; an authorless summary would
  // count as independent of the book it summarises.
  for (const [id, source] of Object.entries(registry)) {
    if (source.kind === "publisher-summary" && !source.author) {
      errors.push(
        `${rel(root, registryPath)}: source "${id}" is a publisher-summary with no author; give it the summarised book's author`,
      );
    }
  }

  const episodeData = parseWith(
    EpisodesSchema,
    await loadOptional(episodesPath, root, errors, p => Bun.file(p).json()),
    rel(root, episodesPath),
    errors,
  );
  const episodes = new Set(
    (episodeData ?? []).flatMap(e =>
      e.episodeNumber === undefined ? [] : [e.episodeNumber],
    ),
  );

  const terms = await loadTerms(root, errors);

  const pageFiles = (
    await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir }))
  )
    .filter(f => f !== "_index.md")
    .toSorted();

  // Optional: a checkout without candidates has nothing to check.
  const candidatesPath = path.join(root, "data/scholarship-candidates.yaml");
  if (await Bun.file(candidatesPath).exists()) {
    const candidates = parseWith(
      CandidatesSchema,
      await loadOptional(candidatesPath, root, errors, readYaml),
      rel(root, candidatesPath),
      errors,
    );
    if (candidates) {
      const pages = new Set(pageFiles.map(f => f.replace(/\.md$/, "")));
      errors.push(...checkCandidates(candidates, pages, episodes));
    }
  }

  for (const file of pageFiles) {
    const slug = file.replace(/\.md$/, "");
    const pagePath = path.join(contentDir, file);
    const triggersPath = path.join(
      root,
      `hugo/data/scholarship/triggers/${slug}.yaml`,
    );
    const reviewPath = path.join(root, `data/scholarship-reviews/${slug}.yaml`);

    const page = parseWith(
      PageSchema,
      await loadOptional(pagePath, root, errors, readFrontmatter),
      rel(root, pagePath),
      errors,
    );
    const triggers = parseWith(
      TriggersSchema,
      await loadOptional(triggersPath, root, errors, readYaml),
      rel(root, triggersPath),
      errors,
    );
    const review = parseWith(
      ReviewSchema,
      await loadOptional(reviewPath, root, errors, readYaml),
      rel(root, reviewPath),
      errors,
    );
    if (!page) continue;

    errors.push(
      ...checkPage(slug, page, registry, triggers, review, episodes, terms),
    );
  }

  return errors;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "../..");
  const errors = await checkScholarship(root);
  if (errors.length > 0) {
    for (const error of errors) console.error(`✗ ${error}`);
    console.error(`\ncheck:scholarship failed: ${errors.length} problem(s)`);
    process.exit(1);
  }
  console.log("✓ check:scholarship passed");
}
