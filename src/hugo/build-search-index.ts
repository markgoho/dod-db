/**
 * Build the site search index (Pagefind) for the built site in hugo/public.
 *
 * Pagefind ranks pages, so the 40-odd Timeline Entries on the one Timeline
 * page would compete with every Episode as a single long document and sink
 * below them. Each entry gets a search record of its own instead: its row,
 * cut from the built /timeline/ page, at its own URL (/timeline/<id>, #219),
 * which opens the Timeline at that entry. The /timeline/ page is indexed
 * without its entries (the axis carries data-pagefind-ignore).
 *
 * Usage: bun run index
 */

import path from "node:path";
import * as pagefind from "pagefind";
import { parse, type DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];

export interface TimelineEntryRecord {
  /** The entry's own URL, e.g. /timeline/flood */
  url: string;
  /** The entry's title as the card shows it */
  title: string;
  /** The entry's row (<li>) exactly as it appears in the built page */
  markup: string;
}

function attribute(element: Element, name: string): string | undefined {
  return element.attrs.find(a => a.name === name)?.value;
}

function hasClass(element: Element, name: string): boolean {
  return (attribute(element, "class") ?? "").split(/\s+/).includes(name);
}

function isElement(node: Node): node is Element {
  return "tagName" in node;
}

function children(node: Node): Node[] {
  return "childNodes" in node ? node.childNodes : [];
}

function textOf(node: Node): string {
  if (node.nodeName === "#text" && "value" in node) return node.value;
  return children(node).map(textOf).join("");
}

function squash(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}

function findAll(node: Node, test: (element: Element) => boolean): Element[] {
  const found: Element[] = [];
  const visit = (current: Node): void => {
    if (isElement(current) && test(current)) found.push(current);
    for (const child of children(current)) visit(child);
  };
  visit(node);
  return found;
}

/**
 * The Timeline Entries in the built /timeline/ page: each row that carries
 * data-entry-url, except a Tradition Date's own marker row, which repeats an
 * entry and carries data-pagefind-ignore.
 */
export function extractTimelineEntries(html: string): {
  timelineTitle: string;
  entries: TimelineEntryRecord[];
} {
  const document = parse(html, { sourceCodeLocationInfo: true });
  const h1 = findAll(document, element => element.tagName === "h1")[0];
  const timelineTitle = h1 ? squash(textOf(h1)) : "";
  if (!timelineTitle) throw new Error("The Timeline page has no <h1>");
  const rows = findAll(
    document,
    element =>
      element.tagName === "li" &&
      attribute(element, "data-entry-url") !== undefined &&
      attribute(element, "data-pagefind-ignore") === undefined,
  );
  const entries = rows.map(row => {
    const url = attribute(row, "data-entry-url") ?? "";
    const id = attribute(row, "id") ?? "(no id)";
    const location = row.sourceCodeLocation;
    if (!url) throw new Error(`Timeline Entry ${id} has no data-entry-url`);
    if (!location) throw new Error(`Timeline Entry ${id}: no source location`);
    const heading = findAll(row, element =>
      hasClass(element, "timeline-entry__title"),
    )[0];
    const title = heading ? squash(textOf(heading)) : "";
    if (!title) throw new Error(`Timeline Entry ${id} has no title`);
    return {
      url,
      title,
      markup: html.slice(location.startOffset, location.endOffset),
    };
  });
  return { timelineTitle, entries };
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

/** The HTML Pagefind indexes for one entry: its row, as the only body. */
export function timelineEntryDocument(
  entry: TimelineEntryRecord,
  timelineTitle: string,
): string {
  const title = escapeAttribute(`${timelineTitle} · ${entry.title}`);
  return `<!doctype html><html lang="en"><head><title>${title}</title></head><body><ol data-pagefind-body data-pagefind-meta="title:${title}" data-pagefind-filter="type:Timeline">${entry.markup}</ol></body></html>`;
}

function fail(message: string): never {
  console.error(`build-search-index: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dir, "../..");
  const site = path.join(root, "hugo/public");
  const timelinePage = Bun.file(path.join(site, "timeline/index.html"));
  if (!(await timelinePage.exists())) fail("no built /timeline/ page");

  const html = await timelinePage.text();
  const { timelineTitle, entries } = extractTimelineEntries(html);
  if (entries.length === 0) fail("no Timeline Entries in /timeline/");

  const { index, errors } = await pagefind.createIndex({});
  if (!index) fail(errors.join("; "));

  const indexed = await index.addDirectory({ path: site });
  if (indexed.errors.length > 0) fail(indexed.errors.join("; "));

  for (const entry of entries) {
    const added = await index.addHTMLFile({
      url: entry.url,
      content: timelineEntryDocument(entry, timelineTitle),
    });
    if (added.errors.length > 0)
      fail(`${entry.url}: ${added.errors.join("; ")}`);
  }

  const written = await index.writeFiles({
    outputPath: path.join(site, "pagefind"),
  });
  if (written.errors.length > 0) fail(written.errors.join("; "));
  await pagefind.close();

  console.log(
    `Read ${indexed.page_count} pages; added ${entries.length} Timeline Entries.`,
  );
}

if (import.meta.main) await main();
