# Consensus claims in the Transcripts: inventory

Research for [#77](https://github.com/markgoho/dod-db/issues/77), child of map [#76](https://github.com/markgoho/dod-db/issues/76). Throwaway branch `research/consensus-claims-inventory`; not for merge.

Question: what claims about scholarly consensus do Hosts and Guest Speakers make across the final Transcripts, and which subjects have enough repeated, explicit claims to anchor a synthesis page?

## Answer in short

- About **460 claims** (461 listed) found in **145 of 189 Episodes**. This is a floor, not a census (see "Not covered").
- **Dan McClellan makes 390 of them (85%).** Dan Beecher 12. Guest Speakers 59, spread over 20 people.
- Most claims are hedged majority statements ("most scholars would say"), not "the consensus is". By strength: 70 consensus, 243 majority, 49 no evidence, 63 contested, 12 minority view, 24 asserted without a marker.
- Claims are wide and shallow. 356 claims fall into 32 subject clusters; the other 105 are one-off remarks on 91 subjects.
- **Ten clusters can anchor a page**: the core thesis recurs in 5-10 Episodes, with explicit claims and one statable thesis. About a dozen more could carry a short page. Ranked list is under "Findings".
- The map's own example is thin as stated. Two claims say there is no evidence for a historical Moses: Ep 21 (McClellan, who allows a possible historical kernel; found only by a targeted follow-up search, not the keyword pass) and Ep 105 (a Guest Speaker; the quote names Moses only through the Host's follow-up question on the next line). No line found has a Speaker saying "the consensus is that Moses never existed". The Exodus as an event is better covered (5 Episodes). A page would have to be "Moses and the Exodus", not "Moses".

## Method

1. Corpus: the 189 Transcripts listed in `data/processed-videos.json` (`transcriptPath`), Episode Numbers 1-189, taken from that file's `episodeNumber`. No `-raw.txt` files. Three non-raw files in `data/transcripts/` are not in the JSON and were excluded: `2025-12-29-shiny-happy-people.txt` (an unmapped second file with the same title as Ep 143; its content differs from the mapped file) and the two `2026-04-26-is-the-kjv-crap-sentences*.txt` diagnostics.
2. Keyword pass: a scratch Bun script matched every Transcript line against seven pattern families: `consensus`; quantifier + scholars/scholarship/historians/archaeologists (most, many, majority of, vast majority, virtually all, few, critical, mainstream, some); `scholars` + verb (agree, think, would say, date, argue); `scholarly consensus/view`, `academic consensus`, majority/minority view; `the data indicate/suggest/show/do not`, `no evidence/data/indication`; `widely/generally/usually accepted/agreed/dated/considered`; and historicity/authorship wording (`historical figure`, `never existed`, `pseudepigraph`, `forger`, `didn't write`, `not written by`). Result: 677 hit lines in 165 Episodes.
3. Reading pass: every hit line was read with its preceding line and its Segment label. Unclear referents ("it", "this story") were resolved by opening the Transcript. Each hit became zero, one, or several claims. The reading was split across four parallel agent passes, then reviewed as one list.
4. Inclusion rule: a claim is a statement about what scholars collectively hold, or what the data collectively show, about a nameable subject. Excluded: adjective uses ("scholarly book"), a single named scholar's opinion, a Speaker's personal view with no appeal to scholars or data, statements about what Christians, tradition, or apologists think.
5. Verification: every quote in this file was machine-checked, after the file was written, as an exact substring of one line of that Episode's Transcript, and the Speaker was compared with that line's label. 0 failures.
6. One claim (Ep 21, Moses) was added by a targeted follow-up search outside the keyword pass. It is marked in its paraphrase.
7. Grouping into clusters is this document's judgment, made after the fact. Episode counts per cluster depend on it; the ranked list below therefore quotes counts for each cluster's core subjects only.

Strength labels:

- **consensus**: Speaker says consensus, scholars agree, virtually all, overwhelming majority.
- **majority**: most, many, the majority, generally, widely.
- **no evidence**: "no data", "no evidence", "the data do not support".
- **contested**: Speaker says there is no consensus, or scholars are split, or only "some scholars" hold it.
- **minority view**: Speaker flags the view as a minority or fringe position.
- **asserted**: stated flatly as fact, in a line caught by the keyword pass, with no appeal to scholars or data in the quote.

## Findings

### All clusters, by distinct Episodes

Whole-cluster counts, including loosely related subjects filed under the cluster. Sorted by Episodes, then by consensus + no-evidence count. "Guest" = claims by Guest Speakers.

| #   | Subject cluster                                              | Type                   | Episodes | Claims | Consensus | Majority | No evidence | Contested | Minority | Asserted | Guest |
| --- | ------------------------------------------------------------ | ---------------------- | -------- | ------ | --------- | -------- | ----------- | --------- | -------- | -------- | ----- |
| 1   | Historical Jesus and mythicism                               | Figures                | 12       | 22     | 6         | 8        | 2           | 3         | 3        | 0        | 2     |
| 2   | Gospels and Acts: dating, order, authorship, sources         | Texts                  | 12       | 27     | 2         | 16       | 0           | 8         | 0        | 1        | 12    |
| 3   | Pauline letters: authorship (Pastorals and disputed letters) | Texts                  | 10       | 22     | 8         | 7        | 0           | 3         | 0        | 4        | 2     |
| 4   | New Testament text: later additions and interpolations       | Texts                  | 10       | 15     | 2         | 9        | 0           | 2         | 0        | 2        | 1     |
| 5   | Yahweh: origins, name, and early Israelite religion          | Figures                | 9        | 21     | 3         | 11       | 3           | 3         | 1        | 0        | 0     |
| 6   | Pentateuch: authorship, sources, dating                      | Texts                  | 9        | 18     | 1         | 7        | 2           | 2         | 1        | 5        | 6     |
| 7   | David, Saul, and the United Monarchy                         | Figures                | 8        | 15     | 2         | 8        | 1           | 4         | 0        | 0        | 3     |
| 8   | Genesis creation accounts                                    | Texts                  | 8        | 11     | 2         | 9        | 0           | 0         | 0        | 0        | 1     |
| 9   | Moses and the Exodus                                         | Events                 | 7        | 15     | 4         | 5        | 6           | 0         | 0        | 0        | 5     |
| 10  | Israelite origins, the conquest, and Jericho                 | Events                 | 7        | 12     | 3         | 4        | 3           | 1         | 1        | 0        | 3     |
| 11  | Child sacrifice and Molech                                   | Events                 | 6        | 11     | 1         | 2        | 4           | 2         | 0        | 2        | 1     |
| 12  | Hebrew Bible text: Masoretic Text and Septuagint             | Texts                  | 6        | 12     | 1         | 10       | 0           | 1         | 0        | 0        | 0     |
| 13  | Flood narrative and Noah                                     | Texts                  | 6        | 10     | 0         | 8        | 1           | 0         | 0        | 1        | 1     |
| 14  | Asherah and Yahweh's consort                                 | Figures                | 6        | 8      | 0         | 7        | 0           | 1         | 0        | 0        | 1     |
| 15  | Dead Sea Scrolls and Qumran                                  | Texts                  | 5        | 10     | 2         | 6        | 0           | 2         | 0        | 0        | 4     |
| 16  | 1 Enoch, Jubilees, and pseudepigraphy                        | Texts                  | 5        | 11     | 1         | 7        | 0           | 1         | 0        | 2        | 0     |
| 17  | Deuteronomy and Josiah's reform                              | Texts                  | 5        | 9      | 1         | 8        | 0           | 0         | 0        | 0        | 0     |
| 18  | Covenant Code and biblical law                               | Texts                  | 5        | 9      | 0         | 8        | 0           | 0         | 1        | 0        | 0     |
| 19  | Birth of Jesus: Bethlehem, infancy narratives, virgin birth  | Events                 | 4        | 10     | 2         | 3        | 4           | 0         | 1        | 0        | 1     |
| 20  | Revelation: date, author, 666, persecution                   | Texts                  | 4        | 14     | 4         | 6        | 1           | 2         | 1        | 0        | 3     |
| 21  | Isaiah: authorship and the prophet                           | Texts                  | 4        | 11     | 4         | 5        | 0           | 2         | 0        | 0        | 1     |
| 22  | Gospel of John: composition                                  | Texts                  | 4        | 10     | 3         | 4        | 0           | 2         | 1        | 0        | 5     |
| 23  | Catholic Epistles: authorship (James, Peter, Jude)           | Texts                  | 4        | 16     | 2         | 9        | 0           | 2         | 1        | 2        | 0     |
| 24  | Patriarchs (Abraham, Isaac, Jacob)                           | Figures                | 3        | 6      | 1         | 1        | 0           | 3         | 0        | 1        | 0     |
| 25  | Daniel: date and composition                                 | Texts                  | 3        | 6      | 1         | 4        | 0           | 1         | 0        | 0        | 0     |
| 26  | Psalms and Song of Songs: authorship                         | Texts                  | 3        | 4      | 1         | 0        | 0           | 0         | 0        | 3        | 0     |
| 27  | Religion as a modern category                                | Doctrines and concepts | 3        | 3      | 0         | 3        | 0           | 0         | 0        | 0        | 1     |
| 28  | Creation ex nihilo                                           | Doctrines and concepts | 2        | 5      | 2         | 2        | 0           | 0         | 0        | 1        | 0     |
| 29  | Cult prostitution                                            | Doctrines and concepts | 2        | 3      | 0         | 1        | 2           | 0         | 0        | 0        | 0     |
| 30  | Seeing the face of God                                       | Doctrines and concepts | 2        | 2      | 0         | 1        | 0           | 1         | 0        | 0        | 0     |
| 31  | Easter origins                                               | Doctrines and concepts | 1        | 5      | 0         | 1        | 4           | 0         | 0        | 0        | 0     |
| 32  | Junia                                                        | Figures                | 1        | 3      | 2         | 0        | 1           | 0         | 0        | 0        | 0     |

### Subjects that can anchor a page, ranked

Counts here are for the core thesis only (peripheral subjects in the cluster left out), so they are lower than the table. Ranking weighs core Episodes, the share of consensus and no-evidence strength, and whether the material reduces to one thesis. It is a judgment.

1. **Pauline letters: authorship.** 10 Episodes, 21 claims, 7 consensus strength (the most of any subject). The Pastorals alone: 7 Episodes, 12 claims. One clean thesis: Paul did not write the Pastorals; seven letters are undisputed; Ephesians, Colossians, 2 Thessalonians are disputed with a weaker consensus. The show itself grades the strength (Ep 35, Ep 138).
2. **Historical Jesus and mythicism.** 8 Episodes, 15 claims, 5 consensus. Explicit and repeated: Jesus existed, mythicism is fringe, the Testimonium Flavianum has an authentic core. Hosts and two Guest Speakers agree. (The cluster's 12 Episodes include side remarks on the baptism, ministry length, and Jesus's trade.)
3. **Moses and the Exodus.** 6 Episodes, 9 claims, every one consensus or no-evidence strength, from both Hosts and two Guest Speakers. Strong for the Exodus, plagues, and wilderness period; Moses himself has two claims.
4. **Yahweh: origins, name, early Israelite religion.** 8 Episodes, 18 claims, all from Hosts. Good material (Shasu of Yhw, Yahweh and El distinct, Deuteronomy 32:8), but the show marks several points as under discussion. A page must carry that hedging.
5. **New Testament text: later additions.** 8 Episodes, 10 claims. Repeated and explicit: about 16 verses are not original; the ending of Mark; the Pericope Adulterae; 1 Corinthians 14:34-35.
6. **Gospels: dating and order.** 8 Episodes, 14 claims, 10 of them majority strength, 5 from Guest Speakers. Mark first, around 70 CE, is solid. Gospel authorship and Q are a separate, thinner set (6 Episodes, 10 claims, no consensus-strength wording). Mostly dating claims, so this may feed the timeline concept more than a consensus page.
7. **Pentateuch: authorship, sources, dating.** 7 Episodes, 15 claims. Clear thesis (not Moses, not one author, mid-first-millennium BCE), but 5 claims are asserted without a marker, 5 come from Guest Speakers, and the source model itself is flagged as contested (Ep 22, Ep 187).
8. **Israelite origins, the conquest, and Jericho.** 5 Episodes, 9 claims, 3 consensus and 3 no evidence. Explicit consensus wording (Ep 116) that Israel emerged within Canaan; conquest not supported archaeologically. Natural merge with item 3 into one page.
9. **David, Saul, and the United Monarchy.** 6 Episodes, 11 claims. Repeated, but the show's claims partly conflict: "probably a historical David" (Ep 181) against "split" on whether there was any historical Saul, David or Solomon (Ep 154). A page would state a divided field, not a consensus.
10. **Child sacrifice and Molech.** 6 Episodes, 10 claims. Two stable claims: Exodus 22:29 originally commanded firstborn sacrifice; no material evidence it was practiced. Molech-as-sacrifice-type is called a shifting consensus (Ep 21) and later asserted flatly (Ep 132, Ep 139).

### Enough for a short page, or a section of a larger one

Explicit claims, but concentrated in 2-5 Episodes or dependent on one Episode. Counts are core-subject counts.

- **Revelation** (4 Episodes, 9 claims, 4 consensus): 90s CE under Domitian, not by the author of John, 666 is Nero.
- **Catholic Epistles** (4 Episodes, 9 claims): James, Jude, 1-2 Peter pseudepigraphic. Natural partner to ranked item 1 as a "who wrote the New Testament letters" page.
- **Isaiah authorship** (2 Episodes, 8 claims, 4 consensus; mostly Ep 43): chapters 40-66 are not eighth-century.
- **Birth of Jesus** (3 Episodes, 8 claims; mostly Ep 141): Nazareth not Bethlehem; virgin birth a later accretion; Isaiah 7:14.
- **Asherah and Yahweh's consort** (5 Episodes, 6 claims, no consensus-strength wording).
- **Flood narrative and Noah** (5 Episodes, 6 claims, no consensus-strength wording): two sources; flood secondary to the Primeval History.
- **Deuteronomy and Josiah's reform** (4 Episodes, 6 claims): seventh century, modeled on Esarhaddon's vassal treaty.
- **Covenant Code** (4 Episodes, the same claim each time: earliest legislation in the Hebrew Bible).
- **Genesis creation accounts** (2 Episodes, Ep 1 and Ep 22; the cluster's 8 Episodes are mostly other Genesis remarks).
- **Creation ex nihilo** (2 Episodes, but the most explicit wording in the corpus: "the academic consensus is").
- **Daniel** (2 Episodes; the consensus date, 167-164 BCE, is stated once, Ep 34).
- **Gospel of John composition** (3 Episodes, 7 claims, 5 from Guest Speakers).
- **Dead Sea Scrolls and Qumran**, **1 Enoch and Jubilees**, **Masoretic Text and Septuagint** (5-6 Episodes each as clusters, but each is a bundle of unrelated small claims, not one thesis).

### Passing remarks only

- The 105 one-off claims on 91 subjects, listed under "Other ...: passing remarks" in each section. Typical: Behemoth, Lilith, Gehenna as a garbage dump, the Eye of the Needle gate, the Shroud of Turin.
- One-Episode subjects with strong wording: Junia (3 claims, Ep 16), Easter origins (5 claims, Ep 5), cult prostitution (Ep 125, Ep 126).
- The map's guide concept names univocality, inerrancy, and inspiration. The keyword pass found **no** consensus-framed claim on any of the three, although `data/processed-videos.json` tags Univocality in 41 Episodes and Inerrancy in 29. Likewise Satan (tagged in 54 Episodes), hell (70), and Trinity (24) produced at most a stray remark. Either the show argues these rather than citing a consensus, or it states the consensus without marker words; this inventory cannot tell which. See "Not covered".

### Patterns worth knowing before building pages

- One voice. 85% of claims are McClellan's. A page "triggered by claims made on the show" is in practice triggered by McClellan's reading of the field. Guest Speakers mostly speak to their own specialties.
- The show hedges. Consensus strength is 15% of claims. McClellan often separates a strong consensus from a mere majority (Pastorals vs. Ephesians, Ep 138) and says when he holds a minority view himself (Psalm 82 dating and Matthew 21, both Ep 57). Pages should keep the strength the Speaker gave.
- Claims drift. Molech goes from "shifting, not yet overwhelming" (Ep 21) to flat assertion (Ep 132, Ep 139). David goes from "split" (Ep 154) to "probably historical" (Ep 181). A refresh loop would need to track this.
- Many claims are dating claims (Mark, Luke, Acts, Revelation, Daniel, Deuteronomy, Isaiah 40-66, Jubilees, 1 Enoch, 2 Peter, Pentateuch). They overlap with the dating-claims inventory the timeline concept is waiting on.

# Inventory

## Figures

### Historical Jesus and mythicism

22 claims across 12 Episodes (5, 37, 43, 48, 49, 81, 86, 87, 140, 143, 144, 145). Strength: 6 consensus, 8 majority, 2 no evidence, 3 contested, 3 minority view, 0 asserted. 2 from Guest Speakers.

- Ep 5 · Dan McClellan (Host) · majority · _Historical Jesus_: “What most scholars agree on is that there was an apocalyptic preacher who was talking about the kingdom of God and got executed by the Roman state.” [00:06:55]
  - Claim: Most scholars agree there was a historical Jesus: an apocalyptic preacher of the kingdom of God who was executed by the Roman state.
- Ep 5 · Dan McClellan (Host) · no evidence · _Dying-and-rising gods_: “But, but the idea that Jesus's death and resurrection is patterned after this template doesn't really have much data to support it.” [00:06:55]
  - Claim: The idea that Jesus's death and resurrection was patterned on a dying-and-rising god template has little data to support it.
- Ep 5 · Dan McClellan (Host) · minority view · _Jesus mythicism_: “It is in the overwhelming minority, the folks who think that this was all created from scratch.” [00:08:03]
  - Claim: The view that Jesus was invented from whole cloth (mythicism) is rejected by the overwhelming majority of scholars; it is an overwhelming minority position.
- Ep 5 · Dan McClellan (Host) · majority · _Dying-and-rising gods_: “So the framework of the dying and rising God is something that most scholars don't think means much today.” [00:08:55]
  - Claim: Most scholars today think the "dying and rising god" framework has little analytical value.
- Ep 37 · Dan McClellan (Host) · no evidence · _Jesus mythicism_: “Although again, the data don't remotely support the notion that. That any such idea existed anciently.” [00:39:38]
  - Claim: The data do not support the mythicist claim that an ancient tradition of the sun dying for three days and rising on a cross existed and inspired the Jesus story.
- Ep 43 · Dan McClellan (Host) · majority · _Jesus' occupation (tekton)_: “And this is why a lot of scholars think that Jesus wouldn't have been a carpenter, but a stone mason or something like that, because the wood would have been at quite a premium.” [00:27:43]
  - Claim: Many scholars think Jesus would have been a stone mason rather than a carpenter because wood was scarce.
- Ep 48 · Helen Bond (Guest Speaker) · consensus · _Historical Jesus_: “I would say in terms of scholars, probably less than 5%, you know, 1%, 2%, something like that, they'd be considered very much a fringe view” [00:05:30]
  - Claim: Virtually all scholars accept that Jesus existed; denying it is a fringe view held by perhaps 1-2%.
- Ep 49 · Candida Moss (Guest Speaker) · majority · _Historical Jesus_: “I think, like many scholars, I'm pretty skeptical about the exact extent to which we can speak about Jesus of Nazareth, who he was and what he did.” [00:47:35]
  - Claim: Many scholars are skeptical about how much can be known about who Jesus of Nazareth was and what he did.
- Ep 81 · Dan McClellan (Host) · majority · _Jesus' name (Yeshua)_: “even though many scholars think that in first century CE Galilee, the ayin on the end, which was an ayin, probably wouldn't have been pronounced” [00:48:43]
  - Claim: Many scholars think the final ayin of Yeshua was not pronounced in first-century Galilee (so roughly 'Yeshu').
- Ep 86 · Dan McClellan (Host) · consensus · _Testimonium Flavianum_: “So pretty much everybody agrees this is definitely not authentic, definitely not entirely authentic. It may be in part authentic.” [00:48:05]
  - Claim: Virtually everyone agrees the Testimonium Flavianum as it stands is not (entirely) authentic to Josephus.
- Ep 86 · Dan McClellan (Host) · consensus · _Testimonium Flavianum_: “So the consensus view is that it originates in some authentic reference to Jesus on Josephus's part that was then elaborated on and added to by later Christian transcribers of the text.” [00:49:07]
  - Claim: The consensus is that the Testimonium goes back to an authentic Josephan reference to Jesus that Christian scribes later elaborated, though some argue it is wholly forged.
- Ep 86 · Dan McClellan (Host) · minority view · _Jesus mythicism_: “I think the, the only scholar who's actually got training related to the New Testament who would call themselves a mythicist is Robert Price” [00:54:14]
  - Claim: Mythicism is a fringe position; Robert Price is the only self-identified mythicist with training in New Testament studies.
- Ep 86 · Dan McClellan (Host) · consensus · _Historical Jesus_: “the overwhelming majority of scholars agree that it is more likely that a historical Jesus existed.” [00:56:01]
  - Claim: The overwhelming majority of scholars agree it is more likely than not that a historical Jesus existed.
- Ep 87 · Dan McClellan (Host) · consensus · _Historical Jesus_: “I think critical scholars would agree that the historical Jesus probably came from Nazareth and was known to come from Nazareth.” [00:26:39]
  - Claim: Critical scholars agree the historical Jesus probably came from Nazareth and was known to come from there.
- Ep 140 · Dan McClellan (Host) · majority · _Testimonium Flavianum_: “I think the majority of scholars still would suggest that there was a historical core to that that was actually in Josephus's writings, but that they just expanded on it.” [00:23:37]
  - Claim: The majority of scholars hold that the Testimonium Flavianum has an authentic Josephan core that was later expanded by Christian writers.
- Ep 140 · Dan McClellan (Host) · minority view · _Testimonium Flavianum_: “And it has has not convinced the majority of scholars, and it's not going to convince the majority of scholars.” [00:26:40]
  - Claim: The argument (T. C. Schmidt) that the Testimonium Flavianum is entirely authentic has not convinced the majority of scholars.
- Ep 143 · Dan McClellan (Host) · contested · _Historical Jesus_: “And I and other scholars think that the historical Jesus had no idea he was going to die” [00:21:47]
  - Claim: Some scholars (including McClellan) think the historical Jesus did not expect to die, and the passion predictions are post-mortem reinterpretation.
- Ep 143 · Dan McClellan (Host) · majority · _Length of Jesus's ministry_: “you have to just ignore the fact that most scholars think there was no additional Passover in the Synoptics.” [00:56:02]
  - Claim: Most scholars think the Synoptics contain no additional Passover: they present a roughly one-year ministry, contradicting John's three years.
- Ep 144 · Dan Beecher (Host) · consensus · _John the Baptist_: “the fact that there was a John the Baptist and he was put to death by a Herod is multiply attested and is widely accepted by scholars.” [00:04:05]
  - Claim: That John the Baptist existed and was put to death by a Herod is multiply attested and widely accepted by scholars.
- Ep 145 · Dan Beecher (Host) · majority · _Baptism of Jesus_: “But a lot of scholars think this is probably historical. We've got that embarrassment criterion that why else would they have Jesus subordinating himself to another claimant to this messenger from God role?” [00:05:46]
  - Claim: A lot of scholars think Jesus's baptism by John is probably historical, on the criterion of embarrassment.
- Ep 145 · Dan Beecher (Host) · contested · _Baptism of Jesus_: “we have some interesting things in the letters of Paul that suggest to some scholars that the story is being crafted with, uh, with this notion of, uh, baptism being an adoption” [00:23:03]
  - Claim: Some scholars see the baptism story as crafted around the Pauline notion of baptism as adoption.
- Ep 145 · Dan McClellan (Host) · contested · _Baptism of Jesus_: “It's, in some scholars argue, it's the point of the act of divinization. It is the endowment of Jesus with the messiahship” [00:33:51]
  - Claim: Some scholars argue the baptism is the point at which Jesus is divinized / endowed with messiahship.

### Yahweh: origins, name, and early Israelite religion

21 claims across 9 Episodes (1, 7, 19, 45, 57, 58, 66, 124, 154). Strength: 3 consensus, 11 majority, 3 no evidence, 3 contested, 1 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 1 · Dan McClellan (Host) · majority · _Divine council_: “And most scholars would suggest that this is a vestigial reference to the divine council, that creation is something that is overseen and supervised by this deliberative body of deities.” [00:13:47]
  - Claim: Most scholars see the plural "let us make" of Genesis 1:26 as a vestigial reference to the divine council.
- Ep 1 · Dan McClellan (Host) · no evidence · _Yahweh origins_: “The name Adonai is not known from any pantheon at all. That deity is totally unknown to the rest of the world of ancient Southwest Asia.” [00:47:37]
  - Claim: The divine name Yahweh is not attested in any other pantheon of ancient Southwest Asia.
- Ep 1 · Dan McClellan (Host) · consensus · _Yahweh origins_: “And the scholarly consensus is that this is probably the precursor to the divine name Adonai.” [00:56:29]
  - Claim: The scholarly consensus is that the "Shasu of Yhw" toponym in 14th-century BCE Egyptian inscriptions is probably the precursor of the divine name Yahweh.
- Ep 1 · Dan McClellan (Host) · consensus · _Divine name YHWH etymology_: “The scholarly consensus is that the divine name is probably based in some way on this verbal root that means to be.” [00:57:30]
  - Claim: The scholarly consensus is that the divine name YHWH is probably based on the verbal root "to be".
- Ep 1 · Dan McClellan (Host) · contested · _Yahweh origins_: “And so there's a discussion going on right now within the scholarship about what this tells us about the origins of one, the divine name, and two, the deity Adonai.” [00:57:30]
  - Claim: What the Shasu-land name implies for the origins of the divine name and of the deity Yahweh is under active scholarly discussion.
- Ep 1 · Dan McClellan (Host) · minority view · _Divine name YHWH etymology_: “So there were a lot of Latter Day Saints who were tickled by that theory, but that's not really the consensus view anymore.” [00:58:34]
  - Claim: Frank Moore Cross's causative reading of the divine name ("he who creates [hosts]") is no longer the consensus view.
- Ep 1 · Dan McClellan (Host) · majority · _Divine name YHWH etymology_: “But most scholars would say it's probably based on the verb to be.” [00:58:34]
  - Claim: Most scholars say the divine name YHWH is probably based on the verb "to be".
- Ep 7 · Dan Beecher (Host) · majority · _Yahweh origins_: “I, I think the data indicate that they merged probably between around 900 BCE.” [00:48:15]
  - Claim: The data indicate Yahweh and El were originally distinct deities who were merged (around 900 BCE).
- Ep 7 · Dan McClellan (Host) · majority · _Psalm 82 dating_: “There are a lot of scholars who date this very, very early, suggest this may predate the conflation of Adonai and El.” [00:53:48]
  - Claim: Many scholars date Psalm 82 very early, possibly before the conflation of Yahweh and El.
- Ep 19 · Dan McClellan (Host) · no evidence · _Early Israelite polytheism / monotheism_: “This idea that monotheism was just a nuclear bomb that just totally revolutionized the world and there's absolutely no indication that any such thing whatsoever happened.” [00:38:01]
  - Claim: There is no evidence that monotheism arrived as a sudden revolution; it developed through incremental elaborations.
- Ep 45 · Dan McClellan (Host) · majority · _Deuteronomy 32:8_: “But some scholars were like, you know, the Septuagint translators like to take gods or sons of God and render it angels of God.” [00:48:59]
  - Claim: Scholars inferred that Deuteronomy 32:8 originally read 'sons of God' because the Septuagint translators render that phrase as 'angels of God'.
- Ep 57 · Dan McClellan (Host) · majority · _Psalm 82 dating_: “I was with the majority of scholars who saw Psalm 82 as one of the oldest texts in the Hebrew Bible.” [00:42:53]
  - Claim: The majority of scholars see Psalm 82 as one of the oldest texts in the Hebrew Bible (McClellan argues it is post-exilic).
- Ep 58 · Dan McClellan (Host) · contested · _Genesis 20:13 (plural verb with Elohim)_: “Which some scholars think probably makes a little better sense if this tradition is coming from very early in the history of Israel. And others think, no, it's. It's just some kind of harmonization.” [00:29:01]
  - Claim: Scholars are split on whether the plural verb with Elohim in Genesis 20:13 reflects early plural 'gods' or mere harmonization.
- Ep 58 · Dan McClellan (Host) · consensus · _Deuteronomy 32:8_: “And scholars have long known they like to translate the phrase sons of God as angels of God.” [00:32:18]
  - Claim: Scholars have long recognized that the Septuagint renders 'sons of God' as 'angels of God', pointing to an original 'sons of God' in Deuteronomy 32:8.
- Ep 66 · Dan McClellan (Host) · majority · _Tetragrammaton pronunciation_: “And by the way, I say Adonai, most scholars pronounce it Y, A, H, W, E, H.” [00:42:35]
  - Claim: Most scholars pronounce the divine name as Yahweh.
- Ep 66 · Dan McClellan (Host) · no evidence · _Yahweh origins_: “Israel is a people, but there's no indication that Adonai is their deity.” [00:44:58]
  - Claim: The Merneptah inscription attests Israel as a people around 1208 BCE but gives no indication that Yahweh was their deity.
- Ep 66 · Dan McClellan (Host) · majority · _Yahweh origins_: “Most scholars think this has some kind of relationship to the divine name.” [00:46:10]
  - Claim: Most scholars think the Egyptian 'Shasu of Yhw' references are related to the divine name.
- Ep 66 · Dan McClellan (Host) · majority · _Yahweh origins_: “And I think many scholars would say if there is a relationship, then whoever occupied this land or whoever bore this name probably named their deity after the land or the people” [00:46:10]
  - Claim: Many scholars would say a group named for that land/people named their deity after it and brought Yahweh into the northern hill country of Israel.
- Ep 66 · Dan McClellan (Host) · contested · _Yahweh origins_: “in my opinion, and in the opinion of some scholars, certainly not all scholars, but I think probably started out as an ancestral deity” [00:50:55]
  - Claim: Some but not all scholars think Yahweh began as an ancestral deity.
- Ep 124 · Dan McClellan (Host) · majority · _Yahweh origins_: “Deuteronomy 32:8-9, I and many other scholars think, preserves an early understanding of Adonai as one of the Bene Elohim, as one of the children of God.” [00:47:29]
  - Claim: Many scholars think Deuteronomy 32:8-9 preserves an early view of Yahweh as one of the sons of God, distinct from and subordinate to Elyon.
- Ep 154 · Dan McClellan (Host) · majority · _Aniconism / idol polemic_: “a lot of scholars would suggest that just shows that the anti-idol polemic is a later developed thing, because we clearly have divine images from earlier periods in Israel and Judah.” [00:50:16]
  - Claim: Many scholars hold that the anti-idol polemic is a later development, since divine images are attested in earlier Israel and Judah.

### Asherah and Yahweh's consort

8 claims across 6 Episodes (2, 88, 117, 123, 163, 176). Strength: 0 consensus, 7 majority, 0 no evidence, 1 contested, 0 minority view, 0 asserted. 1 from Guest Speakers.

- Ep 2 · Francesca Stavrakopoulou (Guest Speaker) · majority · _Asherah_: “And most scholars are now agreed that this seems to index particular religious assumptions, that YHWH and Asherah were kind of like a divine pair” [00:13:11]
  - Claim: Most scholars now agree that the 8th-century BCE Hebrew inscriptions naming YHWH and Asherah together reflect a belief that they were a divine pair.
- Ep 88 · Dan McClellan (Host) · majority · _Asherah_: “it wouldn't surprise me or many other scholars if there were these things in the temple, because, like I said, we've got these inscriptions that talk about Adonai and his Asherah.” [00:35:00]
  - Claim: Many scholars would not be surprised if Asherah cult objects stood in the Jerusalem temple, given inscriptions naming Yahweh and his Asherah.
- Ep 117 · Dan McClellan (Host) · majority · _Elephantine temple_: “it seems like they were allowed to rebuild the temple. This is the conclusion of, I think, the majority of the scholars” [00:44:04]
  - Claim: The majority of scholars conclude the Judean temple at Elephantine was allowed to be rebuilt.
- Ep 117 · Dan McClellan (Host) · majority · _Elephantine Judean religion_: “worshiping Anat Adonai in an unauthorized temple just because of that isolation. That, that doesn't make as much sense to me or, or to most scholars.” [00:51:10]
  - Claim: Most scholars do not think the Elephantine community's worship of Anat-Yahweh in its own temple resulted from drifting away from an earlier monotheism through isolation.
- Ep 123 · Dan McClellan (Host) · majority · _Asherah_: “a lot of scholars will suggest that the reference to the prophets of Asherah is probably a later addition.” [00:15:42]
  - Claim: Many scholars suggest the reference to the prophets of Asherah in 1 Kings 18 is a later addition.
- Ep 123 · Dan McClellan (Host) · majority · _Asherah_: “to Asherah in a condemnatory way are dated by some scholars to the Deuteronomists—they're a Deuteronomistic layer, according to a number of scholars.” [00:24:10]
  - Claim: A number of scholars assign the prophetic books' condemnations of Asherah to a later Deuteronomistic layer.
- Ep 163 · Dan McClellan (Host) · contested · _Queen of Heaven_: “And there are some scholars who think that the Queen of Heaven is a reference to Asherah. But I'm going to say it's not.” [00:11:24]
  - Claim: The identity of Jeremiah's Queen of Heaven is debated; some scholars identify her with Asherah.
- Ep 176 · Dan McClellan (Host) · majority · _Anat-Yahu (Elephantine)_: “that refers to the Jewish God as Anat-Yahu, which is widely understood to refer to the divine pair.” [00:24:03]
  - Claim: The Elephantine reference to Anat-Yahu is widely understood to denote a divine pair, i.e. a consort of Yahweh.

### David, Saul, and the United Monarchy

15 claims across 8 Episodes (40, 52, 64, 67, 139, 154, 161, 181). Strength: 2 consensus, 8 majority, 1 no evidence, 4 contested, 0 minority view, 0 asserted. 3 from Guest Speakers.

- Ep 40 · Dan McClellan (Host) · majority · _Saul_: “And a lot of scholars would argue that this is written much later, and this is an effort to take some... Some vague, spotty social memories about this king back then” [00:53:37]
  - Claim: Many scholars argue the narrative of Saul's downfall was written much later, built on vague social memories of the king.
- Ep 52 · Dan McClellan (Host) · consensus · _David and Goliath_: “And so the scholarly consensus is that there was a story about a dude named Elhanan who killed this giant named Goliath.” [00:16:16]
  - Claim: The scholarly consensus is that an original story of Elhanan killing Goliath was later transferred to David.
- Ep 64 · Dan McClellan (Host) · majority · _United Monarchy / David_: “there's a theory that most scholars don't think there was ever a united kingdom, that is that there was a northern kingdom of Israel and then there was a southern kingdom of Judah.” [00:47:01]
  - Claim: Most scholars do not think there was ever a united kingdom; Israel and Judah were separate kingdoms.
- Ep 67 · Dan McClellan (Host) · contested · _United Monarchy / David_: “There's a lot of arguments within biblical scholarship about the historical David.” [00:25:52]
  - Claim: The historical David is much argued within biblical scholarship.
- Ep 67 · Aaron Higashi (Guest Speaker) · no evidence · _Saul_: “we have no archaeological, there's no epigraphic evidence for Saul. It's unlikely, I think, that we would ever discover some.” [00:27:24]
  - Claim: There is no archaeological or epigraphic evidence for Saul.
- Ep 67 · Aaron Higashi (Guest Speaker) · contested · _Books of Samuel dating_: “That's one of the reasons why biblical scholars date it to so many different times, because the texts can serve so many different rhetorical agendas.” [00:37:07]
  - Claim: Biblical scholars date the David narratives in Samuel to many different periods.
- Ep 67 · Aaron Higashi (Guest Speaker) · consensus · _Kingdoms of Israel and Judah_: “And so it seems to agree with the broader consensus that Israel is the main polity” [00:39:16]
  - Claim: The broader consensus is that the northern kingdom of Israel, not Judah, was the main polity.
- Ep 139 · Dan McClellan (Host) · majority · _United Monarchy / David_: “there was never a single united kingdom. Scholars are pretty sure that Judah in the south and Israel in the north were originally separate kingdoms.” [00:48:17]
  - Claim: Scholars are pretty sure there was never a single united kingdom; Judah and Israel were originally separate kingdoms.
- Ep 139 · Dan McClellan (Host) · contested · _United Monarchy / David_: “some scholars think that it is the memory of the Omrides that has been shifted to David to make it seem like David was really the one who expanded Israel the most” [00:56:27]
  - Claim: Some scholars think the memory of the Omride dynasty's expansion was transferred to David.
- Ep 154 · Dan McClellan (Host) · contested · _United Monarchy / David_: “And there are other scholars who will say, "No, there was never any historical Saul, Solomon, or David. " So we're a little split in that regard.” [00:04:07]
  - Claim: Critical scholars are split on whether there was any historical Saul, David or Solomon.
- Ep 161 · Dan McClellan (Host) · majority · _Death of Saul_: “I think most scholars would probably say the easier explanation is just that the Amalekite was lying.” [00:57:38]
  - Claim: Most scholars explain the conflicting accounts of Saul's death (1 Sam 31 vs 2 Sam 1) by saying the Amalekite was lying.
- Ep 161 · Dan McClellan (Host) · majority · _Death of Saul_: “I think most scholars would say the Amalekite's just making stuff up, but we don't really have enough background details” [00:58:18]
  - Claim: Most scholars say the Amalekite in 2 Samuel 1 is making up his account of killing Saul, rather than it being a contradictory tradition.
- Ep 181 · Dan McClellan (Host) · majority · _United Monarchy / David_: “And so what a lot of scholars think might be going on here is that the southern kingdom is not yet a kingdom. Judah is not a full fledged kingdom.” [00:42:09]
  - Claim: Many scholars think that at the time of the Tel Dan inscription Judah was not yet a full kingdom, just a dynastic 'house of David' in Jerusalem.
- Ep 181 · Dan McClellan (Host) · majority · _Tel Dan Stele_: “this is widely considered to be kind of indirect evidence, data supporting the historicity of David.” [00:42:09]
  - Claim: The Tel Dan Stele's 'house of David' is widely considered indirect evidence for the historicity of David.
- Ep 181 · Dan McClellan (Host) · majority · _United Monarchy / David_: “But I think most scholars would say, yeah, this leans us in the direction of concluding there was a historical David who began this dynasty.” [00:42:09]
  - Claim: Most scholars conclude there was probably a historical David who founded the Judahite dynasty.

### Patriarchs (Abraham, Isaac, Jacob)

6 claims across 3 Episodes (63, 121, 157). Strength: 1 consensus, 1 majority, 0 no evidence, 3 contested, 0 minority view, 1 asserted. 0 from Guest Speakers.

- Ep 63 · Dan McClellan (Host) · majority · _Patriarchs (Abraham, Isaac, Jacob)_: “A lot of scholars are pretty sure that these were three independently separated or circulating traditions that got woven together.” [00:07:22]
  - Claim: Many scholars hold the Abraham, Isaac and Jacob stories were three independent traditions later woven together.
- Ep 63 · Dan McClellan (Host) · contested · _Patriarchs (Abraham, Isaac, Jacob)_: “And some scholars think that Jacob is probably the earliest and that's probably the main tradition of Israel's origins.” [00:07:47]
  - Claim: Some scholars think the Jacob tradition is the earliest and the main tradition of Israel's origins.
- Ep 63 · Dan McClellan (Host) · contested · _Patriarchs (Abraham, Isaac, Jacob)_: “you'll recall I said some scholars think Jacob is the main charter myth for the nation of Israel” [00:21:26]
  - Claim: Some scholars think Jacob is the main charter myth for the nation of Israel.
- Ep 121 · Dan McClellan (Host) · consensus · _Patriarchal narratives_: “it is the consensus view that the stories of Abraham, the stories of Isaac, the stories of Jacob, all circulated independently of each other before being stitched together into the single lineage.” [00:13:48]
  - Claim: The consensus view is that the Abraham, Isaac and Jacob stories circulated independently before being joined into a single lineage.
- Ep 157 · Dan McClellan (Host) · asserted · _Patriarchs historicity_: “she's probably a literary creation, uh, not an actual historical person, just like Abram and Sarai are probably literary creations.” [00:03:56]
  - Claim: Hagar, like Abram and Sarai, is probably a literary creation rather than an actual historical person.
- Ep 157 · Dan McClellan (Host) · contested · _Hagar_: “And so some scholars would suggest that this was composed maybe after Exodus and in light of Exodus.” [00:30:27]
  - Claim: Some scholars suggest the Hagar story was composed after, and in light of, the Exodus story as an inverted parallel.

### Junia

3 claims across 1 Episodes (16). Strength: 2 consensus, 0 majority, 1 no evidence, 0 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 16 · Dan McClellan (Host) · consensus: “The academic consensus right now, I would argue, and I think I'm supported by. By most scholars, is that this name is a feminine name.” [00:42:49]
  - Claim: The academic consensus is that the name in Romans 16:7 is the feminine name Junia.
- Ep 16 · Dan McClellan (Host) · no evidence: “And so the data do not support the identification of Junia as a man. The data overwhelmingly support identifying Junia as a woman.” [00:45:36]
  - Claim: The data do not support identifying Junia as a man; they overwhelmingly support identifying her as a woman.
- Ep 16 · Dan McClellan (Host) · consensus: “And I think that book kind of set the tone for the scholarly consensus.” [00:58:29]
  - Claim: The scholarly consensus (set by Epp's 2005 book) is that Junia was a woman apostle.

### Other figures: passing remarks

10 claims on 8 subjects, none grouped into a cluster above.

- Ep 156 · Dan McClellan (Host) · no evidence · _Amalek_: “there's no indication whatsoever that any of them have any relationship to any people that ever actually existed named Amalek.” [00:27:20]
  - Claim: There is no indication that any modern group has any relationship to a historical people called Amalek.
- Ep 170 · Dan McClellan (Host) · majority · _Behemoth_: “I think the majority of scholars would probably say that Behemoth is not describing a hippopotamus.” [00:54:39]
  - Claim: The majority of scholars say Behemoth in Job 40 is a primordial monster, not a description of a hippopotamus.
- Ep 170 · Dan McClellan (Host) · majority · _Behemoth_: “which a lot of scholars would say is, is more appropriate to the context because we've got loins, belly, penis, thighs.” [00:56:00]
  - Claim: Many scholars read the word usually translated 'tail' in Job 40:17 as a euphemism for penis.
- Ep 64 · Dan Beecher (Host) · majority · _Deborah_: “Most scholars probably think that it's just. She's the wife of. Of Lapidoth. Yeah.” [00:11:28]
  - Claim: Most scholars probably read 'eshet lappidot' as 'wife of Lappidoth' rather than 'woman of torches'.
- Ep 165 · Dan McClellan (Host) · majority · _Hermas (Shepherd of Hermas)_: “I think most scholars would say if we had to choose, we would probably say he was orphaned or exposed or something like that.” [00:44:39]
  - Claim: Most scholars think Hermas was probably an orphaned or exposed child raised into slavery.
- Ep 14 · Dan McClellan (Host) · majority · _Lilith_: “And most scholars will tell you that this comes from a term in Akkadian, so from Mesopotamia that ultimately derives from a Sumerian word.” [00:04:16]
  - Claim: Most scholars derive Hebrew lilit (Isaiah 34:14) from an Akkadian term ultimately of Sumerian origin.
- Ep 14 · Dan McClellan (Host) · no evidence · _Lilith_: “Some people will argue that the original version of Genesis talked about Adam's first wife as Lilith or something like that. And there are no data that support that.” [00:22:24]
  - Claim: No data support the claim that an original version of Genesis named Lilith as Adam's first wife; the tradition is medieval (c. 700-1000 CE).
- Ep 12 · Elizabeth Schrader Polczer (Guest Speaker) · no evidence · _Mary Magdalene_: “But the problem with that position is that there's literally no evidence that she came from that place before the 6th century, first of all.” [00:46:03]
  - Claim: There is no evidence before the 6th century that Mary Magdalene came from a place called Magdala.
- Ep 160 · Dan McClellan (Host) · contested · _Origen (subordinationism)_: “Even if there are some scholars who argue that he was no subordinationist and was one of the first true Trinitarians, but that remains to be seen in my opinion.” [00:56:34]
  - Claim: Whether Origen was a subordinationist is debated; some scholars argue he was one of the first true Trinitarians.
- Ep 10 · Dan McClellan (Host) · majority · _Paul on sex and celibacy_: “And the majority of scholars would argue that Paul does not have a particularly high view of the value of sex.” [00:53:23]
  - Claim: The majority of scholars argue Paul did not have a high view of the value of sex.

## Places

### Other places: passing remarks

11 claims on 10 subjects, none grouped into a cluster above.

- Ep 143 · Dan McClellan (Host) · majority · _Bethsaida location_: “scholars are pretty sure they've identified the actual site of Bethsaida, a place called El-Araj.” [00:47:23]
  - Claim: Scholars are pretty sure the actual site of Bethsaida has been identified at El-Araj.
- Ep 181 · Dan McClellan (Host) · majority · _Caesarea Maritima (Paul before Felix)_: “But a lot of scholars think if, if this is historical, that he was before Felix in Caesarea, this would have been the room.” [00:25:09]
  - Claim: Many scholars think that, if Paul's hearing before Felix is historical, it took place in a particular excavated courtyard room at Caesarea.
- Ep 143 · Dan McClellan (Host) · majority · _Capernaum (Jesus's house)_: “they're in Capernaum, they're at what scholars think probably was Jesus's actual house in Capernaum.” [00:35:00]
  - Claim: Scholars think the house in Capernaum of Mark 3:20 was probably Jesus's actual house.
- Ep 101 · Dan McClellan (Host) · no evidence · _Eye of the Needle gate_: “There's no indication those doors existed anywhere in, around or near Jerusalem in the first century CE.” [00:47:13]
  - Claim: There is no indication that small 'needle' gates existed in or near first-century Jerusalem; they are medieval European wicket gates.
- Ep 83 · Dan McClellan (Host) · no evidence · _Garden Tomb_: “there are absolutely no archaeological or other data that would indicate this cliff face was Golgotha, the tomb itself is definitely not where Jesus was buried.” [00:43:25]
  - Claim: There are no archaeological or other data indicating the Garden Tomb site was Golgotha, and the tomb is not where Jesus was buried.
- Ep 15 · Dan McClellan (Host) · no evidence · _Gehenna_: “And so there's this idea that this is just this perpetually burning place of filth and dead bodies and stench and all this. And there are no archaeological or textual data that actually support that.” [00:22:14]
  - Claim: No archaeological or textual data support the idea that Gehenna (the Hinnom Valley) was a perpetually burning garbage dump in the time of Jesus.
- Ep 176 · Dan McClellan (Host) · majority · _Mount Zion (first-century steps)_: “And so a lot of scholars would suggest that if Jesus was brought to Caiaphas, whose palace might have been located on Mount Zion, that those steps—he would have been dragged up those steps.” [00:44:46]
  - Claim: Many scholars suggest that if Jesus was taken to Caiaphas's palace on Mount Zion, he would have gone up the excavated first-century steps there.
- Ep 13 · Dan McClellan (Host) · majority · _St. Peter in Gallicantu / House of Caiaphas_: “Now, most archaeologists would say this is something that was probably. These were cisterns that were probably converted to dungeons in the Byzantine period or maybe the Crusader period.” [00:32:33]
  - Claim: Most archaeologists say the "dungeons" under St. Peter in Gallicantu were cisterns converted in the Byzantine or Crusader period, not the place Jesus was held.
- Ep 13 · Dan McClellan (Host) · contested · _Tel Arad temple_: “And so some other scholars have postulated that this is all happening around the same time that Sennacherib is getting set to come through and wreak havoc on everything.” [00:17:50]
  - Claim: Some scholars propose the Arad temple was decommissioned and buried ahead of Sennacherib rather than destroyed in a cultic reform.
- Ep 13 · Dan McClellan (Host) · consensus · _Tel Arad temple_: “But I think the consensus view now is that only one at a time would have been in use” [00:20:43]
  - Claim: The consensus view now is that only one of the two standing stones in the Arad Holy of Holies was in use at a time.
- Ep 176 · Dan McClellan (Host) · contested · _Zion etymology_: “And there's not really a universally agreed-upon etymology, but it probably has something to do with being dry.” [00:35:57]
  - Claim: There is no universally agreed etymology of 'Zion'; it probably derives from a root meaning dry.

## Events

### Moses and the Exodus

15 claims across 7 Episodes (21, 31, 75, 97, 105, 116, 138). Strength: 4 consensus, 5 majority, 6 no evidence, 0 contested, 0 minority view, 0 asserted. 5 from Guest Speakers.

- Ep 21 · Dan McClellan (Host) · majority · _Forced labor in ancient Egypt_: “A lot of scholars think that the workers who were doing this were not so much enslaved as just locals who just had an annual responsibility to go dedicate so much time to the work.” [00:12:37]
  - Claim: Many scholars think Egypt's building workforce was largely local corvee labor rather than enslaved people; the record does not support a distinct, massive enslaved Hebrew community.
- Ep 21 · Dan McClellan (Host) · consensus · _Exodus (event)_: “And so on balance, I and most scholars, the overwhelming majority of critical scholars, would say the Exodus, as it is told in the book of Exodus, is entirely implausible.” [00:25:18]
  - Claim: The overwhelming majority of critical scholars say the Exodus as told in the book of Exodus is entirely implausible (at most a small historical kernel).
- Ep 21 · Dan McClellan (Host) · no evidence · _Moses_: “I would say that we don't have evidence, evidence for the existence of a figure named Moses that is anything remotely associated with the story we have in Exodus.” [00:28:28]
  - Claim: There is no evidence for the existence of a Moses resembling the figure in the Exodus story (found by a targeted follow-up search, not the keyword pass).
- Ep 31 · Dan McClellan (Host) · no evidence · _Wilderness wandering_: “And there the data don't really support the notion that any such time period existed, but it is kind of serving that narrative.” [01:01:53]
  - Claim: The data do not support the existence of a wilderness-wandering period.
- Ep 75 · Dan McClellan (Host) · consensus · _Plagues of Egypt_: “But the overwhelming consensus among scholars is that this is purely a literary creation.” [00:15:09]
  - Claim: The overwhelming scholarly consensus is that the plagues narrative is purely a literary creation.
- Ep 75 · Dan Beecher (Host) · no evidence · _Exodus (event)_: “Because there's no archaeological evidence or, or records of any kind that support any of this except this story in the Bible.” [00:22:05]
  - Claim: There is no archaeological evidence or record outside the Bible supporting the Exodus/plagues story.
- Ep 75 · Dan McClellan (Host) · majority · _Ipuwer Papyrus_: “most scholars think the story in the Ipuwer Papyrus dates to several hundred years prior, it doesn't fit.” [00:22:19]
  - Claim: Most scholars date the Ipuwer Papyrus story centuries before any Exodus setting, and it does not fit the Exodus tradition.
- Ep 97 · Dan Beecher (Host) · no evidence · _Exodus (event)_: “There's no, there is no archaeological evidence for the Exodus, but at least not as it's presented in the Bible.” [00:35:22]
  - Claim: There is no archaeological evidence for the Exodus as presented in the Bible.
- Ep 105 · Angela Roskop Erisman (Guest Speaker) · consensus · _Moses birth narrative_: “biblical scholars have long recognized, that story of, you know, the baby in the basket, we all—we all know that. Modeled on a text about the Assyrian king, Sargon II” [00:15:41]
  - Claim: Biblical scholars have long recognized that the baby-in-the-basket birth story of Moses is modeled on the Sargon birth legend.
- Ep 105 · Angela Roskop Erisman (Guest Speaker) · no evidence · _Exodus (event)_: “And there's just, there's no evidence. Right. So why should, why when we have a, a compelling story of how it originated, would we bother?” [00:24:34]
  - Claim: There is no evidence for a historical Exodus.
- Ep 105 · Angela Roskop Erisman (Guest Speaker) · no evidence · _Moses_: “And there's just, there's no evidence. Right. So why should, why when we have a, a compelling story of how it originated, would we bother?” [00:24:34]
  - Claim: There is no evidence for a historical Moses.
- Ep 116 · Aaron Higashi (Guest Speaker) · consensus · _Exodus (event)_: “And this, this is where that scholarly consensus comes in. That did not happen.” [00:19:01]
  - Claim: The scholarly consensus is that the Exodus as described in the Bible did not happen.
- Ep 116 · Aaron Higashi (Guest Speaker) · majority · _Song of the Sea (Exodus 15)_: “the earliest parts in the Hebrew Bible scholars generally consider to be Exodus 15, the Song of the Sea, which is a version of the Exodus story.” [00:21:02]
  - Claim: Scholars generally consider Exodus 15, the Song of the Sea, among the earliest parts of the Hebrew Bible.
- Ep 138 · Dan McClellan (Host) · majority · _Hyksos origins_: “Because this is a group of what scholars generally refer to as West Asians.” [00:36:20]
  - Claim: Scholars generally identify the Hyksos as West Asian (Semitic) peoples.
- Ep 138 · Dan McClellan (Host) · majority · _Hyksos origins_: “And I think most scholars think that they were probably further north. They were probably coming from areas of Syria and around there and into Mesopotamia” [00:46:32]
  - Claim: Most scholars think the Hyksos came from further north (Syria toward Mesopotamia), not from the land of Israel.

### Israelite origins, the conquest, and Jericho

12 claims across 7 Episodes (46, 64, 95, 115, 116, 138, 169). Strength: 3 consensus, 4 majority, 3 no evidence, 1 contested, 1 minority view, 0 asserted. 3 from Guest Speakers.

- Ep 46 · Dan McClellan (Host) · no evidence · _Conquest of Canaan_: “So the conquest narrative is not supported by the archaeological data.” [00:27:30]
  - Claim: The biblical conquest narrative is not supported by the archaeological data.
- Ep 46 · Dan McClellan (Host) · majority · _Conquest of Canaan_: “these days, I think most scholars, most archaeologists would say none of those really work. It's probably a bunch of small scale things kind of took place across the whole spectrum.” [00:28:27]
  - Claim: Most scholars and archaeologists say none of the single models (conquest, peaceful infiltration, peasant revolt) works; Israel emerged through many small-scale processes.
- Ep 64 · Dan McClellan (Host) · majority · _Sea Peoples / Philistines_: “that's actually something that a lot of scholars think. The—the invasion of the Sea Peoples, which happened around 1200 BCE, which is what caused these people known as the Philistines to occupy the—the coastal area.” [00:09:07]
  - Claim: Many scholars think the Sea Peoples' invasion around 1200 BCE brought the Philistines to the coast and introduced chariots.
- Ep 95 · Dan McClellan (Host) · no evidence · _Jericho_: “We have no indication that it was a walled city or that those walls came a tumbling down anywhere near what” [00:43:05]
  - Claim: There is no indication Jericho was a walled city whose walls fell at the time the conquest is set.
- Ep 95 · Dan McClellan (Host) · no evidence · _Jericho_: “there may have been a wall associated with a very small settlement at Jericho in the 14th or the 13th centuries BCE, but there's no evidence of any destruction associated with that wall at any point.” [00:44:44]
  - Claim: The archaeological data do not match the biblical account of Jericho; there is no evidence of destruction of any 14th-13th century wall.
- Ep 115 · Dan McClellan (Host) · majority · _Israelite origins_: “Most scholars these days would say that the nations of Israel and Judah are Canaanite, that the Bible is just the records of a group of Canaanite tribes” [00:10:19]
  - Claim: Most scholars say Israel and Judah were Canaanite groups that came to distinguish themselves from their neighbors.
- Ep 116 · Aaron Higashi (Guest Speaker) · consensus · _Israelite origins_: “Biblical scholars, by and large, especially in the past 20 or 30 years, have come to a very common consensus that the Israelites emerged within the land of Canaan, that Israelite ethnicity is a subset of Canaanite ethnicity.” [00:04:35]
  - Claim: Biblical scholars have reached a consensus that the Israelites emerged within Canaan and that Israelite ethnicity is a subset of Canaanite ethnicity.
- Ep 116 · Aaron Higashi (Guest Speaker) · consensus · _Israelite origins_: “this is where that scholarly consensus comes in. That did not happen. Instead, Israelites emerged more gradually, coming into their awareness of themselves as Israelites over the course of several centuries” [00:19:01]
  - Claim: The scholarly consensus is that Israelites emerged gradually out of the Canaanites over several centuries beginning around 1200 BCE.
- Ep 116 · Aaron Higashi (Guest Speaker) · minority view · _Israelite origins_: “this is kind of a minority opinion amongst biblical scholars, but it is it is popular amongst those that I like the most.” [00:23:28]
  - Claim: Gottwald's model of Israel arising from a revolt of lower-class Canaanites is a minority opinion, not the consensus.
- Ep 138 · Dan McClellan (Host) · consensus · _Jericho destruction dating_: “He's one of the ones who provided this argument against Kenyon and the consensus view that the big walls fell down around 1550 BCE.” [00:45:06]
  - Claim: The consensus view (following Kenyon) is that Jericho's big walls fell around 1550 BCE, against Bryant Wood's c. 1400 BCE dating.
- Ep 169 · Dan McClellan (Host) · majority · _Twelve Tribes of Israel_: “And a lot of scholars think maybe that's supposed to be the tribe of Gad, because Gad is over east of the Jordan.” [00:09:38]
  - Claim: Many scholars think 'Gilead' in the Song of Deborah's tribal list stands for the tribe of Gad.
- Ep 169 · Dan McClellan (Host) · contested · _Twelve Tribes of Israel_: “Some scholars think that if this is like a social memory from, from hoary antiquity before we have the settled firm 12 tribes of Israel, maybe this is what ancient Israel looked like.” [00:09:38]
  - Claim: Some scholars think the ten-tribe list in Judges 5 preserves a memory of early Israel before the fixed twelve-tribe scheme, as a confederation of unrelated tribes.

### Child sacrifice and Molech

11 claims across 6 Episodes (2, 21, 75, 132, 139, 168). Strength: 1 consensus, 2 majority, 4 no evidence, 2 contested, 0 minority view, 2 asserted. 1 from Guest Speakers.

- Ep 2 · Francesca Stavrakopoulou (Guest Speaker) · no evidence · _Child sacrifice in ancient Israel_: “I mean, archaeologically, you know, we have no evidence for the sorts of ritualized burning of very young babies, children and young animals that we have from comparative sites across the Phoenician and Punic worlds.” [00:26:43]
  - Claim: There is no archaeological evidence in Israel/Judah for ritualized burning of infants of the kind found at Phoenician and Punic sites.
- Ep 21 · Dan McClellan (Host) · no evidence · _Child sacrifice in ancient Israel_: “One, we have. We have no material remains that attest directly to any child sacrifice in ancient Israel.” [00:46:54]
  - Claim: There are no material remains directly attesting child sacrifice in ancient Israel.
- Ep 21 · Dan McClellan (Host) · contested · _Carthage tophet_: “And scholars have argued for a while, well, this must be funerary. They're just. These are infants that died in childbirth or shortly thereafter” [00:47:49]
  - Claim: Scholars long argued the infant burials at the Carthage tophet were merely funerary (a view the inscriptions now tell against).
- Ep 21 · Dan McClellan (Host) · majority · _Molech_: “So the consonants are MLK, which many scholars think is the Phoenician Punic version of what we would pronounce Molech or Moloch from the Hebrew Bible.” [00:48:50]
  - Claim: Many scholars think Punic MLK, a term for a type of offering, is the counterpart of biblical Molech.
- Ep 21 · Dan McClellan (Host) · majority · _Molech_: “And so the tide has, over the last almost hundred years, the consensus has been shifting in the direction of understanding this as a reference to a type of sacrifice.” [00:50:29]
  - Claim: The consensus has been shifting toward reading Molech as a type of sacrifice rather than a deity; scholars increasingly favor this but it is not yet an overwhelming consensus.
- Ep 21 · Dan McClellan (Host) · no evidence · _Child sacrifice in ancient Israel_: “And at the same time, we have no indication that despite even though that law is there, we have no indication it was ever enforced or that anyone in Israel ever engaged in that.” [00:56:35]
  - Claim: There is no indication the firstborn-sacrifice law of Exodus 22:29 was ever enforced or practiced in Israel.
- Ep 21 · Dan McClellan (Host) · consensus · _Child sacrifice in ancient Israel_: “It, I would call it the academic consensus, even though it's probably pretty close, that this was originally a commandment for Israelites to sacrifice their firstborn children and specifically their firstborn sons.” [01:02:12]
  - Claim: The (near-)academic consensus is that Exodus 22:29 was originally a commandment for Israelites to sacrifice their firstborn sons.
- Ep 75 · Dan McClellan (Host) · contested · _Child sacrifice in ancient Israel_: “One of the things that, that some scholars think the sacrifice of Isaac that story is doing is something that this story might be doing as well.” [00:33:02]
  - Claim: Some scholars think the sacrifice-of-Isaac story (like the firstborn plague) explains away a command to sacrifice the firstborn.
- Ep 132 · Dan McClellan (Host) · asserted · _Moloch_: “So the deity Moloch never existed. Not in the sense that there were other deities running around, but this one was a fake one.” [00:43:25]
  - Claim: Moloch was not a deity but a term for a type of sacrifice that the Greek translators misunderstood as a god's name.
- Ep 139 · Dan McClellan (Host) · asserted · _Molech_: “Molech was not a deity. Molech was just a type of sacrifice. And then later Greek translators and later folks confused it for the name of a deity that never existed.” [00:41:26]
  - Claim: Molech was not a deity but a type of sacrifice, later mistaken by Greek translators for the name of a god that never existed.
- Ep 168 · Dan McClellan (Host) · no evidence · _Child sacrifice in ancient Israel_: “we have no data that indicates that there was actually the sacrifice of children going on in Israel.” [00:28:44]
  - Claim: There are no data indicating that firstborn child sacrifice was actually practiced in Israel.

### Birth of Jesus: Bethlehem, infancy narratives, virgin birth

10 claims across 4 Episodes (86, 87, 141, 189). Strength: 2 consensus, 3 majority, 4 no evidence, 0 contested, 1 minority view, 0 asserted. 1 from Guest Speakers.

- Ep 86 · Dan McClellan (Host) · no evidence · _Christmas date (December 25)_: “But we have no evidence of it until decades after the initial calculation, which is based on, you know, this assumption that he must have died on the same day that he was conceived.” [00:37:32]
  - Claim: There is no evidence of a Sol Invictus observance on December 25 until decades after Christians had already calculated that date for Jesus's birth.
- Ep 87 · Dan McClellan (Host) · majority · _Isaiah 7:14_: “And then it says in the Greek also says shall become pregnant, whereas the Hebrew, most scholars agree, means has become pregnant.” [00:16:02]
  - Claim: Most scholars agree the Hebrew of Isaiah 7:14 means the woman has become pregnant, not that she shall become pregnant as in the Greek.
- Ep 141 · Dan McClellan (Host) · consensus · _Isaiah 7:14_: “what this almost certainly is referring to, the overwhelming majority of scholars will agree on this, is this is a reference to a woman who is pregnant in the time period when the author” [00:12:19]
  - Claim: The overwhelming majority of scholars agree Isaiah 7:14 refers to a woman already pregnant in Isaiah's own time, not a future virgin birth.
- Ep 141 · Dan McClellan (Host) · consensus · _Virgin birth_: “this notion that there's a virgin birth is widely agreed to be a posthumous secondary accretion to the Jesus tradition” [00:14:05]
  - Claim: The virgin birth is widely agreed to be a posthumous secondary accretion to the Jesus tradition.
- Ep 141 · Dan McClellan (Host) · majority · _Birth of Jesus in Bethlehem_: “so we have two completely different stories about how Jesus of Nazareth was actually born in Bethlehem. Yeah. And that is— and scholars think this is probably because after Jesus's death” [00:26:46]
  - Claim: Scholars think the two divergent stories placing Jesus of Nazareth's birth in Bethlehem arose after Jesus's death, once he was being proclaimed as the Messiah.
- Ep 141 · Dan McClellan (Host) · no evidence · _Messianic prophecy fulfillment_: “And the data don't support the conclusion that Jesus actually fulfilled these prophecies.” [00:37:31]
  - Claim: The data do not support the conclusion that Jesus actually fulfilled the prophecies Matthew cites.
- Ep 141 · Dan McClellan (Host) · no evidence · _Birth of Jesus in Bethlehem_: “The data, I would argue, don't even indicate he was born in Bethlehem. I think most likely he was probably born in Nazareth” [00:37:31]
  - Claim: The data do not indicate that Jesus was born in Bethlehem; he was most likely born in Nazareth.
- Ep 141 · Dan McClellan (Host) · majority · _Infancy narratives_: “And scholars think that the nativity account in Luke is a secondary addition. And there are even scholars who think the nativity account in Matthew is a secondary addition.” [00:44:20]
  - Claim: Scholars think the nativity account in Luke is a secondary addition, and some think the same of Matthew's.
- Ep 141 · Dan McClellan (Host) · no evidence · _Birth of Jesus in Bethlehem_: “there just doesn't seem to be any relevance to Jesus's origins, and certainly no indication about being born in Bethlehem.” [00:45:24]
  - Claim: Outside the nativity accounts there is no indication in the Gospels that Jesus was born in Bethlehem.
- Ep 189 · Shaily Patel (Guest Speaker) · minority view · _Infancy narratives_: “But I'll say that I'm probably in the minority on this. Right. Like, I think most scholars would say that, you know, Luke 1 and 2 are not a response to Marcionite Christianity.” [00:49:21]
  - Claim: Most scholars do not think Luke 1-2 is a response to Marcionite Christianity; the view that it is, is a minority position.

### Other events: passing remarks

7 claims on 6 subjects, none grouped into a cluster above.

- Ep 134 · Dan McClellan (Host) · consensus · _Crucifixion of Jesus (cross shape)_: “I think scholars are pretty secure in the conclusion that, yeah, Jesus was probably crucified on a T-shaped cross.” [00:13:56]
  - Claim: Scholars are fairly secure that Jesus was probably crucified on a T-shaped cross.
- Ep 8 · Aaron Higashi (Guest Speaker) · majority · _Ezra intermarriage crisis (Ezra 9-10)_: “But I haven't seen a lot of attempts to challenge outright the historicity of the event.” [00:37:02]
  - Claim: It is generally agreed that Ezra's forced mass divorce of foreign wives is historical (or reflects something that recurred); its historicity is rarely challenged.
- Ep 54 · Dan McClellan (Host) · contested · _Jerusalem Council_: “There are scholars who will. This kind of affects the break between Christianity and Judaism and. And other scholars would. Would argue against that.” [00:08:15]
  - Claim: Scholars disagree on whether the Jerusalem Council effected the break between Christianity and Judaism.
- Ep 54 · Dan McClellan (Host) · majority · _Jerusalem Council_: “Interestingly, there is what many scholars believe to be a variant account of this.” [00:14:24]
  - Claim: Many scholars believe Galatians 2 is Paul's variant account of the Jerusalem Council of Acts 15.
- Ep 175 · Dan McClellan (Host) · no evidence · _Jubilee / debt release_: “The debts are going to be all released in the, the jubilee or, or whatever. Which we have no evidence that any such thing ever happened.” [00:47:42]
  - Claim: There is no evidence that the sabbatical/jubilee release of debts was ever actually practiced.
- Ep 72 · Dan McClellan (Host) · majority · _Sennacherib's invasion of Judah_: “And a lot of scholars will say this. This sounds an awful lot like two different tellings of the same story.” [00:47:24]
  - Claim: Many scholars see 2 Kings 18 as weaving together two different tellings of Hezekiah's response to Sennacherib.
- Ep 25 · Dan McClellan (Host) · majority · _Sermon on the Mount_: “I think most scholars would say the exact words that we see in Matthew are a literary product and not a reflection of an actual single historical event.” [00:03:29]
  - Claim: Most scholars say the wording of the Sermon on the Mount in Matthew is a literary product, not a record of a single historical event.

## Texts

### Pauline letters: authorship (Pastorals and disputed letters)

22 claims across 10 Episodes (6, 10, 26, 35, 100, 135, 138, 144, 166, 180). Strength: 8 consensus, 7 majority, 0 no evidence, 3 contested, 0 minority view, 4 asserted. 2 from Guest Speakers.

- Ep 6 · Dan McClellan (Host) · consensus · _Pastoral Epistles authorship_: “is that the academic consensus, a strong academic consensus, holds that this text was not written by Paul. This was written decades after Paul's death.” [00:35:10]
  - Claim: A strong academic consensus holds that 2 Timothy was not written by Paul but decades after his death.
- Ep 6 · Dan McClellan (Host) · consensus · _Pastoral Epistles authorship_: “And so, the preponderance of evidence would suggest that 1 and 2 Timothy were not written by Paul.” [00:38:35]
  - Claim: The preponderance of evidence indicates 1 and 2 Timothy were not written by Paul (pseudonymous, late 1st / early 2nd century CE).
- Ep 6 · Dan McClellan (Host) · consensus · _Pastoral Epistles authorship_: “The consensus is that 2 Timothy is not written by Paul.” [00:39:37]
  - Claim: The consensus is that 2 Timothy was not written by Paul.
- Ep 10 · Dan McClellan (Host) · asserted · _Pastoral Epistles authorship_: “And also First Timothy was not written by Paul. Again, something we can talk about in another segment.” [01:04:43]
  - Claim: 1 Timothy was not written by Paul.
- Ep 26 · Matthew Thiessen (Guest Speaker) · majority · _Pastoral Epistles authorship_: “Well, the majority of critical scholars on Paul would argue Paul didn't write these letters. They're written by a later hand in, in Paul's name, which was a very common practice in antiquity.” [00:25:11]
  - Claim: The majority of critical scholars on Paul argue Paul did not write 1-2 Timothy and Titus; they were written later in his name.
- Ep 35 · Dan McClellan (Host) · consensus · _Epistle to the Hebrews authorship_: “There are some very traditional folks who might try to make the argument that Paul wrote it, but no scholars really accept that.” [00:32:48]
  - Claim: No scholars really accept that Paul wrote Hebrews.
- Ep 35 · Dan McClellan (Host) · consensus · _Pauline epistles authorship_: “critical scholarship agrees that at least seven of the Pauline epistles were written by Paul or were dictated to a scribe by Paul.” [00:33:51]
  - Claim: Critical scholarship agrees that at least seven Pauline epistles were genuinely written or dictated by Paul.
- Ep 35 · Dan McClellan (Host) · consensus · _Pauline epistles authorship_: “Now, the seven Pauline epistles that are considered authentic or genuine are First Thessalonians, First Corinthians and Second Corinthians, Galatians, Romans, Philippians, and Philemon.” [00:34:57]
  - Claim: The seven epistles considered authentic are 1 Thessalonians, 1 and 2 Corinthians, Galatians, Romans, Philippians and Philemon.
- Ep 35 · Dan McClellan (Host) · contested · _Deutero-Pauline epistles authorship_: “The disputed ones are where scholars are kind of in disagreement. There's not a clear consensus.” [00:35:43]
  - Claim: There is no clear consensus on Pauline authorship of 2 Thessalonians, Colossians and Ephesians.
- Ep 35 · Dan McClellan (Host) · majority · _Pastoral Epistles authorship_: “And these are ones that most scholars consider spurious. The scholars that assert Pauline authorship of these epistles are in the minority.” [00:35:43]
  - Claim: Most scholars consider the Pastoral Epistles spurious; those asserting Pauline authorship are a minority.
- Ep 35 · Dan McClellan (Host) · majority · _Pastoral Epistles authorship_: “And so that's. That's not an overwhelming consensus, but that's a, a good majority.” [00:36:46]
  - Claim: A good majority (not an overwhelming consensus) of polled New Testament scholars reject Pauline authorship of the Pastorals.
- Ep 35 · Dan McClellan (Host) · consensus · _Pastoral Epistles authorship_: “It's a strong consensus that we cannot confidently say Paul wrote these.” [00:37:49]
  - Claim: There is a strong consensus that Pauline authorship of the Pastorals cannot be confidently affirmed.
- Ep 35 · Dan McClellan (Host) · majority · _Pastoral Epistles authorship_: “the majority of scholars and an even stronger majority of critical scholars, that the Pastoral Epistles were not written by Paul, but were written decades after his death by someone writing in Paul's name” [00:45:40]
  - Claim: The majority of scholars hold the Pastoral Epistles were written decades after Paul's death by someone writing in his name.
- Ep 100 · Dan McClellan (Host) · asserted · _Deutero-Pauline epistles authorship_: “those are limited to the Deutero-Pauline or at least the disputed Paulines. So those things were probably not written by Paul.” [00:32:25]
  - Claim: The household codes appear only in the Deutero-Pauline / disputed letters, which were probably not written by Paul.
- Ep 135 · Dan McClellan (Host) · contested · _Ephesians authorship_: “Well, technically it's one of the disputed ones, right? Like the pastorals, a good strong majority of scholars are like, yeah, that's not Paul.” [00:12:25]
  - Claim: Ephesians is one of the disputed Pauline letters.
- Ep 135 · Dan McClellan (Host) · majority · _Pastoral Epistles authorship_: “Like the pastorals, a good strong majority of scholars are like, yeah, that's not Paul.” [00:12:25]
  - Claim: A strong majority of scholars hold that Paul did not write the Pastoral Epistles.
- Ep 138 · Dan McClellan (Host) · majority · _2 Thessalonians authorship_: “most critical scholars would say that this was likely written by somebody pretending to be Paul after Paul's death.” [00:03:39]
  - Claim: Most critical scholars hold that 2 Thessalonians was written by someone pretending to be Paul after Paul's death.
- Ep 138 · Dan McClellan (Host) · consensus · _Pastoral Epistles authorship_: “So we don't have as much of a consensus as we do with the Pastoral Epistles.” [00:04:09]
  - Claim: There is a strong consensus that the Pastoral Epistles (1-2 Timothy, Titus) are spurious, not written by Paul.
- Ep 138 · Dan McClellan (Host) · majority · _Disputed Pauline epistles authorship_: “these would be Ephesians, Colossians, 2 Thessalonians, probably not written by Paul, but we're not going to put as big a punctuation mark on it as we are with the Pastoral Epistles.” [00:04:09]
  - Claim: Ephesians, Colossians and 2 Thessalonians were probably not written by Paul, though the consensus is weaker than for the Pastoral Epistles.
- Ep 144 · Dan Beecher (Host) · asserted · _Ephesians authorship_: “because Ephesians was not written by Paul, right? Ephesians was probably written again end of the 1st century, beginning of the 2nd century” [00:37:57]
  - Claim: Ephesians was not written by Paul; it dates to the end of the 1st or beginning of the 2nd century CE.
- Ep 166 · Monte Mader (Guest Speaker) · asserted · _Pastoral Epistles authorship_: “Paul told you to be quiet. And I'm like, no, he didn't. He didn't write the Timothys.” [00:47:48]
  - Claim: Paul did not write 1 and 2 Timothy.
- Ep 180 · Dan McClellan (Host) · contested · _Ephesians authorship_: “And this is one of the disputed Pauline epistles. I happen to think that this was probably not written by Paul” [00:46:06]
  - Claim: Ephesians is one of the disputed Pauline epistles and was probably not written by Paul.

### Gospels and Acts: dating, order, authorship, sources

27 claims across 12 Episodes (35, 43, 49, 50, 69, 99, 119, 128, 143, 172, 175, 189). Strength: 2 consensus, 16 majority, 0 no evidence, 8 contested, 0 minority view, 1 asserted. 12 from Guest Speakers.

- Ep 35 · Dan McClellan (Host) · majority · _Synoptic problem / Q_: “And a lot of scholars believe that there was some kind of sayings gospel that functioned as the source for the gospel authors, Matthew, Mark, Luke and John.” [00:15:19]
  - Claim: Many scholars hold that some kind of sayings gospel served as a source for the gospel authors.
- Ep 35 · Dan McClellan (Host) · asserted · _Gospel of Matthew original language_: “Matthew is not a sayings gospel period. Additionally, it was not originally written in Hebrew. It was originally composed in Greek.” [00:15:19]
  - Claim: The Gospel of Matthew is not a sayings gospel and was originally composed in Greek, not Hebrew.
- Ep 35 · Dan McClellan (Host) · majority · _Gospel authorship_: “And so scholars would say as evidence for Matthean or Markan authorship of the Gospels of Matthew and Mark as we have, as we have them today. Papias is not strong evidence.” [00:16:20]
  - Claim: Scholars do not regard Papias as strong evidence for Matthean or Markan authorship of the Gospels as we have them.
- Ep 43 · Dan McClellan (Host) · majority · _Gospel of Luke dating_: “I think most scholars would probably say Luke is after Matthew. Yes.” [00:23:25]
  - Claim: Most scholars would say Luke was written after Matthew.
- Ep 49 · Candida Moss (Guest Speaker) · majority · _Gospel of Mark dating_: “And most scholars will tell you that the Gospel of Mark is written around 70, just sort of the destruction of the temple, the first Jewish war” [00:15:45]
  - Claim: Most scholars date the Gospel of Mark to around 70 CE.
- Ep 49 · Candida Moss (Guest Speaker) · contested · _Gospel of Mark provenance_: “It's one of the reasons some scholars will tell you, oh, this could not have been written anywhere near this region of the world.” [00:17:59]
  - Claim: Some scholars argue from Mark's faulty geography that it could not have been written near Galilee/Judea.
- Ep 50 · Dan McClellan (Host) · consensus · _Markan priority_: “it depends on, on where you put Luke because Mark is, is almost universally agreed to be the earliest gospel.” [00:07:49]
  - Claim: Mark is almost universally agreed to be the earliest gospel.
- Ep 50 · Dan McClellan (Host) · majority · _Gospel of John dating_: “But most people put John somewhere in the mid-90s CE, so almost at the very end of the first century CE.” [00:07:59]
  - Claim: Most place the Gospel of John in the mid-90s CE.
- Ep 50 · Dan McClellan (Host) · contested · _Gospel of Luke dating_: “some scholars think is reliant to some degree on Matthew as well as, as on Mark.” [00:07:59]
  - Claim: Luke was probably written after Matthew, and some scholars think Luke relied on Matthew as well as Mark.
- Ep 50 · Dan McClellan (Host) · majority · _Synoptic problem / Q_: “And scholars will refer to Matthew's independent source as M, and they'll refer to Luke's independent source as L.” [00:09:12]
  - Claim: Scholars posit Q plus independent sources M (Matthew) and L (Luke) to explain the Synoptic relationships.
- Ep 69 · Michael Kok (Guest Speaker) · contested · _Justin Martyr and the Gospels_: “Some scholars think he knew John as well, but it's a little bit. He seems to know John.” [00:15:10]
  - Claim: Some scholars think Justin Martyr knew the Gospel of John, though whether he counted it among the apostolic memoirs is questionable.
- Ep 69 · Michael Kok (Guest Speaker) · majority · _Papias_: “So I think the best evidence is Papias is probably early second century. And I think that's all that might be a majority view among a lot of people.” [00:18:24]
  - Claim: Dating Papias to the early second century may be the majority view.
- Ep 69 · Michael Kok (Guest Speaker) · contested · _Papias_: “But I think, and some other scholars would back me up, would say it's oral traditions about Jesus.” [00:23:07]
  - Claim: Scholars differ on what Papias' 'oracles' were; some hold they were oral traditions about what Jesus said and did.
- Ep 69 · Michael Kok (Guest Speaker) · contested · _Papias_: “there's some debate about whether he means chronological order like that.” [00:25:07]
  - Claim: It is debated whether Papias' 'not in order' about Mark means chronological or rhetorical order.
- Ep 69 · Michael Kok (Guest Speaker) · contested · _Marcion's gospel_: “So that's why some scholars are saying, well, maybe Marcion just inherited a different version of Luke.” [00:51:44]
  - Claim: Some scholars say Marcion may have inherited a different version of Luke rather than editing it.
- Ep 99 · Dan McClellan (Host) · majority · _Gospel authorship_: “They didn't start getting written down until around 70 CE after James was gone. So, so that's why scholars think, well, that's why Matthew got one, because there was one left over.” [00:21:31]
  - Claim: Scholars hold the Gospels were not written down until around 70 CE and that the traditional attributions (e.g. Matthew) were assigned later to link them to apostolic figures.
- Ep 119 · Dan McClellan (Host) · majority · _New Testament dating_: “most critical scholars would say there are multiple books of the New Testament, perhaps even at least one of the Gospels that weren't even written until probably the beginning of the second century CE.” [00:27:52]
  - Claim: Most critical scholars say several New Testament books, perhaps including a Gospel, were not written until the early second century CE.
- Ep 128 · Hugo Mendez (Guest Speaker) · majority · _Gospel authorship_: “I think the majority of scholars think it's very likely that, you know, the biblical texts as we have them simply didn't have titles at the beginning.” [00:06:11]
  - Claim: The majority of scholars think the biblical texts, including the Gospels, originally circulated without titles, which scribes added later.
- Ep 143 · Dan McClellan (Host) · consensus · _Gospels order of composition_: “Yes, that's pretty widely agreed.” [00:03:46]
  - Claim: It is widely agreed that Mark is the earliest of the Gospels.
- Ep 143 · Dan McClellan (Host) · majority · _Gospel of Mark dating_: “I think most scholars would say this is either months before or months to a year or two after the destruction of the temple in summer of 70 CE.” [00:23:32]
  - Claim: Most scholars date Mark to within months or a year or two of the destruction of the temple in 70 CE.
- Ep 172 · Dan McClellan (Host) · contested · _Synoptic problem / Q_: “what some scholars reconstruct as Q, which would be a written source that was used by Matthew and Luke that was probably not known to Mark” [00:36:00]
  - Claim: Some scholars reconstruct Q, a written source used by Matthew and Luke but unknown to Mark, to explain their shared material.
- Ep 172 · Dan McClellan (Host) · majority · _Gospels order of composition_: “So it probably went Mark, Matthew, Luke, and then John. Okay. That's where I think most scholars stand right now.” [00:37:02]
  - Claim: Most scholars hold the Gospels were written in the order Mark, Matthew, Luke, John.
- Ep 175 · Dan McClellan (Host) · contested · _New Testament dating_: “he believes that 99% of all biblical scholars believe the 27 books of the New Testament were completed by the end of the first century CE, which is laughably untrue.” [00:15:14]
  - Claim: It is untrue that 99% of biblical scholars think all 27 New Testament books were completed by the end of the 1st century CE.
- Ep 189 · Shaily Patel (Guest Speaker) · majority · _Gospel of Mark dating_: “And so scholars will say, okay, Mark 13 is very clearly referring to the war that happened between, what is it, 66 and 70.” [00:33:49]
  - Claim: Scholars read Mark 13 as clearly referring to the Jewish War of 66-70 CE, which anchors the dating of Mark and the other Gospels.
- Ep 189 · Shaily Patel (Guest Speaker) · majority · _Gospel of Mark dating_: “there is a scholarly, sort of a scholarly trend, if you will, to say that Mark 13 is talking about the Jewish War and that we can therefore date Mark between 65 and 70” [00:34:56]
  - Claim: The scholarly trend is to date Mark between 65 and 70 CE on the basis of Mark 13 and the Jewish War.
- Ep 189 · Shaily Patel (Guest Speaker) · majority · _Gospel of Luke dating_: “we tend to date Luke somewhere between 75 and 90. Scholars will usually give a date around 80, 85.” [00:34:56]
  - Claim: Scholars usually date Luke to around 80-85 CE (range 75-90), because Luke used Mark.
- Ep 189 · Shaily Patel (Guest Speaker) · majority · _Acts dating_: “Some scholars will put it at five years after Luke. So we get a date for Acts anywhere between, you know, 80, 90.” [00:35:59]
  - Claim: Mainstream scholarly dating puts Acts around 80-90 CE, roughly five to ten years after Luke; some date it before 64 CE.

### Gospel of John: composition

10 claims across 4 Episodes (42, 50, 128, 185). Strength: 3 consensus, 4 majority, 0 no evidence, 2 contested, 1 minority view, 0 asserted. 5 from Guest Speakers.

- Ep 42 · Dan McClellan (Host) · consensus · _John 1:1_: “It is the academic consensus of Greek grammarians that it does not say that.” [00:04:49]
  - Claim: The consensus of Greek grammarians is that John 1:1 does not identify the Word as the God of Israel (theos is qualitative).
- Ep 42 · Dan McClellan (Host) · consensus · _John 8:58 (I am)_: “That's, that's what the consensus view is, is that this is just grammatically unusual enough to be a cue.” [00:28:40]
  - Claim: The consensus view is that 'before Abraham was, I am' is grammatically unusual enough to cue something more than a past-tense statement.
- Ep 42 · Dan McClellan (Host) · minority view · _John 8:58 (I am)_: “I don't think it's particularly strong. It's certainly a minority view among grammarians.” [00:29:00]
  - Claim: Reading 'I am' in John 8:58 as 'I was and continue to be' is a minority view among grammarians.
- Ep 50 · Dan McClellan (Host) · majority · _Gospel of John composition_: “a lot of scholars think that, that the discourse in there, which includes the intercessory prayer, was added or moved from another part of John or something like that.” [00:20:46]
  - Claim: Many scholars think John's farewell discourse (chapters 15-17) was added or moved from elsewhere in John.
- Ep 128 · Hugo Mendez (Guest Speaker) · majority · _Gospel of John composition_: “So the way that most scholars, I think, today think about it and the way that I argue in the book, I think it happened is that we're probably instead looking at really one author” [00:20:06]
  - Claim: Most scholars today think the Gospel of John is largely the work of one author who developed it gradually.
- Ep 128 · Dan McClellan (Host) · majority · _John 21_: “you think the entirety of John chapter 21, and many other scholars think this as well, is a secondary addition to the Gospel of John” [00:22:44]
  - Claim: Many scholars think John 21 is a secondary addition and that the Gospel originally ended at chapter 20.
- Ep 128 · Hugo Mendez (Guest Speaker) · contested · _John 21_: “even though some scholars have argued that it could be part of the original book, I'm still on the side of those people who think that it's probably by a later hand” [00:25:41]
  - Claim: Whether John 21 is original or from a later hand is disputed among scholars.
- Ep 128 · Hugo Mendez (Guest Speaker) · majority · _Gospel of John composition_: “I know many scholars who think that that verse probably means that there might have been an author of something like a core of the gospel, but that there's like a we” [00:26:41]
  - Claim: Many scholars take the 'we' of John 21:24 to indicate a group that edited or completed a core written by an earlier author.
- Ep 128 · Hugo Mendez (Guest Speaker) · contested · _Prologue of John (Logos hymn)_: “some scholars have thought, okay, so this is yet another sort of seam in the gospel where maybe this part in the KitKat bar of the Gospel of John can break off neatly” [00:31:36]
  - Claim: Some scholars have regarded the Logos prologue as a hymn added later to the Gospel of John, a view now being questioned.
- Ep 185 · Dustin Smith (Guest Speaker) · consensus · _Gospel of John Prologue / Wisdom_: “I know there's some debate on that still, but at least that's kind of currently where the consensus is.” [00:13:47]
  - Claim: The current consensus is that Jewish wisdom tradition is the dominant influence on the Logos of John's Prologue, though some debate remains.

### Catholic Epistles: authorship (James, Peter, Jude)

16 claims across 4 Episodes (6, 99, 104, 170). Strength: 2 consensus, 9 majority, 0 no evidence, 2 contested, 1 minority view, 2 asserted. 0 from Guest Speakers.

- Ep 6 · Dan McClellan (Host) · asserted · _Petrine Epistles authorship_: “These are among the last texts of the New Testament written. So we're early to mid-2nd century CE when these texts are being written, also not by the real Peter.” [00:46:38]
  - Claim: 1 and 2 Peter are among the last New Testament texts written (early to mid-2nd century CE) and were not written by the real Peter.
- Ep 99 · Dan McClellan (Host) · majority · _James, brother of Jesus_: “a lot of scholars think that he was basically the leader of the followers of Jesus who remained in Jerusalem up until around the Roman invasion and the siege.” [00:11:40]
  - Claim: Many scholars think James led the Jesus followers in Jerusalem until around the Roman siege.
- Ep 99 · Dan McClellan (Host) · majority · _James, brother of Jesus_: “I think most scholars would probably say of all these folks, Josephus is probably the closest to the events and is probably to be trusted the most.” [00:19:46]
  - Claim: Most scholars regard Josephus as the closest and most trustworthy source on the death of James.
- Ep 99 · Dan McClellan (Host) · consensus · _Epistle of James authorship_: “I don't think there are scholars, many scholars anyway, who take seriously the notion that, that James was actually written by the brother of Jesus.” [00:22:58]
  - Claim: Few if any scholars take seriously that the Epistle of James was written by the brother of Jesus.
- Ep 99 · Dan McClellan (Host) · consensus · _Epistle of James authorship_: “I think the, the scholarly consensus is that this was, this was not written by the brother of Jesus.” [00:25:15]
  - Claim: The scholarly consensus is that the Epistle of James was not written by the brother of Jesus and is likely pseudepigraphic.
- Ep 99 · Dan McClellan (Host) · contested · _Epistle of James dating_: “As for the date of James, opinion is here, as on so much else, remarkably diverse.” [00:26:18]
  - Claim: Scholarly opinion on the date of James is remarkably diverse, ranging from before 50 CE to about 150 CE.
- Ep 104 · Dan McClellan (Host) · majority · _Epistle of Jude authorship_: “whoever Jude is claiming to be, I think the majority of scholars suggest that's not actually who they were.” [00:06:07]
  - Claim: The majority of scholars hold that the Epistle of Jude was not written by the Jude it claims.
- Ep 104 · Dan McClellan (Host) · asserted · _Epistle of Jude authorship_: “And, and so is probably pseudepigraphic, meaning that the person was probably writing in someone else's name, falsely arrogating their identity and thus their authority. And there have even been debates about this.” [00:06:25]
  - Claim: Jude is probably pseudepigraphic and dates to the late first or early second century CE, though this has been debated.
- Ep 104 · Dan McClellan (Host) · majority · _Second Peter and Jude relationship_: “most scholars think that Second Peter is probably referencing parts of Jude, and so it has to have come before Second Peter.” [00:07:08]
  - Claim: Most scholars think Second Peter draws on Jude, so Jude predates it.
- Ep 104 · Dan McClellan (Host) · majority · _Second Peter dating_: “Second Peter is agreed by the majority of scholars to have been written like between 120 and 150 CE.” [00:07:08]
  - Claim: The majority of scholars agree Second Peter was written between about 120 and 150 CE.
- Ep 104 · Dan McClellan (Host) · contested · _Second Peter and Jude relationship_: “some folks say that this is quoting Second Peter. And then others would suggest maybe Second Peter is actually turning around and quoting this. So the, the relative chronology there is, is a little tricky.” [00:39:30]
  - Claim: The direction of dependence between Jude's 'last days' passage and Second Peter 3:3 is disputed.
- Ep 170 · Dan McClellan (Host) · majority · _Epistle of James authorship_: “I think the majority of scholars would say this is probably intended to be James, the brother of Jesus” [00:06:06]
  - Claim: The majority of scholars think the 'James' of the epistle is intended to be James the brother of Jesus.
- Ep 170 · Dan McClellan (Host) · majority · _Epistle of James authorship_: “there are a lot of scholars who think that it was not actually written by James. It is pseudepigraphic.” [00:08:53]
  - Claim: Many scholars think the Epistle of James was not written by James and is pseudepigraphic, though some argue for an early-to-mid 1st-century date.
- Ep 170 · Dan McClellan (Host) · majority · _Epistle of James authorship_: “I think the majority of scholars are going to say it's pseudepigraphic.” [00:10:01]
  - Claim: The majority of scholars regard the Epistle of James as pseudepigraphic.
- Ep 170 · Dan McClellan (Host) · majority · _Epistle of James and Paul_: “And so I and many other scholars would say that he's responding to Paul, or at least the way Paul is being represented in the time period in which the letter was written” [00:11:47]
  - Claim: Many scholars hold that James's faith-and-works argument responds to Paul (or to how Paul was being read).
- Ep 170 · Dan McClellan (Host) · minority view · _Epistle of James and Paul_: “Okay. If this was written before Paul. But I think that's gonna prove to be a minority view.” [00:12:48]
  - Claim: The view that James predates Paul and that Paul was riffing on James is a minority view.

### New Testament text: later additions and interpolations

15 claims across 10 Episodes (11, 12, 17, 35, 58, 60, 94, 104, 140, 174). Strength: 2 consensus, 9 majority, 0 no evidence, 2 contested, 0 minority view, 2 asserted. 1 from Guest Speakers.

- Ep 11 · Dan McClellan (Host) · majority · _Ending of Mark_: “And, and a lot of scholars think that originally the story ended with the tomb is empty, what now?” [01:05:52]
  - Claim: Many scholars think Mark's Gospel originally ended at the empty tomb (16:8).
- Ep 12 · Elizabeth Schrader Polczer (Guest Speaker) · majority · _Papyrus 66 dating_: “And in the world's oldest copy of John 11, which is Papyrus 66, which is usually dated to the turn of the third century, though it's paleographically dated, so we can't be certain.” [00:17:05]
  - Claim: Papyrus 66, the oldest copy of John 11, is usually dated (paleographically, so not with certainty) to the turn of the third century.
- Ep 17 · Dan McClellan (Host) · consensus · _New Testament textual criticism (omitted verses)_: “and a number of other translations that have settled on about 16 verses from the New Testament where scholars are pretty sure that those verses did not exist at all in the earliest New Testament.” [00:41:21]
  - Claim: Scholars are fairly sure about 16 verses found in the KJV New Testament were not in the earliest New Testament text.
- Ep 17 · Dan McClellan (Host) · contested · _Ending of Mark_: “But there are some scholars that argue this was intentionally an abrupt ending to kind of inject the audience with this sense of urgency and of anxiety.” [00:47:55]
  - Claim: Some scholars argue Mark's abrupt ending at 16:8 was intentional; how the Gospel originally ended is debated.
- Ep 35 · Dan McClellan (Host) · majority · _1 Corinthians 14:34-35_: “And so a lot of critical scholars will say, this seems an awful lot like an interpolation, probably from somebody writing at a later time period where we have the more misogynistic pastoral approach to women speaking in church.” [00:45:40]
  - Claim: Many critical scholars regard the command for women to be silent in 1 Corinthians 14 as a later interpolation.
- Ep 58 · Dan McClellan (Host) · majority · _Mark 1:1 (Son of God)_: “I think most scholars would say "Son of God" is probably not there.” [00:52:32]
  - Claim: Most scholars would say 'Son of God' was not originally in Mark 1:1.
- Ep 60 · Dan McClellan (Host) · asserted · _Pericope Adulterae (John 7:53-8:11)_: “even the NRSVue, which we know this is not, was not written by the author of John is still leaving it in there.” [00:17:38]
  - Claim: The story of the woman caught in adultery is known not to have been written by the author of John.
- Ep 60 · Dan McClellan (Host) · majority · _1 Corinthians 14:34-35_: “Seems to me that the majority of scholars agree that this is an interpolation, or at least does not originate with Paul.” [00:34:26]
  - Claim: The majority of scholars agree 1 Corinthians 14:34-35 is an interpolation or at least does not originate with Paul.
- Ep 94 · Dan McClellan (Host) · majority · _Codex Sinaiticus_: “there are places where Sinaiticus omits things that most scholars today would say that was probably an accident.” [00:47:55]
  - Claim: Most scholars regard some of Sinaiticus's omissions as accidental scribal errors.
- Ep 94 · Dan McClellan (Host) · consensus · _New Testament textual interpolations_: “there are these normally 16 or so passages that the overwhelming majority of Bible scholars are in agreement: these are probably not original to the text.” [00:49:49]
  - Claim: The overwhelming majority of scholars agree that roughly 16 verses or passages are not original to the New Testament text.
- Ep 94 · Dan McClellan (Host) · majority · _Codex Sinaiticus_: “And I think probably the majority of scholars these days are like, "Sit down. No, we didn't." But there, there are some scholars who, who still argue that” [00:56:38]
  - Claim: Most scholars reject the idea that Sinaiticus is one of Constantine's fifty Bibles, though some still argue it.
- Ep 104 · Dan McClellan (Host) · majority · _Jude 5 (textual variant)_: “I think most scholars today would say, yeah, it probably says Jesus.” [00:18:33]
  - Claim: Most scholars today think the earliest reading of Jude 5 is 'Jesus' rather than 'Lord' or 'God'.
- Ep 140 · Dan McClellan (Host) · majority · _Papyrus 52 dating_: “It may date to 175 or even 200 CE. But most scholars would say it's probably in the 2nd century CE.” [00:09:27]
  - Claim: Most scholars date P52, the earliest New Testament manuscript fragment, to somewhere in the 2nd century CE.
- Ep 140 · Dan McClellan (Host) · contested · _Conjectural emendation_: “And there are some scholars who think we ought to be engaging in that, in the practice of using conjectural emendations.” [00:16:50]
  - Claim: Scholars are divided on whether textual critics should use conjectural emendation.
- Ep 174 · Dan McClellan (Host) · asserted · _New Testament textual additions_: “we arrived at the conclusion that there are over a dozen full verses in the New Testament that are secondary additions to the text that were not written by the authors of these texts.” [00:25:35]
  - Claim: Textual criticism has concluded that over a dozen full verses in the New Testament are secondary additions not written by the original authors.

### Revelation: date, author, 666, persecution

14 claims across 4 Episodes (4, 9, 39, 119). Strength: 4 consensus, 6 majority, 1 no evidence, 2 contested, 1 minority view, 0 asserted. 3 from Guest Speakers.

- Ep 4 · Bart Ehrman (Guest Speaker) · consensus · _Book of Revelation dating_: “I'll say that scholars are pretty well convinced these days that Revelation was probably written in the 90s when the Emperor Domitian was the ruler.” [00:15:17]
  - Claim: Scholars are pretty well convinced Revelation was probably written in the 90s CE under Domitian.
- Ep 4 · Bart Ehrman (Guest Speaker) · no evidence · _Persecution of early Christians_: “And there's actually no evidence that he was sponsoring any kinds of persecutions.” [00:15:17]
  - Claim: There is no evidence Domitian sponsored persecutions of Christians, and little evidence of widespread persecution at all.
- Ep 4 · Bart Ehrman (Guest Speaker) · consensus · _Book of Revelation authorship_: “that demonstrates on linguistic grounds, on the basis of the language, that whoever wrote John did not write the Book of Revelation. They're different authors. And he's absolutely right about that. He uses arguments that today Greek scholars completely would agree with, do agree with.” [00:23:36]
  - Claim: Greek scholars today agree, on linguistic grounds, that the author of the Gospel of John did not write Revelation.
- Ep 9 · Dan McClellan (Host) · majority · _Beast of Revelation_: “And scholars would say the, the seven. The. The horns and the crowns and things are representative of. Of leadership, kings, emperors, things like that. But the seven heads would be representative of the seven hills on which the city of Rome was founded.” [00:13:58]
  - Claim: Scholars read the seven heads of Revelation's beast as the seven hills of Rome and the horns/crowns as rulers.
- Ep 9 · Dan Beecher (Host) · consensus · _Number of the Beast (666)_: “And that's widely accepted in the scholarship. Right, that's, this isn't something that's very controversial as a concept.” [00:29:03]
  - Claim: That 666 refers to Nero is widely accepted in scholarship.
- Ep 9 · Dan McClellan (Host) · consensus · _Number of the Beast (666)_: “But, but I think it's pretty clear the, the scholarly consensus is that this was a reference to Nero.” [00:29:10]
  - Claim: The scholarly consensus is that 666 is a reference to Nero.
- Ep 9 · Dan McClellan (Host) · contested · _Nero redivivus myth_: “There's, there's some debate about how widespread this Nero redivivus myth was.” [00:29:10]
  - Claim: Scholars debate how widespread the Nero redivivus myth was, though most would use it as background for Revelation.
- Ep 39 · Dan McClellan (Host) · majority · _Book of Revelation dating_: “The text most scholars think was probably written around the early 90s CE.” [00:07:24]
  - Claim: Most scholars think Revelation was written around the early 90s CE.
- Ep 39 · Dan McClellan (Host) · majority · _Domitianic persecution_: “Scholars these days are like, probably wasn't that intense, intense persecution.” [00:07:24]
  - Claim: Scholars now think persecution of Christians under Domitian was probably not that intense.
- Ep 39 · Dan McClellan (Host) · majority · _Book of Revelation dating_: “is not as. As handy an anchor for dating the text. But most scholars think it's probably right around there.” [00:07:55]
  - Claim: Most scholars still date Revelation to around the reign of Domitian.
- Ep 39 · Dan McClellan (Host) · minority view · _Book of Revelation dating_: “There is a small minority of scholars who think it predates 70 CE, that it predates the destruction of the temple.” [00:07:55]
  - Claim: A pre-70 CE date for Revelation is held by a small minority, mostly preterists.
- Ep 39 · Dan McClellan (Host) · majority · _Book of Revelation authorship_: “So most scholars would say there is little chance that this was actually written by the same John.” [00:14:02]
  - Claim: Most scholars say there is little chance Revelation was written by the same John as the Gospel of John.
- Ep 39 · Dan McClellan (Host) · contested · _Balaam and Jezebel in Revelation_: “It's not a consensus view, but it's. One of the main theories is that this is a coded reference to Paul” [00:22:18]
  - Claim: That Revelation's Balaam and Jezebel are coded references to Paul is a main theory but not a consensus view.
- Ep 119 · Dan McClellan (Host) · majority · _Book of Revelation dating_: “I don't know about the overwhelming, but the majority of scholars date Revelation to well after that.” [00:07:48]
  - Claim: The majority of scholars date Revelation to well after 70 CE.

### Pentateuch: authorship, sources, dating

18 claims across 9 Episodes (22, 36, 56, 105, 114, 152, 164, 175, 187). Strength: 1 consensus, 7 majority, 2 no evidence, 2 contested, 1 minority view, 5 asserted. 6 from Guest Speakers.

- Ep 22 · Liane Feldman (Guest Speaker) · majority · _Pentateuch authorship_: “So that these were four somewhat parallel but still rather different stories that were written by at least four different people, slash, groups of people that at some point most scholars would, say in the Persian period were joined together.” [00:23:09]
  - Claim: Most scholars say the separate Pentateuchal sources, written by at least four authors/groups, were joined together in the Persian period.
- Ep 22 · Dan McClellan (Host) · minority view · _Pentateuch authorship_: “I know folks who prefer Mosaic authorship. Not many scholars, but in the broader public, a lot of folks believe that the Documentary Hypothesis is built entirely on this foundation” [00:24:44]
  - Claim: Few scholars hold to Mosaic authorship of the Pentateuch.
- Ep 22 · Liane Feldman (Guest Speaker) · contested · _Documentary Hypothesis_: “But that continental European scholarship, especially German-language scholarship in the mid-20th century, really rightly critiqued and like, tore apart and said, "this doesn't work."” [00:25:17]
  - Claim: Mid-20th-century continental European scholarship rejected the classical Documentary Hypothesis evidence; it was later revived as the Neo-Documentary Hypothesis (the model is contested).
- Ep 36 · Jacob Wright (Guest Speaker) · consensus · _Pentateuch composition_: “Genesis is its own story. And I think everybody kind of agrees now about this, that it's a separate story than the Exodus story.” [00:22:01]
  - Claim: Scholars now generally agree that Genesis was originally a separate story from the Exodus story.
- Ep 56 · David Carr (Guest Speaker) · majority · _Documentary Hypothesis_: “And most scholars over the last few hundred years have thought it was an originally separate strand.” [00:12:56]
  - Claim: Most scholars over the last few centuries have held that the J / non-P material in Genesis was an originally separate strand.
- Ep 105 · Angela Roskop Erisman (Guest Speaker) · majority · _Korah's rebellion (Numbers 16)_: “I, along with many scholars now would situate the Korach story in, in the Persian period after they have come back” [00:32:16]
  - Claim: Many scholars now situate the Korah story in the Persian period, after the return from exile.
- Ep 114 · Dan McClellan (Host) · majority · _Leviticus 18 and 20_: “many scholars, many, many Pentateuchal scholars will suggest that Leviticus is actually in, in coming up with all of these, with its legislation, it's actually following the narrative of Genesis.” [00:48:17]
  - Claim: Many Pentateuchal scholars hold that the legislation of Leviticus 18 and 20 follows the narrative sequence of Genesis.
- Ep 152 · Dan McClellan (Host) · asserted · _Hebrew language origins_: “which contributed to Hebrew. So, and Hebrew didn't exist until like between 1100 and 1000 BCE.” [00:47:37]
  - Claim: Hebrew did not exist as a language until roughly 1100-1000 BCE.
- Ep 152 · Dan McClellan (Host) · asserted · _Hebrew language origins_: “Hebrew didn't exist in the 1400s. So no, it doesn't. Hebrew didn't exist until much later. And then narrative prose in Hebrew didn't exist until even later than that.” [00:48:30]
  - Claim: Hebrew did not exist in the 1400s BCE, so Exodus cannot reflect 15th-century Egyptian borrowings; Hebrew narrative prose is later still.
- Ep 164 · Leslie Baynes (Guest Speaker) · majority · _Pentateuch authorship_: “who were becoming very agitated, uh, when they heard that maybe Moses didn't write the Pentateuch.” [00:13:04]
  - Claim: Critical (German) scholarship by the 19th century held that Moses did not write the Pentateuch.
- Ep 175 · Dan McClellan (Host) · asserted · _Pentateuch authorship_: “it's very clear not only that it was not written by one person, because as we've discussed many times on this channel, it frequently contradicts itself and repeats itself” [00:10:52]
  - Claim: The Pentateuch was clearly not written by one person; it combines different versions of stories.
- Ep 175 · Dan McClellan (Host) · majority · _Pentateuch authorship_: “there are all kinds of indications that, no, this was not written by one person. It was not written in the 15th century BCE, it was not written by Moses.” [00:11:48]
  - Claim: The evidence indicates the Pentateuch was not written by one person, not in the 15th century BCE, and not by Moses.
- Ep 175 · Dan McClellan (Host) · no evidence · _Traditional authorship of Hebrew Bible books_: “People say, Mordecai wrote the book of Esther, except for the parts about his death. These are presuppositions that are not supported by any data whatsoever.” [00:12:48]
  - Claim: Traditional authorship attributions for the historical books (Samuel, Jeremiah, Ezra, Mordecai, etc.) are not supported by any data.
- Ep 175 · Dan McClellan (Host) · asserted · _Hebrew language origins_: “Hebrew didn't exist until around the 11th century BCE at the very earliest.” [00:13:51]
  - Claim: Hebrew did not exist until about the 11th century BCE at the earliest, after any historical Moses.
- Ep 175 · Dan McClellan (Host) · asserted · _Pentateuch dating_: “It's written in a very developed form of Hebrew. Something that is like the second quarter of the first millennium BCE so between the 8th and the 6th centuries BCE.” [00:13:51]
  - Claim: The developed Hebrew of the Pentateuch points to composition between the 8th and 6th centuries BCE.
- Ep 175 · Dan McClellan (Host) · no evidence · _Pentateuch dating_: “all of the data point to a handful of centuries in the middle of the first millennium BCE and there are no data that support the conclusion that it was written before the language it was written in even existed.” [00:14:25]
  - Claim: All the data point to the mid-first millennium BCE for the Pentateuch; no data support a date before Hebrew existed.
- Ep 187 · Dan McClellan (Host) · majority · _Documentary Hypothesis_: “A lot of scholars think this is particularly priestly sounding because the. In the priestly literature we have this idea of God's presence being a cloud.” [00:28:32]
  - Claim: Many scholars attribute the cloud-covered-mountain passage in Exodus 24:15ff to Priestly material, since the cloud as God's presence is a Priestly idea.
- Ep 187 · Dan McClellan (Host) · contested · _Documentary Hypothesis_: “And most likely we've got at the very least two sources, probably three. And some scholars like, like Tim would argue there are four.” [00:31:09]
  - Claim: Exodus 24 (like the Pentateuch as a whole) is a composite of multiple sources; scholars differ on whether two, three or four are present.

### Covenant Code and biblical law

9 claims across 5 Episodes (31, 93, 106, 168, 187). Strength: 0 consensus, 8 majority, 0 no evidence, 0 contested, 1 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 31 · Dan McClellan (Host) · minority view · _Ten Commandments_: “And so some scholars think that the Ritual Decalogue is earlier than the Exodus 20 Ethical Decalogue.” [00:08:39]
  - Claim: Some scholars hold the Ritual Decalogue (Exodus 34) is earlier than the Ethical Decalogue (Exodus 20), a view resting on an outdated ritual-to-ethics model.
- Ep 31 · Dan McClellan (Host) · majority · _Ten Commandments_: “And that trajectory is not taken too seriously by many scholars these days. Most would probably say Exodus 20 is earlier.” [00:08:39]
  - Claim: Most scholars would say the Exodus 20 Decalogue is earlier than the Exodus 34 Ritual Decalogue.
- Ep 31 · Dan McClellan (Host) · majority · _Ten Commandments_: “And a lot of scholars would point to the use of the name in oath where frequently there was some kind of gesture, some kind of lifting up that took place alongside the pronunciation of the divine name.” [00:50:33]
  - Claim: Many scholars connect "do not take the name in vain" with use of the divine name in oaths, not with profanity.
- Ep 93 · Dan McClellan (Host) · majority · _Covenant Code_: “That is what the data indicate. And, and you know, you can look in Exodus 24.” [00:05:52]
  - Claim: The data indicate the laws were not given by God to Moses on Sinai; the Covenant Code is probably the earliest legislation in the Hebrew Bible, later renegotiated.
- Ep 93 · Dan McClellan (Host) · majority · _Exodus 21:20-21 (beating of slaves)_: “most scholars would say in the Hebrew, the idea here seems to be that if the slave lives for a couple of days and then dies, then he's free of punishment.” [00:29:23]
  - Claim: Most scholars read the Hebrew to mean that if the beaten slave survives a day or two and then dies, the owner goes unpunished.
- Ep 93 · Dan McClellan (Host) · majority · _Exodus 22:8 (oath before God)_: “And most scholars would say, this is an ordeal. You're basically trotting them before the divine image and say, yeah, tell it to God's face.” [00:35:35]
  - Claim: Most scholars say being brought before God/the gods in Exodus 22:8 is an ordeal or oath before the divine image.
- Ep 106 · Dan McClellan (Host) · majority · _Covenant Code_: “this is the Covenant Code. I and, and other scholars think this is probably the earliest legislative layer that we have in the Hebrew Bible.” [00:05:15]
  - Claim: Scholars think the Covenant Code is probably the earliest legislative layer in the Hebrew Bible.
- Ep 168 · Dan McClellan (Host) · majority · _Covenant Code_: “I think the majority of scholars agree that the Covenant Code is the earliest legislative stuff in all the Hebrew Bible.” [00:28:44]
  - Claim: The majority of scholars agree the Covenant Code is the earliest legislation in the Hebrew Bible.
- Ep 187 · Dan McClellan (Host) · majority · _Covenant Code_: “a lot of scholars think that Exodus 21 through at least the end of 22, maybe a little bit into chapter 23, might be the earliest legislative literature in all the Hebrew Bible” [00:06:34]
  - Claim: Many scholars think the Covenant Code (Exodus 21-23) may be the earliest legislative literature in the Hebrew Bible.

### Deuteronomy and Josiah's reform

9 claims across 5 Episodes (88, 126, 145, 146, 172). Strength: 1 consensus, 8 majority, 0 no evidence, 0 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 88 · Dan McClellan (Host) · majority · _Josiah's reforms_: “most scholars say Josiah probably did some of this stuff, but, like, the majority of it is just rhetorical.” [00:31:26]
  - Claim: Most scholars say Josiah probably carried out some reforms but that most of the biblical account is rhetorical.
- Ep 88 · Dan McClellan (Host) · majority · _Deuteronomy origins_: “most scholars think that this story is a pretense for the introduction of the book of Deuteronomy, at least a very early stage of the book of Deuteronomy” [00:49:24]
  - Claim: Most scholars think the story of finding the law book under Josiah is a pretense for introducing an early form of Deuteronomy.
- Ep 126 · Dan McClellan (Host) · majority · _Shema (Deuteronomy 6:4)_: “I think most scholars these days are on the side of understanding this to mean Adonai is one” [00:14:50]
  - Claim: Most scholars now read the Shema as 'Yahweh is one' rather than 'Yahweh alone'.
- Ep 126 · Dan McClellan (Host) · majority · _Shema (Deuteronomy 6:4)_: “So I think most scholars would say, "The Lord our God, namely, the Lord is one," or "Adonai is one.” [00:16:02]
  - Claim: Most scholars translate the Shema as 'The Lord our God, the Lord is one'.
- Ep 145 · Dan Beecher (Host) · majority · _Deuteronomy dating_: “And so a lot of critical scholars— again, this is something probably written toward the end of the 7th century BCE” [00:37:04]
  - Claim: Many critical scholars date Deuteronomy to the late 7th century BCE, modelled on Neo-Assyrian vassal treaties.
- Ep 145 · Dan McClellan (Host) · majority · _Deuteronomy 20 (herem law)_: “Verses 15 through 18 are usually agreed by scholars to be part of a secondary literary layer that has been added on later.” [00:44:12]
  - Claim: Scholars usually agree Deuteronomy 20:15-18 is a secondary literary layer added later to the rules of war.
- Ep 146 · Dan McClellan (Host) · majority · _Deuteronomy and the Vassal Treaty of Esarhaddon_: “a lot of critical scholars for, for a long time now, uh, have been convinced that the book of Deuteronomy was basically patterned after the vassal treaty of Esarhaddon” [00:40:10]
  - Claim: Many critical scholars have long held that Deuteronomy was patterned after the Vassal Treaty of Esarhaddon.
- Ep 146 · Dan McClellan (Host) · consensus · _Deuteronomy and the Vassal Treaty of Esarhaddon_: “most critical scholars are in pretty widespread agreement that Deuteronomy is, is picking up a lot of inspiration from what is going on in the Vassal Treaty of Esarhaddon” [00:46:52]
  - Claim: Most critical scholars are in widespread agreement that Deuteronomy draws on the Vassal Treaty of Esarhaddon, the source of the biblical covenant idea.
- Ep 172 · Dan McClellan (Host) · majority · _Josiah's reform_: “The notion that it was so widespread and involved literally killing people and all that kind of stuff, most scholars would say, yeah, it was not that.” [00:07:09]
  - Claim: Most scholars think Josiah's reforms were not as widespread or violent as 2 Kings 23 portrays; the account is propaganda.

### Genesis creation accounts

11 claims across 8 Episodes (1, 20, 22, 29, 56, 81, 90, 142). Strength: 2 consensus, 9 majority, 0 no evidence, 0 contested, 0 minority view, 0 asserted. 1 from Guest Speakers.

- Ep 1 · Dan McClellan (Host) · majority · _Genesis creation accounts_: “So most scholars would agree that we've got two different creation stories in the first three chapters of Genesis” [00:02:19]
  - Claim: Most scholars agree Genesis 1-3 contains two different creation stories (Gen 1:1-2:4a and Gen 2:4b-3:24).
- Ep 1 · Dan McClellan (Host) · majority · _Genesis creation accounts_: “And that second one, most scholars would say, is probably the earlier one.” [00:02:19]
  - Claim: Most scholars say the second creation story (Genesis 2-3) is probably the earlier of the two.
- Ep 1 · Dan McClellan (Host) · majority · _Genesis creation accounts_: “We've got six days and then a day of rest, which many scholars would suggest, one, is borrowing from the sevenfold division of days that was common in Mesopotamia around that time period.” [00:04:28]
  - Claim: Many scholars suggest the seven-day structure of Genesis 1 borrows from the Mesopotamian sevenfold division of days and marks out sacred time in the absence of a temple (exilic setting).
- Ep 1 · Dan McClellan (Host) · majority · _Genesis creation accounts_: “That's probably what most scholars would say about this. So the first creation account, probably 8th-7th century BCE, somewhere around there; Genesis 1, the later creation account, probably 6th, maybe even 5th century BCE.” [00:05:36]
  - Claim: Most scholars date the Genesis 2-3 account to roughly the 8th-7th century BCE and Genesis 1 to the 6th or 5th century BCE.
- Ep 20 · Dan McClellan (Host) · majority · _Genesis genealogies (patriarch ages)_: “And so a lot of scholars would say what's going on in Genesis 5 is probably kind of reflecting traditions that are being borrowed from these Akkadian, probably Babylonian traditions about the ages of ancient kings.” [00:10:05]
  - Claim: Many scholars say the Genesis 5 genealogy reflects traditions borrowed from Akkadian/Babylonian king lists about the ages of ancient kings.
- Ep 22 · Dan McClellan (Host) · majority · _Creation accounts in the Hebrew Bible_: “And then we also, I and many other scholars have argued, have at least one more creation account or at least vestiges of one more creation account scattered around Isaiah and Psalms and Job and elsewhere.” [00:56:23]
  - Claim: Many scholars argue that besides Genesis 1 and Genesis 2-3 there are vestiges of at least one more creation account in Isaiah, Psalms, Job and elsewhere.
- Ep 29 · Dan McClellan (Host) · majority · _Adam and Eve_: “And so in a story that many scholars have suggested likely influenced the development of the story of Adam and Eve, we have a deity telling Adapa, the human, something that ends up denying that human access to immortality.” [00:48:24]
  - Claim: Many scholars suggest the Mesopotamian Adapa story likely influenced the development of the Adam and Eve story.
- Ep 56 · David Carr (Guest Speaker) · majority · _Primeval history (Genesis 1-11) composition_: “Many scholars maybe because the Garden of Eden story is so famous and so central and that sort of thing presuppose the Garden of Eden story was first” [00:29:52]
  - Claim: Many scholars presuppose the Garden of Eden story came first and the Cain and Abel story imitates it (Carr argues the reverse).
- Ep 81 · Dan McClellan (Host) · majority · _Tower of Babel_: “And so a lot of scholars think that this story is kind of thumbing the nose at those morons over in Babylon who've got this gigantic unfinished tower.” [00:18:48]
  - Claim: Many scholars think the Babel story mocks Babylon's long-unfinished Etemenanki ziggurat.
- Ep 90 · Dan McClellan (Host) · consensus · _Genesis 4:1_: “The consensus view is that the idea here is that as with most childbirth and child rearing in the ancient world, it was so fraught with risk that any successful conception, gestation, delivery was attributed to the blessing of a deity.” [00:47:44]
  - Claim: The consensus view is that Eve's statement credits Yahweh's help in childbirth, not that God fathered Cain through intercourse.
- Ep 142 · Dan McClellan (Host) · consensus · _Genesis 2:17 death warning_: “The consensus view is that this means if you eat from that tree, you will be put to death relatively immediately on that, on that day, within that 24-hour period, you are executed.” [00:10:13]
  - Claim: The consensus view is that 'in the day you eat of it you shall die' means execution within that same day, not the onset of mortality.

### Flood narrative and Noah

10 claims across 6 Episodes (27, 41, 56, 95, 124, 183). Strength: 0 consensus, 8 majority, 1 no evidence, 0 contested, 0 minority view, 1 asserted. 1 from Guest Speakers.

- Ep 27 · Dan McClellan (Host) · majority · _Nephilim_: “So Nephilim, there, there is some debate about what this means, but I, I think most scholars would probably say this comes from the verbal root nafal, which means to fall, and is frequently used to refer to dying.” [00:32:17]
  - Claim: The meaning of Nephilim is debated, but most scholars derive it from the root nafal, "to fall".
- Ep 27 · Dan McClellan (Host) · majority · _Sons of God (Genesis 6:1-4)_: “Many scholars would say this is a fragment from some separate story and is just kind of inserted at the beginning of chapter six here to make itself seem like there was some reason for God to be upset.” [00:34:44]
  - Claim: Many scholars say Genesis 6:1-4 is a fragment of a separate story inserted at the start of chapter 6 to motivate the flood.
- Ep 41 · Dan McClellan (Host) · majority · _Noah_: “a lot of scholars think that the story of Noah before the flood story was. Was put in here, was just a story of the etiology for viticulture.” [00:05:03]
  - Claim: Many scholars think the Noah story, before the flood story was added, was an etiology for viticulture.
- Ep 41 · Dan McClellan (Host) · majority · _Curse of Ham / Canaan_: “So a lot of scholars think originally this story was probably about Shem, Japheth and Canaan.” [00:10:09]
  - Claim: Many scholars think the story in Genesis 9 was originally about Shem, Japheth and Canaan, with Ham added later.
- Ep 56 · David Carr (Guest Speaker) · majority · _Flood narrative_: “Now, many scholars have pointed out in the last decade or two, there are, there are some gaps at points where it seems like, for example, that the J or non-P story doesn't have an account of Noah receiving instructions to build the ark” [00:52:04]
  - Claim: Many scholars have noted gaps in the non-P flood strand, such as no account of Noah being told to build the ark.
- Ep 95 · Dan McClellan (Host) · majority · _Flood narrative_: “these days, most scholars divide it up into at least two different stories about the Flood, each with its own beginning, middle, and end.” [00:23:07]
  - Claim: Most scholars divide the Genesis flood narrative into at least two originally separate stories.
- Ep 95 · Dan McClellan (Host) · majority · _Noah_: “So I think, and many scholars would agree, that initially Noah was really just the. The first viticulturist.” [00:32:48]
  - Claim: Many scholars agree that Noah was originally just the first viticulturist, with the flood story attached later.
- Ep 124 · Dan McClellan (Host) · majority · _Flood narrative_: “convince, I think, most critical scholars that the flood tradition is a secondary insertion into The Primeval History.” [00:40:52]
  - Claim: Most critical scholars are convinced the flood tradition is a secondary insertion into the Primeval History.
- Ep 183 · Dan McClellan (Host) · no evidence · _Noah's Ark (Durupinar site)_: “So there's a tunnel there as well. Although we've—we've seen no data that indicate there's a tunnel.” [00:06:21]
  - Claim: No data have been produced showing a tunnel or structure at the claimed Noah's Ark site.
- Ep 183 · Dan McClellan (Host) · asserted · _Flood narrative dating_: “And the story uses that designation, which is a pretty good chronological indicator of when the story was written.” [00:16:56]
  - Claim: The flood story's use of 'Ararat', a region named for a people that did not exist until some two thousand years after an ostensible Noah, is a chronological indicator that the story was written late.

### Isaiah: authorship and the prophet

11 claims across 4 Episodes (2, 43, 120, 158). Strength: 4 consensus, 5 majority, 0 no evidence, 2 contested, 0 minority view, 0 asserted. 1 from Guest Speakers.

- Ep 2 · Francesca Stavrakopoulou (Guest Speaker) · majority · _Isaiah 6 and Ezekiel 1 relative dating_: “if Isaiah 6 is older, which most scholars would probably argue, maybe, but I think there's some kind of intertextual relationship going on between those two.” [00:46:44]
  - Claim: Most scholars would probably argue Isaiah 6 is older than Ezekiel 1.
- Ep 43 · Dan McClellan (Host) · consensus · _Isaiah (prophet)_: “Critical scholarship is in agreement that there was a dude named Isaiah who probably was a core prophet for perhaps King Hezekiah.” [00:33:47]
  - Claim: Critical scholarship agrees there was a historical prophet Isaiah, probably active under Hezekiah.
- Ep 43 · Dan McClellan (Host) · consensus · _Isaiah authorship_: “So out of methodological necessity, critical scholarship cannot accept real prophecy, at least in my opinion. Which means that, no, if the text says there's this dude named Cyrus, that text was written after that dude named Cyrus was on the scene.” [00:43:07]
  - Claim: Critical scholarship, methodologically unable to accept real prophecy, dates the Isaiah text naming Cyrus to after Cyrus appeared.
- Ep 43 · Dan McClellan (Host) · majority · _Isaiah authorship_: “Isaiah 40-55 at least, were probably composed after the Babylonian exile. Most scholars would say somewhere around 520 BCE.” [00:45:20]
  - Claim: Most scholars date Isaiah 40-55 (Deutero-Isaiah) to after the Babylonian exile, around 520 BCE.
- Ep 43 · Dan McClellan (Host) · majority · _Isaiah authorship_: “I think most scholars would say the majority, half to the majority of Isaiah 1-39 is probably the work of an 8th-century prophet who went by Isaiah” [00:47:47]
  - Claim: Most scholars would say half to the majority of Isaiah 1-39 is the work of an 8th-century prophet Isaiah.
- Ep 43 · Dan McClellan (Host) · consensus · _Isaiah authorship_: “But what the overwhelming majority of scholars agree on is that Isaiah 40 through the end of Isaiah were absolutely not written in the 8th or even the 7th century BCE, but were written much later.” [00:48:54]
  - Claim: The overwhelming majority of scholars agree Isaiah 40-66 was not written in the 8th or 7th century BCE but much later.
- Ep 43 · Dan McClellan (Host) · contested · _Isaiah authorship_: “has a very complex compositional history that scholars are still working on, trying to, trying to come to some kind of agreement on.” [00:48:54]
  - Claim: The detailed compositional history of Isaiah is still debated without agreement.
- Ep 120 · Dan McClellan (Host) · consensus · _Isaiah authorship_: “There are portions of Isaiah 1-39 that are agreed to have been written by Isaiah. I think that scholars probably understand at least chapter six and, and probably the majority of the chapters that came before were probably written later on” [00:55:23]
  - Claim: Scholars agree only portions of Isaiah 1-39 go back to Isaiah; chapter 6 and much before it were probably written later as an introduction.
- Ep 120 · Dan McClellan (Host) · majority · _Isaiah (prophet)_: “most scholars agree there was probably a court prophet in the 8th century BCE who was named Isaiah and prophesied” [00:55:23]
  - Claim: Most scholars agree there was probably a historical eighth-century BCE court prophet named Isaiah, some of whose writings survive in the book.
- Ep 120 · Dan McClellan (Host) · contested · _Isaiah 6_: “So it's unclear which exactly I think is in view. I think scholars have argued about this for many years” [00:56:26]
  - Claim: Scholars have long argued over whether the desolation in Isaiah 6:11-12 refers to the fall of the Northern Kingdom or the Babylonian exile.
- Ep 158 · Dan McClellan (Host) · majority · _Prophetic books dating_: “Most scholars agree that there are parts of, large parts of, some of the prophetic books that were actually written in the 8th century BCE.” [00:35:19]
  - Claim: Most scholars agree that large parts of some prophetic books were actually written in the 8th century BCE.

### Daniel: date and composition

6 claims across 3 Episodes (34, 45, 70). Strength: 1 consensus, 4 majority, 0 no evidence, 1 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 34 · Dan McClellan (Host) · majority · _Book of Daniel composition_: “And oddly enough, even that division, that simple dividing in half 1 through 6 and 7 through 12 doesn't align with how scholars think the text actually came together.” [00:06:37]
  - Claim: Scholars hold that Daniel did not come together along the simple chapters 1-6 / 7-12 division.
- Ep 34 · Dan McClellan (Host) · majority · _Book of Daniel historicity_: “And one, this does not remotely solve the overwhelming majority of the historical and textual problems with the book of Daniel.” [00:27:48]
  - Claim: The 19th-century discovery of an inscription naming Belshazzar does not resolve the great majority of Daniel's historical and textual problems (e.g. Belshazzar was not Nebuchadnezzar's son).
- Ep 34 · Dan McClellan (Host) · consensus · _Book of Daniel dating_: “And so the scholarly consensus is that it was in this period when this text was written.” [00:44:03]
  - Claim: The scholarly consensus is that Daniel was written c. 167-164 BCE, during the persecution under Antiochus IV Epiphanes.
- Ep 34 · Dan McClellan (Host) · contested · _Book of Daniel composition_: “Like, that's not how all scholars resolve this. But I think that's, that's the one that makes the most sense to me.” [00:52:41]
  - Claim: Scholars do not all agree on the order in which the sections of Daniel (e.g. chapter 7) were added.
- Ep 45 · Dan McClellan (Host) · majority · _Book of Daniel composition_: “at least the data point in that direction that it looks like we may have pieces of pre-Daniel traditions floating around preserved at Qumran.” [00:45:52]
  - Claim: The Qumran data point to pre-Daniel traditions circulating independently before the biblical book of Daniel.
- Ep 70 · Dan McClellan (Host) · majority · _Bel and the Dragon_: “a lot of scholars think that this story of, particularly the story of Daniel in the lion's den comes from before the story that actually gets preserved in the canonical book of Daniel.” [00:31:24]
  - Claim: Many scholars think the lion's den story in Bel and the Dragon predates the version in canonical Daniel.

### 1 Enoch, Jubilees, and pseudepigraphy

11 claims across 5 Episodes (15, 62, 98, 137, 157). Strength: 1 consensus, 7 majority, 0 no evidence, 1 contested, 0 minority view, 2 asserted. 0 from Guest Speakers.

- Ep 15 · Dan McClellan (Host) · majority · _1 Enoch dating_: “I think there are five distinct books within the Book of Enoch and they are generally dated to different periods by scholars starting around 300 BCE down to probably close to the turn of the era.” [00:26:55]
  - Claim: Scholars generally date the five books within 1 Enoch to different periods from about 300 BCE to around the turn of the era.
- Ep 62 · Dan McClellan (Host) · asserted · _1 Enoch_: “It's something that was attributed to some towering figure from Jewish or Christian history that was very clearly not written by that person.” [00:02:17]
  - Claim: 1 Enoch is pseudepigrapha, very clearly not written by Enoch.
- Ep 62 · Dan Beecher (Host) · asserted · _Pseudepigraphy in the Bible_: “But plenty of Bible books that are part of the canon are. Are pseudepigrapha as well.” [00:03:04]
  - Claim: Plenty of canonical biblical books are themselves pseudepigrapha.
- Ep 62 · Dan McClellan (Host) · consensus · _1 Enoch_: “And scholars agree that the earliest layer of it—it came together over a long period of time—the earliest portions of it probably date to around 300 BCE and probably originally written in Aramaic” [00:09:10]
  - Claim: Scholars agree the earliest portions of 1 Enoch date to around 300 BCE and were probably written in Aramaic.
- Ep 62 · Dan McClellan (Host) · majority · _1 Enoch_: “portions of it, scholars think, have been edited and redacted as it's coming together.” [00:10:20]
  - Claim: Scholars think portions of 1 Enoch were edited and redacted as it came together over centuries.
- Ep 62 · Dan McClellan (Host) · contested · _1 Enoch_: “And some scholars think this is like a later interpolation because the whole point of this book is everything works perfectly.” [00:23:58]
  - Claim: Some scholars think chapter 80 of 1 Enoch (Astronomical Book) is a later interpolation.
- Ep 98 · Dan McClellan (Host) · majority · _1 Peter 3:19 (spirits in prison)_: “a lot of critical scholars these days are leaning in the direction of understanding Peter to be referring to the angels.” [00:28:40]
  - Claim: Many critical scholars now understand the spirits in prison of 1 Peter 3:19 to be the disobedient angels of the Enochic tradition.
- Ep 137 · Dan McClellan (Host) · majority · _Book of Jubilees authorship_: “it is generally considered a pseudepigraphical text. It is non-canonical for the overwhelming majority of, uh, Christianity as well as Judaism.” [00:03:04]
  - Claim: Jubilees is generally considered a pseudepigraphical text, not actually written by its purported author.
- Ep 137 · Dan McClellan (Host) · majority · _Book of Jubilees dating_: “Most scholars would say Jubilees was probably written somewhere between 160 to 150 BCE.” [00:04:21]
  - Claim: Most scholars date the composition of Jubilees to roughly 160-150 BCE, in the Hellenistic period.
- Ep 137 · Dan McClellan (Host) · majority · _Book of Jubilees influence on the New Testament_: “And there are a handful of other places where scholars think that the influence is coming through.” [00:24:35]
  - Claim: Scholars think the influence of Jubilees is reflected in a handful of New Testament passages.
- Ep 157 · Dan McClellan (Host) · majority · _1 Enoch / Book of the Watchers_: “a lot of scholars would suggest this is a theory of the origin of evil. So you've got the Garden of Eden story and the fall, and then you've got Enoch and the angels coming down and teaching evil to humanity.” [00:39:36]
  - Claim: Many scholars read the Watchers narrative in 1 Enoch as a theory of the origin of evil, alternative to the Eden story.

### Dead Sea Scrolls and Qumran

10 claims across 5 Episodes (3, 45, 123, 147, 158). Strength: 2 consensus, 6 majority, 0 no evidence, 2 contested, 0 minority view, 0 asserted. 4 from Guest Speakers.

- Ep 3 · Dan McClellan (Host) · majority · _Dead Sea Scrolls forgeries (post-2002 fragments)_: “We had a lot of scholars who were starting to do research on these fragments and look closely at them, who decided, it seems like these are forgeries, that these aren't real.” [00:40:45]
  - Claim: Many scholars who examined the post-2002 "Dead Sea Scrolls" fragments sold on the market concluded they are forgeries.
- Ep 3 · Dan McClellan (Host) · consensus · _Dead Sea Scrolls forgeries (post-2002 fragments)_: “And so obviously there are a lot of folks who would rather not accept the findings of Dr. Kipp Davis and other scholars who still think they, they are genuine, but they're almost certainly forgeries.” [00:42:26]
  - Claim: The post-2002 unprovenanced "Dead Sea Scrolls" fragments (e.g. Museum of the Bible, Azusa Pacific) are almost certainly forgeries, though some still hold out for authenticity.
- Ep 45 · Kipp Davis (Guest Speaker) · majority · _Qumran_: “It's a site of ruins that scholars believe was occupied by Jewish ascetics.” [00:07:55]
  - Claim: Scholars believe Qumran was occupied by Jewish ascetics (associated with the Essenes).
- Ep 45 · Kipp Davis (Guest Speaker) · majority · _Songs of the Sabbath Sacrifice_: “where they explain in some detail the procedures of what scholars tend to think they, they, they, they undertook on a regular basis.” [00:10:19]
  - Claim: Scholars tend to think the Songs of the Sabbath Sacrifice describe worship procedures the Qumran community regularly undertook.
- Ep 45 · Kipp Davis (Guest Speaker) · majority · _Dead Sea Scrolls_: “But scholars assume it was there because as Nehemiah was collected along with Ezra, and we have Ezra there, so scholars think possibly also, probably also Nehemiah.” [00:27:56]
  - Claim: Scholars think Nehemiah was probably among the Dead Sea Scrolls because it was collected with Ezra, which is attested.
- Ep 45 · Kipp Davis (Guest Speaker) · consensus · _Post-2002 Dead Sea Scrolls fragments (forgeries)_: “And scientific forensic testing has been conducted on, I think it's nine fragments from the Schoyen collection on all 16 fragments from the Museum of the Bible and has demonstrated with a high degree of confidence that yes, they are.” [01:02:16]
  - Claim: Forensic testing has demonstrated with high confidence that the tested Schoyen and Museum of the Bible Dead Sea Scroll fragments are modern forgeries.
- Ep 123 · Dan McClellan (Host) · majority · _Qumran community / Essenes_: “the Essenes, which are another group that I think probably most scholars today would say is how the folks at Qumran who are responsible for storing at least the Dead Sea Scrolls, how they would have identified.” [00:37:47]
  - Claim: Most scholars today identify the Qumran group responsible for the Dead Sea Scrolls as Essenes.
- Ep 147 · Dan McClellan (Host) · contested · _Book of Esther at Qumran_: “some scholars would say, well, it probably would have been a part of the, uh, a scroll containing other books.” [00:08:58]
  - Claim: Some scholars say Esther's absence from the Dead Sea Scrolls is not decisive, since it may have been on a scroll with other books.
- Ep 147 · Dan McClellan (Host) · contested · _Book of Esther at Qumran_: “But some scholars think maybe it's because it doesn't mention God. Maybe they were like, ooh, not you.” [00:10:58]
  - Claim: Some scholars think Esther is missing from Qumran because it does not mention God, though the absence may be chance.
- Ep 158 · Dan McClellan (Host) · majority · _Essenes / Qumran community_: “I think the majority of scholars would probably say that one of their main beefs was that they don't believe the Hasmonean priestly line has a legitimate claim to the priesthood.” [00:19:31]
  - Claim: The majority of scholars hold that a main grievance of the Qumran Essenes was that the Hasmonean priestly line had no legitimate claim to the priesthood.

### Hebrew Bible text: Masoretic Text and Septuagint

12 claims across 6 Episodes (11, 99, 100, 122, 155, 159). Strength: 1 consensus, 10 majority, 0 no evidence, 1 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 11 · Dan McClellan (Host) · majority · _Masoretic Text manuscripts_: “The Sassoon Codex, which many scholars think is maybe a little bit older than the Aleppo Codex.” [00:11:05]
  - Claim: Many scholars think the Sassoon Codex may be slightly older than the Aleppo Codex.
- Ep 99 · Dan McClellan (Host) · majority · _Leningrad Codex_: “Yeah. And in fact, I think scholars think it was probably transcribed in, in Egypt.” [00:44:28]
  - Claim: Scholars think the Leningrad Codex was probably transcribed in Egypt.
- Ep 100 · Dan McClellan (Host) · majority · _Septuagint_: “most scholars think the first five books of Moses were definitely translated first before everything else.” [00:46:14]
  - Claim: Most scholars think the five books of Moses were the first part of the Hebrew Bible translated into Greek.
- Ep 100 · Dan McClellan (Host) · majority · _Septuagint_: “third century BC is when most scholars date the, the earliest translations.” [00:48:16]
  - Claim: Most scholars date the earliest Septuagint translations (the Pentateuch) to the third century BCE.
- Ep 100 · Dan McClellan (Host) · majority · _Septuagint_: “the majority of scholars would would agree that the Septuagint is the Old Testament of the New Testament.” [00:54:04]
  - Claim: Though still debated, the majority of scholars agree the Septuagint was the Old Testament used by the New Testament authors.
- Ep 122 · Dan McClellan (Host) · majority · _Leningrad Codex_: “for the Hebrew Bible, the Leningrad Codex from about 1008 CE is generally considered your starting point.” [00:47:59]
  - Claim: The Leningrad Codex (c. 1008 CE) is generally considered the base text for critical editions of the Hebrew Bible.
- Ep 155 · Dan McClellan (Host) · consensus · _Letter of Aristeas / Septuagint origins_: “And I think that's more or less the consensus view today. There are certainly scholars who will say this was written a century later and this is mostly made up” [00:21:58]
  - Claim: The consensus view today is that the Letter of Aristeas's account of the Septuagint's origin is myth, not history.
- Ep 155 · Dan McClellan (Host) · majority · _Letter of Aristeas / Septuagint origins_: “Not scholars. Most scholars are in agreement that that's definitely not what happened.” [00:30:46]
  - Claim: Most scholars agree the Septuagint was definitely not produced the way the Letter of Aristeas describes.
- Ep 159 · Dan McClellan (Host) · majority · _Masoretic Text_: “they basically produced the textual tradition that is considered most authoritative by the most Jewish folks, at least in terms of those who are approaching the Hebrew Bible from a Jewish devotional point of view, as well as most scholars.” [00:31:40]
  - Claim: Most scholars consider the Masoretic tradition the most authoritative textual tradition of the Hebrew Bible.
- Ep 159 · Dan McClellan (Host) · majority · _Masoretes_: “the Masoretic group, is usually dated to between around 500 CE and around 1000 CE.” [00:32:45]
  - Claim: The Masoretes are usually dated to between about 500 and 1000 CE.
- Ep 159 · Dan McClellan (Host) · majority · _Masoretic Text_: “I think a lot of scholars would say the Masoretes are probably correct more frequently than the Septuagint is correct.” [00:47:49]
  - Claim: Many scholars hold that where Masoretic vocalization and the Septuagint's reading differ, the Masoretes are more often correct.
- Ep 159 · Dan McClellan (Host) · contested · _Masoretes_: “And there are debates. There are some folks who think that the Masoretes were Karaites, which is kind of a minority branch of Judaism that is looked down upon by some other groups within Judaism.” [00:51:15]
  - Claim: It is debated whether the Masoretes were Karaites.

### Psalms and Song of Songs: authorship

4 claims across 3 Episodes (83, 154, 175). Strength: 1 consensus, 0 majority, 0 no evidence, 0 contested, 0 minority view, 3 asserted. 0 from Guest Speakers.

- Ep 83 · Dan McClellan (Host) · consensus · _Psalms authorship (David)_: “the traditional notion that David wrote all the psalms or any of the psalms is not considered to be historical by scholars.” [00:09:15]
  - Claim: Scholars do not regard the tradition that David wrote the Psalms, or any of them, as historical.
- Ep 154 · Dan McClellan (Host) · asserted · _Song of Songs authorship_: “But this is definitely not written by Solomon. This is coming many centuries after the life of any historical Solomon who may have existed.” [00:03:04]
  - Claim: Song of Songs was definitely not written by Solomon; it comes many centuries after any historical Solomon.
- Ep 154 · Dan McClellan (Host) · asserted · _Song of Songs dating_: “we can say for certain is that the Song of Songs was not written by anybody in that time period. This comes from much later, probably the Persian period” [00:04:54]
  - Claim: Song of Songs is certainly post-exilic, probably Persian or Hellenistic period (5th-3rd century BCE).
- Ep 175 · Dan McClellan (Host) · asserted · _Psalms authorship_: “And then we get to the Psalms. David didn't write any of this.” [00:12:48]
  - Claim: David did not write the Psalms.

### Other texts: passing remarks

52 claims on 44 subjects, none grouped into a cluster above.

- Ep 158 · Dan McClellan (Host) · majority · _1 and 2 Maccabees dating_: “a lot of scholars think that the books of 1 and 2 Maccabees were probably written fairly close to what's going on, is because they treat the Romans as allies.” [00:18:34]
  - Claim: Many scholars think 1 and 2 Maccabees were written fairly close to the events because they treat the Romans as allies.
- Ep 158 · Dan McClellan (Host) · majority · _1 and 2 Maccabees dating_: “this is why the scholars think that 1 and 2 Maccabees were written before 63 BCE, because Rome is treated as more of an ally than an enemy.” [00:21:08]
  - Claim: Scholars think 1 and 2 Maccabees were written before 63 BCE, because Rome is treated as an ally rather than an enemy.
- Ep 89 · Dan McClellan (Host) · majority · _1 Corinthians 5:5_: “this obviously refers to death these days. I think more scholars would suggest that probably doesn't seem to be in view.” [00:32:34]
  - Claim: More scholars today hold that handing the man over to Satan for the destruction of the flesh does not mean death but expulsion from the community.
- Ep 159 · Dan McClellan (Host) · majority · _1 Esdras_: “I think a lot of scholars say there's a chiasm, and chiasmus is this idea where you have like theme A, theme B, theme C” [00:04:35]
  - Claim: Many scholars say 1 Esdras reorders material from Ezra-Nehemiah to create a chiastic structure.
- Ep 138 · Dan McClellan (Host) · majority · _2 Thessalonians 3:10 interpretation_: “And so does the context support that interpretation? I'm going to say, along with the majority of scholars, of course not, you jerk.” [00:13:26]
  - Claim: The majority of scholars hold that the context of 2 Thessalonians 3:10 does not support using it to justify denying food to the poor.
- Ep 138 · Dan McClellan (Host) · consensus · _2 Thessalonians 3:10 interpretation_: “One is the consensus reading. This is where if you look in commentaries, this is overwhelmingly going to be the one that is preferred by the majority of scholars.” [00:13:51]
  - Claim: There is a consensus reading of 2 Thessalonians 3:10 overwhelmingly preferred in commentaries, alongside a minority reading (about apostles earning their own keep).
- Ep 138 · Dan McClellan (Host) · majority · _2 Thessalonians 3:10 interpretation_: “most scholars today suggest that this is a reference to people who again are not poor, are not needy, are relatively well off, who are deciding they're just going to coast into the eschaton.” [00:18:24]
  - Claim: Most scholars read 2 Thessalonians 3:10 as condemning relatively well-off people who stopped working in expectation of an imminent second coming, not the poor or needy.
- Ep 23 · Dan McClellan (Host) · consensus · _Abortion in the Bible_: “Yeah, the overwhelming consensus is that the Hebrew here is referring to what is occurring prior to actual conception.” [00:13:06]
  - Claim: The overwhelming consensus is that the Hebrew of Jeremiah 1:5 refers to what precedes conception, not to the fetus in the womb.
- Ep 54 · Dan McClellan (Host) · majority · _Acts of the Apostles composition_: “So a lot of scholars would suggest this is intentional craftsmanship on the part of the author of Acts, who is traditionally labeled Luke.” [00:04:39]
  - Claim: Many scholars see the disappearance of Peter and the Jerusalem apostles after Acts 15 as intentional craftsmanship by the author.
- Ep 186 · Dan McClellan (Host) · majority · _Antitheses (Sermon on the Mount)_: “scholars will point out that this is actually taken from the Gospel of Mark, whereas the, the antitheses seem to be more uniquely Matthean.” [00:23:09]
  - Claim: Scholars note that Matthew 15's 'must surely die' saying is taken over from Mark, whereas the antitheses appear to be uniquely Matthean.
- Ep 18 · Dan McClellan (Host) · consensus · _Balaam's donkey (Numbers 22)_: “And overwhelmingly, scholars agree that this is likely a separate tradition that has been worked into this story in an effort to kind of editorialize Balaam a little bit.” [00:08:03]
  - Claim: Scholars overwhelmingly agree the donkey episode in Numbers 22 is a separate tradition inserted into the Balaam story to mock Balaam.
- Ep 20 · Dan McClellan (Host) · majority · _Ben Sira (Sirach) authorship_: “But then you have issues like Ecclesiasticus, Ben Sira, which most scholars think the authorship seems secure.” [00:51:21]
  - Claim: Most scholars think Ben Sira's self-described authorship is historically secure.
- Ep 130 · Dan McClellan (Host) · majority · _Book of Baruch dating_: “And so most scholars would say Baruch was probably written 1st century BCE, 1st century CE.” [00:09:21]
  - Claim: Most scholars date Baruch to the 1st century BCE or 1st century CE, not the exile.
- Ep 147 · Dan McClellan (Host) · majority · _Book of Esther (absence of God)_: “Now, I think most scholars would say that the text is kind of expecting you to find God in the background.” [00:06:50]
  - Claim: Most scholars think Hebrew Esther, though it never mentions God, expects readers to find God working in the background.
- Ep 133 · Dan McClellan (Host) · majority · _Book of Hosea authorship_: “we don't have a real clear idea about what is genuine and what is not, but most scholars think that probably the majority of it is genuine.” [00:38:48]
  - Claim: What is genuine in Hosea is unclear, but most scholars think the majority of the book goes back to Hosea.
- Ep 133 · Dan McClellan (Host) · majority · _Book of Hosea authorship_: “A lot of scholars think this is actually written by the people who collected and published Hosea's writings rather than by Hosea himself.” [01:04:33]
  - Claim: Many scholars think Hosea 14:9 was written by the book's collectors/editors rather than Hosea.
- Ep 130 · Dan McClellan (Host) · majority · _Book of Jeremiah authorship_: “now the Book of Jeremiah, portions of that are thought to be authentic, to come from the exilic period.” [00:09:21]
  - Claim: Portions of the Book of Jeremiah are thought to be authentic and to come from the exilic period.
- Ep 63 · Dan McClellan (Host) · majority · _Book of Judges composition_: “There are a lot of scholars who think some of the early parts of Judges, Judges 5, maybe Judges 9 through 11, maybe some of these go back to traditions that existed before Israel was even a thing” [00:55:08]
  - Claim: Many scholars think parts of Judges (ch. 5, perhaps 9-11) go back to traditions predating Israel as a polity.
- Ep 72 · Dan McClellan (Host) · no evidence · _Book of Ruth historicity_: “Now at the same time, this... there's absolutely no indication any of this is historical.” [00:24:48]
  - Claim: There is no indication that the story of Ruth is historical.
- Ep 110 · Dan McClellan (Host) · consensus · _Didache_: “scholars agree that this, this is our best shot at reconstructing what it may have looked like in, in the first century CE.” [00:31:59]
  - Claim: Scholars agree the 11th-century manuscript of the Didache, which preserves much older Greek, is the best basis for reconstructing the first-century text.
- Ep 157 · Dan McClellan (Host) · contested · _El Roi (Genesis 16:13)_: “It's confusing, and, and some scholars suggest that it has been corrupted, that the letters have changed somehow.” [00:14:11]
  - Claim: The meaning of El Roi / Genesis 16:13 is uncertain, and some scholars suggest the text has been corrupted.
- Ep 44 · Dan McClellan (Host) · majority · _Eunuchs for the kingdom (Matthew 19:12)_: “you talk about how scholars have long interpreted this as... it's like, well, it doesn't really make much sense if they're talking about actual willful castration.” [00:37:13]
  - Claim: Scholars have long interpreted Matthew's eunuch saying as celibacy rather than literal castration.
- Ep 10 · Dan McClellan (Host) · majority · _Eunuchs in Matthew 19_: “And most scholars would say this probably isn't talking about self-castration. It probably means there are men who are swearing off sex.” [00:53:23]
  - Claim: Most scholars say the "eunuchs for the kingdom" of Matthew 19 refers to celibacy, not self-castration.
- Ep 39 · Dan McClellan (Host) · majority · _Exagoge of Ezekiel the Tragedian_: “Which most scholars would suggest is a, a dream about deification, describing Moses becoming a deity, taking on God's authority” [00:50:07]
  - Claim: Most scholars read Moses' throne dream in the Exagoge as a dream about deification.
- Ep 65 · Dan McClellan (Host) · majority · _Ezekiel 13 (keset)_: “And scholars have long thought that this is cognate with an Akkadian term.” [00:46:20]
  - Claim: Scholars have long thought the Hebrew keset in Ezekiel 13 is cognate with an Akkadian term.
- Ep 8 · Aaron Higashi (Guest Speaker) · majority · _Ezra-Nehemiah dating_: “Some of these issues return again in Nehemiah, which many scholars take to be a bit later.” [00:37:02]
  - Claim: Many scholars take Nehemiah to be somewhat later than Ezra.
- Ep 157 · Dan McClellan (Host) · contested · _Genesis 16:12 (Ishmael oracle)_: “And this is actually - there is actually an interpretive debate here among some scholars.” [00:08:29]
  - Claim: Scholars debate whether Ishmael 'dwelling against the face of his brothers' means living opposite them or living in conflict with them.
- Ep 10 · Dan McClellan (Host) · majority · _Homosexuality in the Bible_: “And so a lot of scholars think that Leviticus 18 is probably the original prohibition.” [00:36:27]
  - Claim: Many scholars think Leviticus 18:22 is the original prohibition and Leviticus 20:13 a later expansion extending the penalty to the other partner.
- Ep 55 · Dan McClellan (Host) · majority · _Joshua 24:19_: “And, and most scholars agree this is, this is not saying that, you know, you're hopeless.” [00:38:30]
  - Claim: Most scholars agree Joshua 24:19 does not mean God categorically refuses to forgive.
- Ep 73 · Dan McClellan (Host) · majority · _Ketef Hinnom silver scrolls_: “Scholars are pretty sure that the purpose of writing this priestly blessing on these scrolls and then rolling them up tight would have been to as. As magical amulets” [00:31:12]
  - Claim: Scholars are fairly sure the Ketef Hinnom scrolls with the priestly blessing functioned as protective magical amulets.
- Ep 13 · Dan McClellan (Host) · contested · _Khirbet Qeiyafa inscription_: “And there's even been a handful of books published about some of these artifacts and an inscription that some scholars argue is the oldest known inscription in the Hebrew language that may date to around 1100 BCE.” [00:07:13]
  - Claim: Whether the Khirbet Qeiyafa ostracon is the oldest Hebrew inscription is debated; some scholars say so, epigraphers such as Rollston say it is not yet Hebrew.
- Ep 126 · Dan McClellan (Host) · majority · _Letter of Jeremiah_: “Obviously, it was not written by Jeremiah. Scholars these days are coming around to the idea that this is probably originally composed in Greek, and that it was probably composed perhaps in the late 2nd, early 1st century BCE.” [00:32:05]
  - Claim: Scholars increasingly hold that the Letter of Jeremiah was not written by Jeremiah but composed in Greek in the late 2nd or early 1st century BCE.
- Ep 130 · Dan McClellan (Host) · majority · _Letter of Jeremiah_: “although most scholars agree this is definitely not written by the same crew.” [00:02:30]
  - Claim: Most scholars agree the Letter of Jeremiah was not written by the same authors as Baruch.
- Ep 131 · Dan McClellan (Host) · majority · _Luke 12:25 (helikia)_: “Most scholars take the term helikia to describe age or length of life here, although a few refer it to bodily stature.” [00:43:12]
  - Claim: Most scholars take helikia in Luke 12:25 to mean age or length of life rather than bodily stature.
- Ep 85 · Logan Williams (Guest Speaker) · consensus · _Mark 7:19 (Jesus and the food laws)_: “no shade on Dan. He's stating the consensus. And I have this really idiosyncratic view which some people have argued something similar before.” [00:02:10]
  - Claim: The consensus reading is that Jesus in Mark 7:19 sets aside the food laws; Williams's contrary reading is an idiosyncratic minority view.
- Ep 7 · Dan Beecher (Host) · majority · _Mesha's sacrifice and Chemosh (2 Kings 3)_: “And so what most critical scholars agree on, and I think is the only rational reading of the text, is that the author is kind of furtively suggesting, well, their god beat us and we ran out.” [00:30:16]
  - Claim: Most critical scholars agree that 2 Kings 3 furtively implies Moab's god Chemosh drove off the Israelites after Mesha sacrificed his heir.
- Ep 6 · Dan McClellan (Host) · no evidence · _New Testament canon formation_: “And so when 2 Timothy was written, none of the— we have no indication any of the texts of the New Testament were identified as Scripture.” [00:46:38]
  - Claim: There is no indication that any New Testament text was regarded as Scripture when 2 Timothy was written.
- Ep 119 · Dan McClellan (Host) · no evidence · _Olivet Discourse_: “The data don't support that at all. The data indicate that these were things that writers, looking back on these events, put into the narratives that they were crafting as if they came from an earlier time period” [00:14:16]
  - Claim: The data indicate the Olivet Discourse predictions were written after the events of 70 CE and placed back into the narrative, not fulfilled prophecy.
- Ep 172 · Dan McClellan (Host) · majority · _Parable of the Wedding Banquet_: “Which leads a lot of scholars to say, okay, so whatever parable this was before it was written down in Matthew and written down in Luke obviously didn't have verses 11 through 14.” [00:36:00]
  - Claim: Many scholars conclude the wedding-robe ending (Matthew 22 verses 11-14) was not part of the parable before it was written down in Matthew and Luke.
- Ep 172 · Dan McClellan (Host) · majority · _Parable of the Wedding Banquet_: “This is widely understood to be a reference to the destruction of Jerusalem in 70 CE.” [00:41:01]
  - Claim: The king destroying the murderers and burning their city in the Matthew 22 wedding banquet parable is widely understood as a reference to the destruction of Jerusalem in 70 CE.
- Ep 100 · Dan McClellan (Host) · majority · _Philemon (Onesimus and manumission)_: “That is debated. And I think the majority of scholars would say Paul is not telling him to manumit Onesimus.” [00:16:55]
  - Claim: It is debated, but the majority of scholars say Paul is not telling Philemon to manumit Onesimus.
- Ep 100 · Dan McClellan (Host) · majority · _Philemon (Onesimus and manumission)_: “the majority of scholars would say, in fact, there's a commentary I really like on this in the New Testament Library series that points out that there's absolutely no indication that Paul was asking him to release him.” [00:19:01]
  - Claim: The majority of scholars see no indication in Philemon that Paul asks for Onesimus's release.
- Ep 115 · Dan McClellan (Host) · majority · _Psalm 104_: “Psalm 104 seems to have some sun God imagery that a lot of scholars would suggest is. Is taken from a hymn of praise to Aten the sun deity during the reign of Akhenaten.” [00:33:37]
  - Claim: Many scholars suggest the solar imagery of Psalm 104 derives from the Egyptian hymn to the Aten.
- Ep 145 · Dan McClellan (Host) · majority · _Psalm 2_: “I don't know if you looked up Psalm chapter 2, but this is widely considered to be a royal coronation event.” [00:11:00]
  - Claim: Psalm 2 is widely considered to reflect a royal coronation.
- Ep 165 · Dan McClellan (Host) · contested · _Shepherd of Hermas dating_: “But I think some scholars would say the earliest it was written was probably somewhere between 70 to 90 CE, and then the latest maybe around 150 CE.” [00:39:39]
  - Claim: Scholarly datings of the Shepherd of Hermas range widely, from about 70-90 CE to about 150 CE.
- Ep 75 · Dan McClellan (Host) · no evidence · _Shroud of Turin_: “I am suggesting that the data do not support the antiquity of this.” [00:44:07]
  - Claim: The data do not support the antiquity of the Shroud of Turin.
- Ep 64 · Dan McClellan (Host) · contested · _Song of Deborah_: “which is some poetry that some scholars think may be among the oldest poetry in all the Bible.” [00:03:29]
  - Claim: Some scholars think the Song of Deborah (Judges 5) may be among the oldest poetry in the Bible.
- Ep 21 · Dan McClellan (Host) · no evidence · _Sotah ordeal (Numbers 5)_: “But we have no indication anyone ever did this, that anyone was ever put through this ordeal.” [00:58:32]
  - Claim: There is no indication anyone was ever actually put through the Numbers 5 sotah ordeal.
- Ep 23 · Dan McClellan (Host) · contested · _Sotah ordeal (Numbers 5)_: “I don't think there's a consensus. I think it's... It's more or less split.” [00:34:31]
  - Claim: There is no consensus on whether the Numbers 5 ordeal describes an induced miscarriage; opinion is roughly split.
- Ep 184 · Dan McClellan (Host) · majority · _Syrophoenician woman (Mark 7)_: “I think most scholars would suggest that what Jesus has in mind is precisely the way that Gentiles are referred to as dogs in a couple of other parts of the New Testament.” [00:33:59]
  - Claim: Most scholars think Jesus's 'dogs' saying to the Syrophoenician woman uses the derogatory image of Gentiles as street dogs outside the household, not a softer 'pet puppy' sense.
- Ep 57 · Dan McClellan (Host) · minority view · _Triumphal entry (Matthew 21)_: “That's not to say that, you know, this is the way it has to be and everybody is wrong. This is not the, the consensus view.” [00:40:55]
  - Claim: McClellan's reading that Matthew is deliberately ambiguous about Jesus riding two animals is not the consensus view.
- Ep 11 · Dan McClellan (Host) · consensus · _Wycliffe Bible_: “And scholars are pretty sure that he is not responsible for translating the whole thing, though it was probably him and his followers who were responsible for translating that Bible.” [00:40:15]
  - Claim: Scholars are fairly sure John Wycliffe did not translate the whole Wycliffe Bible himself; it was the work of him and his followers.

## Doctrines and concepts

### Creation ex nihilo

5 claims across 2 Episodes (70, 112). Strength: 2 consensus, 2 majority, 0 no evidence, 0 contested, 0 minority view, 1 asserted. 0 from Guest Speakers.

- Ep 70 · Dan McClellan (Host) · consensus: “but the academic consensus right now is that we don't get it until the last couple of decades of the second century CE.” [00:05:21]
  - Claim: The academic consensus is that creation ex nihilo does not appear until the last decades of the second century CE.
- Ep 70 · Dan McClellan (Host) · majority: “And this is actually referring as, as most scholars today agree, to a traditional Greek philosophical concepts that we find most clearly in Aristotle” [00:08:59]
  - Claim: Most scholars agree 2 Maccabees 7:28 reflects the Greek philosophical being/non-being distinction, not creation from nothing.
- Ep 70 · Dan McClellan (Host) · consensus: “Now the, what the apologists who are aware of the current academic consensus but don't like it will, will go on to argue is that in the New Testament we have repeated references to God being the creator of all things.” [00:13:21]
  - Claim: The current academic consensus is that the New Testament does not teach creation ex nihilo; apologists contest this.
- Ep 70 · Dan McClellan (Host) · asserted: “But yeah, the, the doctrine didn't exist when the Bible was being written.” [00:27:20]
  - Claim: The doctrine of creation ex nihilo did not exist when the Bible was being written.
- Ep 112 · Dan McClellan (Host) · majority: “Most scholars these days acknowledge that this "things that existed" and "things that did not exist"—this is a reference to a Greek philosophical notion” [00:21:40]
  - Claim: Most scholars now acknowledge that 2 Maccabees 7:28 reflects a Greek philosophical notion of being and non-being rather than creation out of nothing.

### Cult prostitution

3 claims across 2 Episodes (125, 126). Strength: 0 consensus, 1 majority, 2 no evidence, 0 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 125 · Dan McClellan (Host) · no evidence: “there's just no evidence that this notion of cult sex work or sacred sex work or anything like that took place.” [00:13:09]
  - Claim: There is no evidence that cultic or sacred sex work took place in ancient Israel.
- Ep 125 · Dan McClellan (Host) · majority: “But what most scholars these days will say is whatever it is, cultic sex worker, probably not it.” [00:17:18]
  - Claim: Most scholars now say the Hebrew qedeshah/qadesh, whatever it means, probably does not mean cultic sex worker.
- Ep 126 · Dan McClellan (Host) · no evidence: “historians don't really take much of that incredibly seriously because we have no evidence for these fertility rites associated with cultic sex.” [00:56:56]
  - Claim: Historians do not credit Herodotus's account of Babylonian cultic sex; there is no evidence for such fertility rites.

### Seeing the face of God

2 claims across 2 Episodes (25, 31). Strength: 0 consensus, 1 majority, 0 no evidence, 1 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 25 · Dan McClellan (Host) · contested: “And so I and other scholars have argued that what we have here was originally a commandment to go into the temple to see the face of God.” [00:38:32]
  - Claim: Scholars have argued that "appear before God" was originally a command to go to the temple to "see the face of God", later revocalized as passive.
- Ep 31 · Dan McClellan (Host) · majority: “But many scholars argue that that is a later alteration of what the text originally said, that it was intended to refer to seeing the face of God.” [00:12:29]
  - Claim: Many scholars argue the passive "appear before God" is a later alteration of a text that originally spoke of seeing the face of God.

### Religion as a modern category

3 claims across 3 Episodes (19, 25, 77). Strength: 0 consensus, 3 majority, 0 no evidence, 0 contested, 0 minority view, 0 asserted. 1 from Guest Speakers.

- Ep 19 · David A. Burnett (Guest Speaker) · majority · _Religion as a modern category_: “Smith and others are saying, no way. This distinction did not exist in the ancient world.” [00:17:42]
  - Claim: Scholars (Mark Smith and others) hold that the distinction between religion and politics/economics did not exist in the ancient world.
- Ep 25 · Dan McClellan (Host) · majority · _Religion as a modern category_: “So those who say is peacemakers a religious concept or a secular slash political concept, that division didn't exist in the first century.” [00:42:45]
  - Claim: Scholarship on the concept of religion holds that the religious/secular division did not exist in the first century.
- Ep 77 · Dan McClellan (Host) · majority · _Religion (concept)_: “Most scholars would say it seems to come from this Latin word religio” [00:09:27]
  - Claim: Most scholars derive the word 'religion' from Latin religio.

### Easter origins

5 claims across 1 Episodes (5). Strength: 0 consensus, 1 majority, 4 no evidence, 0 contested, 0 minority view, 0 asserted. 0 from Guest Speakers.

- Ep 5 · Dan McClellan (Host) · no evidence · _Easter origins_: “So Ishtar and Easter, there are no data that support any relationship whatsoever.” [00:09:45]
  - Claim: No data support any relationship between Ishtar and Easter.
- Ep 5 · Dan McClellan (Host) · majority · _Easter origins_: “So most scholars are happy to see, yes, the name Easter, which these days really only exists in English and in German.” [00:13:19]
  - Claim: Most scholars accept that the name Easter (English/German only) most likely derives from a month named after a Germanic spring goddess.
- Ep 5 · Dan McClellan (Host) · no evidence · _Easter origins_: “So there are no data from before the 19th century that connect hares and eggs with any pagan origins.” [00:16:02]
  - Claim: No data from before the 19th century connect Easter hares and eggs with pagan origins.
- Ep 5 · Dan McClellan (Host) · no evidence · _Easter origins_: “And while there are oral traditions within neopagan traditions about these having gone back to medieval and earlier pagan roots, there are no data that support those oral traditions.” [00:17:02]
  - Claim: No data support neopagan oral traditions that the Easter hare and egg go back to medieval or earlier pagan roots.
- Ep 5 · Dan McClellan (Host) · no evidence · _Council of Nicaea and the biblical canon_: “And I think that is the great popularizer of this idea that the biblical canon was decided at Nicaea. And there's absolutely no truth whatsoever to that. There are no data” [00:41:21]
  - Claim: There is no truth (no data) to the idea that the biblical canon was decided at the Council of Nicaea.

### Other doctrines and concepts: passing remarks

25 claims on 23 subjects, none grouped into a cluster above.

- Ep 81 · Dan McClellan (Host) · no evidence · _Aleph symbolism_: “And we have absolutely no evidence whatsoever that anyone during the period of the Bible understood the character aleph to in any way represent deity or a specific deity.” [00:39:25]
  - Claim: There is no evidence anyone in the biblical period understood the letter aleph to represent deity.
- Ep 11 · Dan McClellan (Host) · majority · _Biblical canon_: “But many scholars today think maybe words like canonical and non canonical are problematic in and of themselves.” [00:24:32]
  - Claim: Many scholars today consider the categories "canonical" and "non-canonical" problematic when applied to periods before canonization.
- Ep 185 · Dustin Smith (Guest Speaker) · contested · _Christology of the Gospels_: “I think all of them are portraying, I think, what some scholars are now starting to call a high human Christology.” [00:51:07]
  - Claim: Some scholars are beginning to describe the Gospels' portrayal of Jesus as a 'high human Christology' rather than a high divine Christology.
- Ep 81 · Dan McClellan (Host) · majority · _El / Elohim etymology_: “That etymology is rejected by the majority of scholars today. Okay, so that's a false etymology.” [00:38:24]
  - Claim: The majority of scholars reject deriving El/Elohim from a root meaning 'to be strong/mighty'.
- Ep 94 · Dan McClellan (Host) · contested · _Gnosticism_: “A lot of other scholars would say we can't really identify a necessary and sufficient feature of Gnosticism. And some scholars would argue that anciently there's nobody who would have said oh yeah, I'm a Gnostic.” [00:15:30]
  - Claim: There is no agreed definition of Gnosticism: many scholars say no necessary and sufficient feature can be identified and that nobody in antiquity self-identified as Gnostic.
- Ep 145 · Dan McClellan (Host) · contested · _Herem (ban)_: “one of the things that some scholars suggest this herem idea is doing is saying these people are impure, and so in order to purify the land, they all must be annihilated.” [00:47:41]
  - Claim: Some scholars suggest herem functions as ritual purification of the land through annihilation of its 'impure' inhabitants.
- Ep 25 · Dan McClellan (Host) · contested · _Kingdom of God / heaven_: “This, this is something that is debated by some scholars, but in the Gospels, the. What's coming, this promised salvation is not necessarily about flying into the sky to live in the clouds.” [00:21:21]
  - Claim: Scholars debate what the meek "inheriting the earth" means; in the Gospels the promised salvation is earthly rather than an ascent to the sky.
- Ep 94 · Dan McClellan (Host) · majority · _Manichaeism_: “it's generally considered a, a branch of Gnostic Christianity. It was started by a prophet named Manny or Mani, who was.” [00:09:31]
  - Claim: Manichaeism is generally considered a branch of Gnostic Christianity.
- Ep 150 · Dan McClellan (Host) · majority · _Mazzaroth (Job)_: “I think it's the majority position that this is a reference to constellations, the zodiac. Job is Persian period” [00:49:16]
  - Claim: The majority position is that Mazzaroth in Job refers to constellations / the zodiac.
- Ep 110 · Dan McClellan (Host) · majority · _Parting of the ways (Judaism and Christianity)_: “I think a lot of scholars would say we haven't quite achieved the parting of the ways yet if this is a first-century CE text.” [00:14:50]
  - Claim: Many scholars would say Christianity had not yet separated from Judaism in the first century CE.
- Ep 99 · Dan McClellan (Host) · no evidence · _Perpetual virginity of Mary_: “So yeah, I, I think that's very common. And yeah, there's the data don't really support it.” [00:14:15]
  - Claim: The data do not support the perpetual virginity of Mary.
- Ep 71 · Dan McClellan (Host) · majority · _Rapture_: “critical scholarship, which has looked at this passage and finds a better kind of contextual footing in this idea that what Paul seems to be doing here is describing not Jesus coming to collect his, his people” [00:15:48]
  - Claim: Critical scholarship reads 1 Thessalonians 4 as Jesus arriving to enter his kingdom, not collecting believers to return to heaven.
- Ep 160 · Dan McClellan (Host) · majority · _Re'em (KJV unicorn)_: “Most scholars today would say it is a now extinct kind of ox called an aurochs.” [00:20:04]
  - Claim: Most scholars today identify the Hebrew re'em (KJV 'unicorn') as the extinct aurochs.
- Ep 158 · Dan McClellan (Host) · majority · _Resurrection / afterlife beliefs_: “this is also the period that's probably responsible for the rise of ideologies about resurrection and ideologies about heaven and hell, because a lot of scholars think it's in this time period that they're contemplating” [00:27:41]
  - Claim: Many scholars think ideas of resurrection, heaven and hell arose in the Hellenistic/Maccabean period as a response to the unpunished suffering of God's people.
- Ep 123 · Dan McClellan (Host) · majority · _Sadducees_: “And so Sadducee is thought by most scholars to be a callback to this idea of the Zadokite priests.” [00:41:37]
  - Claim: Most scholars think the name Sadducee derives from the Zadokite priests.
- Ep 97 · Dan McClellan (Host) · majority · _Second Temple priesthood_: “a lot of scholars think that a lot of the priests who worked in the temple in Jerusalem lived in Jericho at the time.” [00:42:29]
  - Claim: Many scholars think many of the Jerusalem temple priests lived in Jericho.
- Ep 74 · Dan McClellan (Host) · contested · _Shaatnez_: “And some scholars think this comes from an Egyptian word which would support the theory that the point here is to avoid a specific type of fabric that other societies wore” [00:04:13]
  - Claim: Some scholars think shaatnez derives from an Egyptian word, supporting the theory that the ban distinguished Israelites from other societies.
- Ep 55 · Dan McClellan (Host) · majority · _Sin_: “scholars would say that the sins as they are laid out, as they are described in the Bible and within, like, early Jewish literature and things like that, overwhelmingly are represented as violations of God's commands.” [00:41:51]
  - Claim: Scholars say sins in the Bible and early Jewish literature are overwhelmingly represented as violations of God's commands.
- Ep 101 · Dan McClellan (Host) · consensus · _Slavery in the Bible_: “Emboldened by the findings of biblical criticism that the New Testament writers did not condemn slavery as abolitionists would wish, but instead express views similar to those in the wider Greco-Roman slave culture” [00:23:22]
  - Claim: Biblical criticism found that the New Testament writers did not condemn slavery but shared the views of the wider Greco-Roman slave culture.
- Ep 14 · Dan McClellan (Host) · majority · _Standing stones (stelae)_: “You also find them in the Neolithic period in groups, in arrangements that indicate to many archaeologists that they are there to represent or presence, give presence, to manifest the presence of deities.” [00:28:44]
  - Claim: Many archaeologists interpret grouped Neolithic standing stones as representing or manifesting the presence of deities.
- Ep 76 · Dan McClellan (Host) · contested · _Tithing_: “some scholars have pointed out that there seems to be a trajectory here that it starts off being a, a temple tax, basically, that goes to the priests and the temple.” [00:08:22]
  - Claim: Some scholars see a trajectory in biblical tithe laws, starting as a temple tax for priests and reallocated in later layers.
- Ep 76 · Dan McClellan (Host) · majority · _Tithing_: “And most scholars are like, yeah, that didn't happen. But there's also an interesting reference to the redemption of your tithe” [00:10:27]
  - Claim: Most scholars hold that the stacked multiple tithes (up to 30%) implied by later harmonization were never actually practiced.
- Ep 85 · Logan Williams (Guest Speaker) · no evidence · _Torah observance in Second Temple Judaism_: “this is why I talk about late Second Temple Judaism, because there's very minimal evidence that in the early Second Temple era, Jews were actually” [00:31:44]
  - Claim: There is very minimal evidence that Jews in the early Second Temple period observed the Pentateuchal laws; widespread Torah observance dates to the Hasmonean era.
- Ep 123 · Dan McClellan (Host) · contested · _Torah observance in Second Temple Judaism_: “now, some scholars think this is when the Torah and the Hebrew Bible first begins to become authoritative” [00:40:24]
  - Claim: Some scholars think the Torah and Hebrew Bible first became authoritative under the Hasmoneans.
- Ep 18 · Dan McClellan (Host) · majority · _Zoroastrian influence on Jewish dualism_: “So we have a dualism that seems to pop up within early Judaism following the Babylonian exile. And a lot of scholars would say Zoroastrianism seems like the most likely source of that.” [00:53:30]
  - Claim: Many scholars consider Zoroastrianism the most likely source of the good/evil dualism that appears in post-exilic Judaism (and feeds the development of Satan).

# Not covered

- **Unmarked claims.** Only lines matching the keyword patterns were read. A consensus view stated without marker words ("Daniel was written in the 160s") is missed unless it happened to sit on a matching line. The true count is higher than 460, probably much higher for subjects the show argues rather than cites (Satan, hell, Trinity, sexuality, inerrancy, univocality).
- **Full Transcripts were not read.** 677 hit lines out of roughly 21 MB of text. 44 Episodes produced no claim; 24 had no keyword hit at all.
- **Short lines.** At least one valid claim was left out because the line is too short to carry context: Ep 52 ("And Peter definitely didn't write 1 Peter."). One short quote is included and needs its preceding line to make sense: Ep 143 ("Yes, that's pretty widely agreed.", answering whether Mark is the earliest Gospel).
- **Cold-open teasers** that repeat a later line were dropped where noticed (Ep 52, Ep 138); others may remain as duplicates.
- **Accuracy of the claims.** Nothing here checks whether the stated consensus is the actual consensus. No outside source was consulted. That is the corroboration step the map assigns to each page.
- **Speaker labels are machine-assigned** and sometimes wrong. Ep 7, Ep 144, Ep 145 and parts of Ep 154 have exposition labeled Dan Beecher that reads like Dan McClellan. Labels are reproduced as they stand in the Transcript, so Beecher's count of 12 is likely overstated.
- **Transcript text is machine-transcribed and AI-corrected.** Quotes are verbatim from the Transcript, not checked against Episode Audio.
- **Classification is judgment.** Whether a hit is a claim, its strength label, its paraphrase, and its cluster were decided by reading, split across four reading passes and then reviewed in one list. Quotes and Speakers were verified mechanically; paraphrases and strength labels were not independently re-checked against every Transcript line. Borderline "some scholars think" lines were kept as "contested"; a stricter reader would drop many of those 63.
- **The total is rough.** A single line can yield two claims, and one argument can span several lines. Treat "about 460" as an order of magnitude: several hundred, not dozens and not thousands.
