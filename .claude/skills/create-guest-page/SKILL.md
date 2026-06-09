---
name: create-guest-page
description: Create a rich Hugo guest landing page from guest taxonomy data, episode context, and public web research. Use when the user asks to create a guest page, write a guest landing page, or generate a new hand-authored guest page.
---

# Create Guest Page

This skill guides you through creating a guest landing page as a Hugo content bundle using deterministic repo gathering, transcript and episode-context review, public web research, and a save script.

## Input

A guest name, such as `Aaron Higashi` or `Karla Kamstra`.

If the user does not provide a guest name, ask for one before proceeding.

Do not start by asking the user for credentials, works, or a headshot. The default behavior of this skill is autonomous research: gather what you can from the repo, inspect the episode introductions, and search public sources on the web before asking the user anything. Only ask the user for help when the evidence is missing, conflicting, or too weak to support a confident editorial choice.

## Workflow

### 1. Gather repo context

Run:

```bash
bun run guest-page:gather -- <guest-name>
```

This returns structured JSON with:

- the requested guest name
- the guest slug
- episode count
- every matching episode with number, title, date, and slug
- any existing bundle at `hugo/content/guests/{slug}/_index.md`

If the script exits with an error, stop and tell the user.

### 2. Review episode introductions and transcript context

Use the gathered episodes to inspect how the hosts introduce the guest and what topics they discuss.

At minimum:

- read the opening introduction from the guest's first appearance
- inspect every gathered appearance for titles, institutional affiliations, research areas, and works discussed on the show
- search each transcript for work cues such as `book`, `article`, `essay`, `chapter`, `volume`, `commentary`, `author`, `wrote`, `written`, `published`, `forthcoming`, and known publisher/series names
- also note any social media handles, websites, class links, Patreon, newsletter, or other public-facing resources the guest or hosts mention
- use that evidence to draft the 1 to 2 sentence summary
- start the helpful links list with published works explicitly named in the episode; supplement with social media profiles, personal websites, class links, or other public resources when the guest has few or no publications
- do not stop after finding one good link; continue through every appearance before deciding the helpful links list is complete

Prefer the show's own introduction language for:

- current degree or position
- field or subfield
- research focus
- how to describe the guest's expertise in concise plain language

### 3. Search the internet for public profile details

Search public sources on the web for:

- credentials
- current institutional affiliation, if relevant for understanding the credential line
- helpful links — published works, social media profiles, personal website, Linktree, newsletter, free classes, or other public-facing resources
- headshot image URL

Use Playwriter early for headshot discovery when a public profile page is likely to have a portrait. Prefer opening the institutional or author profile in a browser, locating the profile image visually, and confirming that it is a real headshot before saving anything.
Prefer biographical sources in this order:

1. university or institutional profile pages
2. faculty or scholar CV pages
3. publisher or author pages
4. conference or society pages
5. other public professional pages

For helpful links, use this priority order:

1. **Published works** named in the episode — books, articles, essays, courses. Confirm authorship using at least one strong signal (institutional/profile page, CV, publisher bio, episode discussion, or product page whose author details match the guest's known field). If attribution is ambiguous, omit or ask the user. For books, use Playwriter to find a stable Amazon product page and include the Associates tag `elelohim0a-20` (`?tag=elelohim0a-20`). If Amazon lacks the work or a publisher/university press page is more appropriate, use that instead. Prefer product/detail pages over search results.
2. **Social media profiles** — Instagram, TikTok, YouTube, Twitter/X, Threads. Use the handle mentioned in the episode or confirmed on the guest's Linktree/website. Prefer the platform where the guest is most active or best known.
3. **Personal website or Linktree** — include when it serves as a useful hub for the guest's work and resources.
4. **Free classes, newsletters, Patreon, or other public resources** mentioned in the episode — especially valuable when the guest offers free educational content.

For guests who primarily work in social media or education rather than publishing, social profiles and class links are the most useful helpful links and should not be omitted just because there are no books.

Before saving, validate every URL using Playwriter when needed. Confirm each link resolves to the intended destination and not a 404, search results page, or unrelated profile. If an Amazon product page is broken, replace it with another stable destination.

Use public sources to infer:

- `credentials` — keep this short and traditional, such as `PhD candidate`, `PhD`, `M.Div.`, `M.Ed.`, or similar. For non-academic guests, a short role description like `Content creator & educator` is acceptable. Do not overload this line with affiliations or biography prose.
- `works` — the frontmatter field name is `works` but it renders as **Helpful Links**. A short non-exhaustive list, usually 2 to 5 items, most useful first. For academic guests prefer published works; for social media or educator guests prefer social profiles, class links, and website. Use linked objects `{ "title": "...", "url": "..." }` whenever a trustworthy destination is available. Always populate this for any guest who has a meaningful public presence — do not leave it empty just because there are no books.
- `headshotUrl` — use a stable public image URL only after confirming it is a real portrait or profile photo of the guest. Prefer the guest's own About/profile page image, page `og:image`, faculty profile image, or author headshot, and inspect the page in Playwriter if needed to verify the image visually. Avoid homepage hero images, decorative art, manuscript images, book covers, logos, lecture slides, and other topical illustrations.- `imageAlt` — plain literal alt text, usually `Portrait of <Name>`

If the available public evidence is weak or conflicting, ask the user instead of guessing. Do not ask the user to provide information that can be found confidently from a public institutional profile, CV, publisher page, or the guest's episode introductions.

### 4. Reason

Combine the repo context, transcript introductions, and web research to draft the page.

The target page structure is:

1. head shot
2. name + credentials
3. episode count
4. summary of specialty or expertise
5. helpful links (published works, social profiles, website, classes, etc.)
6. episodes they appear in

Authoring rules:

- `title` should normally be the canonical guest name from the taxonomy or established public profile
- `guestSlug` should normally be the gathered slug unless project slug policy requires a different normalized form
- `credentials` must be short and readable
- `summary` must be 1 to 2 sentences and should describe the guest's area of work, not just restate their name
- `works` (renders as **Helpful Links**) should be 2 to 5 items, most useful first; for academic guests prefer published works, for social media/educator guests prefer social profiles and class links; prefer `{ "title": "...", "url": "..." }` objects; use plain strings only when no destination link can be found; do not leave empty for guests with a meaningful public presence
- before saving, do a final helpful-links audit: confirm every appearance was checked for mentioned works and resources, confirm every included work has same-author evidence, confirm social/class links match the correct guest identity, and confirm any omitted candidate was skipped for a clear reason (unavailable, weakly attributed, less relevant, or no trustworthy destination)
- `expertise` is optional and should only be used if it adds clear value
- `imageAlt` should be plain, literal alt text

### 5. Save

Create a JSON object in this shape:

```json
{
  "guestName": "Aaron Higashi",
  "guestSlug": "aaron-higashi",
  "title": "Aaron Higashi",
  "credentials": "PhD candidate",
  "summary": "Aaron Higashi is a public-facing Bible scholar whose work helps readers approach scripture with historical awareness and contextual sensitivity.",
  "works": [
    {
      "title": "1 and 2 Samuel for Normal People",
      "url": "https://www.amazon.com/dp/example?tag=elelohim0a-20"
    }
  ],
  "imageAlt": "Portrait of Aaron Higashi",
  "headshotUrl": "https://example.com/headshot.jpg"
}
```

Required fields for the save script are:

- `guestName`
- `credentials`
- `summary`
- `headshotUrl`

The rest are optional.

Then save it via stdin using a quoted heredoc:

```bash
bun run guest-page:save <<'EOF'
{
  "guestName": "Aaron Higashi",
  "guestSlug": "aaron-higashi",
  "title": "Aaron Higashi"
}
EOF
```

The save script will:

- write `hugo/content/guests/<slug>/_index.md`
- download the headshot into the bundle as `headshot.<ext>`

Prefer stdin via a quoted heredoc. Do not create temporary JSON files unless stdin is genuinely unavailable.

### 6. Verify

Before building, validate every helpful link in the saved frontmatter. Use Playwriter as the default review path so you confirm the destinations in a normal browser. Open each destination and confirm it lands on the intended page — the correct social profile, work detail page, or resource. If any link is broken, redirected to an unrelated item, or points to a search/results page when a stable detail page should exist, fix the frontmatter first.

Run:

```bash
bun run build:hugo
```

Then review the page at:

```text
http://localhost:1313/guests/<slug>/
```

The Hugo server is already running in this project, so do not start it.

If aliases are present, do not use them for localhost QA if they redirect to the deployed site. Prefer the canonical localhost URL only.

Before considering the page complete, visually inspect the downloaded `headshot.*` file, the source page in Playwriter, or the rendered page image. Confirm it shows the guest's face as a suitable profile photo, not a manuscript, book cover, logo, decorative artwork, placeholder, cropped body part, or unrelated contextual image. If you cannot visually confirm the photo is an appropriate portrait, do not use it; find a better source or ask the user for help.

### 7. Editorial pass

Check that:

- the headshot renders
- the credentials line is concise and credential-like rather than biographical
- the summary is concise, specific, and supported by episode introductions and public profile evidence
- the episode count matches the gathered context
- the helpful links section is present and populated for any guest with a meaningful public presence; links are clean and resolve correctly
- the episode grid shows the guest's appearances

If any of those are weak, tighten them before finishing.

## When to ask the user

Only ask the user for missing details when:

- no reliable public headshot can be found
- credentials are unclear or contradictory across sources
- no public profile or publication list is available
- multiple plausible summaries exist and the distinction is editorial rather than factual

When asking, ask only for the missing piece rather than for the whole profile.

## Output Rules

- Use content bundles under `hugo/content/guests/<slug>/`.
- Do not add body prose; the guest template renders from frontmatter and page resources.
- Keep the page focused on the six target components.
- Prefer evidence from the repo and public web sources before escalating to the user.

## Final Check

Before finishing, verify that `bun run build:hugo` succeeds and that the guest page renders with all expected sections.
