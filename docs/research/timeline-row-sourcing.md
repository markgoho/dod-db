# Sourcing five both-sides timeline rows

Research for [#100](https://github.com/markgoho/dod-db/issues/100), "Can the both-sides Timeline rows be sourced, and from which Tradition sources?", part of map [#88](https://github.com/markgoho/dod-db/issues/88). It applies the sourcing policy in [#80](https://github.com/markgoho/dod-db/issues/80) and the rulings in [#86](https://github.com/markgoho/dod-db/issues/86). Throwaway branch `research/timeline-row-sourcing`; not for merge. Findings only; nothing here is a spec.

All passages were read on 2026-11-22.

## Answer in short

- **Critical side: yes for 5 of 5 rows.** Each row has at least one openly readable Reference or Scholarly sentence. Two of them do not say what the show says.
  - **Daniel** is clean: 167-164 BCE, from three sources.
  - **Deuteronomy** has the Josiah link (c. 622) in two sources. Only the Yale lecture dates the core to the late seventh century. NABRE and Coogan start composition in the eighth century, a century earlier than the show.
  - **Exodus**: the critical sources do give a date, but only conditionally. Coogan and Hayes both say the thirteenth century _if_ the event is historical. Meyers says dating it from the Bible is "an exercise in futility". None says flatly that it "did not happen".
  - **Jericho**: a 2023 field report from the current Italian-Palestinian excavation gives 1550-1520 cal BC from radiocarbon. The "Kenyon, c. 1550" wording appears only on the Tradition side (ABR and AiG, both by Bryant Wood). The same field report says a Late Bronze town with a mud-brick wall existed afterwards. That cuts against the Yale lecture's "there weren't even any walls in Jericho at the time of Joshua".
  - **Fall of Jerusalem**: the sources split, as the show does. NABRE (Jeremiah) says 587. The Coogan summaries say 587 in one chapter and 586 in four. Hayes says "587 or 586". No Reference source counts the exile from 605/604. Hayes dates Judah's vassalage to 605.
- **Tradition side: yes for 5 of 5, and not only from GotQuestions.**
  - The ESV Global Study Bible introductions on esv.org (Crossway) carry dated traditional positions for Daniel (sixth century; Daniel's exile in 605), the Exodus (c. 1446) and the Deuteronomy and Joshua settings (c. 1406).
  - The Associates for Biblical Research (ABR) carries Jericho (c. 1400) and the Exodus (1446). Both ABR pages are signed by Bryant Wood.
  - Answers in Genesis carries Jericho, but in a Wood article again, so it is not an independent voice.
- **The church body tested gives the critical dates.** The USCCB's own Bible introductions (NABRE) are Reference under #86 and give the critical dates for Daniel and Deuteronomy. A Catholic apologetics ministry (Catholic Answers) also argues for the thirteenth-century Exodus, not 1446. On this evidence, no Catholic source supplies a traditional early date for these rows.
- **Quote checks: 69 of 69 source quotes passed** by script against saved text, each in the source it is attributed to. Four of the 69 (NABRE Deuteronomy ×2, Jeremiah, Joshua) were matched against a transcription of browser output, not fetched bytes; see Method. The 10 "Show:" wordings were also checked against the dating inventory: 9 exact, and 1 that joins two exact parts with "...".

## Method

- Rows and show positions come from the dating inventory (`research/dating-claims-inventory`, "A two-sided contrast" table and Table 1/2).
- Each source was fetched and saved (HTML converted to text; PDF converted with `pdftotext`), one directory per source, outside the repo.
- Every line labelled "Quote" below was extracted from this file by script and checked as an exact substring of the saved text of the source it is attributed to. Normalisation, which applies to both sides:
  - whitespace collapsed;
  - curly quotes and apostrophes straightened;
  - dash variants unified;
  - spaces removed before `. , ) ] ;` and after `(`, because tag stripping left them ("BCE .");
  - PDF ligatures expanded.
- Search-engine summaries were used as leads only. No quote comes from them or from memory.
- Each row was time-boxed to about four candidate sources per side.
- Rulings applied: publisher chapter summaries are Reference, cited as the publisher's companion summary; Yale RLST 145 transcripts are Reference; NABRE Old Testament introductions (2011) are Reference and inside the 30-year window; GotQuestions is Tradition; a Tradition source is named in its own words.

### What was not done

- **USCCB.** bible.usccb.org answered one scripted request (Daniel, saved as fetched) and refused the rest with 403. A further scripted retry was not permitted in this session. The Deuteronomy, Exodus, Joshua, 1 Kings and Jeremiah introductions were read through an automated Chrome session (`get_page_text`). I saved the relevant paragraphs by transcribing that tool output into text files. The four quotes from those files pass a substring check, but against my transcription, not against fetched bytes. The owner should confirm them in a browser.
- **Transcripts not re-read.** The issue's third ask, re-reading the Transcript around each candidate Trigger Claim on the ~10 pilot rows, was not part of this pass.
- **Coogan edition year.** The year of _A Brief Introduction to the Old Testament_, 4th ed. (2019), comes from bookseller and library listings, not OUP's catalogue, which #86 requires.
- **Orthodox sources.** Tested with one search only; no Orthodox church body or study Bible page surfaced.
- **Reformation Study Bible.** The Bible Gateway page for Daniel (`biblegateway.com/resources/reformation-study-bible/Daniel`) returned navigation chrome and no introduction text to a scripted fetch. Whether it is gated was not established.
- **No human opened these URLs.** Owner review under #80 still applies.

### Access conditions

Same tags as `public-source-availability.md`.

| Tag            | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| open           | Full passage opens logged-out at the URL                |
| open (browser) | Opens logged-out in a browser; refuses scripted fetches |

Every citation below is open or open (browser). No snippets or abstracts are used.

### Sources used repeatedly

- **Coogan summaries**: OUP Learning Link, student chapter summaries for Michael D. Coogan and Cynthia R. Chapman, _A Brief Introduction to the Old Testament_, 4th ed. Reference (publisher's companion summary). Year 2019 per retail listings, not confirmed in the OUP catalogue. Open. URL pattern: `https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-N-summary`.
- **Hayes**: Christine Hayes, Open Yale Courses RLST 145, "Introduction to the Old Testament (Hebrew Bible)", lecture transcripts (recorded Fall 2006 per #86). Reference (introductory course, professional scholar, university-hosted). Open. URL pattern: `https://oyc.yale.edu/religious-studies/rlst-145/lecture-N`. Recency: 20 years, inside the window.
- **NABRE**: _New American Bible, Revised Edition_ Old Testament book introductions, bible.usccb.org. Reference (2011 OT revision; inside the window). Daniel: open. Others: open (browser).
- **ESV Global Study Bible (ESV GSB)**: book introductions on esv.org, published by Crossway. Tradition. These are the _Global_ Study Bible's short introductions, not the ESV Study Bible's. The page footer reads "© 2001 – 2026 Crossway"; the edition year is not on the page. Open.
- **GotQuestions**: Got Questions Ministries pages. Tradition (ruled in #86). Unsigned, undated. Open.
- **ABR**: Associates for Biblical Research, biblearchaeology.org. Tradition. Open.

## Row 1: Daniel (composition)

Show: traditional "written by Daniel in Babylon in the 6th century BCE"; critical "finalized 167-164 BCE under Antiochus IV; court tales (chs. 1-6) earlier".

### Critical

- **NABRE, introduction to Daniel.** Reference. Open (fetched by script).
  - URL: https://bible.usccb.org/bible/daniel/0
  - Quote: "This work was composed during the bitter persecution carried on by Antiochus IV Epiphanes (167–164 B.C.) and was written to strengthen and comfort the Jewish people in their ordeal."
- **Hayes, lecture 23**, "Visions of the End: Daniel and Apocalyptic Literature". Reference. Open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-23
  - Quote: "It was chronologically the latest book, written between 167 and 164 BCE."
  - Quote: "Chapters 7 through 12 are fully apocalyptic in genre and they were composed between 167 and 164"
  - Quote (court tales): "So the book, we know, was written quite late, perhaps the end of the third century, those first six chapters."
  - This matches the show's two-stage view exactly.
- **Coogan summary, chapter 25**. Reference. Open.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-25-summary
  - Quote: "The book of Daniel was written in the second century BCE and comprises two distinct genres."
  - Quote: "It is for this reason that scholars place the date of Daniel in the second century BCE."
  - Century only; no 167-164.

### Tradition

- **ESV GSB, introduction to Daniel** (Crossway). Open.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-daniel/
  - Locator: "Author and Date".
  - Quote: "Daniel wrote this book in the sixth century B.C."
- **GotQuestions, "Summary of the Book of Daniel"**. Open.
  - URL: https://www.gotquestions.org/Book-of-Daniel.html
  - Quote: "The Book of Daniel was likely written between 540 and 530 B.C."
- **Rabbinic tradition does not support the show's "traditional" view here.** Babylonian Talmud, Bava Batra 15a, William Davidson English (Sefaria). Tradition (rabbinic). Open.
  - URL: https://www.sefaria.org/Bava_Batra.15a
  - Quote: "The members of the Great Assembly wrote the following" (the list that follows names Ezekiel, the Twelve, Daniel and Esther).
  - So the "Daniel wrote Daniel" position is a Christian tradition. A page should name it that way, not as "the traditional view".

### Notes

- Clean pair. Both sides are dated and the two are about the same subject.

## Row 2: Deuteronomy (composition)

Show: traditional "Moses's farewell address; 1400 or 1200 BCE"; critical "begun under Josiah, late 7th century BCE; expanded for about 200 more years".

### Critical

- **Hayes, lecture 11**, "On the Steps of Moab: Deuteronomy". Reference. Open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-11
  - Quote: "This reform has long been noticed and provides scholars with a basis for dating the core materials of Deuteronomy, dating them to the late seventh century."
  - Quote: "but even more so in the seventh century by King Josiah, around 622"
  - Quote (later growth): "during the exile, down to the end of the sixth century, Deuteronomy was incorporated into a larger narrative history"
  - Quote (earlier northern material): "It was probably produced there in the eighth century"
- **NABRE, introduction to Deuteronomy.** Reference. Open (browser); quotes matched against a transcription (see Method).
  - URL: https://bible.usccb.org/bible/deuteronomy/0
  - Quote: "The book was probably composed over the course of three centuries, from the eighth century to the exile and beyond."
  - Quote: "It bears some relation to “the Book of the Law” discovered in the Jerusalem Temple around 622 B.C. during the reign of King Josiah (2 Kgs 22:8–13)."
- **Coogan summaries, chapters 10 and 19**. Reference. Open.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-10-summary
  - Quote: "Scholars have established a hypothetical reconstruction that demonstrates how Deuteronomy evolved over the span of two centuries."
  - Quote: "The oldest material dating to the eighth century BCE is the core laws from Deuteronomy 12–26."
  - Quote: "Scholars have argued that Deuteronomy, or the Deuteronomic school that produced it, probably originated in the northern kingdom of Israel in the eighth century BCE."
  - URL (ch. 19): https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-19-summary
  - Quote: "What inspired this reform was the discovery of the “book of the law” in the Temple archives, a book identified by scholars as an early form of Deuteronomy."

### Tradition

- **GotQuestions, "Summary of the Book of Deuteronomy"**. Open.
  - URL: https://www.gotquestions.org/Book-of-Deuteronomy.html
  - Quote: "These sermons were given during the 40-day period prior to Israel’s entering the Promised Land."
  - Quote: "The year was 1406 B.C."
- **ESV GSB, introduction to Deuteronomy** (Crossway). Open.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-deuteronomy/
  - Quote: "Deuteronomy is largely a sermon, or set of sermons, preached by Moses to all of Israel shortly before his death."
  - Quote: "The Setting of Deuteronomy c. 1406 B.C."
  - This is a setting date for the speeches, not a stated date of writing. It implies one only through Mosaic authorship. The page has no "Author and Date" section.
- **Talmud, Bava Batra 14b** (authorship only). Open.
  - URL: https://www.sefaria.org/Bava_Batra.14b
  - Quote: "Moses wrote his own book, i.e., the Torah"

### Notes

- **Mismatch with the show.** The show's critical date is "begun under Josiah, late 7th century". Hayes supports that wording. NABRE ("from the eighth century") and Coogan ("originated ... in the eighth century") put the start a century earlier and tie Josiah's scroll only to "some relation" or "an early form". A row worded from NABRE or Coogan would read "8th century BCE onward, linked to Josiah's reform c. 622", not "late 7th century".
- **Tradition gives one date, not the show's two.** The traditional side has 1406 only; the show's alternative "1200 BCE" was not found in a Tradition source in this pass.

## Row 3: Exodus (event)

Show: traditional "early date in the 1400s BCE ... late date late 1200s BCE"; critical "did not happen as described; 'if at all', c. 1250 BCE with a small group".

### Critical

- **Coogan summary, chapter 6**. Reference. Open.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-6-summary
  - Quote: "If we accept the Exodus as a historical event, then it is necessary to establish some sort of plausible date."
  - Quote: "Internally, the Bible dates the Exodus to the mid-fifteenth century BCE."
  - Quote: "The most reasonable date is the thirteenth century BCE, both because it fits the historical record most suitably and because Israel is mentioned in the thirteenth-century Egyptian Merneptah stela as a nation in Canaan."
  - Quote (verdict, as found in #85): "it certainly appears that some sort of exodus occurred in Israel’s history."
- **Hayes, lecture 7**. Reference. Open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-7
  - Quote: "if there's any historical basis to the Exodus, then the most plausible time, the most plausible backdrop would be the thirteenth century BCE."
- **Carol Meyers, _Exodus_, New Cambridge Bible Commentary (Cambridge University Press, 2005)**, Introduction. Scholarly. Open (publisher's excerpt PDF). 21 years old, inside the window.
  - URL: https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf
  - Locator: p. 8.
  - Quote: "Attempts to use the Bible’s own chronology to “date” the exodus is an exercise in futility."
  - Quote: "there are strong proponents, with no consensus or prospects for resolution, of dates ranging from the sixteenth to the early twelfth centuries bce"
  - Locator: p. 2.
  - Quote: "assumptions about an exodus experience in the Late Bronze Age, sometime between 1500 and 1200 bce, survived in many quarters of academia."
- **NABRE, introduction to Exodus.** Open (browser). It gives no date and no historicity statement.

### Tradition

- **GotQuestions, "What was the date of the exodus from Egypt?"** Open.
  - URL: https://www.gotquestions.org/date-of-the-exodus.html
  - Quote: "The early date, 1446 BC, is the most common date applied in conservative interpretations of Scripture."
  - Quote: "These are 1446 BC and 1225 BC, respectively labeled the “early” and “late” dates."
- **ABR**: Bryant G. Wood, "The Biblical Date for the Exodus Is 1446 BC: A Response to James Hoffmeier", dated on the page 30 March 2009 (originally in _JETS_ 50.2, 2007, per search lead). Open.
  - URL: https://biblearchaeology.org/the-biblical-date-for-the-exodus-is-1446-bc-a-response-to-james-hoffmeier/
  - Quote: "1 Kgs 6:1 and 1 Chr 6:33–37 converge on a date of 1446 BC for the exodus"
- **ESV GSB, introduction to Exodus** (Crossway). Open.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-exodus/
  - Quote: "A common view is that the exodus occurred in c. 1446 B.C."
  - Quote: "There is no consensus among scholars as to the date when the events of the exodus took place."
  - Quote (alternative): "possibly around 1260 B.C."
- **Catholic Answers**: Jimmy Akin, "When Was the Exodus?", _Catholic Answers Magazine_ (datePublished 2021-07-11 in page metadata). Tradition (Catholic apologetics). Open.
  - URL: https://www.catholic.com/magazine/print-edition/when-was-the-exodus
  - Quote: "As a result, most scholars place the Exodus in the 1200s, during the reign of Ramesses II."
  - This Catholic apologist argues for the late date. It is a source for "a Catholic apologetics ministry places it in the 1200s", not for 1446.

### Notes

- **Does any critical source give a date? Yes, conditionally.** Coogan and Hayes both give the thirteenth century under an explicit "if". Meyers refuses a date and gives the proposed range (sixteenth to early twelfth centuries). No source read gives the show's "c. 1250 with a small group".
- **The verdict is not "did not happen".** The only verdict sentence (Coogan) leans the other way: "some sort of exodus occurred". #85's E1 finding stands.
- **Overlap.** The critical 13th century and the traditional "late date" (GotQuestions 1225, ESV GSB 1260, Catholic Answers 1200s) are the same century. The contrast the show draws is 1446 against "maybe, 13th century, if at all". A row that shows "13th century (if historical)" on the critical side would sit beside a Tradition source giving 1446 and another giving the 1200s.

## Row 4: Fall of Jericho (event)

Show: traditional "Jericho's walls fell c. 1400 BCE (Bryant Wood)"; critical "walls fell c. 1550 BCE, before any possible Joshua".

### Critical

- **Lorenzo Nigro, "Jericho. From the Neolithic to the Bronze and Iron Ages: The Urban Diversity"**, in N. Marchetti et al. (eds.), _Proceedings of the 12th International Congress on the Archaeology of the Ancient Near East_ (Bologna, 6-9 April 2021), vol. 2 (Harrassowitz, Wiesbaden; DOI 10.13173/9783447119030.399; the PDF was created May 2023). Scholarly (field director of the Sapienza University of Rome / Palestinian MoTA-DACH expedition). Open (offprint on Sapienza's IRIS repository).
  - URL: https://iris.uniroma1.it/retrieve/a09e0ba5-0e23-4a5e-8c89-db58e6d2ba80/Nigro_Jericho_2022.pdf
  - Locator: p. 402, on the scarab naming the city (Ruha = Jericho).
  - Quote: "the latter was the ancient Canaanite name of the city"
  - Locator: p. 403.
  - Quote: "In the second half of the 16th century BC, Ruha was completely destroyed by an enemy attack"
  - Quote: "Radiocarbon dates fix the event between 1550 and 1520 cal BC"
  - Locator: p. 403-404, the next period.
  - Quote: "During the Late Bronze Age the city gradually recovered (Bienkowski 1986), becoming again a town, with weaker fortifications consisting of a mud-brick wall erected on top of the Cyclopean Wall"
- **Hayes, lecture 12**. Reference. Open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-12
  - Quote: "Excavations at Jericho and Ai indicate that both of these towns were laid waste at least 200 years before the probable time of Joshua; so there weren't even any walls in Jericho at the time of Joshua."
  - Relative date only (at least 200 years before Joshua).
- **Coogan summary, chapter 11**. Reference. Open.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-11-summary
  - Quote: "The archaeological evidence demonstrates that during the thirteenth century BCE (the most widely accepted date for these events) the cities of Jericho, Ai, and Gibeon were uninhabited."
  - It states the absence of a city at the usual conquest date, not when Jericho fell.
- **NABRE, introduction to Joshua.** Open (browser). No date for Jericho. It reads the book as theology, not a record.
  - Quote: "highly idealized depiction of the “conquest,”"

### Tradition

- **ABR**: Bryant G. Wood, "Did the Israelites Conquer Jericho? A New Look at the Archaeological Evidence", on biblearchaeology.org (page date 1 May 2008; a reprint of _Biblical Archaeology Review_ 16.2, 1990). Open.
  - URL: https://biblearchaeology.org/research-articles/did-the-israelites-conquer-jericho-a-new-look-at-the-archaeological-evidence/
  - Quote: "I believe, however, that the evidence indicates that Kenyon’s Middle Bronze Age city lasted into the early part of the Late Bronze Age and was not destroyed until about 1400 B.C.E."
  - Quote: "The pottery, stratigraphic considerations, scarab data and a Carbon-14 date all point to a destruction of the city around the end of Late Bronze I, about 1400 B.C.E."
  - Quote (Wood reporting Kenyon): "Her conclusions dated Jericho’s destruction to about 1550 B.C.E"
  - Quote (Wood on his minority position): "Most scholars will reject the possibility that the Israelites destroyed Jericho in about 1400 B.C.E."
- **Answers in Genesis**: Bryant Wood, "The Walls of Jericho", dated on the page March 1, 1999 (_Creation_ magazine). Open.
  - URL: https://answersingenesis.org/archaeology/the-walls-of-jericho/
  - Quote: "An in-depth analysis of the evidence, however, reveals that the destruction took place around 1400 B.C."
  - Same author as ABR; it adds a second publisher, not a second voice.
- **ESV GSB, introduction to Joshua** (Crossway). Open. It dates the conquest setting, not the destruction of Jericho.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-joshua/
  - Quote: "The Setting of Joshua c. 1406 B.C."
- GotQuestions was not needed for this row and was not tested.

### Notes

- **The critical date is sourced, but not to Kenyon.** Nigro gives 1550-1520 cal BC from radiocarbon (citing Bruins and van der Plicht 1995). It is the current excavator's date, not Kenyon's. The only pages that attribute "c. 1550" to Kenyon are the Tradition pages (Wood). A row can say "destroyed c. 1550-1520 BCE (radiocarbon)", citing Nigro. It should not say "Kenyon dated it" on this sourcing unless the owner accepts a Tradition page as the source for a report of what Kenyon concluded.
- **Contradiction inside the critical side.** Nigro's Late Bronze town with "a mud-brick wall" sits against Hayes's "there weren't even any walls in Jericho at the time of Joshua". Under the policy the page follows the newer, more specific source and drops "no walls".
- **Class doubt.** Nigro's chapter is in conference proceedings. Whether those proceedings are peer-reviewed was not checked.
- **Exact subject.** Nigro dates the Middle Bronze destruction of the city, which is what the show calls the walls falling. Wood and Nigro date the same stratum: Wood's "City IV" and Kenyon's Middle Bronze city.

## Row 5: Fall of Jerusalem and the start of the exile (event)

Show: critical "Temple destroyed 587 or 586 BCE (both figures used)"; traditional "exile 'traditionally' counted from 605/604 BCE (Jeremiah's 70 years)".

### Critical: the fall

- **NABRE, introduction to Jeremiah.** Reference. Open (browser); quotes matched against a transcription (see Method).
  - URL: https://bible.usccb.org/bible/jeremiah/0
  - Quote: "Nebuchadnezzar took swift vengeance; Jerusalem was destroyed in 587 and its leading citizens sent into exile."
  - The same introduction gives the first capture as "(598 B.C.)", not 597.
- **Hayes, lectures 12, 14 and 18**. Reference. Open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-14
  - Quote: "It's the neo-Babylonian empire that will succeed in felling Judah under Nebuchadrezzar of Babylon in 587 or 586."
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-12
  - Quote: "to the destruction of the state by the Babylonians in 587-586 BCE."
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-18
  - Quote: "two sieges: one in 597, one in 587, both under Nebuchadnezzar."
  - Elsewhere (lectures 1, 11, 15) she says 586 alone.
- **Coogan summaries**. Reference. Open. They use both years.
  - Quote (ch. 2): "The Israelites fell to the Assyrians in 722 and the Judeans to the Babylonians in 587 because their kings had failed to keep the commandments of Yahweh."
    - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-2-summary
  - Quote (ch. 19): "The invasion of the Babylonians in 586 BCE resulted in catastrophic upheaval for Israel."
    - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-19-summary
  - Chapters 1, 22 and 25 also say 586.

### Critical: the start of the exile

- **Hayes, lecture 18**. Reference. Open. It dates the start of vassalage, not of exile.
  - Quote: "By 605 Babylon manages to extract tribute from Judah as a vassal."
- Not found: any Reference or Scholarly sentence that counts the exile from 605/604. On the critical side the deportations are 597 (598 in NABRE) and 587/586.

### Tradition

- **GotQuestions, "When and how was Judah conquered by the Babylonians?"** Open.
  - URL: https://www.gotquestions.org/Judah-conquered-by-Babylon.html
  - Quote: "The Jews’ exile in Babylon lasted for 70 years (605—536 BC, counting the starting and ending years as full years), as Jeremiah predicted (Jeremiah 25:12)."
  - Quote: "The city fell in 586 BC"
- **GotQuestions, "What was the Babylonian captivity/exile?"** Open.
  - URL: https://www.gotquestions.org/Babylonian-captivity-exile.html
  - Quote: "Jerusalem fell in July 587 or 586 BC"
- **ESV GSB, introduction to Daniel** (Crossway). Open. It dates Daniel's own deportation, not the exile's start as such.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-daniel/
  - Quote: "It records the events of Daniel’s life and the visions that he saw from the time of his exile in 605 B.C. (1:1) until 536 B.C., the third year of King Cyrus (10:1)."
- **ESV GSB, introduction to 1-2 Kings** (Crossway). Open.
  - URL: https://www.esv.org/resources/esv-global-study-bible/introduction-to-1-2-kings/
  - Quote: "The fall of Jerusalem to Babylon in 586 B.C."
  - The ESV GSB Joshua introduction says "post-587 B.C." instead, so Crossway is not consistent either.

### Notes

- **587 vs 586 splits within sources, not between them.** The one source that commits to a single year is NABRE (587). Coogan's companion uses both; Hayes says "587 or 586"; GotQuestions says both on different pages. The show's use of both years matches its sources. A row would need a rule: either "587/586 BCE" or one year with a source.
- **605 is a Tradition count.** Only GotQuestions states the 605-536 count of Jeremiah's 70 years. ESV GSB gives 605 for Daniel's exile. The critical sources date 605 only as the start of vassalage.

## Results

| Row         | Show critical               | Critical found                                                                                                  | Show traditional           | Tradition found                   | Tradition other than GotQuestions                                             |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| Daniel      | 167-164 BCE                 | Yes, clean: NABRE, Hayes (167-164); Coogan (2nd century)                                                        | 6th century, by Daniel     | Yes: GotQuestions 540-530 BC      | ESV GSB "sixth century B.C."; the Talmud assigns Daniel to the Great Assembly |
| Deuteronomy | late 7th century onward     | Partly: Hayes (late 7th); NABRE and Coogan say 8th century onward, linked to Josiah c. 622                      | Moses, 1400 or 1200 BCE    | Yes: GotQuestions 1406 B.C.       | ESV GSB setting c. 1406 (not a writing date); Talmud (authorship only)        |
| Exodus      | did not happen as described | No verdict "did not happen". Dated conditionally to the 13th century (Coogan, Hayes); Meyers refuses to date it | 1446 / 1400s or late 1200s | Yes: GotQuestions 1446 (and 1225) | ABR 1446; ESV GSB c. 1446 (and c. 1260); Catholic Answers 1200s               |
| Jericho     | c. 1550 BCE (Kenyon)        | Yes: Nigro 2023, 1550-1520 cal BC (radiocarbon, not Kenyon); Hayes relative only                                | c. 1400 BCE (Wood)         | Yes: ABR (Wood) c. 1400 B.C.E.    | ABR and AiG, both Wood; ESV GSB conquest setting c. 1406                      |
| Jerusalem   | 587 or 586                  | Yes, split: NABRE 587; Hayes "587 or 586"; Coogan both                                                          | exile from 605/604         | Yes: GotQuestions 605-536         | ESV GSB: Daniel's exile in 605; fall in 586                                   |

Counts:

- Critical date sourced at the show's wording: Daniel; Jerusalem (as a split). Sourced with different wording: Deuteronomy (8th century start), Jericho (radiocarbon, not Kenyon), Exodus (conditional date; no "did not happen").
- Traditional date: 5 of 5, from GotQuestions. Four of five also from a non-GotQuestions Tradition source with a date (Daniel, Exodus, Jericho, start of exile). Deuteronomy's alternative has only a setting date.

## Tradition sources other than GotQuestions

| Source                                  | Opened          | Dated positions found                                                                                          | Names itself (own words)                                                                        |
| --------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Associates for Biblical Research        | open            | Jericho c. 1400 (Wood); Exodus 1446 (Wood)                                                                     | "Christian Apologetics Ministry"; "evangelical apologetics ministry"                            |
| Answers in Genesis                      | open            | Jericho c. 1400 (Wood again)                                                                                   | "an apologetics (i.e., Christianity-defending) ministry"                                        |
| ESV Global Study Bible (Crossway)       | open            | Daniel 6th century; Daniel's exile 605; Exodus c. 1446; Deuteronomy and Joshua settings c. 1406; Jerusalem 586 | Crossway: "nonprofit Christian ministry"; the introductions themselves carry no tradition label |
| Catholic Answers                        | open            | Exodus in the 1200s (argues against 1446)                                                                      | "a media ministry that serves Christ by explaining and defending the Catholic faith"            |
| USCCB (NABRE introductions)             | open (browser)  | Critical dates only (Daniel 167-164; Deuteronomy 8th century to exile; Jerusalem 587)                          | Church body; Reference under #86, so not a Tradition source                                     |
| Reformation Study Bible (Bible Gateway) | not established | Not read                                                                                                       | n/a                                                                                             |
| Orthodox church bodies                  | not found       | One search; nothing surfaced                                                                                   | n/a                                                                                             |
| Talmud (Sefaria)                        | open            | Authorship only (Moses: Torah; Great Assembly: Daniel)                                                         | Rabbinic; already used in #85                                                                   |

Self-description quotes (checked):

- Quote, ABR About page (https://biblearchaeology.org/about/): "Associates for Biblical Research is a Christian Apologetics Ministry Dedicated to Demonstrating the Historical Reliability of the Bible through Archaeological and Biblical Research."
- Quote, ABR, same page: "Associates for Biblical Research is the only evangelical apologetics ministry leading a licensed excavation in Israel."
- Quote, AiG About page (https://answersingenesis.org/about/): "Answers in Genesis is an apologetics (i.e., Christianity-defending) ministry dedicated to enabling Christians to defend their faith and to proclaim the gospel of Jesus Christ effectively."
- Quote, Crossway Who We Are (https://www.crossway.org/who-we-are/): "Crossway is a 501(c)(3) nonprofit Christian ministry that exists solely for the purpose of proclaiming the gospel through publishing and other means"
- Quote, Catholic Answers About (https://www.catholic.com/about): "Catholic Answers is a media ministry that serves Christ by explaining and defending the Catholic faith."

Findings:

- **Yes, a non-GotQuestions Tradition source can supply a date.** The most useful is the ESV GSB: a confessional study Bible from a named publisher, with short "Author and Date" or "Setting" lines on four of the five rows. ABR is the named apologist the show itself cites (Wood).
- **Naming problem.** Crossway's own words are "Christian ministry". The introductions do not say "evangelical" or "conservative", although ABR's do. Under #86 a page would have to write "a Christian publishing ministry's study Bible dates..." unless the owner rules that a study Bible can be named by its Bible ("the ESV Global Study Bible dates...").
- **Independence problem.** Wood is the author on both ABR pages and the AiG page. Three URLs, one voice.
- **A church body is not the same as a tradition.** The USCCB's Bible gives the critical dates, and a Catholic apologist argues for the late Exodus. On these rows "the traditional date" is an evangelical position, which supports #86's rule against unlabelled "traditional".

## Decisions the policy needs

1. **Can a study Bible be named by its own title?** The ESV GSB introductions carry no tradition label, and Crossway calls itself a "Christian ministry". Options: name it by the Bible ("the ESV Global Study Bible"), by the publisher's words ("a Christian publishing ministry"), or require a label the source gives itself.
2. **Is a setting date a composition date?** The ESV GSB "Setting of Deuteronomy c. 1406 B.C." plus Mosaic authorship implies a writing date but does not state one. The same applies to the Joshua setting and Jericho.
3. **One voice, several URLs.** Should Wood on ABR and Wood on AiG count as one Tradition source? The #86 rule "one such source per statement is enough" makes this matter only if independence is ever required.
4. **A row whose critical date is conditional (Exodus).** The timeline needs a way to show "13th century BCE, if historical" against 1446. Alternatively, the critical side can show no date, with Meyers's "no consensus" sentence.
5. **A year that the sources themselves split (587/586).** The options are a slash form, or one year with a named source.
6. **Reporting a scholar's conclusion via a Tradition page.** "Kenyon dated the destruction to c. 1550" is attested here only on Wood's pages. Can a Tradition source carry a factual report of what a critical scholar concluded, or must Kenyon's own 1957 or 1981 work be read? It is outside the 30-year window, but this is a finding, not a state-of-the-field statement.
7. **Conference proceedings as Scholarly.** Nigro's report is in ICAANE proceedings (Harrassowitz). Peer review was not checked.

## Sources

- Coogan and Chapman, OUP Learning Link chapter summaries 2, 6, 10, 11, 19, 25: https://learninglink.oup.com/access/coogan-brief-4e-student-resources
- Hayes, Open Yale Courses RLST 145, lectures 7, 11, 12, 14, 18, 23: https://oyc.yale.edu/religious-studies/rlst-145
- NABRE introductions (Daniel, Deuteronomy, Exodus, Joshua, 1 Kings, Jeremiah): https://bible.usccb.org/bible
- Meyers 2005 excerpt: https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf
- Nigro, ICAANE 12 proceedings offprint: https://iris.uniroma1.it/retrieve/a09e0ba5-0e23-4a5e-8c89-db58e6d2ba80/Nigro_Jericho_2022.pdf
- ESV Global Study Bible introductions (Daniel, Deuteronomy, Exodus, Joshua, 1-2 Kings): https://www.esv.org/resources/esv-global-study-bible/
- GotQuestions: Book-of-Daniel, Book-of-Deuteronomy, date-of-the-exodus, Judah-conquered-by-Babylon, Babylonian-captivity-exile (gotquestions.org)
- ABR: Wood 1990/2008 (Jericho), Wood 2009 (Exodus), About page (biblearchaeology.org)
- Answers in Genesis: Wood 1999 (Jericho), About page (answersingenesis.org)
- Catholic Answers: Akin 2021 (Exodus), About page (catholic.com)
- Crossway, Who We Are: https://www.crossway.org/who-we-are/
- Talmud, Bava Batra 14b and 15a, William Davidson English: https://www.sefaria.org/Bava_Batra.14b, https://www.sefaria.org/Bava_Batra.15a
