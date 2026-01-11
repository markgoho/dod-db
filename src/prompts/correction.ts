export function correctionPrompt(transcript: string) {
  return `You are an expert in Bible scholarship. Review this podcast transcript and correct any errors in domain-specific terms, names, places, or theological concepts.

CORRECTION GUIDELINES:
1. Fix anything that appears incorrect (misspellings, garbled words, wrong names)
2. Use only plain English letters (a-z A-Z), NO diacritics or special characters
3. Hebrew/Greek terms: simple transliteration (Torah not Tôrāh, Bereshit not Bərēšîṯ, raqia not rāqîaʿ)
4. DO NOT change "Adonai" to "Yahweh" or "YHWH" - the host intentionally uses "Adonai" as a respectful substitute
5. Preserve exact formatting: [HH:MM:SS] Speaker Name: text
6. Maintain all line breaks - each timestamped line stays separate
7. DO NOT add commentary - return only the corrected transcript

Common error types:
- Scholar/host names (Dan McClellan, Frank Moore Cross)
- Hebrew/Greek/Aramaic terms (use plain English letters)
- Biblical books and concepts (Septuagint, Deuteronomy)
- Theological terminology

Transcript to correct:
---
${transcript}
---`;
}
