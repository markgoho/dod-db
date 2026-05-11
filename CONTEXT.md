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
