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

interface SaveBookPageInput {
  bookSlug: string;
  title: string;
  bookName: string;
  testament: "old" | "new" | "apocrypha";
  nrsvueUrl: string;
  definition: string;
  featuredItems?: FeaturedItem[];
  quotes: QuoteInput[];
  showAllEpisodes?: boolean;
  body: string;
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

function validateInput(input: SaveBookPageInput): void {
  if (!input.bookSlug.trim()) {
    throw new Error("bookSlug is required");
  }

  if (!input.title.trim()) {
    throw new Error("title is required");
  }

  if (!input.bookName.trim()) {
    throw new Error("bookName is required");
  }

  if (!input.nrsvueUrl.trim()) {
    throw new Error("nrsvueUrl is required");
  }

  if (!input.definition.trim()) {
    throw new Error("definition is required");
  }

  if (!input.body.trim()) {
    throw new Error("body is required");
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
      `    speaker: ${quoteYaml(quote.speaker)}`,
      `    episode: ${quote.episode}`,
      `    timestamp: ${quoteYaml(quote.timestamp)}`,
    ]),
  ];
}

function buildFrontmatter(input: SaveBookPageInput): string {
  const lines = [
    "---",
    `title: ${quoteYaml(input.title)}`,
    `bookName: ${quoteYaml(input.bookName)}`,
    `testament: ${input.testament}`,
    `definition: ${quoteYaml(input.definition)}`,
    `nrsvueUrl: ${quoteYaml(input.nrsvueUrl)}`,
  ];

  if (input.featuredItems && input.featuredItems.length > 0) {
    lines.push(...renderFeaturedItems(input.featuredItems));
  }

  lines.push(
    ...renderQuotes(input.quotes),
    `showAllEpisodes: ${input.showAllEpisodes ?? true}`,
    "---",
  );

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const rawInput = await readInput(args.inputPath);
    const input = JSON.parse(rawInput) as SaveBookPageInput;
    validateInput(input);

    const outputPath = `hugo/content/books/${input.bookSlug}/_index.md`;
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
