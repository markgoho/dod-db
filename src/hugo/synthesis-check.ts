/**
 * What check:scholarship and check:timeline share: the External Source
 * registry, Trigger Claim and review-file schemas, file loading, Episode
 * loading, term pages for `related`, and the #93 publish gate (with its
 * delegation rule).
 */

import { Glob } from "bun";
import path from "node:path";
import { z } from "zod";
import { taxonomyFolderSlug } from "../utils/title-to-slug.js";

export const dateValue = z.union([z.string(), z.date()]);

export const CiteSchema = z.object({
  source: z.string(),
  locator: z.string(),
  quote: z.string(),
  url: z.string().optional(),
  read: dateValue,
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

export const TriggerSchema = z.object({
  episode: z.number().int(),
  speaker: z.string(),
  timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d+)?$/),
  text: z.string(),
});

export const TriggersSchema = z.array(TriggerSchema);

const ReviewItemSchema = z.object({
  agent: z.string().optional(),
  // Only a verdict; a reviewer's text goes in `note` (#223).
  owner: z.enum(["", "pass", "fail"], {
    error: 'owner must be "", pass or fail; put notes in note (#223)',
  }),
  note: z.string().optional(),
  edition: z.string().optional(),
});

const ReviewSectionSchema = z.record(z.string(), ReviewItemSchema).default({});

/**
 * #93 rule change: the owner delegated the publish review to agents. Fields
 * are optional here so a missing one is reported, not a parse failure.
 */
const DelegationSchema = z.object({
  by: z.string().optional(),
  date: dateValue.optional(),
  issue: z.string().optional(),
  secondPass: dateValue.optional(),
});

export const ReviewSchema = z.object({
  review: dateValue.nullish(),
  delegation: DelegationSchema.optional(),
  citations: ReviewSectionSchema,
  triggers: ReviewSectionSchema,
  rules: ReviewSectionSchema,
  sources: ReviewSectionSchema,
  leads: z.array(z.string()).default([]),
  uncited: z.array(z.string()).default([]),
});

const EpisodesSchema = z.array(
  z.object({ episodeNumber: z.number().int().optional() }),
);

export type Cite = z.infer<typeof CiteSchema>;
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

export function rel(root: string, filePath: string): string {
  return path.relative(root, filePath);
}

/** Parse with a schema; on failure, push one error per issue and return undefined. */
export function parseWith<T>(
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

export async function loadOptional(
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

/** Read and parse a YAML or front-matter file; undefined (with errors) on any failure. */
export async function loadParsed<T>(
  schema: z.ZodType<T>,
  filePath: string,
  root: string,
  errors: string[],
  read: (p: string) => Promise<unknown> = readYaml,
): Promise<T | undefined> {
  return parseWith(
    schema,
    await loadOptional(filePath, root, errors, read),
    rel(root, filePath),
    errors,
  );
}

const REGISTRY_PATH = "hugo/data/external-sources.yaml";

/** A column-0 mapping key (not a comment, document marker or list item). */
const TOP_LEVEL_KEY = /^([^\s#-][^:]*):(?:\s|$)/;

/**
 * One error per top-level key a YAML file repeats. The YAML loader keeps the
 * last block silently; an External Source is described once (#202).
 */
export function duplicateTopLevelKeys(label: string, text: string): string[] {
  const lines = new Map<string, number[]>();
  for (const [index, line] of text.split("\n").entries()) {
    const raw = TOP_LEVEL_KEY.exec(line)?.[1];
    if (raw === undefined) continue;
    const key = raw.trim().replace(/^(["'])(.*)\1$/, "$2");
    lines.set(key, [...(lines.get(key) ?? []), index + 1]);
  }
  return [...lines]
    .filter(([, at]) => at.length > 1)
    .map(
      ([key, at]) =>
        `${label}: source "${key}" is defined more than once (lines ${at.join(", ")}); keep one block`,
    );
}

/**
 * The shared registry, hugo/data/external-sources.yaml; empty when unreadable.
 * A repeated source id is an error.
 */
export async function loadRegistry(
  root: string,
  errors: string[],
): Promise<Registry> {
  return (
    (await loadParsed(
      RegistrySchema,
      path.join(root, REGISTRY_PATH),
      root,
      errors,
      async filePath => {
        const text = await Bun.file(filePath).text();
        errors.push(...duplicateTopLevelKeys(REGISTRY_PATH, text));
        return Bun.YAML.parse(text);
      },
    )) ?? {}
  );
}

/** Episode Numbers in data/processed-videos.json. */
export async function loadEpisodes(
  root: string,
  errors: string[],
): Promise<Set<number>> {
  const episodeData = await loadParsed(
    EpisodesSchema,
    path.join(root, "data/processed-videos.json"),
    root,
    errors,
    p => Bun.file(p).json(),
  );
  return new Set(
    (episodeData ?? []).flatMap(e =>
      e.episodeNumber === undefined ? [] : [e.episodeNumber],
    ),
  );
}

export const TAXONOMIES = ["books", "tags", "topics"] as const;
export type Taxonomy = (typeof TAXONOMIES)[number];
/**
 * Term keys per taxonomy, as Hugo keys term pages (taxonomyFolderSlug), and
 * `tagTopics`: each tag key a topic page claims as an alias (`/tags/<key>/`),
 * mapped to that topic's key.
 */
export type Terms = Record<Taxonomy, Set<string>> & {
  tagTopics: Map<string, string>;
};

const EpisodeTermsSchema = z.object({
  books: z.array(z.string()).nullish(),
  tags: z.array(z.string()).nullish(),
  topics: z.array(z.string()).nullish(),
});

const TopicAliasesSchema = z.object({
  aliases: z.array(z.string()).nullish(),
});

const TAG_ALIAS = /^\/tags\/([^/]+)\/?$/;

/**
 * The term pages Hugo builds: one per value in an Episode's books/tags/topics
 * front matter, plus each hand-authored hugo/content/<taxonomy>/<key>/_index.md.
 * A topic page's `/tags/<key>/` aliases go in `tagTopics`.
 */
export async function loadTerms(
  root: string,
  errors: string[],
): Promise<Terms> {
  const terms: Terms = {
    books: new Set(),
    tags: new Set(),
    topics: new Set(),
    tagTopics: new Map(),
  };
  const content = path.join(root, "hugo/content");
  const episodeFiles = await Array.fromAsync(
    new Glob("episodes/*/index.md").scan({ cwd: content }),
  );
  for (const file of episodeFiles) {
    const filePath = path.join(content, file);
    const episode = await loadParsed(
      EpisodeTermsSchema,
      filePath,
      root,
      errors,
      readFrontmatter,
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
      const key = path.basename(path.dirname(bundle));
      terms[taxonomy].add(key);
      if (taxonomy !== "topics") continue;
      const topic = await loadParsed(
        TopicAliasesSchema,
        path.join(content, bundle),
        root,
        errors,
        readFrontmatter,
      );
      for (const alias of topic?.aliases ?? []) {
        const tag = TAG_ALIAS.exec(alias)?.[1];
        if (tag) terms.tagTopics.set(decodeURIComponent(tag), key);
      }
    }
  }
  return terms;
}

/**
 * One error per `related` entry that names no term page (same rule as
 * hugo/layouts/partials/scholarship-related-term.html), and per related tag
 * whose URL only redirects to a topic page that `topics` doesn't list: the
 * topic page would show no inbound link (#161).
 */
export function unknownRelated(
  at: string,
  related: Record<Taxonomy, string[]>,
  terms: Terms,
): string[] {
  const unknown = TAXONOMIES.flatMap(taxonomy =>
    related[taxonomy]
      .filter(entry => !terms[taxonomy].has(taxonomyFolderSlug(entry)))
      .map(entry => `${at}: related ${taxonomy} "${entry}" names no term page`),
  );
  const listedTopics = new Set(related.topics.map(t => taxonomyFolderSlug(t)));
  const redirected = related.tags.flatMap(entry => {
    const topic = terms.tagTopics.get(taxonomyFolderSlug(entry));
    if (topic === undefined || listedTopics.has(topic)) return [];
    return [
      `${at}: related tag "${entry}" only redirects to topic "${topic}"; add "${topic}" to related topics`,
    ];
  });
  return [...unknown, ...redirected];
}

/** Review key for a Trigger Claim: `<episode>@HH:MM:SS`. */
export function triggerKey(trigger: Trigger): string {
  return `${trigger.episode}@${trigger.timestamp.slice(0, 8)}`;
}

/** The error for a Trigger Claim whose Episode isn't processed, or undefined. */
export function unknownEpisode(
  at: string,
  trigger: Trigger,
  episodes: Set<number>,
): string | undefined {
  if (episodes.has(trigger.episode)) return undefined;
  return `${at}: Trigger Claim ${triggerKey(trigger)} names Episode ${trigger.episode}, not in data/processed-videos.json`;
}

/** A YAML date as `YYYY-MM-DD`, whether it parsed as a string or a Date. */
export function isoDate(value: string | Date): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

/**
 * #93 delegation: who delegated and when, a second agent pass on or after
 * that date, and a review date that the page's sourcesRead matches.
 */
function checkDelegation(
  at: string,
  sourcesRead: string | Date | null | undefined,
  review: Review,
  delegation: NonNullable<Review["delegation"]>,
): string[] {
  const errors = (["by", "date", "secondPass"] as const)
    .filter(field => !delegation[field])
    .map(field => `${at}: review delegation has no ${field}`);
  if (delegation.date && delegation.secondPass) {
    const date = isoDate(delegation.date);
    const secondPass = isoDate(delegation.secondPass);
    if (secondPass < date) {
      errors.push(
        `${at}: review delegation secondPass ${secondPass} is before date ${date}`,
      );
    }
  }
  if (review.review) {
    const reviewed = isoDate(review.review);
    const read = sourcesRead ? isoDate(sourcesRead) : "";
    if (read !== reviewed) {
      errors.push(
        `${at}: sourcesRead "${read}" doesn't match review date ${reviewed}`,
      );
    }
  } else {
    errors.push(`${at}: review has no review date`);
  }
  return errors;
}

/** The review keys a published page or entry must have, per section. */
export type RequiredReviewKeys = Record<
  "citations" | "triggers" | "rules" | "sources",
  string[]
>;

/**
 * #93 publish gate: every required citation, Trigger Claim, cited source and
 * rule has a review entry, and every entry has `owner: pass`; under a
 * `delegation` block, `agent: pass` and no `owner: fail` instead.
 */
export function checkPublishGate(
  at: string,
  sourcesRead: string | Date | null | undefined,
  required: RequiredReviewKeys,
  review: Review,
): string[] {
  const errors: string[] = review.delegation
    ? checkDelegation(at, sourcesRead, review, review.delegation)
    : [];
  for (const [section, keys] of Object.entries(required)) {
    const entries = review[section as keyof RequiredReviewKeys];
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
      if (review.delegation) {
        if (item.agent !== "pass") {
          errors.push(
            `${at}: review ${section}.${key} has agent "${item.agent ?? ""}", not pass`,
          );
        }
        if (item.owner === "fail") {
          errors.push(`${at}: review ${section}.${key} has owner "fail"`);
        }
        continue;
      }
      if (item.owner !== "pass") {
        errors.push(
          `${at}: review ${section}.${key} has owner "${item.owner}", not pass`,
        );
      }
    }
  }
  return errors;
}
