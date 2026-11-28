/**
 * Timeline Entry Pages (/timeline/<id>, #219) and the Timeline's own page:
 * their link-preview card images, and the record of which card was rendered
 * from which text.
 */

import path from "node:path";
import { readCardManifest, type CardManifest } from "./question-cards.js";

/** Card images, one per entry: hugo/static/assets/timeline/<id>.png */
const ENTRY_CARD_DIR = "hugo/static/assets/timeline";

/** The Timeline's own card: what a link to /timeline/#<id> previews. */
const TIMELINE_CARD = "hugo/static/assets/timeline-card.png";

/** What each card was rendered from: "<id>" (or INDEX) to its key. */
export const TIMELINE_CARD_MANIFEST = "data/timeline-cards.json";

/** The Timeline's own card in the manifest; no entry file can take the name. */
export const INDEX = "_index";

const FIX = "run bun run timeline:cards --stale";

/** The fields of an entry its card shows. */
interface CardEntry {
  title: string;
  entryKind: string;
  critical?: { display: string } | undefined;
  undated?: object | undefined;
  historicity?: { point?: string | undefined } | undefined;
}

/** The fields of the Timeline's page its card shows. */
export interface CardIndex {
  title: string;
  dek: string;
}

function hash(parts: readonly string[]): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(JSON.stringify(parts));
  return hasher.digest("hex").slice(0, 16);
}

/**
 * The text an entry's card shows; a card is stale when this changes. An
 * undated entry's card shows its verdict's wording (timeline-undated-label.html):
 * "not historical as narrated" for that historicity point (#275), else "no firm date".
 */
export function entryCardKey(entry: CardEntry): string {
  const verdict =
    entry.historicity?.point === "not-historical"
      ? "not-historical"
      : "no-firm-date";
  return hash([
    entry.title,
    entry.entryKind,
    entry.critical?.display ?? `undated:${verdict}`,
  ]);
}

export function indexCardKey(index: CardIndex): string {
  return hash([index.title, index.dek]);
}

/** The image file of an entry's card, or of the Timeline's (INDEX). */
export function timelineCardPath(root: string, id: string): string {
  return id === INDEX
    ? path.join(root, TIMELINE_CARD)
    : path.join(root, ENTRY_CARD_DIR, `${id}.png`);
}

export async function readTimelineCardManifest(
  root: string,
): Promise<CardManifest> {
  return readCardManifest(root, TIMELINE_CARD_MANIFEST);
}

/** A card exists and was rendered from its current text. */
export async function checkTimelineCard(
  root: string,
  id: string,
  key: string,
  manifest: CardManifest,
): Promise<string[]> {
  const at = id === INDEX ? "timeline" : `timeline/${id}`;
  if (!(await Bun.file(timelineCardPath(root, id)).exists())) {
    return [`${at}: no card image; ${FIX}`];
  }
  if (manifest[id] !== key) {
    return [`${at}: card image is stale (its text changed); ${FIX}`];
  }
  return [];
}
