/**
 * Build the bundle the expert review page reads.
 * Run with: bun run build:review-bundle
 *
 * Writes apps/web/public/review-bundle.json — a static file compiled from
 * data/ on every site build, exactly like queue.json beside it, and gitignored
 * for the same reasons: committing it would put a large generated diff in every
 * pull request and let the questions drift behind the data they came from.
 *
 * ## Why this is built from git rather than read from the mailbox
 *
 * The obvious design is for the page to query Supabase directly. It is the
 * wrong one. The mailbox never holds all the votes — the weekly job drains and
 * deletes rows, and the accumulated tallies live in data/stats/reports.json —
 * so a live query would show a week of traffic and call it the whole picture.
 * And it would need read access, which means an RLS view, which means a leak
 * surface where today there is none: nothing in any browser can read that
 * database, and that property is worth more than freshness.
 *
 * The cost is latency. A vote cast today reaches the reviewer after the next
 * weekly merge and deploy. At this project's cadence that is the right trade.
 *
 * ## What this file is for
 *
 * One expert deciding, in a page that renders монгол бичиг properly, what a
 * maintainer who does not read the script cannot decide from a diff. Every row
 * is one spelling and one question — *is this a written form of this word, for
 * any meaning?* — the same question the queue asks, because yes/no answers to
 * it compose into everything else and no other question has an honest answer.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
import { questionId } from "./build-queue.ts";
import type { Frequency, Ledger, Report, VerdictTally } from "./aggregate-signals.ts";

const BUNDLE_FILE = join(REPO_ROOT, "apps", "web", "public", "review-bundle.json");
const FREQUENCY_FILE = join(DATA_DIR, "stats", "frequency.json");
const REPORTS_FILE = join(DATA_DIR, "stats", "reports.json");

/**
 * How many rows of each group ship in one file.
 *
 * A cap on the download, not on the work: the page fetches the whole bundle,
 * and nobody reviews four hundred spellings in a sitting. What it leaves out is
 * recorded per group as `pool`, so a truncated bundle can never read as a
 * finished one — the page says how many are waiting behind it.
 */
export const MAX_PER_GROUP = 150;

/** The placeholder the Wiktionary import writes for an unlabelled meaning. It
 *  reads like a sense and carries none, so it never reaches a reader. */
const UNLABELED_SENSE = "unlabeled";

function displaySense(sense: string | undefined): string | undefined {
  return sense === undefined || sense === UNLABELED_SENSE ? undefined : sense;
}

/** A sibling candidate, shown so the reviewer can see what the entry already
 *  offers before judging this one. Never itself decidable in the same row. */
export interface ReviewSibling {
  traditional: string;
  latin?: string;
  sense?: string;
  verified: boolean;
}

/** One spelling to judge. */
export interface ReviewItem {
  /** Content-derived, so a draft survives a rebuild and the same spelling keeps
   *  its identity across weeks. Same hash as the queue's question ids. */
  id: string;
  cyrillic: string;
  /** The spelling in question — stored for a verification, proposed for a
   *  proposal. Always the thing the answer is about. */
  traditional: string;
  latin?: string;
  sense?: string;
  /** Where a stored spelling came from. Absent on a proposal: it is in no file. */
  source?: string;
  corroborated?: boolean;
  /** Set only where it is surprising: a candidate somebody reported wrong that
   *  a human has already verified. The page has to say so loudly — rejecting
   *  it means contradicting a reviewer, not correcting a machine import. */
  verified?: boolean;
  /** Anonymous answers already recorded about this spelling. */
  yes?: number;
  no?: number;
  /**
   * Opaque roster labels of trusted reviewers who answered yes, and no, to a
   * queue or converter question about this spelling. Tallies only — answering
   * a question and filing a report are different acts and get different
   * fields, so that neither can be read as the other.
   *
   * Already public in reports.json, so putting them in a static file leaks
   * nothing new. A label here means somebody else who reads the script has
   * been here, which is worth knowing before you decide.
   */
  attested?: string[];
  disputed?: string[];
  /** Labels of trusted reviewers who *filed* this — reported it wrong, or
   *  typed this spelling. Not an answer to a question; a claim of their own. */
  trusted?: string[];
  /** Distinct browser sessions that reported or proposed this. */
  sessions?: number;
  /** How often this word was converted and copied. Ordering context only. */
  traffic?: number;
  /** What else this entry holds. */
  siblings?: ReviewSibling[];
  /**
   * Proposals only: whether accepting this needs a meaning label.
   *
   * The entry schema requires a `sense` on every candidate once an entry holds
   * more than one, so a proposal accepted into an entry that already has a
   * candidate cannot be written without one. Asking the reviewer for it in the
   * same breath as the judgement is far cheaper than a follow-up pull request.
   */
  senseRequired?: boolean;
  /** The meaning a contributor suggested, to prefill that field. */
  proposedSense?: string;
}

/** One group of rows, with the count the cap left behind. */
export interface ReviewGroup {
  pool: number;
  items: ReviewItem[];
}

export interface ReviewBundle {
  /** Candidates in the lexicon that people have answered about. */
  verifications: ReviewGroup;
  /** Candidates somebody said are wrong. */
  wrong: ReviewGroup;
  /** Spellings somebody typed that the lexicon does not hold. */
  proposals: ReviewGroup;
}

function siblingsOf(entry: Entry | undefined, traditional: string): ReviewSibling[] | undefined {
  const others = (entry?.candidates ?? []).filter((c) => c.traditional !== traditional);
  if (others.length === 0) return undefined;
  return others.map((c) => {
    const sibling: ReviewSibling = { traditional: c.traditional, verified: c.verified };
    if (c.latin !== undefined) sibling.latin = c.latin;
    const sense = displaySense(c.sense);
    if (sense !== undefined) sibling.sense = sense;
    return sibling;
  });
}

function chosenCount(frequency: Frequency, cyrillic: string, traditional: string): number {
  return frequency.words[cyrillic]?.[traditional] ?? 0;
}

/**
 * Tallies about candidates that are still in the lexicon and still unverified.
 *
 * A tally about a spelling that is already verified, or that no longer exists,
 * has been answered by the data itself. The aggregator drops those on write, so
 * they are normally gone before they get here — this re-checks anyway, because
 * the bundle is built from whatever reports.json holds at deploy time and a
 * hand-edit between runs is exactly the case where a stale row would surface.
 */
export function verificationItems(
  tallies: readonly VerdictTally[],
  lexicon: Map<string, Entry>,
  frequency: Frequency,
): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const tally of tallies) {
    const entry = lexicon.get(tally.cyrillic);
    const candidate = entry?.candidates.find((c) => c.traditional === tally.traditional);
    if (candidate === undefined || candidate.verified) continue;
    items.push(itemFor(tally.cyrillic, candidate, entry!, frequency, tally));
  }
  // Most-answered first: those are where one more judgement settles the most,
  // and a reviewer who stops after ten rows should have spent them well.
  // Disputes float to the very top — two people who read the script
  // contradicting each other is the one thing here nothing else can resolve.
  return items.sort(
    (a, b) =>
      (b.disputed?.length ?? 0) - (a.disputed?.length ?? 0) ||
      (b.yes ?? 0) + (b.no ?? 0) - ((a.yes ?? 0) + (a.no ?? 0)) ||
      (b.traffic ?? 0) - (a.traffic ?? 0) ||
      compareWords(a.cyrillic, b.cyrillic),
  );
}

function itemFor(
  cyrillic: string,
  candidate: Candidate,
  entry: Entry,
  frequency: Frequency,
  tally?: VerdictTally,
): ReviewItem {
  const item: ReviewItem = {
    id: questionId(cyrillic, candidate.traditional),
    cyrillic,
    traditional: candidate.traditional,
    source: candidate.source,
  };
  if (candidate.latin !== undefined) item.latin = candidate.latin;
  const sense = displaySense(candidate.sense);
  if (sense !== undefined) item.sense = sense;
  if (candidate.corroborated) item.corroborated = true;
  if (tally !== undefined) {
    item.yes = tally.yes;
    item.no = tally.no;
    if (tally.attested !== undefined) item.attested = tally.attested;
    if (tally.disputed !== undefined) item.disputed = tally.disputed;
  }
  const traffic = chosenCount(frequency, cyrillic, candidate.traditional);
  if (traffic > 0) item.traffic = traffic;
  const siblings = siblingsOf(entry, candidate.traditional);
  if (siblings !== undefined) item.siblings = siblings;
  return item;
}

/** Merge one more report's labels into a row that already exists. */
function mergeLabels(a: string[] | undefined, b: readonly string[] | undefined): string[] | undefined {
  const merged = [...new Set([...(a ?? []), ...(b ?? [])])].sort(compareWords);
  return merged.length > 0 ? merged : undefined;
}

/**
 * Stored spellings somebody reported as wrong.
 *
 * Only reports anchored to a candidate that still exists: a report whose form
 * is gone was answered by whoever removed it. Composed suffix candidates fall
 * out here too, and correctly — they live in no shard, so there is nothing to
 * reject, and the repair for a mis-composed word is a lexicon entry of its own
 * (data/GRAMMAR.md § Fixing a wrong composition), which arrives as a proposal.
 *
 * A report against an *already verified* candidate is kept rather than skipped.
 * Somebody contradicting a verification is the most informative row this page
 * can show, and hiding it would make a mistaken verification permanent.
 */
export function wrongItems(
  reports: readonly Report[],
  lexicon: Map<string, Entry>,
  frequency: Frequency,
): ReviewItem[] {
  const byKey = new Map<string, ReviewItem>();
  for (const report of reports) {
    if (report.kind !== "correction" || report.traditional === undefined) continue;
    const entry = lexicon.get(report.cyrillic);
    const candidate = entry?.candidates.find((c) => c.traditional === report.traditional);
    if (candidate === undefined) continue;
    // One spelling is one row however many reports name it. Reports are keyed
    // by their full content, so the same candidate reported with a proposed
    // correction and reported without one are two objects saying one thing.
    const key = `${report.cyrillic}|${report.traditional}`;
    const existing = byKey.get(key);
    if (existing !== undefined) {
      existing.sessions = (existing.sessions ?? 0) + report.sessions;
      existing.trusted = mergeLabels(existing.trusted, report.reviewers);
      continue;
    }
    const item = itemFor(report.cyrillic, candidate, entry!, frequency);
    item.sessions = report.sessions;
    if (report.reviewers !== undefined) item.trusted = [...report.reviewers];
    if (candidate.verified) item.verified = true;
    byKey.set(key, item);
  }
  return [...byKey.values()].sort(
    (a, b) =>
      (b.trusted?.length ?? 0) - (a.trusted?.length ?? 0) ||
      (b.sessions ?? 0) - (a.sessions ?? 0) ||
      (b.traffic ?? 0) - (a.traffic ?? 0) ||
      compareWords(a.cyrillic, b.cyrillic),
  );
}

/**
 * Spellings somebody typed that the lexicon does not hold.
 *
 * Reports carrying a proposed spelling, whichever door they came through: a
 * word we do not know, a correction that arrived with the right answer
 * attached, a meaning reported missing along with how it is written. All three
 * resolve to the same operation — add this candidate — and to the same
 * question, so they are one group rather than three.
 *
 * A report proposing only a *meaning* is left out. That is an edit to a
 * candidate that already exists rather than an addition, this pipeline never
 * edits a candidate mechanically, and "what label should this carry?" is a
 * question that wants prose. It stays in data/REVIEW.md, which is where the
 * judgement calls live.
 */
export function proposalItems(
  reports: readonly Report[],
  lexicon: Map<string, Entry>,
  frequency: Frequency,
): ReviewItem[] {
  const byKey = new Map<string, ReviewItem>();
  for (const report of reports) {
    const traditional = report.proposal_traditional;
    if (traditional === undefined) continue;
    const entry = lexicon.get(report.cyrillic);
    // Already accepted by somebody, by hand or by an earlier run of this.
    if (entry?.candidates.some((c) => c.traditional === traditional)) continue;
    const key = `${report.cyrillic}|${traditional}`;
    const existing = byKey.get(key);
    if (existing !== undefined) {
      existing.sessions = (existing.sessions ?? 0) + report.sessions;
      existing.trusted = mergeLabels(existing.trusted, report.reviewers);
      if (existing.proposedSense === undefined && report.proposal_sense !== undefined) {
        existing.proposedSense = report.proposal_sense;
      }
      continue;
    }
    const item: ReviewItem = {
      id: questionId(report.cyrillic, traditional),
      cyrillic: report.cyrillic,
      traditional,
      sessions: report.sessions,
    };
    // An entry that already holds a candidate will hold two once this lands,
    // and the schema requires a label on every candidate of such an entry.
    // A hint for the page, not the rule: the transcriber recomputes it against
    // the lexicon as merged, which is the only state that can be authoritative
    // — two proposals for one unknown word both accepted in the same session
    // make an entry of two candidates that nothing here could have foreseen.
    if (entry !== undefined) item.senseRequired = true;
    if (report.proposal_sense !== undefined) item.proposedSense = report.proposal_sense;
    if (report.reviewers !== undefined) item.trusted = [...report.reviewers];
    const traffic = Object.values(frequency.words[report.cyrillic] ?? {}).reduce((n, c) => n + c, 0);
    if (traffic > 0) item.traffic = traffic;
    const siblings = siblingsOf(entry, traditional);
    if (siblings !== undefined) item.siblings = siblings;
    byKey.set(key, item);
  }
  return [...byKey.values()].sort(
    (a, b) =>
      (b.trusted?.length ?? 0) - (a.trusted?.length ?? 0) ||
      (b.sessions ?? 0) - (a.sessions ?? 0) ||
      (b.traffic ?? 0) - (a.traffic ?? 0) ||
      compareWords(a.cyrillic, b.cyrillic),
  );
}

function group(items: ReviewItem[]): ReviewGroup {
  return { pool: items.length, items: items.slice(0, MAX_PER_GROUP) };
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback;
}

function main(): void {
  const lexicon = loadLexicon();
  // Names are the flagship human-verified tier and live in their own file. A
  // name still waiting for review is exactly what an expert should see.
  if (existsSync(NAMES_FILE)) for (const e of readEntriesFile(NAMES_FILE)) lexicon.set(e.cyrillic, e);

  const frequency = readJson<Frequency>(FREQUENCY_FILE, { words: {} });
  const ledger = readJson<Ledger>(REPORTS_FILE, { through: null, reports: [] });

  const bundle: ReviewBundle = {
    verifications: group(verificationItems(ledger.verdicts ?? [], lexicon, frequency)),
    wrong: group(wrongItems(ledger.reports, lexicon, frequency)),
    proposals: group(proposalItems(ledger.reports, lexicon, frequency)),
  };

  mkdirSync(join(REPO_ROOT, "apps", "web", "public"), { recursive: true });
  writeFileSync(BUNDLE_FILE, JSON.stringify(bundle) + "\n", "utf8");

  console.log("Wrote apps/web/public/review-bundle.json");
  for (const [name, g] of Object.entries(bundle)) {
    const held = g.pool - g.items.length;
    console.log(`  ${name}: ${g.items.length}${held > 0 ? ` (${held} more left for a later build)` : ""}`);
  }
}

if (import.meta.main) {
  main();
}
