type FeaturedItem =
  | {
      type: "segment";
      episodeNumber: number;
      segmentAnchor: string;
      label: string;
    }
  | {
      type: "episode";
      number: number;
      label: string;
    };

interface QuoteInput {
  text: string;
  speaker: string;
  episode: number;
  timestamp: string;
}

interface RelatedPage {
  slug: string;
  title: string;
  description?: string;
}

interface SaveTagPageInput {
  tagSlug: string;
  title: string;
  topicName?: string;
  definition: string;
  aliases?: string[];
  knownAs?: string[];
  featuredItems?: FeaturedItem[];
  quotes: QuoteInput[];
  showTopEpisodes?: boolean;
  topEpisodesLimit?: number;
  showAllEpisodes?: boolean;
  body: string;
  isDisambiguation?: boolean;
  relatedPages?: RelatedPage[];
}

interface ParsedArguments {
  inputPath?: string;
}

function parseArguments(argv: string[]): ParsedArguments {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") {
      const inputPath = argv[index + 1];
      if (!inputPath) {
        throw new Error("Missing value for --input");
      }
      return { inputPath };
    }
  }

  return {};
}

async function readInput(inputPath: string | undefined): Promise<string> {
  if (inputPath) {
    return Bun.file(inputPath).text();
  }

  return new Response(Bun.stdin.stream()).text();
}

function validateInput(input: SaveTagPageInput): void {
  if (!input.tagSlug.trim()) {
    throw new Error("tagSlug is required");
  }

  if (!input.title.trim()) {
    throw new Error("title is required");
  }

  if (!input.definition.trim()) {
    throw new Error("definition is required");
  }

  if (!input.body.trim()) {
    throw new Error("body is required");
  }

  if (input.isDisambiguation) {
    if (!input.relatedPages || input.relatedPages.length < 2) {
      throw new Error(
        "disambiguation pages require at least 2 relatedPages entries",
      );
    }

    for (const page of input.relatedPages) {
      if (!page.slug.trim()) {
        throw new Error("relatedPages slug is required");
      }
      if (!page.title.trim()) {
        throw new Error("relatedPages title is required");
      }
    }

    return;
  }

  if (input.quotes.length !== 4) {
    throw new Error("quotes must contain exactly 4 entries");
  }

  for (const quote of input.quotes) {
    if (!quote.text.trim()) {
      throw new Error("quote text is required");
    }
    if (!quote.speaker.trim()) {
      throw new Error("quote speaker is required");
    }
    if (!quote.timestamp.trim()) {
      throw new Error("quote timestamp is required");
    }
  }

  for (const item of input.featuredItems ?? []) {
    if (!item.label.trim()) {
      throw new Error("featured item label is required");
    }

    if (
      item.type === "segment" &&
      (!item.episodeNumber || !item.segmentAnchor?.trim())
    ) {
      throw new Error(
        "segment featured items require episodeNumber and segmentAnchor",
      );
    } else if (item.type === "episode" && !item.number) {
      throw new Error("episode featured items require number");
    }
  }
}

function quoteYaml(value: string): string {
  return JSON.stringify(value);
}

function quoteScalar(value: string): string {
  return JSON.stringify(value);
}

function renderStringList(fieldName: string, values: string[]): string[] {
  return [fieldName, ...values.map(value => `  - ${quoteYaml(value)}`)];
}

function renderFeaturedItems(items: FeaturedItem[]): string[] {
  return [
    "featuredItems:",
    ...items.flatMap(item => {
      if (item.type === "segment") {
        return [
          `  - type: ${item.type}`,
          `    episodeNumber: ${item.episodeNumber}`,
          `    segmentAnchor: ${item.segmentAnchor}`,
          `    label: ${quoteYaml(item.label)}`,
        ];
      }

      return [
        `  - type: ${item.type}`,
        `    number: ${item.number}`,
        `    label: ${quoteYaml(item.label)}`,
      ];
    }),
  ];
}

function renderQuotes(quotes: QuoteInput[]): string[] {
  return [
    "quotes:",
    ...quotes.flatMap(quote => [
      `  - text: ${quoteYaml(quote.text)}`,
      `    speaker: ${quoteScalar(quote.speaker)}`,
      `    episode: ${quote.episode}`,
      `    timestamp: ${quoteYaml(quote.timestamp)}`,
    ]),
  ];
}

function renderRelatedPages(pages: RelatedPage[]): string[] {
  return [
    "relatedPages:",
    ...pages.flatMap(page => {
      const lines = [
        `  - slug: ${quoteScalar(page.slug)}`,
        `    title: ${quoteScalar(page.title)}`,
      ];
      if (page.description) {
        lines.push(`    description: ${quoteYaml(page.description)}`);
      }
      return lines;
    }),
  ];
}

function buildFrontmatter(input: SaveTagPageInput): string {
  if (input.isDisambiguation) {
    const lines = [
      "---",
      "layout: disambiguation",
      `title: ${quoteScalar(input.title)}`,
      `definition: ${quoteYaml(input.definition)}`,
    ];

    if (input.relatedPages) {
      lines.push(...renderRelatedPages(input.relatedPages));
    }

    lines.push("---");
    return `${lines.join("\n")}\n`;
  }

  const lines = [
    "---",
    `title: ${quoteScalar(input.title)}`,
    `definition: ${quoteYaml(input.definition)}`,
  ];

  const topicName = input.topicName?.trim();
  if (topicName) {
    lines.push(`topicName: ${quoteScalar(topicName)}`);
  }

  if (input.aliases && input.aliases.length > 0) {
    lines.push(...renderStringList("aliases:", input.aliases));
  }

  if (input.knownAs && input.knownAs.length > 0) {
    lines.push(...renderStringList("knownAs:", input.knownAs));
  }

  if (input.featuredItems && input.featuredItems.length > 0) {
    lines.push(...renderFeaturedItems(input.featuredItems));
  }

  lines.push(
    ...renderQuotes(input.quotes),
    `showTopEpisodes: ${input.showTopEpisodes ?? true}`,
    `topEpisodesLimit: ${input.topEpisodesLimit ?? 6}`,
    `showAllEpisodes: ${input.showAllEpisodes ?? true}`,
    "---",
  );
  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const rawInput = await readInput(args.inputPath);
    const input = JSON.parse(rawInput) as SaveTagPageInput;
    validateInput(input);

    const outputPath = `hugo/content/tags/${input.tagSlug}/_index.md`;
    await Bun.write(
      outputPath,
      `${buildFrontmatter(input)}\n${input.body.trim()}\n`,
    );

    console.log(outputPath);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
