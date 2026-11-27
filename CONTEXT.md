# Data Over Dogma Episode Archive

The Data Over Dogma Episode Archive curates podcast **Episodes** into **Transcripts**, **Segments**, **Tags**, **Topics**, **Scripture References**, **Guest Speakers**, **Episode Pages**, and **Taxonomy Pages**.

## Language

**Canonical Feed**:
The configured podcast RSS feed whose main-episode ordering defines **Episode** identity and numbering.
_Avoid_: YouTube channel

**Episode**:
One canonical Data Over Dogma main episode, identified by its position in the **Canonical Feed**.
_Avoid_: Video, RSS item, After Party item

**Episode Number**:
The ordinal assigned to an **Episode** by its position among main episodes in the **Canonical Feed**.
_Avoid_: Feed episode metadata

**Episode Audio**:
The audio source used to create a **Transcript** for an **Episode**.
_Avoid_: Video

**Transcript**:
Speaker-attributed, corrected text for an **Episode**, suitable for archive pages and downstream extraction.
_Avoid_: Raw transcript, transcription

**Scriptural Book**:
A book from canonical or related scriptural literature used for grouping **Scripture References**.
_Avoid_: Biblical Book

**Scripture Reference**:
An explicit reference to scriptural text in a **Transcript** or **Segment**, from book-only through verse-level scope, normalized for linking.
_Avoid_: Bible verse

**Segment**:
A named portion of an **Episode** focused on a specific concept, named figure, text, **Scripture Reference**, or recurring show format.
_Avoid_: Clip, excerpt

**Segment Label**:
A short transcript-grounded title for a **Segment**, shaped by its **Segment Type**.
_Avoid_: Episode topic

**Segment Summary**:
A concise description of what a **Segment** discusses, used to help readers decide whether to open it.
_Avoid_: Transcript excerpt

**Segment Type**:
A recurring show format for named content **Segments** that shapes what kind of subject a **Segment** can be about.
_Avoid_: Segment category

**Speaker**:
A person whose words appear in a **Transcript**.
_Avoid_: Label

**Host**:
Dan McClellan or Dan Beecher, the recurring show **Speakers**.
_Avoid_: Presenter

**Guest Speaker**:
An invited non-host **Speaker** whose presence makes an **Episode** a **Guest Episode**.
_Avoid_: Guest

**Guest Credentials**:
The short professional identification displayed for a **Guest Speaker**.
_Avoid_: Bio

**Guest Headshot**:
The portrait image displayed on a **Guest Speaker Page**.
_Avoid_: Avatar

**Expertise**:
An area of scholarship or practice associated with a **Guest Speaker**.
_Avoid_: Category

**Selected Work**:
A publication, project, or other work highlighted on a **Guest Speaker Page**.
_Avoid_: Link

**Guest Episode**:
An **Episode** that includes one or more invited **Guest Speakers** and usually is not divided into normal **Segments**.
_Avoid_: Interview segment

**Episode Topic**:
The broad subject of a **Guest Episode** or other segmentless **Episode**, separate from a browsable **Topic**.
_Avoid_: Episode focus

**Mention**:
An occurrence of a **Tag** or **Topic** concept in a **Transcript**.
_Avoid_: Hit

**Topic**:
A concept that a **Segment** is explicitly about and that is suitable for a dedicated archive page.
_Avoid_: Tag

**Topic Alias**:
An alternate name that helps readers find the same **Topic**, not a separate **Topic**.
_Avoid_: Mechanical variant

**Tag**:
A concept tracked because it has **Mentions** in one or more **Transcripts**, but is not necessarily central to a **Segment**.
_Avoid_: Topic

**Episode Page**:
A public Hugo page for one **Episode**.
_Avoid_: Taxonomy page

**Taxonomy Page**:
A public Hugo page that groups archive content around a **Topic**, **Tag**, **Guest Speaker**, or **Scriptural Book**.
_Avoid_: Archive page, landing page

**Topic Page**:
A **Taxonomy Page** for a **Topic**.
_Avoid_: Tag page

**Tag Page**:
A **Taxonomy Page** for a **Tag**.
_Avoid_: Topic page

**Guest Speaker Page**:
A **Taxonomy Page** for a **Guest Speaker**.
_Avoid_: Guest page

**Book Page**:
A **Taxonomy Page** for a **Scriptural Book**.
_Avoid_: Biblical book page

**Featured Item**:
A central **Segment** selected as the strongest evidence for a **Topic Page**.
_Avoid_: Featured episode, featured segment

**Transcript Quote**:
An excerpt from a **Transcript** used as evidence on a **Topic Page**.
_Avoid_: Quote

**Synthesis Page**:
A public page that states conclusions about a subject across **Episodes**, prompted by **Trigger Claims** and backed by **External Sources**.
_Avoid_: Taxonomy Page

**Scholarship Page**:
A **Synthesis Page** on one subject that lists questions about it, each answered from **External Sources**.
_Avoid_: Consensus page

**Question Page**:
One **Scholarship Page** statement at its own URL (`/scholarship/<slug>/<id>/`), generated from the page and made to be shared: its link preview shows the question, the short answer and the question's card image.
_Avoid_: Permalink, share page

**Timeline**:
The **Synthesis Page** that places events and the composition of **Scriptural Books** by the dates **External Sources** give, as **Timeline Entries**.
_Avoid_: Chronology, dating page

**Timeline Entry**:
One subject on the **Timeline**, either an event or the composition of a text, with its **Critical Date** or a sourced statement that the sources give it no firm date or don't treat it as historical, and optionally a **Tradition Date**.
_Avoid_: Row, dated claim

**Timeline Entry Page**:
The **Timeline** itself at one **Timeline Entry**'s own URL (`/timeline/<id>`, no trailing slash), opened at that entry: the URL to share, whose link preview shows the entry's title, its **Critical Date** or scholarly verdict, and the entry's card image. It is never a page of the entry alone.
_Avoid_: Entry permalink, share page

**Critical Date**:
The date, range or relative date a Scholarly or Reference **External Source** gives for a **Timeline Entry**'s subject.
_Avoid_: Real date, scholarly date

**Tradition Date**:
The date a named tradition holds for a **Timeline Entry**'s subject, from a Tradition **External Source** and attributed in its own words.
_Avoid_: Traditional date, apologetic date

**Setting**:
The period a composition **Timeline Entry**'s text narrates: the text's own internal date, never a historical claim. It never places a **Timeline Entry**.
_Avoid_: Narrative date, date of events

**Trigger Claim**:
A **Speaker**'s assertion in a **Transcript** that prompts a **Synthesis Page** and sets its subject.
_Avoid_: Consensus claim, source

**External Source**:
A work outside the show cited by a **Synthesis Page**, classed as Scholarly, Reference, or Tradition.
_Avoid_: Link

**Lead**:
A pointer to a passage in an **External Source** that has not been read in the source itself, such as a snippet or a quote found in another work. A Lead is never cited. A passage read in the source itself but not cited is recorded as `uncited`, not as a Lead.
_Avoid_: Citation, snippet source

## Relationships

- The **Canonical Feed** defines which main episodes count as **Episodes** and their **Episode Numbers**; see [ADR 0001](docs/adr/0001-rss-feed-defines-episode-identity.md).
- After Party feed items are not **Episodes** in this archive.
- An **Episode** has **Episode Audio**.
- An **Episode** has exactly one **Transcript** once processed.
- An **Episode** has one **Episode Page** once published.
- An **Episode Page** presents the **Transcript**, named content **Segments**, **Tags**, **Scripture References**, **Guest Speakers**, and **Episode Topic** when present for one **Episode**.
- A **Transcript** can contain many **Scripture References**.
- A normal **Episode** usually has two normal **Segments**; intro, outro, and ads are structural material, not domain **Segments**.
- A **Segment** has one **Segment Type**, one **Segment Label**, and optionally one **Segment Summary**.
- The canonical **Segment Type** list lives in `src/config/segment-patterns.ts`; this document defines the concept, not the full list.
- A **Transcript** attributes words to **Speakers**.
- Normal **Episodes** have only **Hosts** as **Speakers**.
- Any **Episode** with an invited non-host **Speaker** is a **Guest Episode**.
- A **Guest Episode** features one or more **Guest Speakers** and usually has no normal **Segments**.
- **Episode Topic** is normally used only for **Guest Episodes**.
- A **Guest Episode** or other segmentless **Episode** can have one **Episode Topic**.
- An **Episode** has many **Tags** through **Mentions** in its **Transcript**.
- A **Segment** can be about a **Topic**, named figure, text, or **Scripture Reference**, but only concept-centered **Segments** support **Topic Pages**.
- A **Topic** is supported by one or more **Segments** that are explicitly about it and can have **Mentions** across many **Episodes**.
- A **Topic** can have **Topic Aliases** for reader discovery.
- A **Topic**, **Tag**, **Guest Speaker**, or **Scriptural Book** can have a **Taxonomy Page**.
- A **Guest Speaker Page** profiles one **Guest Speaker** with **Guest Credentials**, a **Guest Headshot**, optional **Expertise**, optional **Selected Works**, and their **Guest Episodes**.
- A **Tag Page** groups incidental **Mentions** across **Episodes**; a **Topic Page** is anchored by in-depth **Segment** evidence and can list all **Episodes** where the **Topic** is mentioned.
- A **Topic Page** can have one or more **Featured Items**, and each **Featured Item** must be a central **Segment**.
- A **Topic Page** can include **Transcript Quotes** as evidence.
- A **Tag** can become a **Topic** when it becomes central to a **Segment**.
- **Topics**, **Tags**, **Segments**, and **Scripture References** should be grounded in **Transcript** evidence.
- A **Synthesis Page** exists only for a subject with at least one **Trigger Claim**; its statements are backed by **External Sources**, never by a **Transcript** alone.
- A **Trigger Claim** gates a **Synthesis Page** and its subject, not each statement on it.
- A Tradition **External Source** supports only what a tradition holds, never what scholars think.
- A study Bible from a publisher that describes itself as a ministry with a statement of faith is a Tradition **External Source**, unless its notes are written by a scholarly association, as the NABRE's are.
- A **Synthesis Page** names the tradition a Tradition **External Source** speaks for in that source's own words, never as "the traditional view".
- A **Synthesis Page** reports what **External Sources** say; it gives no advice and addresses no particular reader.
- A **Synthesis Page** is the archive's own work, not the show's; a **Trigger Claim** is shown apart from the page's statements, and a **Host** is never its authority.
- A **Host**'s published work can be an **External Source**, but never the only one behind a **Synthesis Page**'s core claim.
- **Synthesis Pages** come in two kinds: **Scholarship Pages** and the **Timeline**.
- A **Timeline Entry** needs at least one **Trigger Claim** and one Scholarly or Reference **External Source** for its **Critical Date**, or for a statement that the sources date it only conditionally or not at all.
- A date a source gives only on a condition ("if it is historical") is not a **Critical Date**.
- A **Timeline Entry** is placed by its **Critical Date**; one with no **Critical Date** is placed by its **Tradition Date**, its tradition card under the cited statement of what scholars say (#162, 2026-11-24, reversing #97's placement rule).
- The **Timeline**'s axis runs down the middle, with rows on both sides; side means nothing, and a **Tradition Date** is told apart by its card's look and its holder's name, never by its side (#254, 2026-11-27, reversing #162's two lanes).
- A **Timeline Entry** with both dates shows its **Tradition Date** at that date's own year, in its own row, and the two cards link to each other; when the two dates' middles are under 30 years apart, the **Tradition Date** stays beside the entry (#214, 2026-11-26, reversing #162's beside-the-entry display).
- A **Timeline Entry** shows a **Tradition Date** only when one of its **Trigger Claims** states the tradition's side.
- A **Timeline Entry** is worded for what its sources date, even when that is narrower than the **Trigger Claim**.
- Only a composition **Timeline Entry** has a **Setting**, cited to Scholarly or Reference **External Sources** only and worded no more strongly than they are (#167 §4).
- A **Setting** without a year draws no span on the **Timeline**'s minimap, only its text line; it is never anchored by a **Tradition Date** (#167 §4).
- A **Scholarship Page** statement's short answer reports where scholarship stands (consensus, most scholars, divided, no consensus), backed by two or more independent authors; a view only one cited author holds appears in the statement, attributed, never as the answer. Uncontested facts (a date, what an inscription says) are exempt. A statement whose sources can't support a state-of-the-field answer is reframed or cut (#133).
- A **Scholarship Page** is published only when two or more independent **External Sources**, at least one Scholarly or Reference, back its core claim and it makes three or more statements.
- A new **Episode** can add a **Trigger Claim** to a **Synthesis Page** or suggest a new subject; it never changes a statement.
- A **Speaker**'s assertion that contradicts a **Scholarship Page** statement is never attached to that page as a **Trigger Claim**; it is logged as a conflict for the owner's next re-review (2026-11-25).
- A **Synthesis Page** shows the date its **External Sources** were read; its statements change only when the owner re-reviews it.
- A **Timeline Entry**'s id is a public URL once published (its **Timeline Entry Page** and the **Timeline**'s `#<id>` link): it never changes (#219).
- Every published **Timeline Entry** has a **Timeline Entry Page** card rendered from its current title and **Critical Date** or scholarly verdict, never its **Tradition Date**, and the **Timeline** has its own card; `check:timeline` fails a missing or stale card (`bun run timeline:cards --stale`) (#219, 2026-11-26, reversing #109's "an entry has no page" and #139's "no image").
- A link to `/timeline/#<id>` previews the **Timeline**, never the entry: the link to share is the **Timeline Entry Page**'s, which each entry's Copy link gives and a jump inside the **Timeline** puts in the address bar. The address never changes on its own after a page loads: a `/timeline/#<id>` link stays as typed.
- A **Timeline Entry** is always read in place among the others: nothing shows one entry on a page of its own (owner, 2026-11-26).
- A **Scholarship Page** statement's id is a public URL once published (its **Question Page** and the page's `#<id>` link): it never changes.
- Every statement of a published **Scholarship Page** has a **Question Page** card rendered from its current question and short answer; `check:scholarship` fails a missing or stale card (`bun run scholarship:question-cards <slug>`).
- An **External Source** is described once and shared by every **Synthesis Page** that cites it.
- A **Synthesis Page**, and each **Timeline Entry**, is published only after an independent second agent pass has re-checked every citation, **Trigger Claim** and **External Source**; the owner delegated the per-citation review to that pass (#93, 2026-11-23; extended to the **Timeline**, #110, 2026-11-23).
- **Guest Speaker** names should be normalized consistently across **Episodes** and **Taxonomy Pages**.

## Example dialogue

> **Dev:** "This concept appears in several **Transcripts**. Should it get a **Topic Page**?"
> **Domain expert:** "Only if a named content **Segment** is explicitly about it. Otherwise it stays a **Tag** and can have a **Tag Page** for incidental **Mentions**."
>
> **Dev:** "Episode 149 has an invited scholar and no normal segments. Do we need to invent a **Segment Label**?"
> **Domain expert:** "No. Presence of a **Guest Speaker** makes it a **Guest Episode**, and its broad subject belongs in **Episode Topic**."
>
> **Dev:** "The code found an intro and an ad as segment types. Should those show on the **Episode Page**?"
> **Domain expert:** "No. Those are structural detection artifacts; **Episode Pages** show named content **Segments**."

## Flagged ambiguities

- "video" appears in code as legacy storage language, but domain language should use **Episode** unless specifically discussing YouTube media.
- "tag" and "topic" are not synonyms: **Tags** are mentions; **Topics** are in-depth show discussions.
- Code may model intro, outro, and ads as segment types, but domain language reserves **Segment** for named content segments shown on **Episode Pages**.
- **Episode Topic** names a segmentless episode's broad subject; it is not the same thing as a browsable **Topic**.
