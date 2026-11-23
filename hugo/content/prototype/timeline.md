---
# PROTOTYPE for issue #101, "What does a Timeline row look like?". Throwaway; never merge.
# Every citation quote maps to a fetched, script-checked passage in
# docs/research/public-source-availability.md (branch research/public-source-availability)
# or docs/research/timeline-row-sourcing.md (branch research/timeline-row-sourcing).
# Years: signed integers, BCE negative. `sort` places an entry on the spine; `display` is what the reader sees.
title: "Timeline"
dek: "When the events and texts the show discusses date to, according to publicly readable scholarship, from about 1250 BCE to 400 CE."
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

entries:
  - id: fall-of-samaria
    kind: event
    title: "Fall of Samaria and the northern kingdom"
    critical:
      display: "722 or 721 BCE"
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
      display: "After 622 BCE; finished soon after 562 BCE"
      note: "The date is for the edited history from Joshua to 2 Kings, of which Judges is part. The sources read give no date for the older stories inside it."
      from: -622
      to: -560
      sort: -622
      cites:
        - { source: hayes12, locator: "transcript", quote: "The whole unit, as a whole, was redacted after 622: that's clear." }
        - { source: hayes12, locator: "transcript", quote: "So the work was probably concluded shortly after that date" }
        - { source: nabreJudges, locator: "introduction", quote: "The principal contribution of the Deuteronomistic historian to the Book of Judges is the thematic introduction to—and theological evaluation of—the period of the Judges in 2:1–3:6" }
    triggers:
      - { episode: 64, speaker: "Dan McClellan", timestamp: "00:26:06.370", text: "But the reality is that these, most of these stories probably come from the 9th or the 8th century BCE, but this poem, the Song of Deborah, could come from before that, you know, possibly as early as around a thousand BCE." }

  - id: priestly-genesis-1
    kind: composition
    title: "The Priestly source, including Genesis 1"
    critical:
      display: "Exilic or post-exilic period"
      note: "Placed from the fall of Jerusalem onward. Genesis 1 is assigned to the Priestly source; the date is for the Priestly material as a whole, in its final form."
      anchor: fall-of-jerusalem
      from: -587
      open: true
      sort: -586
      cites:
        - { source: hayes5, locator: "transcript", quote: "Genesis 1, the first creation account, is attributed to P." }
        - { source: hayes9, locator: "transcript", quote: "They reached their final form in the exilic or post-exilic period." }
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

ledger:
  - "PENDING: five both-sides entries from research ticket #100."
---
