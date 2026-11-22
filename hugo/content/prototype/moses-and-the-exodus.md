---
# PROTOTYPE for issue #83, "What does a consensus page for Moses look like?".
# Throwaway. Three variants of one Synthesis Page, switchable via ?variant=a|b|c.
# Every statement maps to a quote in docs/research/public-source-availability.md
# (branch research/public-source-availability). Nothing here comes from memory.
title: "Moses and the Exodus"
dek: "What publicly readable scholarship says about the evidence for the Exodus and for Moses."
readDate: "2026-11-22"
build:
  list: never

triggers:
  - episode: 21
    speaker: "Dan McClellan"
    timestamp: "00:25:18.080"
    text: "And so on balance, I and most scholars, the overwhelming majority of critical scholars, would say the Exodus, as it is told in the book of Exodus, is entirely implausible."
  - episode: 21
    speaker: "Dan McClellan"
    timestamp: "00:28:28.730"
    text: "I, I would say that we don't have evidence, evidence for the existence of a figure named Moses that is anything remotely associated with the story we have in Exodus."
  - episode: 75
    speaker: "Dan Beecher"
    timestamp: "00:22:05.760"
    text: "Because there's no archaeological evidence or, or records of any kind that support any of this except this story in the Bible."
  - episode: 97
    speaker: "Dan Beecher"
    timestamp: "00:35:22.450"
    text: "There's no, there is no archaeological evidence for the Exodus, but at least not as it's presented in the Bible."
  - episode: 105
    speaker: "Angela Roskop Erisman"
    timestamp: "00:15:41.290"
    text: "And as—as biblical scholars have long recognized, that story of, you know, the baby in the basket, we all—we all know that. Modeled on a text about the Assyrian king, Sargon II, who has a—who has a similar story of being abandoned and adopted."
  - episode: 116
    speaker: "Aaron Higashi"
    timestamp: "00:19:01.230"
    text: "So the Exodus, as it's described in the Bible, did not happen. We have good archaeological evidence that it did not happen."
  - episode: 116
    speaker: "Aaron Higashi"
    timestamp: "00:21:02.640"
    text: "the earliest parts in the Hebrew Bible scholars generally consider to be Exodus 15, the Song of the Sea, which is a version of the Exodus story."

sources:
  meyers:
    short: "Meyers 2005"
    full: "Carol Meyers, Exodus, New Cambridge Bible Commentary (Cambridge University Press, 2005), Introduction"
    class: "Scholarly"
    access: "Publisher excerpt PDF, open"
    url: "https://assets.cambridge.org/97805210/02912/excerpt/9780521002912_excerpt.pdf"
  coogan:
    short: "Coogan and Chapman, chapter 6 summary"
    full: "OUP Learning Link, student chapter summary for Michael D. Coogan and Cynthia R. Chapman, A Brief Introduction to the Old Testament, 4th ed., chapter 6"
    class: "Reference?"
    access: "Publisher companion page, open"
    pending: "Publisher chapter summary: unsigned, not the textbook's own text; authors and year are not on the page."
    url: "https://learninglink.oup.com/access/content/coogan-brief-4e-student-resources/coogan-brief-4e-chapter-6-summary"
  hayes7:
    short: "Hayes, lecture 7"
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145, lecture 7 transcript"
    class: "Unclassed"
    access: "University courseware, open"
    pending: "University lecture transcript: the policy names no class for it; year is not on the page."
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-7"
  hayes8:
    short: "Hayes, lecture 8"
    full: "Christine Hayes, Introduction to the Old Testament (Hebrew Bible), Open Yale Courses RLST 145, lecture 8 transcript"
    class: "Unclassed"
    access: "University courseware, open"
    pending: "University lecture transcript: the policy names no class for it; year is not on the page."
    url: "https://oyc.yale.edu/religious-studies/rlst-145/lecture-8"
  eerdmans:
    short: "Eerdmans Dictionary 2000"
    full: "Eerdmans Dictionary of the Bible, ed. David Noel Freedman (Eerdmans, 2000)"
    class: "Reference"
    access: "Google Books snippet"
    pending: "Google Books snippet: the surrounding page was not confirmed readable; entry title and author not visible."
    url: "https://books.google.com/books?id=qRtUqxkB7wkC&pg=PA441&q=exodus+%22no%22+evidence+archaeological+Egyptian+historicity+scholars"
  collins:
    short: "Collins 2019"
    full: "John J. Collins, Introduction to the Hebrew Bible, 3rd ed., The Torah/Pentateuch (Fortress Press, 2019)"
    class: "Reference"
    access: "Google Books snippet"
    pending: "Google Books snippet: the surrounding page was not confirmed readable."
    url: "https://books.google.com/books?id=Qu49DwAAQBAJ&pg=PA122&q=Sargon"

statements:
  - id: evidence
    core: true
    group: "The evidence outside the Bible"
    question: "Is there evidence for the Exodus outside the Bible?"
    short: "Nothing recovered relates directly to it."
    text: "More than a century of work by archaeologists and Egyptologists has recovered nothing that relates directly to the Exodus account of a stay in Egypt and an escape, or of a large-scale migration through Sinai. The archaeological evidence from Egypt and Sinai is all negative."
    cites:
      - source: meyers
        locator: "p. 5"
        quote: "After more than a century of research and the massive efforts of generations of archaeologists and Egyptologists, nothing has been recovered that relates directly to the account in Exodus of an Egyptian sojourn and escape or of a large-scale migration through Sinai."
      - source: meyers
        locator: "p. 6"
        quote: "The archaeological evidence from Egypt and Sinai is all negative."
      - source: coogan
        locator: "section “Exodus and History”"
        quote: "no direct historical corroboration for the events in Exodus have been found."
      - source: hayes7
        locator: "transcript"
        quote: "Well, no, there isn't any direct evidence outside the Bible"
      - source: eerdmans
        locator: "p. 441"
        quote: "In fact, there is no contemporary reference or description in any extrabiblical source."
  - id: moses
    group: "The evidence outside the Bible"
    question: "Is Moses mentioned outside the Bible?"
    short: "No text found in Egypt mentions him."
    text: "No text discovered in Egypt mentions Moses or Aaron."
    cites:
      - source: meyers
        locator: "p. 6"
        quote: "no texts ever discovered in Egypt mention Moses or Aaron"
      - source: hayes7
        locator: "transcript"
        quote: "There's no Egyptian record of the biblical Moses, no record of plagues, no record of a defeat of Pharaoh's army."
      - source: coogan
        locator: "section “Exodus and History”"
        quote: "the abundant Egyptian historical records recount no mention of these events or figures."
  - id: history
    group: "How scholars read the account"
    question: "Do scholars read the Exodus account as history?"
    short: "Most have not read biblical narrative as straightforward history for over a century."
    text: "For more than a century most biblical scholars have recognized that biblical narratives cannot be read as straightforward history."
    cites:
      - source: meyers
        locator: "p. 4"
        quote: "As most biblical scholars have done for more than a century, they recognize that biblical narratives cannot be read as straightforward history."
  - id: kernel
    group: "How scholars read the account"
    question: "Did some kind of exodus happen?"
    short: "Many scholars think some history is preserved."
    text: "Many scholars still think that some genuine history is preserved in Exodus. The chapter summary for Coogan and Chapman's introductory textbook holds that the accounts may not preserve the details accurately, but that some sort of exodus occurred in Israel's history."
    cites:
      - source: coogan
        locator: "section “Exodus and History”"
        quote: "many scholars still think that there is some genuine history preserved in Exodus."
      - source: coogan
        locator: "section “Implications for Our Study”"
        quote: "Although the accounts of the Exodus may not preserve the historical details of this event accurately, it certainly appears that some sort of exodus occurred in Israel’s history."
  - id: sargon
    group: "The story's literary background"
    question: "Where does the story of Moses's birth come from?"
    short: "It is paralleled by the birth story of Sargon of Akkad."
    text: "Many scholars have pointed out that the story of Moses's birth is paralleled by the birth story of Sargon of Akkad (c. 2300 BCE), whose mother also placed him in a vessel of reeds in a river."
    cites:
      - source: hayes7
        locator: "transcript"
        quote: "Many scholars have pointed out that this story in particular is paralleled by the birth story of a great Akkadian king, Sargon, from about 2300 BCE, Sargon of Akkad."
      - source: collins
        locator: "p. 122"
        quote: "Sargon of Akkad (c. 2300 b.c.e.), whose mother also placed him in a vessel of reeds in a river."
  - id: song
    group: "The story's literary background"
    question: "What is the oldest account of the event?"
    short: "A poetic fragment in Exodus 15:1–12."
    text: "The oldest account of the event at the sea is widely agreed to be a poetic fragment in Exodus 15:1–12."
    cites:
      - source: hayes8
        locator: "transcript"
        quote: "One thing that most people do in fact agree on is that the oldest account of the event is a poetic fragment that's found in Exodus 15, verses one to 12, in particular."

# Prototype-only: how the show's wording fared against the readable sources.
ledger:
  - show: "“most scholars, the overwhelming majority of critical scholars” say the Exodus as told is entirely implausible (Ep 21); it “did not happen” (Ep 116)"
    page: "Most scholars do not read biblical narrative as straightforward history. Many think some history is preserved."
    result: "Weaker"
    why: "No readable source attaches “consensus”, “most scholars” or “overwhelming majority” to “did not happen”. One source says some sort of exodus occurred, so the page has to carry that."
  - show: "No archaeological evidence or records of any kind outside the Bible (Ep 75, Ep 97)"
    page: "Nothing recovered relates directly to the account; the evidence from Egypt and Sinai is all negative."
    result: "Sourced"
    why: "Five quotes from four sources. One source (Meyers) is Scholarly and fully open; it alone carries the statement."
  - show: "No evidence for the existence of a Moses like the one in Exodus (Ep 21)"
    page: "No text discovered in Egypt mentions Moses or Aaron."
    result: "Narrower"
    why: "Sources speak of Egyptian records only. None says “no evidence” outright."
  - show: "Scholars have “long recognized” the birth story is “modeled on” the Sargon text (Ep 105)"
    page: "Many scholars have pointed out it is “paralleled by” the Sargon birth story."
    result: "Weaker, unsettled sources only"
    why: "Rests on a lecture transcript and a snippet. If neither counts, the statement is cut."
  - show: "Exodus 15 is among “the earliest parts in the Hebrew Bible” (Ep 116)"
    page: "The oldest account of the sea event is a fragment in Exodus 15:1–12."
    result: "Narrower, unsettled source only"
    why: "The source speaks of the oldest account of this event, not of the oldest text in the Hebrew Bible."

cut:
  - "Any “consensus” or “overwhelming majority” wording about whether the Exodus happened."
  - "“There is no evidence Moses existed.”"
  - "The Egyptian origin of the name Moses (Ep 21): not researched, so not on the page."
  - "A small group of escaped slaves as the historical kernel (Ep 21): no readable source found for that specific picture."
  - "The reasons scholars give for not reading the narrative as history. The policy requires them after a “most scholars” statement, and no quote read supplies them."
---
