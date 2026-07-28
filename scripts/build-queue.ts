/**
 * Build the verification queue the "help verify" page reads.
 * Run with: bun run build:queue
 *
 * Writes apps/web/public/queue.json — a static file compiled from data/ on
 * every site build, exactly like the lexicon artifact the engine ships. It is
 * gitignored on purpose: committing it would put a large generated diff in
 * every pull request and let the questions drift behind the data they came
 * from. Nothing schedules anything either — a merged pull request deploys the
 * site, and the deploy rebuilds the queue.
 *
 * Every question has the same shape, and it is deliberately the weakest one
 * that still helps: **is this a written form of this word, for any meaning?**
 * Yes/no answers to that question compose into everything else. Two candidates
 * both answered yes are homonyms and both belong; one yes and one no names the
 * spelling to delete. Asking "which of these two is right?" instead would
 * force a choice where the honest answer is often "both", which is exactly the
 * one-to-many collapse this project exists to prevent.
 *
 * Questions are ordered, not shuffled: everyone answers the same ones first,
 * so verdicts accumulate on a few candidates rather than scattering one vote
 * across thousands. A single answer is not evidence; three on one candidate is.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DATA_DIR,
  NAMES_FILE,
  REPO_ROOT,
  compareWords,
  loadLexicon,
  readEntriesFile,
  type Candidate,
  type Entry,
} from "./lib.ts";
import { isConflict } from "./import-wiktionary.ts";
import type { Frequency, Ledger } from "./aggregate-signals.ts";

const QUEUE_FILE = join(REPO_ROOT, "apps", "web", "public", "queue.json");
const FREQUENCY_FILE = join(DATA_DIR, "stats", "frequency.json");
const REPORTS_FILE = join(DATA_DIR, "stats", "reports.json");

/**
 * How many questions ship in one file. The page fetches the whole thing, and
 * nobody answers three hundred questions in a sitting — the cap is about the
 * download, not about the work. What it leaves out is printed by this script
 * and recorded in the file as `pool`, so a truncated queue can never read as a
 * finished one.
 */
export const MAX_QUESTIONS = 300;

/**
 * Why a candidate is being asked about — also its priority, best first.
 *
 * A flag outranks a source disagreement: a reader looked at that spelling and
 * said it was wrong, which is a stronger claim than two dictionaries differing.
 * Traffic comes last and only above zero — a candidate nobody has chosen,
 * nobody has flagged and no source disputes is not a question anyone needs
 * answered this week, and there are 28,000 of those.
 */
export const REASONS = ["flagged", "conflict", "traffic"] as const;
export type Reason = (typeof REASONS)[number];

/** A sibling candidate, shown as context so a reader can see what else the
 *  entry already offers before answering about this one. */
export interface QueueAlternative {
  traditional: string;
  latin?: string;
  sense?: string;
  verified: boolean;
}

export interface Question {
  id: string;
  cyrillic: string;
  traditional: string;
  latin?: string;
  sense?: string;
  source: string;
  corroborated?: boolean;
  reason: Reason;
  alternatives?: QueueAlternative[];
}

export interface Queue {
  /** Total candidates that qualified, before the cap. */
  pool: number;
  questions: Question[];
}

/**
 * A stable id for one question, derived from what it asks about.
 *
 * Content-derived so that a candidate keeps its id across weekly rebuilds and
 * verdicts about it accumulate. FNV-1a because it is four lines and this is not
 * a security boundary: a collision would merge two questions' audit trail, and
 * the verdict row carries the full anchor anyway — `question_id` says which
 * question was shown, never which candidate was meant.
 */
export function questionId(cyrillic: string, traditional: string): string {
  let hash = 0x811c9dc5;
  for (const ch of `${cyrillic}|${traditional}`) {
    hash ^= ch.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `e-${hash.toString(16).padStart(8, "0")}`;
}

/** The placeholder the Wiktionary import writes for an unlabelled meaning. It
 *  reads like a sense and carries none, so it never reaches a reader. */
const UNLABELED_SENSE = "unlabeled";

function displaySense(candidate: Candidate): string | undefined {
  if (candidate.sense === undefined || candidate.sense === UNLABELED_SENSE) return undefined;
  return candidate.sense;
}

/**
 * Which candidates are worth asking about, and in what order.
 *
 * Verified candidates are skipped: a human already answered. Corroborated ones
 * sink within their tier — two independent sources already agree — except when
 * they were flagged, which is the opposite of routine: two sources and a reader
 * disagree, and that deserves a look sooner, not later.
 */
export function buildQuestions(
  lexicon: Map<string, Entry>,
  flagged: Set<string>,
  frequency: Frequency,
): Question[] {
  const questions: (Question & { rank: number; traffic: number })[] = [];
  for (const entry of lexicon.values()) {
    const conflicted = isConflict(entry);
    for (const candidate of entry.candidates) {
      if (candidate.verified) continue;
      const key = `${entry.cyrillic}|${candidate.traditional}`;
      const traffic = frequency.words[entry.cyrillic]?.[candidate.traditional] ?? 0;
      const isFlagged = flagged.has(key);
      const reason: Reason = isFlagged ? "flagged" : conflicted ? "conflict" : "traffic";
      // A candidate nobody has chosen, nobody has flagged and no source
      // disputes is not a question anyone needs answered this week — the
      // lexicon has 28,000 of those, and a queue that includes them is a queue
      // that never runs out and never converges on anything.
      if (!isFlagged && !conflicted && traffic === 0) continue;
      const question: Question & { rank: number; traffic: number } = {
        id: questionId(entry.cyrillic, candidate.traditional),
        cyrillic: entry.cyrillic,
        traditional: candidate.traditional,
        source: candidate.source,
        reason,
        rank: REASONS.indexOf(reason) + (candidate.corroborated && !isFlagged ? 0.5 : 0),
        traffic,
      };
      if (candidate.latin !== undefined) question.latin = candidate.latin;
      const sense = displaySense(candidate);
      if (sense !== undefined) question.sense = sense;
      if (candidate.corroborated) question.corroborated = true;
      const others = entry.candidates.filter((c) => c.traditional !== candidate.traditional);
      if (others.length > 0) {
        question.alternatives = others.map((c) => {
          const alt: QueueAlternative = { traditional: c.traditional, verified: c.verified };
          if (c.latin !== undefined) alt.latin = c.latin;
          const s = displaySense(c);
          if (s !== undefined) alt.sense = s;
          return alt;
        });
      }
      questions.push(question);
    }
  }
  questions.sort(
    (a, b) =>
      a.rank - b.rank ||
      b.traffic - a.traffic ||
      compareWords(a.cyrillic, b.cyrillic) ||
      compareWords(a.traditional, b.traditional),
  );
  return questions.map(({ rank: _rank, traffic: _traffic, ...q }) => q);
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback;
}

function main(): void {
  const lexicon = loadLexicon();
  // Names are the fully human-verified tier and live in their own file; a name
  // still waiting for review is exactly the kind of thing to ask about.
  if (existsSync(NAMES_FILE)) for (const e of readEntriesFile(NAMES_FILE)) lexicon.set(e.cyrillic, e);

  const frequency = readJson<Frequency>(FREQUENCY_FILE, { words: {} });
  const ledger = readJson<Ledger>(REPORTS_FILE, { through: null, reports: [] });
  const flagged = new Set(
    ledger.reports
      .filter((r) => r.traditional !== undefined)
      .map((r) => `${r.cyrillic}|${r.traditional}`),
  );

  const all = buildQuestions(lexicon, flagged, frequency);
  const queue: Queue = { pool: all.length, questions: all.slice(0, MAX_QUESTIONS) };
  mkdirSync(join(REPO_ROOT, "apps", "web", "public"), { recursive: true });
  writeFileSync(QUEUE_FILE, JSON.stringify(queue) + "\n", "utf8");

  const byReason = new Map<Reason, number>();
  for (const q of queue.questions) byReason.set(q.reason, (byReason.get(q.reason) ?? 0) + 1);
  console.log(`Wrote ${queue.questions.length} questions to apps/web/public/queue.json`);
  for (const reason of REASONS) console.log(`  ${reason}: ${byReason.get(reason) ?? 0}`);
  if (all.length > queue.questions.length) {
    console.log(`  (${all.length - queue.questions.length} more qualified and were left for a later build)`);
  }
}

if (import.meta.main) {
  main();
}
