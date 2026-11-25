/**
 * Generate the raster illustrations for one Scholarship Page infographic with
 * Gemini, from `data/scholarship-illustrations/<slug>.yaml`.
 *
 * Every image shares one style preamble and one content-rules block. An image
 * may list `refs`: earlier images passed as reference, so a character or an
 * object stays the same across panels. Words, links and claims never come
 * from the model; they stay in the page's partial.
 *
 * Usage: bun run scholarship:illustrations <slug> [--id=<id>] [--pro]
 * Output: hugo/assets/scholarship-art/<slug>/<id>.png (Hugo serves WebP)
 */

import { YAML } from "bun";
import path from "node:path";
import { z } from "zod";
import { ai } from "../ai.js";

const FLASH_MODEL = "gemini-3.1-flash-image-preview";
const PRO_MODEL = "gemini-3-pro-image-preview";
const MAX_RETRIES = 3;

const ManifestSchema = z.object({
  slug: z.string(),
  images: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      statements: z.array(z.string()).min(1),
      aspect: z.enum(["1:1", "4:3", "3:4", "16:9", "9:16", "4:5", "5:4"]),
      refs: z.array(z.string()).optional(),
      alt: z.string(),
      prompt: z.string(),
    }),
  ),
});

const STYLE = `STYLE — a single panel from a modern editorial comic:
- Bold, confident black ink outlines of even weight; flat colour fills; no gradients.
- A strictly limited palette: near-black ink (#1a1410), warm off-white paper (#fbf6ef), golden amber (#e8b90c), deep rust red (#8f1d18), and a light warm grey. No other hues.
- Halftone dot shading for shadows, as in printed comics.
- Clean, friendly, slightly stylised figures: expressive faces, simple shapes, no caricature.
- Plain uncluttered background in paper or light grey with only the props named.
- No panel border, no frame, no caption box: the page draws those.`;

const RULES = `CONTENT RULES:
- No text anywhere in the image except exactly what the scene below asks for. No captions, titles, signatures, labels, watermarks, or invented writing.
- Writing on scrolls or papers is tiny illegible scribble marks, never letters or words.
- Do not depict any real, identifiable person. Figures are generic.
- No violence, nudity, or intimacy.`;

function arg(name: string): string | undefined {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const slug = process.argv[2];
if (!slug || slug.startsWith("--")) {
  console.error(
    "Usage: bun run scholarship:illustrations <slug> [--id=<id>] [--pro]",
  );
  process.exit(1);
}
const onlyId = arg("id");
const model = process.argv.includes("--pro") ? PRO_MODEL : FLASH_MODEL;

const manifest = ManifestSchema.parse(
  YAML.parse(
    await Bun.file(`data/scholarship-illustrations/${slug}.yaml`).text(),
  ),
);
const outDir = `hugo/assets/scholarship-art/${slug}`;

async function readPart(id: string) {
  const file = Bun.file(path.join(outDir, `${id}.png`));
  if (!(await file.exists())) {
    throw new Error(`reference "${id}" has not been generated yet`);
  }
  return {
    inlineData: {
      mimeType: "image/png",
      data: (await file.bytes()).toBase64(),
    },
  };
}

for (const image of manifest.images) {
  if (onlyId && image.id !== onlyId) continue;
  const refs = await Promise.all((image.refs ?? []).map(readPart));
  const text = [
    STYLE,
    RULES,
    refs.length > 0
      ? "The attached image(s) are earlier panels of the same comic: keep the same characters, objects and drawing style."
      : "",
    `SCENE:\n${image.prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Generating ${image.id} with ${model} (try ${attempt})…`);
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [...refs, { text }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: { aspectRatio: image.aspect, imageSize: "1K" },
        },
      });
      const data = response.candidates?.[0]?.content?.parts?.find(
        p => p.inlineData?.data,
      )?.inlineData?.data;
      if (!data) throw new Error("no image in response");
      const out = path.join(outDir, `${image.id}.png`);
      await Bun.write(out, Uint8Array.fromBase64(data));
      console.log(`✓ ${out}`);
      break;
    } catch (error) {
      console.error(`✗ ${image.id}: ${(error as Error).message}`);
      if (attempt === MAX_RETRIES) process.exit(1);
      await Bun.sleep(2000 * attempt);
    }
  }
}
