/**
 * Validate the Timeline's entries, Trigger Claims and review files against
 * #109 §6. Structure only: wording and strength stay with the review.
 *
 * Usage: bun run check:timeline
 */

import { Glob } from "bun";
import path from "node:path";
import { z } from "zod";
import {
  CiteSchema,
  checkPublishGate,
  dateValue,
  isoDate,
  loadEpisodes,
  loadParsed,
  loadRegistry,
  loadTerms,
  readFrontmatter,
  ReviewSchema,
  TriggerSchema,
  triggerKey,
  unknownEpisode,
  unknownRelated,
  type Registry,
  type Review,
  type Terms,
} from "./synthesis-check.js";
import {
  checkTimelineCard,
  entryCardKey,
  INDEX,
  indexCardKey,
  readTimelineCardManifest,
} from "./timeline-cards.js";

const year = z.number().int();

/**
 * A Critical Date. The layout renders `display` and places by `from`, `anchor`
 * or `sort`; `to`, `precision` and `open` are kept as data but not rendered
 * since the vertical Timeline (#163) dropped the scale.
 */
const CriticalSchema = z.object({
  display: z.string(),
  from: year.optional(),
  to: year.optional(),
  precision: z.enum(["year", "century", "period"]).optional(),
  open: z.boolean().optional(),
  anchor: z.string().nullish(),
  sort: year.optional(),
  note: z.string().optional(),
  cites: z.array(CiteSchema),
});

const UndatedSchema = z.object({
  statement: z.string(),
  cites: z.array(CiteSchema),
});

const TraditionSchema = z.object({
  display: z.string(),
  from: year,
  to: year.optional(),
  holder: z.string(),
  cites: z.array(CiteSchema),
});

/**
 * Where an event entry's titled subject sits on the historicity scale (#275),
 * reusing #133's state-of-the-field steps, from "historical" to "not
 * historical as narrated". Never shown by the border, which means placement.
 */
export const HISTORICITY_POINTS = [
  "historical",
  "most-historical",
  "debated",
  "most-not-historical",
  "not-historical",
] as const;

/**
 * The point and what backs it: a reviewed Scholarship statement that answers
 * the subject (`<page>#<statement-id>`), or the entry's own statement with
 * cites from two or more independent Scholarly or Reference authors (#133).
 * `historical` alone, with neither, marks an uncontested fact (a record, an
 * inscription), carried by the Critical Date's cites (#133's exemption).
 *
 * `pending: "#<issue>"` in place of a point: the second pass found no
 * sourced point and the issue tracks the source that would give one. The
 * entry shows no scale until then.
 */
const HistoricitySchema = z.object({
  point: z.enum(HISTORICITY_POINTS).optional(),
  pending: z
    .string()
    .regex(/^#\d+$/, "give the tracking issue, #<n>")
    .optional(),
  scholarship: z
    .string()
    .regex(/^[a-z0-9-]+#[a-z0-9-]+$/, "give <scholarship-page>#<statement-id>")
    .optional(),
  statement: z.string().optional(),
  cites: z.array(CiteSchema).optional(),
});

/**
 * A narrated setting (#167 §4): the period a composition's text narrates, its
 * own internal date, not a historical claim. It never places the entry.
 */
const SettingSchema = z.object({
  display: z.string(),
  from: year.optional(),
  to: year.optional(),
  cites: z.array(CiteSchema),
});

/** The Timeline's own page: what its link-preview card shows. */
export const IndexSchema = z.object({ title: z.string(), dek: z.string() });

export const EntrySchema = z.object({
  title: z.string(),
  entryKind: z.enum(["event", "composition"]),
  /**
   * Ids the entry was published under before a rename (#274, an owner
   * exception to #219): /timeline/#<former> still lands on the entry, and
   * firebase.json redirects /timeline/<former>. Never reused.
   */
  formerIds: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
  /** Read only to refuse `render: never`, which entries carried before #219. */
  build: z.object({ render: z.string().optional() }).optional(),
  sourcesRead: dateValue.nullish(),
  related: z.object({
    books: z.array(z.string()),
    tags: z.array(z.string()),
    topics: z.array(z.string()),
  }),
  watch: z.array(z.string()).optional(),
  critical: CriticalSchema.optional(),
  undated: UndatedSchema.optional(),
  historicity: HistoricitySchema.optional(),
  seeAlso: z.string().nullish(),
  setting: SettingSchema.optional(),
  tradition: TraditionSchema.optional(),
});

const TimelineTriggerSchema = TriggerSchema.extend({
  entry: z.string(),
  states: z.enum(["critical", "tradition", "both"]),
});

export type Entry = z.infer<typeof EntrySchema>;
export type TimelineTrigger = z.infer<typeof TimelineTriggerSchema>;

/** Entry rules the review checks (#109 §1). */
export const TIMELINE_RULES = [
  "critical-scope",
  "split-shown",
  "tradition-both-sides",
  "tradition-named",
  "conditional-not-critical",
];

const TRIGGERS_PATH = "hugo/data/timeline/triggers.yaml";

/**
 * Each cite with its review key: `critical/<n>`, `undated/<n>`,
 * `historicity/<n>`, `setting/<n>`, `tradition/<n>`.
 */
function keyedCites(entry: Entry): { key: string; source: string }[] {
  return (
    ["critical", "undated", "historicity", "setting", "tradition"] as const
  ).flatMap(part =>
    (entry[part]?.cites ?? []).map((cite, index) => ({
      key: `${part}/${index + 1}`,
      source: cite.source,
    })),
  );
}

/** What every entry is checked against: the parsed Timeline and its inputs. */
interface TimelineContext {
  registry: Registry;
  terms: Terms;
  triggers: TimelineTrigger[];
  reviews: Map<string, Review | undefined>;
  entries: Map<string, Entry | undefined>;
  /** Scholarship page slug → its statement ids. */
  statements: Map<string, Set<string>>;
}

function checkEntry(
  id: string,
  entry: Entry,
  { registry, terms, entries, statements, ...context }: TimelineContext,
): string[] {
  const triggers = context.triggers.filter(t => t.entry === id);
  const review = context.reviews.get(id);
  const errors: string[] = [];
  const at = `timeline/${id}`;

  errors.push(...unknownRelated(at, entry.related, terms));

  // A former id stays reserved: no entry, and no other entry's former id.
  for (const former of entry.formerIds ?? []) {
    if (entries.has(former))
      errors.push(
        `${at}: former id "${former}" is an entry's id; a former id is never reused`,
      );
    for (const [other, e] of entries)
      if (other !== id && e?.formerIds?.includes(former))
        errors.push(
          `${at}: former id "${former}" is also a former id of ${other}`,
        );
  }

  // A Tradition Date at its own year takes the id `<entry>-tradition` (#214).
  if (id.endsWith("-tradition"))
    errors.push(
      `${at}: an entry id can't end in "-tradition"; that anchor belongs to an entry's Tradition Date`,
    );

  // An entry has its own page, the Timeline Entry Page (#219).
  if (entry.build?.render === "never")
    errors.push(
      `${at}: build has render: never; drop the build line, an entry has its own page`,
    );

  for (const { key, source } of keyedCites(entry)) {
    if (!registry[source]) {
      errors.push(`${at}: citation ${key} names unknown source "${source}"`);
    }
  }

  if (entry.critical && entry.undated) {
    errors.push(`${at}: has both critical and undated; give one`);
  }
  if (!entry.critical && !entry.undated) {
    errors.push(`${at}: has neither critical nor undated; give one`);
  }

  // A reader places a card by its year or century, not a period name alone (#276).
  if (entry.critical && !/\d/.test(entry.critical.display)) {
    errors.push(
      `${at}: critical display "${entry.critical.display}" names no year or century; add the cited years`,
    );
  }

  for (const [field, target] of links(entry)) {
    if (!entries.has(target)) {
      errors.push(`${at}: ${field} "${target}" names no entry`);
    }
  }

  if (entry.tradition) {
    if (!triggers.some(t => t.states !== "critical")) {
      errors.push(
        `${at}: has a Tradition Date but no Trigger Claim with states: tradition or both`,
      );
    }
    for (const [index, cite] of entry.tradition.cites.entries()) {
      const source = registry[cite.source];
      if (!source) continue;
      if (source.class !== "Tradition") {
        errors.push(
          `${at}: citation tradition/${index + 1} cites "${cite.source}", a ${source.class} source; a Tradition Date cites Tradition sources only`,
        );
        continue;
      }
      const name = source.tradition ?? "";
      if (!name || !entry.tradition.holder.includes(name)) {
        errors.push(
          `${at}: holder "${entry.tradition.holder}" doesn't contain "${name}", the tradition of "${cite.source}"`,
        );
      }
    }
  }

  errors.push(...checkHistoricity(at, entry, registry, statements));

  if (entry.setting) {
    if (entry.entryKind !== "composition") {
      errors.push(
        `${at}: has a setting but entryKind ${entry.entryKind}; a setting is for composition entries only`,
      );
    }
    if (entry.setting.to !== undefined && entry.setting.from === undefined) {
      errors.push(`${at}: setting has to but no from; give from with to`);
    }
  }

  // Critical, undated and setting cites need a Scholarly or Reference source;
  // a setting cites nothing else. An unknown source is reported above, once.
  for (const part of ["critical", "undated", "setting"] as const) {
    const cites = entry[part]?.cites;
    if (!cites) continue;
    let faulted = false;
    let scholarly = false;
    for (const [index, cite] of cites.entries()) {
      const source = registry[cite.source];
      if (!source) faulted = true;
      else if (source.class === "Scholarly" || source.class === "Reference")
        scholarly = true;
      else if (part === "setting") {
        faulted = true;
        errors.push(
          `${at}: citation setting/${index + 1} cites "${cite.source}", a ${source.class} source; a setting cites Scholarly or Reference sources only`,
        );
      }
    }
    if (!scholarly && !faulted) {
      errors.push(`${at}: ${part} cites no Scholarly or Reference source`);
    }
  }

  if (entry.draft) return errors;

  if (entry.entryKind === "event" && !entry.historicity) {
    errors.push(
      `${at}: a published event needs historicity (#275): its point on the scale and what backs it`,
    );
  }

  if (triggers.length === 0) {
    errors.push(`${at}: has no Trigger Claim; a published entry needs one`);
  }
  for (const [field, target] of links(entry)) {
    if (entries.get(target)?.draft) {
      errors.push(
        `${at}: ${field} "${target}" names a draft entry; an entry can't publish before the entries it links to`,
      );
    }
  }
  if (review) {
    const required = {
      citations: keyedCites(entry).map(c => c.key),
      triggers: triggers.map(triggerKey),
      rules: TIMELINE_RULES,
      sources: [...new Set(keyedCites(entry).map(c => c.source))],
    };
    errors.push(...checkPublishGate(at, entry.sourcesRead, required, review));
    // #135: for a Timeline Entry the second pass, too, must match sourcesRead.
    const secondPass = review.delegation?.secondPass;
    if (secondPass) {
      const read = entry.sourcesRead ? isoDate(entry.sourcesRead) : "";
      if (read !== isoDate(secondPass)) {
        errors.push(
          `${at}: sourcesRead "${read}" doesn't match review delegation secondPass ${isoDate(secondPass)}`,
        );
      }
    }
  }

  return errors;
}

/** The historicity rules (#275); a missing one on a published event is checked with the publish rules. */
function checkHistoricity(
  at: string,
  entry: Entry,
  registry: Registry,
  statements: Map<string, Set<string>>,
): string[] {
  const h = entry.historicity;
  if (!h) return [];
  const errors: string[] = [];
  if (!h.point === !h.pending) {
    errors.push(`${at}: historicity needs exactly one of point or pending`);
  }
  if (h.pending && (h.scholarship || h.statement || h.cites)) {
    errors.push(
      `${at}: historicity is pending; it has no scholarship, statement or cites until it has a point`,
    );
  }
  if (entry.entryKind !== "event") {
    errors.push(
      `${at}: has historicity but entryKind ${entry.entryKind}; historicity is for event entries only`,
    );
  }
  if (h.statement && !h.cites?.length)
    errors.push(`${at}: historicity has a statement but no cites`);
  if (h.cites?.length && !h.statement)
    errors.push(`${at}: historicity has cites but no statement`);
  if (h.point && h.point !== "historical" && !h.scholarship && !h.statement) {
    errors.push(
      `${at}: historicity point ${h.point} needs a scholarship statement or its own statement and cites; only historical stands on the Critical Date's cites`,
    );
  }
  if (h.scholarship) {
    const [page = "", id = ""] = h.scholarship.split("#");
    const ids = statements.get(page);
    if (!ids)
      errors.push(
        `${at}: historicity scholarship "${h.scholarship}" names no Scholarship Page`,
      );
    else if (!ids.has(id))
      errors.push(
        `${at}: historicity scholarship "${h.scholarship}" names no statement on ${page}`,
      );
  }
  // Two or more independent Scholarly or Reference authors (#133); an unknown source is reported above.
  const authors = new Set<string>();
  for (const [index, cite] of (h.cites ?? []).entries()) {
    const source = registry[cite.source];
    if (!source) continue;
    if (source.class === "Tradition") {
      errors.push(
        `${at}: citation historicity/${index + 1} cites "${cite.source}", a Tradition source; historicity cites Scholarly or Reference sources only`,
      );
      continue;
    }
    authors.add(source.author ?? source.publisher ?? source.title);
  }
  if (h.statement && h.cites?.length && authors.size < 2 && !h.scholarship) {
    errors.push(
      `${at}: historicity statement cites ${authors.size} author(s); a state-of-the-field point needs two or more independent authors (#133)`,
    );
  }
  return errors;
}

/** The entry ids an entry points to: its `anchor` and `seeAlso`. */
function links(entry: Entry): ["anchor" | "seeAlso", string][] {
  const result: ["anchor" | "seeAlso", string][] = [];
  if (entry.critical?.anchor) result.push(["anchor", entry.critical.anchor]);
  if (entry.seeAlso) result.push(["seeAlso", entry.seeAlso]);
  return result;
}

/** Each Scholarship Page's statement ids, for historicity's `scholarship` (#275). */
async function loadStatements(root: string): Promise<Map<string, Set<string>>> {
  const dir = path.join(root, "hugo/content/scholarship");
  const result = new Map<string, Set<string>>();
  const files = await Array.fromAsync(
    new Glob("*.md").scan({ cwd: dir, onlyFiles: true }),
  ).catch(() => []);
  for (const file of files) {
    if (file.startsWith("_")) continue;
    const fm = (await readFrontmatter(path.join(dir, file))) as {
      statements?: { id?: string }[];
    } | null;
    result.set(
      file.replace(/\.md$/, ""),
      new Set((fm?.statements ?? []).flatMap(s => (s.id ? [s.id] : []))),
    );
  }
  return result;
}

/**
 * Check every Timeline Entry under `root` (a repo checkout).
 * Returns one message per problem; empty means the check passes.
 * `cards` also checks the link-preview card images.
 */
export async function checkTimeline(
  root: string,
  { cards = true }: { cards?: boolean } = {},
): Promise<string[]> {
  const errors: string[] = [];
  const contentDir = path.join(root, "hugo/content/timeline");

  const registry = await loadRegistry(root, errors);
  const episodes = await loadEpisodes(root, errors);
  const terms = await loadTerms(root, errors);
  const triggers =
    (await loadParsed(
      z.array(TimelineTriggerSchema),
      path.join(root, TRIGGERS_PATH),
      root,
      errors,
    )) ?? [];

  const ids = (
    await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir }))
  )
    .filter(f => f !== "_index.md")
    .map(f => f.replace(/\.md$/, ""))
    .toSorted();

  for (const trigger of triggers) {
    const error = unknownEpisode(TRIGGERS_PATH, trigger, episodes);
    if (error) errors.push(error);
    if (!ids.includes(trigger.entry)) {
      errors.push(
        `${TRIGGERS_PATH}: Trigger Claim ${triggerKey(trigger)} names entry "${trigger.entry}", not in hugo/content/timeline`,
      );
    }
  }

  // Parse every entry first: the draft rule reads the entries an entry links to.
  const entries = new Map<string, Entry | undefined>();
  const reviews = new Map<string, Review | undefined>();
  for (const id of ids) {
    entries.set(
      id,
      await loadParsed(
        EntrySchema,
        path.join(contentDir, `${id}.md`),
        root,
        errors,
        readFrontmatter,
      ),
    );
    reviews.set(
      id,
      await loadParsed(
        ReviewSchema,
        path.join(root, `data/timeline-reviews/${id}.yaml`),
        root,
        errors,
      ),
    );
  }

  const statements = await loadStatements(root);
  const context: TimelineContext = {
    registry,
    terms,
    triggers,
    reviews,
    entries,
    statements,
  };
  for (const [id, entry] of entries) {
    if (entry) errors.push(...checkEntry(id, entry, context));
  }

  // The Timeline and each published entry's page need their link-preview cards.
  if (cards) {
    const manifest = await readTimelineCardManifest(root);
    const index = await loadParsed(
      IndexSchema,
      path.join(contentDir, "_index.md"),
      root,
      errors,
      readFrontmatter,
    );
    if (index) {
      errors.push(
        ...(await checkTimelineCard(
          root,
          INDEX,
          indexCardKey(index),
          manifest,
        )),
      );
    }
    for (const [id, entry] of entries) {
      if (!entry || entry.draft) continue;
      errors.push(
        ...(await checkTimelineCard(root, id, entryCardKey(entry), manifest)),
      );
    }
  }

  return errors;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "../..");
  const errors = await checkTimeline(root);
  if (errors.length > 0) {
    for (const error of errors) console.error(`✗ ${error}`);
    console.error(`\ncheck:timeline failed: ${errors.length} problem(s)`);
    process.exit(1);
  }
  console.log("✓ check:timeline passed");
}
