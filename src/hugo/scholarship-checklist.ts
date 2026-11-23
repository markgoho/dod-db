/**
 * Print the #93 owner checklist for one Scholarship Page as GitHub markdown,
 * generated from the page, its review file, its Trigger Claims and the
 * External Source registry.
 *
 * Usage: bun run scholarship:checklist <slug>
 */

import { $, Glob } from "bun";
import path from "node:path";
import { z } from "zod";
import {
  independentSources,
  PAGE_RULES,
  PageSchema,
  readFrontmatter,
  readYaml,
  RegistrySchema,
  ReviewSchema,
  triggerKey,
  TriggersSchema,
  type Page,
  type Registry,
  type Review,
} from "./check-scholarship.js";

/**
 * Episode Page anchor for a Transcript timestamp, as
 * hugo/layouts/partials/quote-card.html builds it: `t-<seconds>-<ms>`, where
 * the fraction is read as an integer and padded to three digits.
 */
export function timestampAnchor(timestamp: string): string {
  const [clock = "", fraction = "0"] = timestamp.split(".");
  const [hours = 0, minutes = 0, seconds = 0] = clock.split(":").map(Number);
  const total = hours * 3600 + minutes * 60 + seconds;
  return `t-${total}-${String(Number(fraction)).padStart(3, "0")}`;
}

type Source = Registry[string];
type ReviewItem = Review["citations"][string];
type Section = "citations" | "triggers" | "rules" | "sources";

const RULE_TEXT: Record<string, string> = {
  "publish-rule":
    "at least 3 statements, and the core claim on at least 2 independent sources (counted by author), one Scholarly or Reference, not only Host-authored.",
  "consensus-wording":
    'no statement says "consensus" or "most scholars" more strongly than its source does.',
  "dissent-attributed": "any dissent is attributed to the person who holds it.",
  "tradition-named":
    "each statement citing a Tradition source names the tradition in its own words.",
};

/** Same parts and order as hugo/layouts/partials/external-source-label.html. */
function sourceLabel(source: Source): string {
  const tail = [source.series, source.edition].filter(Boolean);
  const imprint = [source.publisher, source.year?.toString()].filter(Boolean);
  let label = source.author ? `${source.author}, ` : "";
  label += `_${source.title}_`;
  if (tail.length > 0) label += `, ${tail.join(", ")}`;
  if (imprint.length > 0) label += ` (${imprint.join(", ")})`;
  return label;
}

/** End `text` with exactly one full stop. */
function sentence(text: string): string {
  return text.endsWith(".") ? text : `${text}.`;
}

function flagMark(item: ReviewItem | undefined): string {
  return item?.agent === "flag" ? " ⚑" : "";
}

function agentLine(item: ReviewItem | undefined): string {
  if (!item) return "  - Agent: no review entry.";
  if (item.agent === "flag") return "  - Agent: flag, see flags.";
  const note = item.note ? ` ${item.note}` : "";
  return `  - Agent: ${item.agent ?? "none"}.${note}`;
}

/** Episode number → Episode Page folder, from each page's front matter. */
async function episodeFolders(root: string): Promise<Map<number, string>> {
  const content = path.join(root, "hugo/content");
  const folders = new Map<number, string>();
  const files = await Array.fromAsync(
    new Glob("episodes/*/index.md").scan({ cwd: content }),
  );
  const Schema = z.object({ episodeNumber: z.number().int().optional() });
  for (const file of files) {
    const parsed = Schema.safeParse(
      await readFrontmatter(path.join(content, file)),
    );
    const number = parsed.success ? parsed.data.episodeNumber : undefined;
    if (number !== undefined) {
      folders.set(number, path.basename(path.dirname(file)));
    }
  }
  return folders;
}

async function baseUrl(root: string): Promise<string> {
  const toml = await Bun.file(path.join(root, "hugo/hugo.toml")).text();
  const match = /^baseURL\s*=\s*['"]([^'"]+)['"]/m.exec(toml);
  if (!match?.[1]) throw new Error("hugo/hugo.toml: no baseURL");
  return match[1].endsWith("/") ? match[1] : `${match[1]}/`;
}

async function load<T>(
  root: string,
  relative: string,
  schema: z.ZodType<T>,
  read: (filePath: string) => Promise<unknown>,
): Promise<T> {
  const filePath = path.join(root, relative);
  if (!(await Bun.file(filePath).exists())) {
    throw new Error(`${relative}: file not found`);
  }
  const result = schema.safeParse(await read(filePath));
  if (!result.success) {
    throw new Error(`${relative}: ${result.error.message}`);
  }
  return result.data;
}

function citedSourceIds(page: Page): string[] {
  return [...new Set(page.statements.flatMap(s => s.cites.map(c => c.source)))];
}

function publishRuleNow(page: Page, registry: Registry): string {
  const statements = `${page.statements.length} statements`;
  const core = page.statements.find(s => s.id === page.core);
  if (!core) return `${statements}; core "${page.core}" names no statement.`;
  const ids = [...new Set(core.cites.map(c => c.source))];
  const independent = independentSources(ids, registry);
  const noun = independent.length === 1 ? "source" : "sources";
  return `${statements}; core \`${core.id}\` cites ${independent.length} independent ${noun} (${independent.join("; ")}).`;
}

/**
 * Build the owner checklist for `slug` from the repo checkout at `root`.
 * `commit` names the revision the checklist was generated from.
 */
export async function buildChecklist(
  root: string,
  slug: string,
  commit: string,
): Promise<string> {
  const pagePath = `hugo/content/scholarship/${slug}.md`;
  const reviewPath = `data/scholarship-reviews/${slug}.yaml`;
  const triggersPath = `hugo/data/scholarship/triggers/${slug}.yaml`;
  const registryPath = "hugo/data/external-sources.yaml";

  const page = await load(root, pagePath, PageSchema, readFrontmatter);
  const review = await load(root, reviewPath, ReviewSchema, readYaml);
  const triggers = await load(root, triggersPath, TriggersSchema, readYaml);
  const registry = await load(root, registryPath, RegistrySchema, readYaml);
  const folders = await episodeFolders(root);
  const site = await baseUrl(root);
  const sourceIds = citedSourceIds(page);
  const citationCount = page.statements.reduce((n, s) => n + s.cites.length, 0);

  const out: string[] = [];
  const firstKey = page.statements[0] ? `${page.statements[0].id}/1` : "id/1";
  out.push(
    `## Publish checklist: ${page.title} (#93 step 2)`,
    "",
    `Generated from \`${pagePath}\`, \`${reviewPath}\`, \`${triggersPath}\` and \`${registryPath}\` at ${commit}.`,
    "",
    `Open every URL. For each item, reply **pass** or **fail**, with a note if needed, using its key (e.g. \`${firstKey}: pass\`). A citation passes when the quote is present, the locator finds it, and the question, short answer and statement are no stronger than the source.`,
    "",
    `Draft preview: \`cd hugo && hugo server -D\`, then http://localhost:1313/scholarship/${slug}/`,
    "",
    "### Decide first (agent flags)",
    "",
  );

  const kinds: Record<Section, string> = {
    citations: "citation",
    triggers: "Trigger Claim",
    rules: "rule",
    sources: "source",
  };
  const order: Record<Section, string[]> = {
    citations: page.statements.flatMap(s =>
      s.cites.map((_, index) => `${s.id}/${index + 1}`),
    ),
    triggers: triggers.map(triggerKey),
    rules: PAGE_RULES,
    sources: sourceIds,
  };
  const flags: string[] = [];
  for (const section of Object.keys(kinds) as Section[]) {
    const keys = [
      ...new Set([...order[section], ...Object.keys(review[section])]),
    ];
    for (const key of keys) {
      const item = review[section][key];
      if (item?.agent !== "flag") continue;
      flags.push(`- [ ] \`${key}\` (${kinds[section]}): ${item.note ?? ""}`);
    }
  }
  out.push(...(flags.length > 0 ? flags : ["None."]), "");

  out.push(`### Sources (${sourceIds.length})`, "");
  for (const id of sourceIds) {
    const source = registry[id];
    const item = review.sources[id];
    if (!source) {
      out.push(`- [ ] \`${id}\`: not in the registry.`, agentLine(item));
      continue;
    }
    const sourceClass =
      source.class === "Tradition" && source.tradition
        ? `Tradition: ${source.tradition}`
        : source.class;
    const edition = item?.edition ?? source.edition ?? "not in the review file";
    out.push(
      `- [ ] \`${id}\`${flagMark(item)}: ${sourceLabel(source)}. ${sourceClass}. [${source.access}](${source.url}). Edition: ${sentence(edition)}`,
      agentLine(item),
    );
  }
  out.push("");

  out.push(`### Citations (${citationCount})`, "");
  for (const statement of page.statements) {
    const core = statement.id === page.core ? " (core claim)" : "";
    out.push(
      `**\`${statement.id}\`**${core}: Q "${statement.question}" · short "${statement.short}" · statement "${statement.text}"`,
      "",
    );
    for (const [index, cite] of statement.cites.entries()) {
      const key = `${statement.id}/${index + 1}`;
      const item = review.citations[key];
      const url = cite.url ?? registry[cite.source]?.url;
      const source = url
        ? `[\`${cite.source}\`](${url})`
        : `\`${cite.source}\``;
      out.push(
        `- [ ] \`${key}\`${flagMark(item)}, ${source} at **${cite.locator}**: "${cite.quote}"`,
        agentLine(item),
      );
    }
    out.push("");
  }

  out.push(
    `### Trigger Claims (${triggers.length})`,
    "",
    "Check the Speaker and the text, and read about two minutes either side for any hedge the quote drops.",
    "",
  );
  for (const trigger of triggers) {
    const key = triggerKey(trigger);
    const item = review.triggers[key];
    const folder = folders.get(trigger.episode);
    const episode = folder
      ? `[Ep ${trigger.episode}](${site}episodes/${folder}/#${timestampAnchor(trigger.timestamp)})`
      : `Ep ${trigger.episode} (no Episode Page)`;
    out.push(
      `- [ ] \`${key}\`${flagMark(item)}, ${trigger.speaker}, ${episode}: "${trigger.text}"`,
      agentLine(item),
    );
  }
  out.push("");

  out.push(`### Rules (${PAGE_RULES.length})`, "");
  for (const rule of PAGE_RULES) {
    const item = review.rules[rule];
    const now =
      rule === "publish-rule" ? ` Now: ${publishRuleNow(page, registry)}` : "";
    out.push(
      `- [ ] \`${rule}\`${flagMark(item)}: ${RULE_TEXT[rule] ?? ""}${now}`,
      agentLine(item),
    );
  }
  out.push("");

  const summaries = sourceIds.flatMap(id => {
    const source = registry[id];
    return source?.kind === "publisher-summary"
      ? [`\`${id}\` "${source.title}"`]
      : [];
  });
  out.push(
    "### Copy (#91), confirm or edit",
    "",
    '- [ ] The notice (`hugo/layouts/partials/scholarship-notice.html`), the About section (`/about/#scholarship-pages`), the date line ("Sources read … Newer scholarship is not tracked.") and the link line (`scholarship-link.html`).',
    '- [ ] Agent wording not taken from #91: the list-page line "Each Scholarship Page is the site\'s summary of outside scholarship, not the show\'s work." and the link text "How Scholarship Pages are made".',
    ...(summaries.length > 0
      ? [
          `- [ ] Agent-written registry titles of the publisher summaries cited: ${summaries.join("; ")}.`,
        ]
      : []),
    "- [ ] Agent calls made under your delegation:",
    '  - the section is named "Scholarship" at `/scholarship/`;',
    "  - no main-menu entry until three pages are published (#106);",
    "  - the section is not in search;",
    "  - storage is split as in #92;",
    "  - review follows the #93 procedure.",
    "",
  );

  out.push(
    "### Leads (not on the page)",
    "",
    ...(review.leads.length > 0
      ? review.leads.map(lead => `- [ ] ${lead}`)
      : ["None."]),
    "",
    "### Uncited (read, not on the page)",
    "",
    ...(review.uncited.length > 0
      ? review.uncited.map(entry => `- [ ] ${entry}`)
      : ["None."]),
    "",
    "---",
    "",
    "When you're done, I record each result in the review file, apply any failures, and recompute the publish rule (#93 step 4). If the rule holds, I set `review` and `sourcesRead` to your review date, remove `draft`, and push.",
    "",
  );

  return out.join("\n");
}

if (import.meta.main) {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: bun run scholarship:checklist <slug>");
    process.exit(1);
  }
  const root = path.resolve(import.meta.dir, "../..");
  const commit = (await $`git rev-parse --short HEAD`.cwd(root).text()).trim();
  try {
    process.stdout.write(await buildChecklist(root, slug, commit));
  } catch (error) {
    console.error(`✗ ${(error as Error).message}`);
    process.exit(1);
  }
}
