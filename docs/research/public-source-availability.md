# Public source availability for the top anchor subjects

Research for [#85](https://github.com/markgoho/dod-db/issues/85), "Can publicly readable sources carry the top anchor subjects?", child of map [#76](https://github.com/markgoho/dod-db/issues/76). It tests the sourcing policy resolved in [#80](https://github.com/markgoho/dod-db/issues/80). Throwaway branch `research/public-source-availability`; not for merge. Findings only; nothing here is a spec.

All passages were read on 2026-11-22.

## Answer in short

- Partly. For 3 to 5 of the 11 core claims tested, I could openly read a Scholarly or Reference sentence that supports the claim and, where the claim is about the field, states the field's position. It is 5 if publisher chapter summaries count as Reference and 3 if they do not.
- The other 6 can be written only in weaker or narrower wording than the show uses. For four of them (P2, P4, E1, E3) no openly readable sentence states the scholarly position at all; the passages found give evidence or reasoning, or sit in a search snippet.
- The show's strongest words ("strong consensus", "overwhelming majority", "fringe") were found in no source, for any claim.
- Every claim has some readable passage on its subject. That is a lower bar than the ticket asks for.
- The five timeline rows are sourceable on both sides: 5 of 5 critical dates, 5 of 5 traditional dates. Two of the critical dates rest on a class-ambiguous source. Every dated Tradition citation comes from one apologetics site.
- The pages rest on a narrow base: publisher companion pages for two textbooks, one publisher book excerpt, two open-access articles, one article abstract, a study Bible's online introductions and a university lecture transcript. Most standard reference works (Brown, Collins, the Anchor and Eerdmans dictionaries, the Oxford study Bibles) were not readable.
- Several sources carry a class or recency doubt that the owner has to rule on before they count. They are listed under "Decisions the policy needs".

## Method

- Claims were taken from the consensus inventory's ranked theses (`research/consensus-claims-inventory`) and the dating inventory's "not stated" rows (`research/dating-claims-inventory`).
- Each source was fetched and saved as bytes (HTML or PDF converted to text). Every quote below was then checked by script as an exact substring of the saved text, after normalising whitespace and quote marks. 60 of 60 quotes passed.
- Nine of the 60 are Google Books search snippets, marked "snippet". Five of them passed only after also ignoring OCR spacing around punctuation and line-break hyphens.
- Search-engine summaries and model-summarised page fetches were used as leads only. No quote comes from them or from memory.
- Each claim was time-boxed to about four candidate sources.

### What was not done

- No human opened these URLs. The owner review in #80 still applies to every citation.
- One cited site (USCCB) had to be read through an automated Chrome session because it refuses scripted requests after a couple of hits. The text came from the page itself.
- The textbook authors named for the Coogan summaries come from OUP's catalogue listing, not from the summary pages.
- Publication years for the two textbook companion sites, the NABRE introductions and the Yale lectures are not printed on the pages I read. Where a year below is marked "not on page", it is not verified.
- JSTOR free reading and author-posted copies on Academia.edu were not tested.

### Access conditions used below

| Tag            | Meaning                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| open           | Full passage opens logged-out at the URL                                                                                           |
| open (browser) | Opens logged-out in a browser; refuses scripted fetches                                                                            |
| abstract       | Only the article's own abstract page was readable; the PDF was refused                                                             |
| snippet        | Google Books search-within returns the sentence fragment and page number; whether the full page shows in preview was not confirmed |
| account-gated  | Internet Archive lending copy; needs a free account and a timed loan. Not tested, and nothing cited uses it                        |

## Subject 1: Pauline authorship and the Pastorals

| #   | Show claim                                                                                      | Result                                                                                   |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| P1  | Most scholars (a strong consensus) hold Paul did not write the Pastorals                        | Sourced at "most scholars". "Strong consensus" not found                                 |
| P2  | They were written decades after his death by someone writing in his name                        | Weaker. The only sentence that states this as the scholarly position is a snippet        |
| P3  | Seven letters are undisputed                                                                    | Sourced                                                                                  |
| P4  | Ephesians, Colossians, 2 Thessalonians are disputed, with a weaker consensus than the Pastorals | Weaker. "Disputed" is sourced; the comparison of strength is not stated in anything read |

### P1

- **Source**: OUP Learning Link, student chapter summary for Bart D. Ehrman, _A Brief Introduction to the New Testament_, 5th ed., chapter 16. **Class**: Reference (textbook companion; see caveat). **Year**: not on page. **Access**: open.
  - URL: https://learninglink.oup.com/access/content/ehrman_briefnt5e-student-resources/ehrman_briefnt5e-chapter-16-summary
  - Locator: section "The Pastoral Epistles", first sentence.
  - Quote: "Most scholars agree that Paul did not write the Pastoral Epistles."
- **Source**: Kampotela Luc Bulundwe, "Ethics and Pseudepigraphy: Do the Ends Always Justify the Means?", _Athens Journal of Humanities and Arts_ 6.4 (2019), 323-344. **Class**: Scholarly (peer review of this journal not checked). **Access**: open (University of Geneva repository, published version).
  - URL: https://archive-ouverte.unige.ch/unige:141374
  - Locator: body text at note 74; note 9.
  - Quote: "To consider 2 Tim as pseudonymous is the majority but not unanimous position."
  - Quote (note 9): "According to Burnet, 90% of the scholars consider the Pastoral Epistles (1 et 2 Tim; Titus) as pseudepigrapha". This reports Régis Burnet secondhand. Under the policy the 90% figure is a lead only; Burnet's book was not opened.
- **Source**: _New American Bible, Revised Edition_, introduction to 1 Timothy (USCCB). **Class**: Reference (study Bible introduction; church-published). **Year**: not established. The page gives no date for the introduction; if the New Testament introductions predate about 1996 they fall outside the 30-year window. **Access**: open (browser).
  - URL: https://bible.usccb.org/bible/1timothy/0
  - Quote: "Most scholars are convinced that Paul could not have been responsible for the vocabulary and style, the concept of church organization, or the theological expressions found in these letters."
  - The same introduction then lists three other groups of scholars who defend Pauline authorship in some form, so it reports dissent.
- **Source**: Frank J. Matera, _New Testament Theology: Exploring Diversity and Unity_ (Westminster John Knox, 2007), p. 240. **Class**: Scholarly. **Access**: snippet.
  - URL: https://books.google.com/books?id=nguWJ5kV-GgC&pg=PA240&q=%22most+scholars%22+pastoral
  - Quote: "The Pastoral Epistles (1 and 2 Timothy, Titus), which most scholars classify as pseudonymous, form a distinctive group of writings within the Pauline corpus."
- **Weaker wording in another textbook**: Mark Allan Powell, _Introducing the New Testament_ (Baker, 2009). **Class**: Reference. **Access**: snippet (Google page id PT488; no printed page number given).
  - URL: https://books.google.com/books?id=B8O5DQkk39YC&pg=PT488&q=%22pastoral+letters%22+scholars+pseudepigraphical
  - Quote: "many scholars believe that the three Pastoral Letters can be regarded as pseudepigraphical"
  - Powell says "many", the others say "most". That is not a contradiction about the state of the field, but it is not the show's "strong consensus" either.

### P2

- Matera, as above, p. 241. **Access**: snippet.
  - URL: https://books.google.com/books?id=nguWJ5kV-GgC&pg=PA241&q=%22most+scholars%22+pastoral
  - Quote: "most scholars view the Pastorals as pseudonymous, arguing that they were written by a later Paulinist in response" (the snippet breaks off here; "arguing" is hyphenated across a line in the scan).
- Ehrman chapter 16 summary, as above. **Access**: open. This states the reasoning, not the field's position.
  - Quote: "The Pastoral Epistles, then, reflect a church structure that developed well after Paul’s death."
- NABRE introduction to 1 Timothy, as above. A conditional, not a position statement.
  - Quote: "if they are regarded as only more remotely Pauline, their date may be as late as the early second century."
- Not found: any openly readable sentence saying most scholars date the Pastorals decades after Paul's death.

### P3

- **Source**: OUP Learning Link, Ehrman _Brief Introduction_ 5th ed., chapter 11 summary. **Class**: Reference (same caveat). **Access**: open.
  - URL: https://learninglink.oup.com/access/content/ehrman_briefnt5e-student-resources/ehrman_briefnt5e-chapter-11-summary
  - Locator: section "The Study of Paul: Methodological Difficulties".
  - Quote: "Most scholars believe that some of the New Testament letters attributed to Paul are, in fact, pseudepigraphic."
  - Quote: "the undisputed Pauline letters (Romans, 1 and 2 Corinthians, Galatians, Philippians, 1 Thessalonians, and Philemon)"
- Powell 2009, as above. **Access**: snippet (Google page ids PT436 and PT276).
  - URL: https://books.google.com/books?id=B8O5DQkk39YC&pg=PT436&q=%22undisputed+letters%22
  - Quote: "letters that all scholars recognize as being written by the apostle"
  - Quote: "undisputed letters, acknowledged to have been written by Paul (Romans, 1 Corinthians, 2 Corinthians, Galatians, Philippians, 1 Thessalonians, Philemon) six disputed letters, believed by some but not by all to have been written"

### P4

- Ehrman chapter 11 summary, as above. **Access**: open.
  - Quote: "the Deutero-Pauline epistles (Ephesians, Colossians, and 2 Thessalonians; this group is often called the “disputed Pauline” corpus)"
- Ehrman chapter 16 summary, as above. **Access**: open.
  - Quote (on 2 Thessalonians): "Many scholars believe that the main themes in this letter do not correspond with the teachings in Paul’s undisputed letters."
  - Quote: "Scholars question the authorship of Colossians for a number of reasons."
- NABRE introduction to Ephesians. Same class and year caveat as the 1 Timothy introduction. **Access**: open (browser).
  - URL: https://bible.usccb.org/bible/ephesians/0
  - Quote: "much of critical scholarship has considered the letter’s style and use of words (especially when compared with Colossians), its concept of the church, and other points of doctrine put forward by the writer as grounds for serious doubt about authorship by Paul."
- Not found: a sentence that compares the strength of the two consensuses. The same summary page says "Most scholars agree" for the Pastorals and "Many scholars believe" for 2 Thessalonians, but a page that drew the contrast itself would be counting, which the policy forbids.
- Lead not opened: Raymond Brown's _An Introduction to the New Testament_ (1997) is widely cited for percentage estimates per letter. Its Internet Archive scans are print-disabled only and Google Books has no preview.

## Subject 2: the historical Jesus and mythicism

| #   | Show claim                                                                                                                | Result                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| J1  | The overwhelming majority of scholars agree a historical Jesus existed; most see an apocalyptic preacher executed by Rome | Sourced                                                                                                                   |
| J2  | Mythicism is a fringe, overwhelming-minority view; Robert Price is the only trained mythicist                             | Sourced that specialists reject it. The words "fringe" and "minority" were not found. The source contradicts "only Price" |
| J3  | The Testimonium Flavianum has an authentic core, later expanded; this is the consensus                                    | Weaker. One abstract, scoped to "recent studies"                                                                          |

### J1

- **Source**: Justin J. Meggitt, "‘More Ingenious than Learned’? Examining the Quest for the Non-Historical Jesus", _New Testament Studies_ 65.4 (2019), 443-460. **Class**: Scholarly. **Access**: open (author's accepted manuscript in the Cambridge University repository; the published version on Cambridge Core showed only the abstract).
  - URL: https://www.repository.cam.ac.uk/handle/1810/289048
  - Locator: section 1, first sentence (manuscript p. 1; published p. 443 not seen).
  - Quote: "Virtually no scholar working in the field of New Testament studies or early Christian history doubts the historical existence of Jesus of Nazareth."
  - His note 1 qualifies it: "It is not the case that none do, as is often claimed or implied."
- **Source**: OUP Learning Link, Ehrman _Brief Introduction_ 5th ed., chapter 9 summary. **Class**: Reference (same caveat). **Access**: open.
  - URL: https://learninglink.oup.com/access/content/ehrman_briefnt5e-student-resources/ehrman_briefnt5e-chapter-9-summary
  - Quote: "Most scholars, however, agree that Jesus was an apocalyptic prophet."
- **Class-ambiguous**: Bart D. Ehrman, _Did Jesus Exist?_ (HarperOne, 2012). A scholar writing for a trade press. **Access**: Google Books preview; this is the one page for which the preview service returned a page image to my client (page id PT9).
  - URL: https://books.google.com/books?id=hf5Rj8EtsPkC&pg=PT9&q=%22virtually+every%22
  - Quote: "virtually every scholar of antiquity, of biblical studies, of classics, and of Christian origins in this country and, in fact, in the Western world agrees."

### J2

- Meggitt 2019, as above. The sentence is split by a footnote in the manuscript, so the checked quote starts mid-sentence. In full it reads: "Indeed, the arguments of those that deny his historicity are usually judged by most working professionally in the discipline to be 'so weak or bizarre that they relegate them to footnotes or often ignore them completely.'" The inner quotation is Meggitt citing Van Voorst (2000).
- The same paragraph cuts against the show's "only Robert Price" (Ep 86): "Whilst G. A. Wells was 'almost a lone voice'5 in support of the non-historicity thesis6 prior to the year 2000, that is evidently not the case now, even if we decide to restrict ourselves to those qualified within the field." He goes on to name Price and Thomas L. Brodie. Under the policy the page follows the source and drops the "only Price" detail.
- Not found: "fringe", "minority" or a percentage in a Scholarly or Reference source. Helen Bond's on-air "less than 5%" (Ep 48) has no readable written counterpart.

### J3

- **Source**: Chrissy M. E. Hansen, "Reception of the Testimonium Flavianum: An Evaluation of the Independent Witnesses to Josephus’ Testimonium Flavianum", _New England Classical Journal_ 51.2 (2024), 50-75. **Class**: Scholarly. **Access**: abstract (the journal's own landing page; the PDF link returned 403 to a scripted request and was not read).
  - URL: https://crossworks.holycross.edu/necj/vol51/iss2/6/
  - Quote: "Recent studies have largely ruled it partially authentic, with the works of Whealey, Paget, and Allen arguing that independent witnesses to the Testimonium Flavianum existed beyond Eusebius."
  - Scope is "recent studies", not "most scholars". The article disputes the independent-witness argument those studies use, so it reports the prevailing view as a critic of part of it.
- Not read: T. C. Schmidt, _Josephus and Jesus: New Evidence for the One Called Christ_ (Oxford University Press, 2025), which is open access and surveys the field. Oxford Academic and OAPEN both refused scripted and automated-browser requests. The owner can probably open it in an ordinary browser; if so it is the better citation.

## Subject 3: Moses and the Exodus

| #   | Show claim                                                                                           | Result                                                                                |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| E1  | The overwhelming majority of critical scholars (the consensus) say the Exodus as told did not happen | Weaker, and the sources show a split on whether some exodus happened                  |
| E2  | There is no archaeological or documentary evidence for the Exodus outside the Bible                  | Sourced, by four sources                                                              |
| E3  | There is no evidence for a historical Moses                                                          | Weaker. Sources say no Egyptian record mentions him; none says "no evidence" outright |
| E4  | Scholars have long recognized that Moses's birth story is modeled on the Sargon legend               | Weaker. "Paralleled by", from a class-ambiguous source and a snippet                  |

A fifth claim was sourced in passing (the Song of the Sea as the oldest account); see the end of this section.

### E1

- **Source**: Carol Meyers, _Exodus_, New Cambridge Bible Commentary (Cambridge University Press, 2005), Introduction. **Class**: Scholarly. **Access**: open (publisher's excerpt PDF).
  - URL: https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf
  - Locator: p. 4.
  - Quote (of "mainstream scholars who occupy a middle ground"): "As most biblical scholars have done for more than a century, they recognize that biblical narratives cannot be read as straightforward history."
  - This is about biblical narrative in general, not a verdict that the Exodus did not happen.
- **Source**: OUP Learning Link, student chapter summary for Michael D. Coogan and Cynthia R. Chapman, _A Brief Introduction to the Old Testament_, 4th ed., chapter 6. **Class**: Reference (textbook companion; same caveat as Ehrman). **Year**: not on page. **Access**: open.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-6-summary
  - Locator: sections "Exodus and History" and "Implications for Our Study".
  - Quote: "many scholars still think that there is some genuine history preserved in Exodus."
  - Quote: "Although the accounts of the Exodus may not preserve the historical details of this event accurately, it certainly appears that some sort of exodus occurred in Israel’s history."
- Not found: "consensus", "most scholars" or "overwhelming majority" attached to "did not happen". Under the policy the page cannot use those words for this claim, and has to carry Coogan's "some sort of exodus occurred" alongside the negative evidence.

### E2

- Meyers 2005, as above, p. 5.
  - Quote: "After more than a century of research and the massive efforts of generations of archaeologists and Egyptologists, nothing has been recovered that relates directly to the account in Exodus of an Egyptian sojourn and escape or of a large-scale migration through Sinai."
- Meyers 2005, p. 6.
  - Quote: "The archaeological evidence from Egypt and Sinai is all negative."
- Coogan chapter 6 summary, as above.
  - Quote: "no direct historical corroboration for the events in Exodus have been found."
- **Class-ambiguous**: Christine Hayes, "Introduction to the Old Testament (Hebrew Bible)", Open Yale Courses RLST 145, lecture 7 transcript. A lecture transcript published by the university, not a book or article. **Year**: not on page. **Access**: open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-7
  - Quote: "Well, no, there isn't any direct evidence outside the Bible"
- _Eerdmans Dictionary of the Bible_, ed. David Noel Freedman (Eerdmans, 2000), p. 441. **Class**: Reference. **Access**: snippet (entry title and author not visible).
  - URL: https://books.google.com/books?id=qRtUqxkB7wkC&pg=PA441&q=exodus+%22no%22+evidence+archaeological+Egyptian+historicity+scholars
  - Quote: "In fact, there is no contemporary reference or description in any extrabiblical source."

### E3

- Meyers 2005, as above, p. 6.
  - Quote: "no texts ever discovered in Egypt mention Moses or Aaron"
- Hayes lecture 7, as above (class-ambiguous).
  - Quote: "There's no Egyptian record of the biblical Moses, no record of plagues, no record of a defeat of Pharaoh's army."
- Coogan chapter 6 summary, as above.
  - Quote: "the abundant Egyptian historical records recount no mention of these events or figures."
- All three are narrower than the show: they speak of Egyptian records, not of evidence as such. A page can say "no Egyptian text mentions Moses". It cannot say "there is no evidence Moses existed" on these sources.

### E4

- Hayes lecture 7, as above (class-ambiguous).
  - Quote: "Many scholars have pointed out that this story in particular is paralleled by the birth story of a great Akkadian king, Sargon, from about 2300 BCE, Sargon of Akkad."
- John J. Collins, _Introduction to the Hebrew Bible_, 3rd ed., The Torah/Pentateuch (Fortress Press, 2019), p. 122. **Class**: Reference. **Access**: snippet.
  - URL: https://books.google.com/books?id=Qu49DwAAQBAJ&pg=PA122&q=Sargon
  - Quote: "Sargon of Akkad (c. 2300 b.c.e.), whose mother also placed him in a vessel of reeds in a river."
- The Coogan chapter 6 summary names other parallels instead (Dionysus, Heracles, Jesus) and does not mention Sargon.
- Not found: "modeled on" or "long recognized". Note too that the guest's on-air wording (Ep 105) says "Sargon II", an Assyrian king, while both sources name Sargon of Akkad.

### Also sourced: Song of the Sea (Ep 116)

- Hayes, Open Yale Courses RLST 145, lecture 8 transcript (class-ambiguous). **Access**: open.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-8
  - Quote: "One thing that most people do in fact agree on is that the oldest account of the event is a poetic fragment that's found in Exodus 15, verses one to 12, in particular."
  - This says the oldest account of the sea event, not among the earliest parts of the Hebrew Bible.

## Timeline rows

### Selection

The five rows are not a random sample. I chose "not stated" rows where a tradition actually asserts a date or a datable author, so that both sides could exist. Rows with no traditional counterpart (the emergence of Hebrew, the origin of YHWH worship) were avoided. One event row and four composition rows:

1. Fall of Samaria / northern kingdom (event)
2. Isaiah 56-66 (Trito-Isaiah)
3. Lamentations
4. Judges
5. Genesis 1 (Priestly creation account), from the row "Genesis 2-3 and Genesis 1"

### Results

| Row             | Show's critical date       | Critical source found                                                          | Tradition source found               |
| --------------- | -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Fall of Samaria | 722 BCE                    | Yes, clean                                                                     | Yes; same date as the critical one   |
| Isaiah 56-66    | Probably Persian period    | Yes, clean                                                                     | Yes (date); Talmud (authorship only) |
| Lamentations    | No date on the show        | Yes: after 587, not by Jeremiah                                                | Yes (date); Talmud (authorship only) |
| Judges          | Prose 9th-8th century BCE  | Partly: only the Deuteronomistic editing is dated, by a class-ambiguous source | Yes (date); Talmud (authorship only) |
| Genesis 1       | 6th, maybe 5th century BCE | Partly: Priestly material dated by a class-ambiguous source                    | Yes (date); Talmud (authorship only) |

Sources used repeatedly below:

- **Coogan summaries**: OUP Learning Link, _A Brief Introduction to the Old Testament_ 4th ed. student resources, as under E1. Reference; year not on page; open.
- **NABRE**: _New American Bible, Revised Edition_ book introductions on bible.usccb.org. Reference (church-published study Bible); year not established (no date on the pages); open (browser).
- **Hayes**: Open Yale Courses RLST 145 transcripts, as under E2. Class-ambiguous; open.
- **GotQuestions**: Got Questions Ministries "Summary of the Book of ..." pages. Tradition (evangelical apologetics). Unsigned and undated. Open. Borderline against the policy's exclusion of blogs; see "Decisions the policy needs".
- **Talmud**: Babylonian Talmud, Bava Batra 14b-15a, in the William Davidson (Steinsaltz) English on Sefaria. Tradition (rabbinic). Open. It names authors and gives no dates, so it is tagged authorship only. The English includes the translator's explanatory insertions.

### 1. Fall of Samaria

- Critical: Coogan chapter 17 summary.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-17-summary
  - Quote: "resulting in the siege of Israel and the eventual fall of Samaria in 722."
- Critical: NABRE introduction to Isaiah.
  - URL: https://bible.usccb.org/bible/isaiah/0
  - Quote: "The Northern Kingdom collapsed, under the hammerlike blows of Assyria, in 722/721 B.C."
- Tradition: GotQuestions, "When and how was Israel conquered by the Assyrians?"
  - URL: https://www.gotquestions.org/Israel-conquered-by-Assyria.html
  - Quote: "about 722 BC, the capital city, Samaria, was overtaken by the Assyrians under Shalmaneser V."
- The two sides give the same date. This row has no contrast to show.

### 2. Isaiah 56-66

- Critical: Coogan chapter 22 summary.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-22-summary
  - Locator: section "Third Isaiah".
  - Quote: "it is most likely that the text dates to some time after the Temple was completed in 515 BCE."
- Critical: NABRE introduction to Isaiah, URL as above.
  - Quote: "Chapters 56–66 (Third Isaiah, or Trito-Isaiah) contain oracles from the postexilic period and were composed by writers imbued with the spirit of Isaiah who continued his work."
- Critical: _Eerdmans Dictionary of the Bible_ (2000), p. 648. Snippet.
  - URL: https://books.google.com/books?id=qRtUqxkB7wkC&pg=PA648&q=%22Third+Isaiah%22
  - Quote: "(Third Isaiah), who wrote in the 5th century, when exiles had returned from captivity in Babylon."
  - The next sentence in the snippet says the three-part division "has received widespread support until recent years", which hints at a shift the page would need to follow up.
- Tradition: GotQuestions, "Summary of the Book of Isaiah".
  - URL: https://www.gotquestions.org/Book-of-Isaiah.html
  - Quote: "The book of Isaiah was written between 739 and 681 B.C."
- Tradition (authorship only): Talmud, Bava Batra 15a.
  - URL: https://www.sefaria.org/Bava_Batra.15a
  - Quote: "Hezekiah and his colleagues wrote the following" (the list that follows includes Isaiah).

### 3. Lamentations

- Critical: NABRE introduction to Lamentations.
  - URL: https://bible.usccb.org/bible/lamentations/0
  - Quote: "Although the poems are traditionally ascribed to the prophet Jeremiah, this is unlikely."
  - Quote: "In any case, they are anonymous compositions probably used by survivors of the catastrophe of 587 B.C. in a communal expression of grief and mourning."
- Critical: Coogan chapter 20 summary.
  - URL: https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-20-summary
  - Quote: "Traditionally, the book is attributed to Jeremiah, but modern scholarship suggests that he is not the author"
- Tradition: GotQuestions, "Summary of the Book of Lamentations".
  - URL: https://www.gotquestions.org/Book-of-Lamentations.html
  - Quote: "The Book of Lamentations was likely written between 586 and 575 B.C., during or soon after Jerusalem’s fall."
- Tradition (authorship only): Talmud, Bava Batra 15a, URL as above.
  - Quote: "Jeremiah wrote his own book, and the book of Kings, and Lamentations."
- The two sides differ on the author, not much on the date.

### 4. Judges

- Critical: Hayes lecture 12 transcript (class-ambiguous), on the Deuteronomistic History as a whole (Joshua to 2 Kings).
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-12
  - Quote: "The whole unit, as a whole, was redacted after 622: that's clear."
  - Quote: "So the work was probably concluded shortly after that date" (the date is 562, the release of Jehoiachin).
- Critical: NABRE introduction to Judges. It names the Deuteronomistic editor but gives no date.
  - URL: https://bible.usccb.org/bible/judges/0
  - Quote: "The principal contribution of the Deuteronomistic historian to the Book of Judges is the thematic introduction to—and theological evaluation of—the period of the Judges in 2:1–3:6"
- Not found: a date for the older Judges stories. The show's "9th or 8th century BCE" for the prose has no source here. The Coogan chapter 12 summary gives no composition date.
- Tradition: GotQuestions, "Summary of the Book of Judges".
  - URL: https://www.gotquestions.org/Book-of-Judges.html
  - Quote: "The Book of Judges was likely written between 1045 and 1000 B.C."
- Tradition (authorship only): Talmud, Bava Batra 14b.
  - URL: https://www.sefaria.org/Bava_Batra.14b
  - Quote: "Samuel wrote his own book, the book of Judges, and the book of Ruth."

### 5. Genesis 1

- Critical: Hayes lecture 5 transcript (class-ambiguous).
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-5
  - Quote: "Genesis 1, the first creation account, is attributed to P."
- Critical: Hayes lecture 9 transcript (class-ambiguous), on the Priestly materials.
  - URL: https://oyc.yale.edu/religious-studies/rlst-145/lecture-9
  - Quote: "They reached their final form in the exilic or post-exilic period."
  - In lecture 5 she calls the exilic dating of P "one of Wellhausen's most controversial points that's still hotly debated today", so the page would have to show a split.
- Critical: NABRE introduction to Genesis. It dates the editing of the older sources, not Genesis 1 itself.
  - URL: https://bible.usccb.org/bible/genesis/0
  - Quote: "contemporary readers can reasonably assume that ancient traditions (J and E) were edited in the sixth or fifth century B.C."
- Not found: a Reference or Scholarly sentence that dates Genesis 1 itself to the sixth century. The Coogan chapter 3 and 4 summaries do not date the Priestly source.
- Tradition: GotQuestions, "Summary of the Book of Genesis".
  - URL: https://www.gotquestions.org/Book-of-Genesis.html
  - Quote: "The date of authorship is likely between 1440 and 1400 B.C., between the time Moses led the Israelites out of Egypt and his death."
- Tradition (authorship only): Talmud, Bava Batra 14b, URL as above.
  - Quote: "Moses wrote his own book, i.e., the Torah, and the portion of Balaam in the Torah, and the book of Job."

## What fraction could be sourced

### Core claims (11)

| Outcome                                                                                                  | Count  | Claims                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| An openly readable sentence supports the claim and states the field's position where the claim needs one | 3 to 5 | J1, J2 (rejection by specialists), E2; plus P1 (as "most scholars") and P3 if publisher summaries count |
| Sourced only in weaker or narrower wording                                                               | 6      | P2, P4, J3, E1, E3, E4                                                                                  |
| No readable passage on the subject                                                                       | 0      |                                                                                                         |

Notes on the count:

- The upper figure depends on accepting publisher companion summaries as Reference. Without them, P1 rests on one sentence about 2 Timothy alone and P3 has only snippets, leaving 3 of 11 (J1, J2, E2), all from two sources (Meggitt and Meyers).
- Within the 6, P2, P4, E1 and E3 have no openly readable sentence stating the scholarly position. J3 has one, scoped to "recent studies" and read in an abstract. E4 has one from a class-ambiguous source, saying "paralleled", not "modeled".
- None of the 11 is supported at the show's own strength where the show says "strong consensus", "overwhelming majority" or "fringe". Those words were found nowhere. The pages would say "most scholars" and "virtually no scholar".
- Two show details are contradicted by a source: "only Robert Price" (J2) and, by implication, a flat "did not happen" (E1).

### Timeline rows (5 rows, 10 lookups)

- Critical date: 5 of 5 found. Three are clean (Samaria, Isaiah 56-66, Lamentations). Two rest on the class-ambiguous Yale transcripts and date an editorial layer, not the row's exact subject (Judges, Genesis 1).
- Traditional date: 5 of 5 found, all from GotQuestions. Four of the five also have a Talmud passage naming the traditional author without a date.
- One row (Samaria) has identical dates on both sides.

## Which kinds of public access worked

Worked:

- **Publisher companion sites.** OUP Learning Link chapter summaries for Ehrman's and Coogan's brief textbooks open logged-out and carried more claims than any other source type. They are summaries of the textbooks, not the textbooks.
- **Publisher excerpt PDFs.** Cambridge's sample chapter of Meyers's _Exodus_ gave the strongest Exodus passages.
- **Institutional repositories.** Cambridge (Meggitt's accepted manuscript) and Geneva (Bulundwe's published article).
- **Journal landing pages.** The abstract was readable where the PDF was not (Hansen).
- **Study Bible introductions online.** USCCB's NABRE introductions, in a browser.
- **University open courseware.** Yale lecture transcripts.
- **Tradition sources.** GotQuestions and Sefaria opened without trouble. This side is easy.
- **Google Books search-within.** It returns the sentence fragment and page number for most academic books. It is good for finding and confirming wording.

Failed or limited:

- **Google Books preview pages: not confirmed.** For 8 of the 9 pages I tested, the snippet came back but the preview service returned no page image to my client. I do not know whether that means the page is outside the preview. A check in a browser was stopped by Google's CAPTCHA. The owner may see the full page or only a two-line snippet cut mid-sentence. I count these as snippet-only, not as passages read.
- **Internet Archive: print-disabled items unreadable; lending items untested.** Three post-1996 books I looked up (Brown 1997, Horrell 2006, Gray 2012) are print-disabled only and cannot be borrowed. Others are lendable with a free account (for example Scholz 2013, listed as available to browse); I did not test a loan, and my attempts to query search-inside for restricted items returned "item not available". Full-text search across the Archive shows fragments from such books, but only fragments. Unrestricted copies of recent books there are user uploads of doubtful legality and were not used.
- **Open-access platforms behind bot walls.** Oxford Academic (Cloudflare), OAPEN and OpenEdition (Anubis), MDPI, the University of Lausanne repository (captcha) and the Holy Cross PDF link all refused scripted requests; Oxford Academic and OAPEN also refused an automated browser. These are probably readable by a person. I could not confirm that, and nothing from them is cited.
- **Cambridge Core.** Book chapters and the published version of Meggitt redirected to abstract-only pages.
- **Publisher textbook sites other than OUP.** Baker's student resources returned 403.
- **Search aids.** The Google Books API was over quota and the CORE open-access API returned errors, so discovery relied on general web search, which mostly returns Wikipedia and blogs.

## Quotes not verified verbatim against a full page

All 60 quotes matched fetched text. These are the ones with a weaker kind of match:

- The nine Google Books snippets (Matera pp. 240 and 241; Powell page ids PT276, PT436, PT488; _Eerdmans Dictionary_ pp. 441 and 648; Collins p. 122; Ehrman _Did Jesus Exist?_ PT9) are OCR fragments returned by search, cut at "..." boundaries. Spacing and hyphenation were normalised. Only for the Ehrman page did the preview service return a page image.
- Meggitt's J2 sentence is interrupted by a footnote in the manuscript text; its opening ("Indeed, the arguments of those that deny his") and the rest were matched separately.
- Meggitt was read in the accepted manuscript, not the typeset article. Published page numbers are not confirmed.
- Hansen was read in the abstract only.
- The Talmud quotes are from a modern English translation that mixes literal text with explanation.

## Decisions the policy needs

These came up and the policy in #80 does not settle them. Each changes the fraction above.

1. **Are publisher-hosted chapter summaries Reference sources?** The Learning Link pages are published by OUP about its own textbooks, but are unsigned and are not the textbook text. They carry P1, P3, P4, E1-E3 and three timeline rows.
2. **Does a Google Books snippet count as "the passage read in the source itself"?** The fragment is real text from the book, but the owner may not be able to see the page around it.
3. **Is a university lecture transcript by a professional scholar Scholarly, Reference or neither?** Hayes carries E4 and two timeline rows.
4. **Is the NABRE a Reference source, and which year applies to its introductions?** The pages carry no date. If the New Testament introductions predate about 1996 they fall outside the 30-year window.
5. **Is GotQuestions a Tradition source or an excluded blog?** If excluded, dated traditional claims need another home (older confessional Bible dictionaries or study Bible notes), which I did not test.
6. **Does a scholar's trade-press book count?** Ehrman's _Did Jesus Exist?_ has the most quotable J1 sentence.

## Sources

Every source cited above, with the URL where it was read:

- Bulundwe 2019: https://archive-ouverte.unige.ch/unige:141374
- Collins 2019 (snippet): https://books.google.com/books?id=Qu49DwAAQBAJ
- Coogan and Chapman, Learning Link summaries, chapters 6, 17, 20, 22: https://learninglink.oup.com/access/coogan-brief-4e-student-resources
- _Eerdmans Dictionary of the Bible_ 2000 (snippet): https://books.google.com/books?id=qRtUqxkB7wkC
- Ehrman, Learning Link summaries, chapters 9, 11, 16: https://learninglink.oup.com/access/content/ehrman_briefnt5e-student-resources/ehrman_briefnt5e-chapter-16-summary
- Ehrman 2012: https://books.google.com/books?id=hf5Rj8EtsPkC&pg=PT9
- GotQuestions: https://www.gotquestions.org/ (five pages, linked above)
- Hansen 2024 (abstract): https://crossworks.holycross.edu/necj/vol51/iss2/6/
- Hayes, Open Yale Courses RLST 145, lectures 5, 7, 8, 9, 12: https://oyc.yale.edu/religious-studies/rlst-145
- Matera 2007 (snippet): https://books.google.com/books?id=nguWJ5kV-GgC
- Meggitt 2019 (accepted manuscript): https://www.repository.cam.ac.uk/handle/1810/289048
- Meyers 2005 (publisher excerpt): https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf
- NABRE introductions (1 Timothy, Ephesians, Isaiah, Lamentations, Judges, Genesis): https://bible.usccb.org/bible
- Powell 2009 (snippet): https://books.google.com/books?id=B8O5DQkk39YC
- Talmud, Bava Batra 14b-15a: https://www.sefaria.org/Bava_Batra.14b
