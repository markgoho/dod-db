/**
 * Question Pages (/scholarship/<slug>/<id>/) and their card images: the rules
 * on statement ids, which are public URLs, and the record of which card was
 * rendered from which text.
 */

import path from "node:path";

/** Card images, one per statement: hugo/static/assets/scholarship/<slug>/<id>.png */
export const CARD_DIR = "hugo/static/assets/scholarship";

/** What each card was rendered from: "<slug>/<id>" to cardKey(). */
export const CARD_MANIFEST = "data/scholarship-question-cards.json";

export type CardManifest = Record<string, string>;

interface CardStatement {
  id: string;
  question: string;
  short: string;
}

/**
 * Ids a statement can't take: other ids on the page (see scholarship/single.html,
 * and `<id>-links` in scholarship-statement-body.html).
 */
const RESERVED_IDS = new Set(["share", "share-card", "card"]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A statement id is a URL path segment and a fragment: lower-case slug,
 * unique on its page, and clear of the page's own ids.
 */
export function checkStatementIds(
  at: string,
  statements: readonly CardStatement[],
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const { id } of statements) {
    if (!ID_PATTERN.test(id)) {
      errors.push(
        `${at}: statement id "${id}" is not a lower-case slug (a-z, 0-9, single hyphens)`,
      );
    }
    if (
      RESERVED_IDS.has(id) ||
      id.startsWith("source-") ||
      id.endsWith("-links")
    ) {
      errors.push(
        `${at}: statement id "${id}" collides with an id the page already uses`,
      );
    }
    if (seen.has(id)) {
      errors.push(`${at}: statement id "${id}" is used twice`);
    }
    seen.add(id);
  }
  return errors;
}

/** The text a card shows; a card is stale when this changes. */
export function cardKey(pageTitle: string, statement: CardStatement): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(
    JSON.stringify([
      pageTitle,
      statement.id,
      statement.question,
      statement.short,
    ]),
  );
  return hasher.digest("hex").slice(0, 16);
}

export function cardPath(root: string, slug: string, id: string): string {
  return path.join(root, CARD_DIR, slug, `${id}.png`);
}

export async function readCardManifest(root: string): Promise<CardManifest> {
  const file = Bun.file(path.join(root, CARD_MANIFEST));
  return (await file.exists()) ? ((await file.json()) as CardManifest) : {};
}

/** Every statement of a published page has a card, rendered from its current text. */
export async function checkCards(
  root: string,
  slug: string,
  page: { title: string; statements: readonly CardStatement[] },
  manifest: CardManifest,
): Promise<string[]> {
  const errors: string[] = [];
  const fix = `run bun run scholarship:question-cards ${slug}`;
  for (const statement of page.statements) {
    const at = `scholarship/${slug}/${statement.id}`;
    if (!(await Bun.file(cardPath(root, slug, statement.id)).exists())) {
      errors.push(`${at}: no card image; ${fix}`);
      continue;
    }
    if (
      manifest[`${slug}/${statement.id}`] !== cardKey(page.title, statement)
    ) {
      errors.push(
        `${at}: card image is stale (question or short answer changed); ${fix}`,
      );
    }
  }
  return errors;
}
