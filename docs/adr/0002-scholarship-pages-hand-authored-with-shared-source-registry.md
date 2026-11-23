# Scholarship Pages are hand-authored, with a shared source registry and separate Trigger Claims

A **Scholarship Page**'s questions, statements and citations live in its own front matter (`hugo/content/scholarship/<slug>.md`). **External Sources** live once in a shared registry (`hugo/data/external-sources.yaml`) that every **Synthesis Page** cites by id. **Trigger Claims** live in a separate file per page (`hugo/data/scholarship/triggers/<slug>.yaml`). Review results are kept unrendered in `data/scholarship-reviews/<slug>.yaml`.

We rejected generating the pages from `data/` records, which is how `data/processed-videos.json` produces Episode Pages. That pattern exists because Episode Pages are pipeline output. Scholarship Pages are hand-authored and number in the tens, like Topic Pages, so a generator would add a build step and a second copy of every page. We also rejected keeping Trigger Claims in front matter, which the prototype did: then a new **Episode** would edit the file that holds the statements, though the rule is that it never changes one.

## Consequences

- Episode Pages find the Scholarship Pages that quote them by reading the triggers data in templates. Episode front matter is never edited.
- Book, Tag and Topic Pages link to a Scholarship Page only when it names them in its `related` field.
- A validator (`bun run check:scholarship`) checks registry ids, Episode Numbers, the publish rule's counts and the review record. Strength and scope are judged by the owner's review only.
- The Timeline reuses the registry and the Trigger Claim shape.
