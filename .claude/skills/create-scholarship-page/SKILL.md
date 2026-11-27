---
name: create-scholarship-page
description: Create, review and publish a new Scholarship Page from a GitHub issue or a candidate subject, then build its infographic. Use when the user asks to create, draft or write a Scholarship Page, works a "Scholarship Page: <subject>" issue, or runs /create-scholarship-page <issue-or-slug>.
---

# Create Scholarship Page

A **Scholarship Page** answers questions about one subject from **External Sources**, prompted by **Trigger Claims** in Transcripts. The rules every page obeys live in `CONTEXT.md` (the Synthesis Page and Scholarship Page lines) and the sourcing policy in issue #80; storage is ADR 0002; the review procedure is #93 with the owner's delegation comment. Read all four before step 2. This skill is the order of work; it restates none of those rules.

Worked example: `homosexuality-and-the-bible` (#177). Its page, triggers file and review file show every field filled in, and its review file's header comments show what each pass records.

## Input

A GitHub issue number (a "Scholarship Page: <subject>" issue, the usual case) or a slug from `data/scholarship-candidates.yaml`.

- **Issue given:** read its body and comments for sub-claims, likely Episodes, process notes and overlaps with other pages. Find its candidate entry by subject, not slug (#155 is `daniel-date`); many issues have none. Use the matching entry's slug; with no entry, make the slug from the issue title, kebab-case, as the published pages are named.
- **Slug given:** look for an open issue on the subject (`gh issue list --search "Scholarship Page"`) and work it as the issue for this page, so the commits and the closing comment have one home.

The issue's specific instructions (an extra sourcing bar, a scope limit, a cross-link) apply on top of the rules, and are recorded in the review file's header.

## Workflow

Work in a worktree (`.claude/worktrees/<slug>`). Land each of the three commits below on trunk and push, as #177 did.

### 1. Find the Trigger Claims

Start from the candidate's `triggers`, the issue's named Episodes, and `hugo/data/tag-episode-index.json` for the subject's tags. Read each claim in the final Transcript with about two minutes either side.

Done when every Trigger Claim has Episode, Speaker, `HH:MM:SS.mmm` timestamp and verbatim text, each matched by script against its Transcript line, and any hedge the trimmed quote drops is noted. No Trigger Claim means no page: go to the exit in step 2.

### 2. Run the sourcing test

Find External Sources that can be read in full at a public URL. Dispatch research agents per sub-claim, each saving every fetched page into its own scratch folder and copying quotes only from that saved text. Then:

- Reword the candidate core claim to the strength its sources actually state. The sources set the claim; the claim never picks the sources.
- Count independent authors behind the core (`independentSources` in `src/hugo/check-scholarship.ts` is the counter) and the statements the sources can carry.
- Sort every passage touched: cited, `uncited` (read in the source, not used, with the reason), or `leads` (not read in the source itself).

Done when the publish rule in `CONTEXT.md` is met or plainly unmet.

**Exit when unmet:** set the candidate entry to `held` with `missing` saying what would unblock it, comment that on the issue, commit, and stop. A page short of the rule waits for sources; it is never reworded until it fits.

### 3. Draft

Write the four files, `draft: true` on the page:

- `hugo/content/scholarship/<slug>.md`: `title`, `dek`, `core` (a statement id), `sourcesRead`, `related` (books, tags, topics that exist), `watch` (terms `synthesis:gather` greps new Transcripts for), and `statements` grouped by `group`. A statement id becomes a public URL at publish: choose short, durable ids.
- `hugo/data/scholarship/triggers/<slug>.yaml`: the Trigger Claims from step 1.
- `hugo/data/external-sources.yaml`: a registry entry per new source; reuse existing ids. Set `shortAuthor` when the short cite's name isn't the author line's last word, as for a compound surname or a regnal name.
- `data/scholarship-reviews/<slug>.yaml`: the agent first pass, one entry per citation, Trigger Claim and source, plus `leads`, `uncited` and the header comments (sourcing test, what was dropped and why, flags for the second pass).

Remove the subject's entry from `data/scholarship-candidates.yaml`, if it has one; the page now carries it. Write the shorts last, each reporting where scholarship stands, never one author's view.

Done when every quote on the page is script-matched (whitespace and HTML entities normalised) against the saved source text with zero misses, and `bun run check:scholarship` passes. Commit "Add draft Scholarship Page: <title> (#<issue>)".

### 4. Independent second pass

Dispatch a fresh `general-purpose` Agent, never a fork: independence means it has not seen the build. Its brief holds only the slug, the issue number, the four file paths, pointers to `CONTEXT.md`, #80 and #93's delegation comment, and these instructions:

- Re-fetch every cited source into its own scratch folder; never read the first pass's files.
- Re-match every quote at its locator, and re-check every statement, question and short answer against its sources' strength and scope.
- Re-match every Trigger Claim at timestamp and speaker, reading about two minutes either side.
- Cut when in doubt: move the citation to `uncited` with the reason. Narrow a short or statement to what its sources say. Add no citations.
- Record the pass in the review file: each item's note, the header comments (what changed, its flags), and `delegation.secondPass`.

Done when the agent returns and its changes are on the page. Commit "Second agent pass on the <title> draft (#<issue>)".

### 5. Publish

Resolve the second pass's flags conservatively, record each resolution in the review file's header, and recompute the publish rule. A cut that breaks the rule takes the step 2 exit, under the page's slug.

Then drop `draft`, and run:

```bash
bun run scholarship:question-cards <slug>
bun run generate:scholarship-scripture
bun run check:scholarship && bun run check && bun test
```

Preview the page and two Question Pages in Claude in Chrome from the worktree's own `hugo server`: statements render, scripture references link to BibleGateway, the Trigger Claims link to their Episodes.

Commit "Publish the <title> Scholarship Page (#<issue>)", push, and confirm the deploy succeeded and the live page loads. Comment on the issue as #177's closing comment does (URL, counts, core sourcing, what the second pass changed, leads left open), then close it. File an issue for any follow-on work the leads point to.

### 6. Infographic

Run `/scholarship-infographic <slug>`. It lands the infographic itself once its checks pass; there is no acceptance stop. The page is done when the infographic is live.

## Report

End with: the live URL, statement and citation counts, the core claim and the authors behind it, what the second pass changed, open leads and issues filed, the infographic's state, and "committed and pushed (<sha>)" with the deploy status.
