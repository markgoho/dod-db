# RSS feed defines episode identity

Starting with Episode 143, the **Canonical Feed** RSS ordering defines **Episode** identity and **Episode Numbers** instead of YouTube videos or title matching. YouTube uploads no longer map one-to-one to podcast episodes, so YouTube remains legacy or auxiliary for episodes through 142 while RSS is the canonical source for main episodes after the changeover.

## Consequences

- The configured RSS feed URL can come from private environment configuration and must not be committed.
- After Party feed items are filtered out and do not count as **Episodes**.
- YouTube IDs and titles are unsafe as canonical identity for current episodes.
