/**
 * Validate Scholarship Pages and their data against the #92 rules, and the
 * #96 candidate file.
 *
 * Usage: bun run check:scholarship
 */

import { Glob } from "bun";
import path from "node:path";
import { z } from "zod";
import {
  checkCards,
  checkStatementIds,
  readCardManifest,
} from "./question-cards.js";
import { checkScriptureLinks } from "./scholarship-scripture-links.js";
import {
  CiteSchema,
  checkPublishGate,
  dateValue,
  loadEpisodes,
  loadParsed,
  loadTerms,
  loadRegistry,
  readFrontmatter,
  readYaml,
  ReviewSchema,
  RegistrySchema,
  TriggerSchema,
  TriggersSchema,
  triggerKey,
  unknownEpisode,
  unknownRelated,
  type Registry,
  type Review,
  type Terms,
  type Trigger,
} from "./synthesis-check.js";

// scholarship-checklist.ts reads these from here.
export {
  readFrontmatter,
  readYaml,
  RegistrySchema,
  ReviewSchema,
  triggerKey,
  TriggersSchema,
};
export type { Registry, Review, Trigger };

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

export type Page = z.infer<typeof PageSchema>;

/** Page rules the review checks (#93 order of work). */
export const PAGE_RULES = [
  "publish-rule",
  "consensus-wording",
  "dissent-attributed",
  "tradition-named",
];

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

  errors.push(...unknownRelated(at, page.related, terms));
  errors.push(...checkStatementIds(at, page.statements));

  for (const statement of page.statements) {
    for (const [index, cite] of statement.cites.entries()) {
      if (!registry[cite.source]) {
        errors.push(
          `${at}: citation ${statement.id}/${index + 1} names unknown source "${cite.source}"`,
        );
      }
    }
  }

  const statementIds = new Set(page.statements.map(s => s.id));
  for (const trigger of triggers ?? []) {
    const error = unknownEpisode(at, trigger, episodes);
    if (error) errors.push(error);
    if (trigger.statement && !statementIds.has(trigger.statement)) {
      errors.push(
        `${at}: trigger ${triggerKey(trigger)} names unknown statement "${trigger.statement}"`,
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
    const required = {
      citations: page.statements.flatMap(s =>
        s.cites.map((_, index) => `${s.id}/${index + 1}`),
      ),
      triggers: (triggers ?? []).map(triggerKey),
      rules: PAGE_RULES,
      sources: [
        ...new Set(page.statements.flatMap(s => s.cites.map(c => c.source))),
      ],
    };
    errors.push(...checkPublishGate(at, page.sourcesRead, required, review));
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
    const error = unknownEpisode(at, trigger, episodes);
    if (error) errors.push(error);
  }
  return errors;
}

/**
 * Check every Scholarship Page under `root` (a repo checkout).
 * Returns one message per problem; empty means the check passes.
 */
export async function checkScholarship(
  root: string,
  {
    cards = true,
    scriptureLinks = true,
  }: { cards?: boolean; scriptureLinks?: boolean } = {},
): Promise<string[]> {
  const errors: string[] = [];
  const contentDir = path.join(root, "hugo/content/scholarship");
  const registryPath = "hugo/data/external-sources.yaml";

  const registry = await loadRegistry(root, errors);

  // The publish rule counts sources by author; an authorless summary would
  // count as independent of the book it summarises.
  for (const [id, source] of Object.entries(registry)) {
    if (source.kind === "publisher-summary" && !source.author) {
      errors.push(
        `${registryPath}: source "${id}" is a publisher-summary with no author; give it the summarised book's author`,
      );
    }
  }

  const episodes = await loadEpisodes(root, errors);

  const terms = await loadTerms(root, errors);

  const pageFiles = (
    await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir }))
  )
    .filter(f => f !== "_index.md")
    .toSorted();

  // Optional: a checkout without candidates has nothing to check.
  const candidatesPath = path.join(root, "data/scholarship-candidates.yaml");
  if (await Bun.file(candidatesPath).exists()) {
    const candidates = await loadParsed(
      CandidatesSchema,
      candidatesPath,
      root,
      errors,
    );
    if (candidates) {
      const pages = new Set(pageFiles.map(f => f.replace(/\.md$/, "")));
      errors.push(...checkCandidates(candidates, pages, episodes));
    }
  }

  const manifest = await readCardManifest(root);

  for (const file of pageFiles) {
    const slug = file.replace(/\.md$/, "");
    const pagePath = path.join(contentDir, file);
    const triggersPath = path.join(
      root,
      `hugo/data/scholarship/triggers/${slug}.yaml`,
    );
    const reviewPath = path.join(root, `data/scholarship-reviews/${slug}.yaml`);

    const page = await loadParsed(
      PageSchema,
      pagePath,
      root,
      errors,
      readFrontmatter,
    );
    const triggers = await loadParsed(
      TriggersSchema,
      triggersPath,
      root,
      errors,
    );
    const review = await loadParsed(ReviewSchema, reviewPath, root, errors);
    if (!page) continue;

    errors.push(
      ...checkPage(slug, page, registry, triggers, review, episodes, terms),
    );
    // A published page's Question Pages need their link-preview cards.
    if (cards && !page.draft) {
      errors.push(...(await checkCards(root, slug, page, manifest)));
    }
  }

  if (scriptureLinks) errors.push(...(await checkScriptureLinks(root)));

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
