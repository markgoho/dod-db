---
name: create-guest-page
description: Create a rich Hugo guest landing page from guest taxonomy data and hand-supplied profile details. Use when the user asks to create a guest page, write a guest landing page, or generate a new hand-authored guest page.
---

# Create Guest Page

This skill guides you through creating a guest landing page as a Hugo content bundle using deterministic context gathering, Claude reasoning, and a save script.

## Input

A guest name, such as `Aaron Higashi` or `Karla Kamstra`.

If the user does not provide a guest name, ask for one before proceeding.

You will also need the following user-supplied details, because they are not reliably derivable from the repo:

- credentials line
- 1 to 2 sentence specialty summary
- selected works list
- headshot URL
- optional short role
- optional expertise chips
- optional image alt text

## Workflow

### 1. Gather

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

### 2. Reason

Use the gathered JSON plus the user's supplied profile details to draft the page.

The target page structure is:

1. head shot
2. name + title + credentials
3. episode count
4. summary of specialty or expertise
5. selected works
6. episodes they appear in

Authoring rules:

- `title` should normally be the canonical guest name from the taxonomy.
- `guestSlug` should normally be the gathered slug.
- `credentials` must be a single readable line.
- `summary` must be 1 to 2 sentences and should describe the guest's area of work, not just restate their name.
- `works` should be a short non-exhaustive list, usually 3 to 5 items max, with the strongest or most recent items first.
- `expertise` should be short chip labels, not sentences.
- `imageAlt` should be plain, literal alt text.

### 3. Save

Create a JSON object in this shape:

```json
{
  "guestName": "Aaron Higashi",
  "guestSlug": "aaron-higashi",
  "title": "Aaron Higashi",
  "shortRole": "Public Bible scholar",
  "credentials": "PhD candidate, Chicago Theological Seminary · Bible for Normal People",
  "summary": "Aaron Higashi is a public-facing Bible scholar whose work helps readers approach scripture with historical awareness and contextual sensitivity.",
  "expertise": [
    "Biblical interpretation",
    "Contextual theology",
    "Hebrew Bible"
  ],
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

### 4. Verify

Run:

```bash
bun run build:hugo
```

Then review the page at:

```text
http://localhost:1313/guests/<slug>/
```

The Hugo server is already running in this project, so do not start it.

### 5. Editorial pass

Check that:

- the headshot renders
- the credentials line reads naturally
- the summary is concise and specific
- the episode count matches the gathered context
- the selected works list is clean and non-exhaustive
- the episode grid shows the guest's appearances

If any of those are weak, tighten them before finishing.

## Output Rules

- Use content bundles under `hugo/content/guests/<slug>/`.
- Do not add body prose; the guest template renders from frontmatter and page resources.
- Keep the page focused on the six target components.

## Final Check

Before finishing, verify that `bun run build:hugo` succeeds and that the guest page renders with all expected sections.
