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
- use that evidence to draft the 1 to 2 sentence summary
- start the selected works list with works explicitly named in the episode when the hosts or guest discuss a specific book, article, project, or publication
- do not stop after finding one good work; continue through every appearance before deciding the selected works list is complete

Prefer the show's own introduction language for:

- current degree or position
- field or subfield
- research focus
- how to describe the guest's expertise in concise plain language

### 3. Search the internet for public profile details

Search public sources on the web for:

- credentials
- current institutional affiliation, if relevant for understanding the credential line
- selected works with destination links
- headshot image URL

Prefer biographical sources in this order:

1. university or institutional profile pages
2. faculty or scholar CV pages
3. publisher or author pages
4. conference or society pages
5. other public professional pages

For selected work destination links, start from works named in the episode transcript before branching out to public profiles, CVs, publisher pages, catalogs, or retailers. Use Playwriter as the default way to find these links in a normal browser, especially for books and other retailer pages that are difficult to verify with fetch-only tooling. Search by exact title plus author when possible, and use the browser results to navigate to a stable detail page rather than guessing URLs. Be critical of search results for common names: do not add a work unless the source connects it to the same guest identity, not merely the same name. Confirm authorship using at least one strong signal such as the guest's institutional/profile page, CV, publisher author bio, episode discussion, OR a product/catalog page whose author details match the guest's known field, credentials, or biography. If attribution is ambiguous, omit the work or ask the user instead of guessing.

Once authorship is confirmed, use Playwriter to look for a stable Amazon product page first. When using Amazon, include the approved Associates tag `elelohim0a-20` in the URL by adding `tag=elelohim0a-20` to the product page query string. If Amazon does not have the work, or a publisher/institutional/niche page is clearly more appropriate, use a reputable direct destination such as a publisher page, university press page, author page, journal page, or other legitimate bookseller. Prefer product/detail pages over search result pages. Do not use pirate sources, low-trust aggregators, redirect spam, or broken links.

Before saving, validate every selected-work URL you plan to include, using Playwriter when needed to confirm the destination in a real browser. Confirm that each link resolves to a live destination for the specific work rather than a 404, generic storefront/search page, CAPTCHA/interstitial, or unrelated product. If an Amazon product page is broken or unavailable, replace it with another stable destination instead of keeping the bad link.

Use public sources to infer:

- `credentials` — keep this short and traditional, such as `PhD candidate`, `PhD`, `M.Div.`, `M.Ed.`, or similar. Do not overload this line with affiliations or biography prose.
- `works` — a short non-exhaustive list, usually 3 to 5 items max, strongest or most relevant first; use linked objects with `title` and `url` when a trustworthy destination is available
- `headshotUrl` — use a stable public image URL only after confirming it is a real portrait or profile photo of the guest. Prefer the guest's own About/profile page image, page `og:image`, faculty profile image, or author headshot over homepage hero images, decorative art, manuscript images, book covers, logos, lecture slides, or other topical illustrations.
- `imageAlt` — plain literal alt text, usually `Portrait of <Name>`

If the available public evidence is weak or conflicting, ask the user instead of guessing. Do not ask the user to provide information that can be found confidently from a public institutional profile, CV, publisher page, or the guest's episode introductions.

### 4. Reason

Combine the repo context, transcript introductions, and web research to draft the page.

The target page structure is:

1. head shot
2. name + credentials
3. episode count
4. summary of specialty or expertise
5. selected works
6. episodes they appear in

Authoring rules:

- `title` should normally be the canonical guest name from the taxonomy or established public profile
- `guestSlug` should normally be the gathered slug unless project slug policy requires a different normalized form
- `credentials` must be short and readable
- `summary` must be 1 to 2 sentences and should describe the guest's area of work, not just restate their name
- `works` should be a short non-exhaustive list, usually 3 to 5 items max; prefer episode-discussed works first, verify every work belongs to the same guest before adding it, prefer `{ "title": "...", "url": "..." }` objects, and use plain strings only when no trustworthy destination link can be found
- before saving, do a final selected-works audit: list every gathered appearance mentally, confirm each was checked for work mentions, confirm every included work has same-author evidence, and confirm any omitted candidate was skipped because it is forthcoming/unavailable, weakly attributed, less relevant, or lacks a trustworthy destination
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

Before building, validate the selected-work links in the saved frontmatter. Use Playwriter as the default review path for this link check so you confirm the destinations in a normal browser. Open each destination and confirm it lands on the intended work page. If any link is broken, redirected to an unrelated item, or only points to a search/results page when a stable product/detail page should exist, fix the frontmatter first.

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

Before considering the page complete, visually inspect the downloaded `headshot.*` file or rendered page image. Confirm it shows the guest's face as a suitable profile photo, not a manuscript, book cover, logo, decorative artwork, placeholder, cropped body part, or unrelated contextual image. If you cannot visually confirm the photo is an appropriate portrait, do not use it; find a better source or ask the user for help.

### 7. Editorial pass

Check that:

- the headshot renders
- the credentials line is concise and credential-like rather than biographical
- the summary is concise, specific, and supported by episode introductions and public profile evidence
- the episode count matches the gathered context
- the selected works list is clean, non-exhaustive, and uses trustworthy destination links where available
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
