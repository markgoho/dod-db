const MCCLELLAN = "Dan McClellan";
const BEECHER = "Dan Beecher";

const linePattern = /^\[(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?\]\s+([^:]+):\s?(.*)$/;
/**
 * McClellan's median share of host words is about 0.7 (Beecher's 0.3).
 * Correct Episodes do pass 0.5 now and then (Ep 47, 85), so this only flags.
 */
const SUSPECT_BEECHER_SHARE = 0.5;
/** Self-introductions and the tagline only count inside the opening. */
const INTRO_WINDOW_SECONDS = 300;
const taglinePattern = /increase public access|academic study of the bible/i;
// ASR spells McClellan many ways (McClel, McLellen, McClelland)
const hostNamePattern = /\bDan\s+(Ma?c\w*|Be[ae]ch\w*)/gi;
const selfIntroPattern = /\bI(?:'|’|\s+a)?m\s+Dan\s+(Ma?c\w*|Be[ae]ch\w*)/gi;

/** Speaker label ("Speaker A") to name, as the model returns it. */
type SpeakerMapping = Record<string, string | undefined>;

export interface HostMappingCheck<T extends SpeakerMapping = SpeakerMapping> {
  speakers: T;
  swapped: boolean;
  /** Beecher's share of host words, on the returned mapping. */
  beecherShare: number | undefined;
  /** Human-readable notes for the run output: swaps and suspicions. */
  flags: string[];
}

interface Turn {
  seconds: number;
  host: string | undefined;
  text: string;
}

function parseTurns(transcript: string, speakers: SpeakerMapping): Turn[] {
  const turns: Turn[] = [];
  for (const line of transcript.split("\n")) {
    const match = linePattern.exec(line);
    if (!match) continue;
    const [, hours, minutes, seconds, label, text] = match;
    turns.push({
      seconds: Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds),
      host: speakers[label!.trim()],
      text: text ?? "",
    });
  }
  return turns;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function beecherShareOf(turns: Turn[]): number | undefined {
  let mcclellan = 0;
  let beecher = 0;
  for (const turn of turns) {
    if (turn.host === MCCLELLAN) mcclellan += countWords(turn.text);
    if (turn.host === BEECHER) beecher += countWords(turn.text);
  }
  const total = mcclellan + beecher;
  return total === 0 ? undefined : beecher / total;
}

function swapHosts<T extends SpeakerMapping>(speakers: T): T {
  return Object.fromEntries(
    Object.entries(speakers).map(([label, name]) => [
      label,
      name === MCCLELLAN ? BEECHER : name === BEECHER ? MCCLELLAN : name,
    ]),
  ) as T;
}

function hostFromSurname(surname: string): string {
  return /^ma?c/i.test(surname) ? MCCLELLAN : BEECHER;
}

function namesIn(text: string, pattern: RegExp): Set<string> {
  return new Set(
    [...text.matchAll(pattern)].map(match => hostFromSurname(match[1]!)),
  );
}

type Vote = "agrees" | "contradicts";

/**
 * Votes from the opening on whether each host label is right:
 * - a host turn that introduces exactly one host ("I'm Dan Beecher") and
 *   names no other is that host. A turn naming both is a diarization merge
 *   and says nothing about who is speaking (Ep 144 vs Ep 145).
 * - the turn with the tagline ("where we increase public access to the
 *   academic study...") is McClellan's.
 */
function anchorVotes(turns: Turn[]): { selfIntro: Vote[]; tagline: Vote[] } {
  const intro = turns.filter(turn => turn.seconds <= INTRO_WINDOW_SECONDS);
  const selfIntro: Vote[] = [];
  for (const turn of intro) {
    if (turn.host !== MCCLELLAN && turn.host !== BEECHER) continue;
    const introduced = namesIn(turn.text, selfIntroPattern);
    const named = namesIn(turn.text, hostNamePattern);
    if (introduced.size !== 1 || named.size !== 1) continue;
    selfIntro.push(introduced.has(turn.host) ? "agrees" : "contradicts");
  }
  const tagline: Vote[] = [];
  const taglineTurn = intro.find(turn => taglinePattern.test(turn.text));
  if (taglineTurn?.host === MCCLELLAN) tagline.push("agrees");
  if (taglineTurn?.host === BEECHER) tagline.push("contradicts");
  return { selfIntro, tagline };
}

function describeVotes(votes: { selfIntro: Vote[]; tagline: Vote[] }): string {
  const parts: string[] = [];
  const selfIntros = votes.selfIntro.filter(vote => vote === "contradicts");
  if (selfIntros.length > 0) {
    parts.push(`${selfIntros.length} self-introduction(s) by the other host`);
  }
  if (votes.tagline.includes("contradicts")) {
    parts.push(`tagline in ${BEECHER}'s turn`);
  }
  return parts.join(", ");
}

/**
 * Deterministic guard on the model's speaker mapping (#126).
 *
 * The model can invert McClellan and Beecher for a whole Episode. When the
 * intro anchors contradict the mapping (and none confirm it), swap the two
 * hosts. When the anchors conflict, or Beecher's share of host words is
 * above 0.5, keep the mapping and return a flag for the run output.
 */
export function checkHostMapping<T extends SpeakerMapping>(
  transcript: string,
  speakers: T,
): HostMappingCheck<T> {
  const names = new Set(Object.values(speakers));
  if (!names.has(MCCLELLAN) || !names.has(BEECHER)) {
    // Guest-hosted or solo Episode: nothing to swap between
    return { speakers, swapped: false, beecherShare: undefined, flags: [] };
  }

  const flags: string[] = [];
  const votes = anchorVotes(parseTurns(transcript, speakers));
  const all = [...votes.selfIntro, ...votes.tagline];
  const contradicted = all.includes("contradicts");
  const confirmed = all.includes("agrees");
  const swapped = contradicted && !confirmed;
  if (swapped) {
    flags.push(
      `Swapped ${MCCLELLAN} and ${BEECHER}: the intro contradicts the model's mapping (${describeVotes(votes)}).`,
    );
  } else if (contradicted) {
    flags.push(
      `Intro anchors disagree about which speaker is ${MCCLELLAN}. Mapping kept; check by hand.`,
    );
  }

  const checked = swapped ? swapHosts(speakers) : speakers;
  const beecherShare = beecherShareOf(parseTurns(transcript, checked));
  if (beecherShare !== undefined && beecherShare > SUSPECT_BEECHER_SHARE) {
    flags.push(
      `${BEECHER} has ${Math.round(beecherShare * 100)}% of host words (${MCCLELLAN} usually has about 70%). ${swapped ? "Check" : "Mapping kept; check"} for swapped hosts.`,
    );
  }

  return { speakers: checked, swapped, beecherShare, flags };
}

/** Print guard flags in a script's final run summary. */
export function printSpeakerIdFlags(flags: string[] | undefined): void {
  if (!flags || flags.length === 0) return;
  console.log("  Speaker ID flags:");
  for (const flag of flags) {
    console.log(`    ⚠️ ${flag}`);
  }
}
