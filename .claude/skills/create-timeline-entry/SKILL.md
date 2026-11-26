---
name: create-timeline-entry
description: Create, review and publish one Timeline Entry from a GitHub issue. Use when the user asks to create, draft or add a Timeline Entry, works a "Timeline Entry: <subject>" issue, or runs /create-timeline-entry <issue>.
---

# Create Timeline Entry

A **Timeline Entry** places one event, or one text's composition, on the **Timeline** by the date **External Sources** give, prompted by **Trigger Claims** in Transcripts. The rules live in `CONTEXT.md` (the Timeline lines and the Synthesis Page lines); the schema and publish gate live in `src/hugo/check-timeline.ts` and `src/hugo/synthesis-check.ts`; the sourcing policy is #80 and #86, the show-contradiction rule #99, the review procedure #93 extended by #110. Read `CONTEXT.md` and the schema before step 2. This skill is the order of work; it restates none of those rules. Spec #109 is history: its field names and layout are superseded by the files.

Worked examples: `daniel` (critical, setting and tradition) and `exodus` (undated, placed by its tradition). Each is `hugo/content/timeline/<id>.md`, its lines in `hugo/data/timeline/triggers.yaml`, and `data/timeline-reviews/<id>.yaml`. The pilot review files carry `owner: pass` from the owner's one-off publish; the delegated route this skill takes has its shape in `data/scholarship-reviews/homosexuality-and-the-bible.yaml` (`delegation` block, `owner: ""`).

## Input

A "Timeline Entry: <subject>" issue number. Read its body and comments: the inventory leads (Episodes, sides stated, traps) are unverified until step 1, and its notes (wording scope, overlaps with other entries, an `anchor` candidate) apply on top of the rules and are recorded in the review file's header. Make the entry id from the subject, kebab-case and short; it becomes the public anchor `/timeline/#<id>`.

## Workflow

Work in a worktree (`.claude/worktrees/<id>`). Land each of the three commits below on trunk and push.

### 1. Find the Trigger Claims

Start from the issue's Episodes, then `hugo/data/tag-episode-index.json` for the subject's tags. The inventory lives on branch `research/dating-claims-inventory` (`git show research/dating-claims-inventory:docs/research/dating-claims-inventory.md`). Read each claim in the final Transcript with about two minutes either side.

Done when every Trigger Claim has Episode, Speaker, `HH:MM:SS.mmm` timestamp, verbatim text and `states` (`critical`, `tradition` or `both`: the side the quote itself states), each matched by script against its Transcript line, and any hedge the trimmed quote drops is noted. Where the show gives two dates, apply #99. No Trigger Claim means no entry: go to the exit in step 2.

### 2. Run the sourcing test

Find External Sources readable in full at a public URL; reuse ids from `hugo/data/external-sources.yaml` first. Dispatch research agents per side (critical, tradition, setting), each saving every fetched page into its own scratch folder and copying quotes only from that saved text. Then decide the entry's shape from what the sources say:

- **`critical`**: a Scholarly or Reference source dates the subject outright. Word `display` and the title for what it dates, even when narrower than the Trigger Claim; a source's dual form ("722/721") is shown as given; a split ("587 or 586") is shown with each side cited.
- **`undated`**: the sources date it only on a condition, or not at all. The statement keeps the condition inside it and is no stronger than its sources.
- **`tradition`**: only when a Trigger Claim states the tradition's side and a Tradition-class source gives a date; `holder` uses that source's own words for itself.
- **`setting`**: composition entries only, cited to Scholarly or Reference sources.
- **`anchor`** / **`seeAlso`**: only to a published entry.

Sort every passage touched: cited, `uncited` (read, not used, with the reason) or `leads` (not read in the source itself).

Done when the entry rule in `CONTEXT.md` is met or plainly unmet.

**Exit when unmet:** comment on the issue with what is missing and what source would unblock it, leave it open, and stop. An entry short of the rule waits for sources; it is never reworded until it fits.

### 3. Draft

Write, with `draft: true` on the entry:

- `hugo/content/timeline/<id>.md`: front matter only (no `build` line: the entry has its own Timeline Entry Page, #219), `entryKind`, `related` (books, tags and topics that exist; a tag whose URL only redirects to a topic page needs that topic listed too, which `check:timeline` enforces), `watch` (terms `synthesis:gather` greps new Transcripts for) and the blocks from step 2. `sourcesRead` stays empty until publish.
- `hugo/data/timeline/triggers.yaml`: append the Trigger Claims with `entry: <id>`.
- `hugo/data/external-sources.yaml`: a registry entry per new source (a Tradition source sets `tradition:`).
- `data/timeline-reviews/<id>.yaml`: the agent first pass, one item per citation (`critical/1`, `tradition/1` …), Trigger Claim (`<episode>@HH:MM:SS`), source and rule (`TIMELINE_RULES` in `check-timeline.ts`), with `owner: ""`, plus `leads`, `uncited` and header comments (sourcing test, issue instructions, what was dropped and why, flags for the second pass).

Done when every quote is script-matched (whitespace, quotes, dashes and HTML entities normalised) against the saved source text with zero misses, and `bun run check:timeline` passes. Commit "Add draft Timeline Entry: <title> (#<issue>)".

### 4. Independent second pass

Dispatch a fresh `general-purpose` Agent, never a fork: independence means it has not seen the build. Its brief holds only the entry id, the issue number, the four file paths, pointers to `CONTEXT.md`, #80, #99 and #93's delegation comment, and these instructions:

- Re-fetch every cited source into its own scratch folder; never read the first pass's files.
- Re-match every quote at its locator, and re-check the title, `display`, note, statement and `holder` against their sources' strength and scope.
- Re-match every Trigger Claim at timestamp, speaker and `states`, reading about two minutes either side.
- Cut when in doubt: move the citation to `uncited` with the reason; narrow wording to what the sources say. Add no citations.
- Record the pass in the review file: each item's note, the header comments (what changed, its flags), and the `delegation` block (`by: owner`, `date: 2026-11-23`, `issue: "#110"`, `secondPass: <today>`).

Done when the agent returns and its changes are in the files. Commit "Second agent pass on the <title> Timeline Entry (#<issue>)".

### 5. Publish

Resolve the second pass's flags conservatively and record each resolution in the review file's header. A cut that breaks the entry rule takes the step 2 exit.

Then drop `draft`, set `sourcesRead` and the review file's `review` both to the `secondPass` date (the gate checks all three match). Render the entry's link-preview card from the worktree's own `hugo server` (never another checkout's on 1313), then check:

```bash
bun run timeline:cards <id> --base=http://localhost:<port>
bun run check:timeline && bun run check && bun test
```

Read the card image (`hugo/static/assets/timeline/<id>.png`): title and date fit, and it shows the Critical Date or verdict, never the Tradition Date. Commit it with `data/timeline-cards.json`.

Preview `/timeline/` in Claude in Chrome from the worktree's own `hugo server`: the entry sits in the right era and lane, its sources and Trigger Claims render, its Trigger Claim Episodes link back, and the minimap shows its tick without overlap. With both dates, its Tradition Date sits at its own year (`#<id>-tradition`, a diamond in the minimap) unless the two are under 30 years apart; follow both links between the cards. Open `/timeline/<id>/` with no fragment: it is the Timeline, opened at the entry as `/timeline/#<id>` would be, with the address left as typed (no fragment appears), and the entry's Copy link gives the same URL. Its sources stay closed, like every entry's, until the reader opens them; the page is never the entry alone (#221). Never give an entry an id ending in `-tradition`. If the entry extends the axis or crowds other ticks, note it on #175.

Commit "Publish the <title> Timeline Entry (#<issue>)", push, and confirm the deploy succeeded and the live `/timeline/#<id>` and `/timeline/<id>/` load. Comment on the issue (the `/timeline/<id>/` URL, which is the one that carries a link preview, Critical Date or statement, sources behind it, Tradition Date and holder if any, what the second pass changed, leads left open), then close it. File an issue for any follow-on work the leads point to.

## Report

End with: the live URL, the date as displayed and the sources behind it, the Tradition Date if any, what the second pass changed, open leads and issues filed, and "committed and pushed (<sha>)" with the deploy status.
