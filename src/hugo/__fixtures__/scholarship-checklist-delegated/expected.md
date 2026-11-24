## Publish checklist: Test Page (#93 step 2)

Generated from `hugo/content/scholarship/test-page.md`, `data/scholarship-reviews/test-page.yaml`, `hugo/data/scholarship/triggers/test-page.yaml` and `hugo/data/external-sources.yaml` at abc1234.

Review delegated by the owner on 2026-11-23 (#93); second agent pass 2026-11-24.

Open every URL. For each item, reply **pass** or **fail**, with a note if needed, using its key (e.g. `core/1: pass`). A citation passes when the quote is present, the locator finds it, and the question, short answer and statement are no stronger than the source.

Draft preview: `cd hugo && hugo server -D`, then http://localhost:1313/scholarship/test-page/

### Decide first (agent flags)

- [ ] `core/3` (citation): Summary never names the figure.
- [ ] `22@01:02:03` (Trigger Claim): Names a different king.
- [ ] `textbook-summary` (source): Edition from a search snippet.

### Sources (4)

- [ ] `scholarly-book`: Ann Author, _A Commentary_ (University Press, 2005). Scholarly. [Publisher excerpt PDF, open](https://example.org/commentary.pdf). Edition: 2005, University Press catalogue.
  - Agent: pass.
- [ ] `reference-lecture`: Leo Lecturer, _Lecture 7 transcript_, Open Courses (2006). Reference. [University courseware, open](https://example.org/lecture-7). Edition: recorded Fall 2006.
  - Agent: pass.
- [ ] `textbook-summary` ⚑: Tess Textbook, _Student chapter 6 summary of A Textbook_, Companion Site, 4th ed. (University Press, 2019). Reference. [Publisher companion page, open](https://example.org/summary). Edition: 4th ed., 31 May 2019.
  - Agent: flag, see flags.
- [ ] `tradition-guide`: _A Study Guide_ (Example Church Press, 2010). Tradition: Example Church. [Publisher page, open](https://example.org/guide). Edition: not in the review file.
  - Agent: no review entry.

### Citations (5)

**`core`** (core claim): Q "Is there evidence?" · short "None recovered." · statement "Nothing has been recovered."

- [ ] `core/1`, [`scholarly-book`](https://example.org/commentary.pdf) at **p. 5**: "nothing has been recovered"
  - Agent: pass. Author p. 5
- [ ] `core/2`, [`reference-lecture`](https://example.org/lecture-7) at **ch. 3 [00:10:06]**: "there isn't any direct evidence"
  - Agent: pass.
- [ ] `core/3` ⚑, [`textbook-summary`](https://example.org/summary) at **section “History”**: "no corroboration has been found"
  - Agent: flag, see flags.

**`entry`**: Q "What does the entry say?" · short "Not certain." · statement "The location is not certain."

- [ ] `entry/1`, [`scholarly-book`](https://example.org/commentary/sea) at **entry “Sea”**: "the location is not certain"
  - Agent: pass.

**`tradition`**: Q "How does the tradition read it?" · short "As history." · statement "The Example Church reads the account as history."

- [ ] `tradition/1`, [`tradition-guide`](https://example.org/guide) at **p. 1**: "the account is history"
  - Agent: no review entry.

### Trigger Claims (2)

Check the Speaker and the text, and read about two minutes either side for any hedge the quote drops.

- [ ] `21@00:25:18`, Dan McClellan, [Ep 21](https://example.org/episodes/21-test/#t-1518-080): "There is no evidence."
  - Agent: pass. Context: the sea.
- [ ] `22@01:02:03` ⚑, Dan Beecher, Ep 22 (no Episode Page): "It never happened."
  - Agent: flag, see flags.

### Rules (4)

- [ ] `publish-rule`: at least 3 statements, and the core claim on at least 2 independent sources (counted by author), one Scholarly or Reference, not only Host-authored. Now: 3 statements; core `core` cites 3 independent sources (Ann Author; Leo Lecturer; Tess Textbook).
  - Agent: pass. 3 statements; core on 3 authors.
- [ ] `consensus-wording`: no statement says "consensus" or "most scholars" more strongly than its source does.
  - Agent: pass.
- [ ] `dissent-attributed`: any dissent is attributed to the person who holds it.
  - Agent: pass.
- [ ] `tradition-named`: each statement citing a Tradition source names the tradition in its own words.
  - Agent: no review entry.

### Copy (#91), confirm or edit

- [ ] The notice (`hugo/layouts/partials/scholarship-notice.html`), the About section (`/about/#scholarship-pages`), the date line ("Sources read … Newer scholarship is not tracked.") and the link line (`scholarship-link.html`).
- [ ] Agent wording not taken from #91: the list-page line "Each Scholarship Page is the site's summary of outside scholarship, not the show's work." and the link text "How Scholarship Pages are made".
- [ ] Agent-written registry titles of the publisher summaries cited: `textbook-summary` "Student chapter 6 summary of A Textbook".
- [ ] Agent calls made under your delegation:
  - the section is named "Scholarship" at `/scholarship/`;
  - no main-menu entry until three pages are published (#106);
  - the section is not in search;
  - storage is split as in #92;
  - review follows the #93 procedure.

### Leads (not on the page)

- [ ] Another Book, p. 9: a snippet not read in the source.

### Uncited (read, not on the page)

- [ ] Scholarly Book, p. 7: read in full; broader than any statement.

---

When you're done, I record each result in the review file, apply any failures, and recompute the publish rule (#93 step 4). If the rule holds, I set `review` and `sourcesRead` to your review date, remove `draft`, and push.
