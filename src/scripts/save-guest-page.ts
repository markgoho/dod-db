import { titleToSlug } from "../utils/title-to-slug.js";

type LinkedWorkInput = {
  title?: unknown;
  url?: unknown;
};

type WorkInput = string | LinkedWorkInput;
type NormalizedWork = string | { title: string; url: string };

interface SaveGuestPageInput {
  guestName: string;
  guestSlug?: string;
  title?: string;
  shortRole?: string;
  credentials: string;
  summary: string;
  expertise?: string[];
  works?: WorkInput[];
  imageAlt?: string;
  headshotUrl: string;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

async function readInput(): Promise<string> {
  return new Response(Bun.stdin.stream()).text();
}

function validateInput(input: SaveGuestPageInput): void {
  if (!input.guestName.trim()) {
    throw new Error("guestName is required");
  }

  if (!input.credentials.trim()) {
    throw new Error("credentials is required");
  }

  if (!input.summary.trim()) {
    throw new Error("summary is required");
  }

  if (!input.headshotUrl.trim()) {
    throw new Error("headshotUrl is required");
  }
}

function renderStringList(fieldName: string, values: string[]): string[] {
  return [fieldName, ...values.map(value => `  - ${quote(value)}`)];
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeWorks(values: WorkInput[]): NormalizedWork[] {
  return values.flatMap((value, index) => {
    if (typeof value === "string") {
      const title = value.trim();
      return title ? [title] : [];
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`works[${index}] must be a string or linked work object`);
    }

    if (typeof value.title !== "string" || typeof value.url !== "string") {
      throw new Error(
        `works[${index}] must include string title and url fields`,
      );
    }

    const title = value.title.trim();
    const url = value.url.trim();
    if (!title || !url) {
      throw new Error(
        `works[${index}] must include non-empty title and url fields`,
      );
    }

    if (!isHttpUrl(url)) {
      throw new Error(`works[${index}].url must be an HTTP or HTTPS URL`);
    }

    return [{ title, url }];
  });
}

function renderWorkList(values: NormalizedWork[]): string[] {
  return [
    "works:",
    ...values.flatMap(value =>
      typeof value === "string"
        ? [`  - ${quote(value)}`]
        : [`  - title: ${quote(value.title)}`, `    url: ${quote(value.url)}`],
    ),
  ];
}

function buildFrontmatter(
  input: SaveGuestPageInput,
  guestSlug: string,
): string {
  const title = input.title?.trim() || input.guestName.trim();
  const lines = ["---", `title: ${quote(title)}`, `slug: ${quote(guestSlug)}`];

  if (input.shortRole?.trim()) {
    lines.push(`shortRole: ${quote(input.shortRole.trim())}`);
  }

  lines.push(
    `credentials: ${quote(input.credentials.trim())}`,
    `summary: ${quote(input.summary.trim())}`,
  );

  const expertise = (input.expertise ?? [])
    .map(value => value.trim())
    .filter(Boolean);
  if (expertise.length > 0) {
    lines.push(...renderStringList("expertise:", expertise));
  }

  const works = normalizeWorks(input.works ?? []);
  if (works.length > 0) {
    lines.push(...renderWorkList(works));
  }

  if (input.imageAlt?.trim()) {
    lines.push(`imageAlt: ${quote(input.imageAlt.trim())}`);
  }

  lines.push("---");
  return `${lines.join("\n")}\n`;
}

function extensionFromContentType(
  contentType: string | null,
): string | undefined {
  if (!contentType) {
    return undefined;
  }

  if (contentType.includes("jpeg")) {
    return "jpg";
  }
  if (contentType.includes("png")) {
    return "png";
  }
  if (contentType.includes("webp")) {
    return "webp";
  }
  if (contentType.includes("gif")) {
    return "gif";
  }

  return undefined;
}

function extensionFromUrl(url: string): string | undefined {
  const pathname = new URL(url).pathname;
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase();
}

async function main(): Promise<void> {
  try {
    const rawInput = await readInput();
    const input = JSON.parse(rawInput) as SaveGuestPageInput;
    validateInput(input);

    const guestSlug = input.guestSlug?.trim() || titleToSlug(input.guestName);
    const guestDir = `hugo/content/guests/${guestSlug}`;
    await Bun.$`mkdir -p ${guestDir}`.quiet();
    await Bun.write(
      `${guestDir}/_index.md`,
      buildFrontmatter(input, guestSlug),
    );

    const response = await fetch(input.headshotUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download headshot: ${response.status} ${response.statusText}`,
      );
    }

    const extension =
      extensionFromContentType(response.headers.get("content-type")) ??
      extensionFromUrl(input.headshotUrl) ??
      "jpg";
    const imagePath = `${guestDir}/headshot.${extension}`;
    await Bun.write(imagePath, await response.arrayBuffer());

    console.log(`${guestDir}/_index.md`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
