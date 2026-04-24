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
- if needed, read the opening of additional appearances to confirm titles, institutional affiliations, or research areas
- use that evidence to draft the 1 to 2 sentence summary

Prefer the show's own introduction language for:

- current degree or position
- field or subfield
- research focus
- how to describe the guest's expertise in concise plain language

### 3. Search the internet for public profile details

Search public sources on the web for:

- credentials
- current institutional affiliation, if relevant for understanding the credential line
- selected works
- headshot image URL

Prefer sources in this order:

1. university or institutional profile pages
2. faculty or scholar CV pages
3. publisher or author pages
4. conference or society pages
5. other public professional pages

Use public sources to infer:

- `credentials` — keep this short and traditional, such as `PhD candidate`, `PhD`, `M.Div.`, `M.Ed.`, or similar. Do not overload this line with affiliations or biography prose.
- `works` — a short non-exhaustive list, usually 3 to 5 items max, strongest or most relevant first
- `headshotUrl` — use a stable public image URL when available
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
- `works` should be a short non-exhaustive list, usually 3 to 5 items max
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
  "works": ["1 and 2 Samuel for Normal People"],
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

### 7. Editorial pass

Check that:

- the headshot renders
- the credentials line is concise and credential-like rather than biographical
- the summary is concise, specific, and supported by episode introductions and public profile evidence
- the episode count matches the gathered context
- the selected works list is clean and non-exhaustive
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
