---
# PROTOTYPE for issue #101, "What does a Timeline row look like?". Throwaway; never merge.
# Every citation quote maps to a fetched, script-checked passage in
# docs/research/public-source-availability.md (branch research/public-source-availability)
# or docs/research/timeline-row-sourcing.md (branch research/timeline-row-sourcing).
# Years: signed integers, BCE negative. `sort` places an entry on the spine; `display` is what the reader sees.
title: "Timeline"
dek: "When events the show discusses happened, and when the texts it discusses were written, according to publicly readable scholarship."
readDate: "2026-11-22"
build:
  list: never

scale:
  from: -1600
  to: 0
  ticks:
    - { year: -1500, label: "1500 BCE" }
    - { year: -1000, label: "1000 BCE" }
    - { year: -500, label: "500 BCE" }
    - { year: 0, label: "1 CE" }

sources:
  coogan17:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 17"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-17-summary"
  coogan20:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 20"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-20-summary"
  coogan22:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 22"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-22-summary"
  nabreIsaiah:
    full: "New American Bible, Revised Edition, introduction to Isaiah (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open in a browser"
    url: "https://bible.usccb.org/bible/isaiah/0"
  nabreLamentations:
    full: "New American Bible, Revised Edition, introduction to Lamentations (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open in a browser"
    url: "https://bible.usccb.org/bible/lamentations/0"
  nabreJudges:
    full: "New American Bible, Revised Edition, introduction to Judges (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open in a browser"
    url: "https://bible.usccb.org/bible/judges/0"
  hayes5:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 5 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-5"
  hayes9:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 9 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-9"
  hayes12:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 12 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-12"

  hayes7:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 7 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-7"
  hayes11:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 11 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-11"
  hayes14:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 14 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-14"
  hayes23:
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145 (2006), lecture 23 transcript"
    class: "Reference"
    access: "University courseware, open"
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-23"
  coogan6:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 6"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-6-summary"
  coogan10:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 10"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-10-summary"
  coogan19:
    full: "OUP companion summary of Coogan and Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 19"
    class: "Reference"
    access: "Publisher companion page, open"
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-19-summary"
  nabreDaniel:
    full: "New American Bible, Revised Edition, introduction to Daniel (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open"
    url: "https://bible.usccb.org/bible/daniel/0"
  nabreDeuteronomy:
    full: "New American Bible, Revised Edition, introduction to Deuteronomy (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open in a browser"
    url: "https://bible.usccb.org/bible/deuteronomy/0"
  nabreJeremiah:
    full: "New American Bible, Revised Edition, introduction to Jeremiah (USCCB)"
    class: "Reference"
    access: "Church-published study Bible, open in a browser"
    url: "https://bible.usccb.org/bible/jeremiah/0"
  meyers:
    full: "Carol Meyers, Exodus, New Cambridge Bible Commentary (Cambridge University Press, 2005), Introduction"
    class: "Scholarly"
    access: "Publisher excerpt PDF, open"
    url: "https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf"
  nigro:
    full: "Lorenzo Nigro, “Jericho. From the Neolithic to the Bronze and Iron Ages: The Urban Diversity”, Proceedings of the 12th International Congress on the Archaeology of the Ancient Near East, vol. 2 (Harrassowitz, 2023), pp. 399–414"
    class: "Scholarly"
    access: "Author's offprint, university repository, open"
    url: "https://iris.uniroma1.it/retrieve/a09e0ba5-0e23-4a5e-8c89-db58e6d2ba80/Nigro_Jericho_2022.pdf"
  gqDaniel:
    full: "Got Questions Ministries, “Summary of the Book of Daniel”"
    class: "Tradition"
    access: "Ministry website, open"
    url: "https://www.gotquestions.org/Book-of-Daniel.html"
  gqDeuteronomy:
    full: "Got Questions Ministries, “Summary of the Book of Deuteronomy”"
    class: "Tradition"
    access: "Ministry website, open"
    url: "https://www.gotquestions.org/Book-of-Deuteronomy.html"
  abrExodus:
    full: "Bryant G. Wood, “The Biblical Date for the Exodus Is 1446 BC: A Response to James Hoffmeier”, Associates for Biblical Research (2009)"
    class: "Tradition"
    access: "Ministry website, open"
    url: "https://biblearchaeology.org/the-biblical-date-for-the-exodus-is-1446-bc-a-response-to-james-hoffmeier/"
  abrJericho:
    full: "Bryant G. Wood, “Did the Israelites Conquer Jericho? A New Look at the Archaeological Evidence”, Associates for Biblical Research (2008; reprinted from Biblical Archaeology Review 16.2, 1990)"
    class: "Tradition"
    access: "Ministry website, open"
    url: "https://biblearchaeology.org/research-articles/did-the-israelites-conquer-jericho-a-new-look-at-the-archaeological-evidence/"

entries:
  - id: fall-of-samaria
    kind: event
    title: "Fall of Samaria and the northern kingdom"
    critical:
      display: "722/721 BCE"
      from: -722
      to: -721
      sort: -722
      cites:
        - { source: coogan17, locator: "chapter summary", quote: "resulting in the siege of Israel and the eventual fall of Samaria in 722." }
        - { source: nabreIsaiah, locator: "introduction", quote: "The Northern Kingdom collapsed, under the hammerlike blows of Assyria, in 722/721 B.C." }
    triggers:
      - { episode: 187, speaker: "Dan McClellan", timestamp: "00:52:15.840", text: "In 722 BCE, you had Assyrians come in and basically exile the northern kingdom." }

  - id: lamentations
    kind: composition
    title: "Lamentations"
    critical:
      display: "After 587 BCE"
      note: "Anonymous poems, probably used by survivors of the fall of Jerusalem. The book is traditionally ascribed to Jeremiah; the sources call that unlikely."
      from: -587
      open: true
      sort: -587
      cites:
        - { source: nabreLamentations, locator: "introduction", quote: "In any case, they are anonymous compositions probably used by survivors of the catastrophe of 587 B.C. in a communal expression of grief and mourning." }
        - { source: nabreLamentations, locator: "introduction", quote: "Although the poems are traditionally ascribed to the prophet Jeremiah, this is unlikely." }
        - { source: coogan20, locator: "chapter summary", quote: "Traditionally, the book is attributed to Jeremiah, but modern scholarship suggests that he is not the author" }
    triggers:
      - { episode: 36, speaker: "Jacob Wright", timestamp: "00:35:26.900", text: "The book of Lamentations, which is like the most graphic description of the devastation, some of it goes back to the early days, but some of it goes back, you know, late. It's been. It continued to be written for centuries." }

  - id: judges-dtr
    kind: composition
    title: "Judges, as edited into the Deuteronomistic History"
    critical:
      display: "After 622 BCE; probably finished soon after 562 BCE"
      note: "The date is for the edited history from Joshua to 2 Kings, of which Judges is part. The sources read give no date for the older stories inside it."
      from: -622
      to: -560
      sort: -622
      cites:
        - { source: hayes12, locator: "transcript", quote: "The whole unit, as a whole, was redacted after 622: that's clear." }
        - { source: hayes12, locator: "transcript", quote: "That was when King Jehoiachin was released from prison in Babylon, in 562." }
        - { source: hayes12, locator: "transcript", quote: "So the work was probably concluded shortly after that date" }
        - { source: nabreJudges, locator: "introduction", quote: "The principal contribution of the Deuteronomistic historian to the Book of Judges is the thematic introduction to—and theological evaluation of—the period of the Judges in 2:1–3:6" }
    triggers:
      - { episode: 64, speaker: "Dan McClellan", timestamp: "00:26:06.370", text: "the reality is that these, most of these stories probably come from the 9th or the 8th century BCE, but this poem, the Song of Deborah, could come from before that, you know, possibly as early as around a thousand BCE." }

  - id: priestly-genesis-1
    kind: composition
    title: "The Priestly source, including Genesis 1"
    critical:
      display: "Exilic or post-exilic period"
      note: "Placed from the fall of Jerusalem onward. Genesis 1 is assigned to the Priestly source; the date is for the Priestly material as a whole, in its final form. The same source calls this dating still debated."
      anchor: fall-of-jerusalem
      from: -587
      open: true
      sort: -586
      cites:
        - { source: hayes5, locator: "transcript", quote: "Genesis 1, the first creation account, is attributed to P." }
        - { source: hayes9, locator: "transcript", quote: "They reached their final form in the exilic or post-exilic period." }
        - { source: hayes5, locator: "transcript", quote: "this is one of Wellhausen's most controversial points that's still hotly debated today" }
    triggers:
      - { episode: 1, speaker: "Dan McClellan", timestamp: "00:05:36.230", text: "So the first creation account, probably 8th-7th century BCE, somewhere around there; Genesis 1, the later creation account, probably 6th, maybe even 5th century BCE." }

  - id: isaiah-56-66
    kind: composition
    title: "Isaiah 56–66 (Third Isaiah)"
    critical:
      display: "After 515 BCE"
      note: "Postexilic; most likely some time after the Second Temple was completed."
      from: -515
      open: true
      sort: -515
      cites:
        - { source: coogan22, locator: "section “Third Isaiah”", quote: "it is most likely that the text dates to some time after the Temple was completed in 515 BCE." }
        - { source: nabreIsaiah, locator: "introduction", quote: "Chapters 56–66 (Third Isaiah, or Trito-Isaiah) contain oracles from the postexilic period and were composed by writers imbued with the spirit of Isaiah who continued his work." }
    triggers:
      - { episode: 43, speaker: "Dan McClellan", timestamp: "00:45:20.710", text: "Most scholars would say somewhere around 520 BCE. So after the return, right around the time that the second temple is being rebuilt, is probably when you have the first layers of Deutero-Isaiah being produced, and then Trito or third Isaiah is coming even later than that, probably in the Persian period." }

  - id: daniel
    kind: composition
    title: "Daniel"
    critical:
      display: "167–164 BCE"
      note: "Chapters 7–12 date from then. The court tales of chapters 1–6 are earlier, perhaps the end of the third century BCE."
      from: -167
      to: -164
      sort: -167
      cites:
        - { source: nabreDaniel, locator: "introduction", quote: "This work was composed during the bitter persecution carried on by Antiochus IV Epiphanes (167–164 B.C.) and was written to strengthen and comfort the Jewish people in their ordeal." }
        - { source: hayes23, locator: "transcript", quote: "Chapters 7 through 12 are fully apocalyptic in genre and they were composed between 167 and 164" }
        - { source: hayes23, locator: "transcript", quote: "So the book, we know, was written quite late, perhaps the end of the third century, those first six chapters." }
    tradition:
      display: "540–530 BCE"
      from: -540
      to: -530
      holder: "Got Questions Ministries, an evangelical ministry,"
      cites:
        - { source: gqDaniel, locator: "summary", quote: "The Book of Daniel was likely written between 540 and 530 B.C." }
    triggers:
      - { episode: 32, speaker: "Dan McClellan", timestamp: "00:24:33.250", text: "The Book of Daniel is brought together from some traditions that were collated and finalized in the middle of the second century BCE. In fact, we can probably date it to within maybe two or three years of when it was. It was probably written around 167ish BCE." }
      - { episode: 119, speaker: "Dan McClellan", timestamp: "00:08:35.900", text: "as you get from the 6th century BCE, which is when Daniel was supposed to have been written, as you get closer to the 160s BCE, the history gets one, more accurate, two, more detailed" }

  - id: deuteronomy
    kind: composition
    title: "Deuteronomy"
    critical:
      display: "8th century BCE to after the exile"
      note: "Built up over two to three centuries. Its core is linked to King Josiah's reform around 622 BCE, and one source dates that core to the late seventh century."
      from: -800
      to: -500
      open: true
      sort: -800
      cites:
        - { source: nabreDeuteronomy, locator: "introduction", quote: "The book was probably composed over the course of three centuries, from the eighth century to the exile and beyond." }
        - { source: coogan10, locator: "chapter summary", quote: "The oldest material dating to the eighth century BCE is the core laws from Deuteronomy 12–26." }
        - { source: hayes11, locator: "transcript", quote: "This reform has long been noticed and provides scholars with a basis for dating the core materials of Deuteronomy, dating them to the late seventh century." }
    tradition:
      display: "1406 BCE, as sermons by Moses"
      from: -1406
      holder: "Got Questions Ministries, an evangelical ministry,"
      cites:
        - { source: gqDeuteronomy, locator: "Date of Writing", quote: "These sermons were given during the 40-day period prior to Israel’s entering the Promised Land." }
        - { source: gqDeuteronomy, locator: "Date of Writing", quote: "The year was 1406 B.C." }
    triggers:
      - { episode: 146, speaker: "Dan McClellan", timestamp: "00:41:37.928", text: "it's supposed to date to or after the Exodus, uh, the, the 40 years wandering before everybody enters into Israel. So 1200 BCE, 1400 BCE, depending on where you imagine this, uh, what time period you imagine this happened in. The reality is that it was probably brought together under King Josiah toward the end of the 600s BCE." }

  - id: jericho
    kind: event
    title: "Destruction of Canaanite Jericho"
    critical:
      display: "1550–1520 BCE"
      note: "Radiocarbon dates for an enemy attack that destroyed the city completely."
      from: -1550
      to: -1520
      sort: -1550
      cites:
        - { source: nigro, locator: "p. 403", quote: "In the second half of the 16th century BC, Ruha was completely destroyed by an enemy attack" }
        - { source: nigro, locator: "p. 403", quote: "Radiocarbon dates fix the event between 1550 and 1520 cal BC" }
        - { source: nigro, locator: "p. 402", quote: "the latter was the ancient Canaanite name of the city" }
    tradition:
      display: "About 1400 BCE"
      from: -1400
      holder: "Associates for Biblical Research, an evangelical apologetics ministry,"
      cites:
        - { source: abrJericho, locator: "article", quote: "The pottery, stratigraphic considerations, scarab data and a Carbon-14 date all point to a destruction of the city around the end of Late Bronze I, about 1400 B.C.E." }
    triggers:
      - { episode: 138, speaker: "Dan McClellan", timestamp: "00:45:06.633", text: "And even actual archaeologists like Bryant Wood, who is somebody who gets appealed to a lot when it comes to Jericho. He's one of the ones who provided this argument against Kenyon and the consensus view that the big walls fell down around 1550 BCE. He was like, no, it's closer to 1400 BCE." }

  - id: fall-of-jerusalem
    kind: event
    title: "Fall of Jerusalem to Babylon"
    critical:
      display: "587 or 586 BCE"
      note: "The sources use both years."
      from: -587
      to: -586
      sort: -587
      cites:
        - { source: hayes14, locator: "transcript", quote: "It's the neo-Babylonian empire that will succeed in felling Judah under Nebuchadrezzar of Babylon in 587 or 586." }
        - { source: nabreJeremiah, locator: "introduction", quote: "Nebuchadnezzar took swift vengeance; Jerusalem was destroyed in 587 and its leading citizens sent into exile." }
        - { source: coogan19, locator: "chapter summary", quote: "The invasion of the Babylonians in 586 BCE resulted in catastrophic upheaval for Israel." }
    triggers:
      - { episode: 126, speaker: "Dan McClellan", timestamp: "00:33:23.420", text: "So, uh, the Babylonians, there are, uh, two main waves: 597 BCE and then 586 BCE. And it's the 586 invasion that results in the destruction of the Jerusalem Temple." }

  - id: exodus
    kind: event
    title: "The Exodus"
    undated:
      statement: "The sources give it no firm date. Dating it from the Bible's own chronology is called “an exercise in futility”, and proposed dates run from the sixteenth to the early twelfth century BCE, with no consensus. Two introductions say that if it has a historical basis, the thirteenth century BCE is the most plausible setting."
      cites:
        - { source: meyers, locator: "p. 8", quote: "Attempts to use the Bible’s own chronology to “date” the exodus is an exercise in futility." }
        - { source: meyers, locator: "p. 8", quote: "there are strong proponents, with no consensus or prospects for resolution, of dates ranging from the sixteenth to the early twelfth centuries bce" }
        - { source: hayes7, locator: "transcript", quote: "if there's any historical basis to the Exodus, then the most plausible time, the most plausible backdrop would be the thirteenth century BCE." }
        - { source: coogan6, locator: "chapter summary", quote: "The most reasonable date is the thirteenth century BCE, both because it fits the historical record most suitably and because Israel is mentioned in the thirteenth-century Egyptian Merneptah stela as a nation in Canaan." }
        - { source: coogan6, locator: "chapter summary", quote: "If we accept the Exodus as a historical event, then it is necessary to establish some sort of plausible date." }
    tradition:
      display: "1446 BCE"
      from: -1446
      holder: "Associates for Biblical Research, an evangelical apologetics ministry,"
      cites:
        - { source: abrExodus, locator: "article", quote: "1 Kgs 6:1 and 1 Chr 6:33–37 converge on a date of 1446 BC for the exodus" }
    triggers:
      - { episode: 21, speaker: "Dan McClellan", timestamp: "00:25:18.080", text: "And so on balance, I and most scholars, the overwhelming majority of critical scholars, would say the Exodus, as it is told in the book of Exodus, is entirely implausible. It is plausible that there's a historical core, some kind of little kernel of history that just grew and grew and grew" }
      - { episode: 138, speaker: "Dan McClellan", timestamp: "00:44:09.004", text: "So the— if you date the Exodus to the 1400s BCE, which is what a lot of folks do, they'll say, oh, this is Amenhotep II, that was the Pharaoh. 1440 to 1420, somewhere around there is the date of the Exodus." }

ledger:
  - "Owner review for this page: open every citation listed above at its URL and check each Trigger Claim against its Episode. NABRE pages for Deuteronomy and Jeremiah were read by hand in a browser (USCCB refuses scripts)."
  - "Tradition Dates appear on four entries (Daniel, Deuteronomy, Jericho, Exodus): the subjects where a Trigger Claim states the traditional side. Fall of Samaria has the same date in GotQuestions, but the show states no traditional side, so none is shown."
  - "Fall of Jerusalem: Episode 34's “605, 604 BCE” is a reading of Daniel 9's arithmetic, not a date a tradition is said to hold, so the entry has no Tradition Date and that Trigger Claim was left out."
  - "Deuteronomy: the show says “late 7th century”. Two of three sources start it in the eighth century, so the entry says that and notes the late-7th-century core."
  - "Jericho: the show credits “c. 1550” to Kenyon; only Wood's pages attribute it to her, which makes it a lead. The entry cites a 2023 radiocarbon report instead and is titled for what that report dates."
  - "Exodus: no source says it did not happen. The entry gives the sources' no-date statement and their conditional thirteenth century, and sits outside the spine."
  - "Samaria and Daniel, Jerusalem and Deuteronomy are the clean cases. Judges and the Priestly source are worded for an editorial layer, narrower than the show's subject."
---
