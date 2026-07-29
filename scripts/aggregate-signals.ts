/**
 * Turn a drained mailbox into a triaged pull request.
 * Run with: bun run signals:aggregate <file.jsonl> [--pr-body <file.md>]
 *
 * Reads the JSONL written by scripts/export-signals.ts and writes:
 *   data/stats/frequency.json  — how often each candidate was chosen
 *   data/stats/reports.json    — the open triage ledger (flags and proposals)
 *   data/REVIEW.md             — the human-readable queue, between markers
 *   data/lexicon/<letter>.json — only for the one unambiguous case below
 *   the PR body, if --pr-body is given (not committed; the workflow reads it)
 *
 * What this script may and may not decide:
 *
 *   - It never sets `verified: true` on the strength of anonymous signals. A
 *     count of strangers agreeing is evidence about where to look; verification
 *     is a human reading монгол бичиг. The single exception is the fast track
 *     below, and it is not an exception to that sentence: the humans are the
 *     trusted reviewers who attested the spelling and the maintainer who merges
 *     the pull request. A script still decides nothing on its own.
 *   - It never edits or removes an existing candidate. "This spelling is
 *     wrong" and "this is a correct spelling of a meaning I did not want"
 *     arrive through the same button, and only a reviewer can tell them apart;
 *     guessing would collapse the one-to-many mapping the whole project exists
 *     to preserve.
 *   - It adds a lexicon entry in exactly one case: an unknown word — no entry
 *     at all — for which two independent sessions typed the identical
 *     spelling, and no other spelling was proposed for it. Nothing existing is
 *     touched, no `sense` label is invented, and the result is an ordinary
 *     `verified: false` candidate a reviewer can delete in one line. Anything
 *     less clear-cut is written up for a human instead.
 *
 * The ledger is the memory. Signals are deleted from the mailbox once drained,
 * so an item not carried forward is an item lost — reports.json accumulates
 * them across weeks and this script regenerates REVIEW.md from it, the same
 * way the Wiktionary importer regenerates its conflict queue from the merged
 * lexicon rather than parsing its own markdown.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CYRILLIC_WORD_RE,
  DATA_DIR,
  NAMES_FILE,
  TRADITIONAL_RE,
  compareWords,
  listShardFiles,
  readEntriesFile,
  readReviewers,
  reviewerLabelOf,
  shardFileFor,
  writeEntriesFile,
  type Candidate,
  type Entry,
  type Reviewer,
} from "./lib.ts";
import type { SignalRow } from "./export-signals.ts";
import { wiktionaryUrl } from "./import-wiktionary.ts";

const STATS_DIR = join(DATA_DIR, "stats");
const FREQUENCY_FILE = join(STATS_DIR, "frequency.json");
const REPORTS_FILE = join(STATS_DIR, "reports.json");
const REVIEW_FILE = join(DATA_DIR, "REVIEW.md");
const REVIEW_BEGIN = "<!-- community-signals:begin (auto-generated, do not edit between markers) -->";
const REVIEW_END = "<!-- community-signals:end -->";

/** NNBSP U+202F, which joins a written-apart suffix to its stem. Built from
 *  its code point: invisible characters do not belong in source. */
const NNBSP = String.fromCodePoint(0x202f);

/** How many independent sessions must type the identical spelling before it is
 *  added mechanically. Two is not proof — it is the point at which "one person
 *  typed something" becomes "two strangers agree", which is the weakest claim
 *  worth acting on without a reviewer. */
export const CORROBORATION_THRESHOLD = 2;

/** How long an unactioned report stays in the queue. Long enough that a busy
 *  month does not drop it, short enough that the queue stays readable. Aged-out
 *  items are listed in the PR body — never dropped quietly — and the raw signal
 *  is still in the workflow artifact. */
export const STALE_DAYS = 90;

/**
 * How many *different* trusted reviewers must call a spelling right before this
 * script stages `verified: true` for the maintainer to merge.
 *
 * Two, and they are counted by roster label rather than by session, so one
 * reviewer answering from their phone and their laptop is still one reviewer.
 * One would be enough on the merits — a grant is handed to somebody the
 * maintainer knows reads монгол бичиг — but two is what makes a leaked or
 * careless link unable to verify anything by itself, and the cost of the second
 * opinion is one more person answering one more question.
 */
export const ATTESTATION_THRESHOLD = 2;

/**
 * How many staged flips one pull request may carry.
 *
 * The whole policy rests on the maintainer actually reading the fast-track
 * section, and a hundred-line diff of `verified: false` → `true` is a section
 * nobody reads — it is merged. The rest wait for next week; the count that
 * waited is printed in the PR body, because a cap nobody is told about reads as
 * "that was all of them".
 */
export const MAX_FAST_TRACK = 25;

// ---------------------------------------------------------------------------
// Ledger shapes

/** Times each candidate was the one a visitor copied, accumulated across
 *  drains. Ordering signal only: never a claim that a form is right. */
export interface Frequency {
  words: Record<string, Record<string, number>>;
}

/**
 * One open question for a reviewer, keyed by content so it survives re-sorting
 * of the shards. `traditional` is the candidate it is about — absent when the
 * lexicon had no entry for the word at all.
 */
export interface Report {
  cyrillic: string;
  traditional?: string;
  kind: "correction" | "missing_sense" | "new_word";
  proposal_traditional?: string;
  proposal_sense?: string;
  /** Distinct browser sessions that said this. The mailbox drops a repeat from
   *  the same session, so each count is a separate contributor-ish. */
  sessions: number;
  /** Roster labels of the trusted reviewers among them, if any. A report from
   *  someone who reads the script is worth reading first — it does not make the
   *  report true, and nothing is applied from it either way. */
  reviewers?: string[];
  first_seen: string;
  last_seen: string;
}

/**
 * Answers to one verification-queue question, tallied.
 *
 * A tally is evidence, never a verdict of ours: `yes` and `no` are counts of
 * people who said this is, or is not, a written form of the word. A reviewer
 * reads them beside the candidate and decides. Nothing here sets `verified`.
 */
export interface VerdictTally {
  cyrillic: string;
  traditional: string;
  yes: number;
  no: number;
  /**
   * Roster labels of trusted reviewers who said yes, and who said no.
   *
   * Labels, never grants — the repository records that two different trusted
   * people agreed, never which two. Deduplicated, so one reviewer answering
   * from a phone and a laptop is one attestation rather than a quorum of one.
   * A reviewer who changes their mind moves between the two lists; the later
   * answer is the one that stands.
   */
  attested?: string[];
  disputed?: string[];
  first_seen: string;
  last_seen: string;
}

export interface Ledger {
  /** Latest `created_at` already folded in. Rows at or before it are ignored,
   *  so a re-run — or a week whose delete failed and re-exported the same
   *  rows — cannot count anything twice. */
  through: string | null;
  reports: Report[];
  verdicts?: VerdictTally[];
}

// ---------------------------------------------------------------------------
// Pure aggregation (unit-tested in aggregate-signals.test.ts)

export function parseJsonl(text: string): SignalRow[] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as SignalRow);
}

/**
 * Rows worth folding in: never seen before (by id), and newer than the
 * watermark. Both guards matter — the id guard catches a file concatenated
 * with itself, the watermark catches a re-run of an entire drain.
 */
export function freshRows(rows: SignalRow[], through: string | null): SignalRow[] {
  const seen = new Set<string>();
  const fresh: SignalRow[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    if (through !== null && row.created_at <= through) continue;
    fresh.push(row);
  }
  return fresh;
}

export function latestTimestamp(rows: SignalRow[], through: string | null): string | null {
  let latest = through;
  for (const row of rows) if (latest === null || row.created_at > latest) latest = row.created_at;
  return latest;
}

/** Fold selection signals into the running frequency table. */
export function addSelections(frequency: Frequency, rows: SignalRow[]): number {
  let counted = 0;
  for (const row of rows) {
    if (row.signal_type !== "selection" || !row.traditional) continue;
    const forms = (frequency.words[row.cyrillic] ??= {});
    forms[row.traditional] = (forms[row.traditional] ?? 0) + 1;
    counted++;
  }
  return counted;
}

/** Identity of a report: the same question asked by two people is one item. */
export function reportKey(r: Report): string {
  // Pipes cannot occur in any half — every field is Cyrillic letters, the
  // Mongolian block, a fixed enum, or a free-text sense, and a sense with a
  // pipe in it would only ever merge two reports that are already about the
  // same word and spelling.
  return [r.cyrillic, r.traditional ?? "", r.kind, r.proposal_traditional ?? "", r.proposal_sense ?? ""].join("|");
}

function asReport(row: SignalRow, roster: readonly Reviewer[]): Report | undefined {
  if (row.signal_type !== "flag" && row.signal_type !== "proposal") return undefined;
  const kind = row.proposal_kind;
  if (kind !== "correction" && kind !== "missing_sense" && kind !== "new_word") return undefined;
  const report: Report = {
    cyrillic: row.cyrillic,
    kind,
    sessions: 1,
    first_seen: row.created_at,
    last_seen: row.created_at,
  };
  if (row.traditional) report.traditional = row.traditional;
  if (row.proposal_traditional) report.proposal_traditional = row.proposal_traditional;
  if (row.proposal_sense) report.proposal_sense = row.proposal_sense;
  const label = reviewerLabelOf(row.reviewer_id, roster as Reviewer[]);
  if (label !== undefined) report.reviewers = [label];
  return report;
}

/** Merge two label lists into one sorted, deduplicated list, or nothing. */
function mergeLabels(a: readonly string[] | undefined, b: readonly string[] | undefined): string[] | undefined {
  const merged = [...new Set([...(a ?? []), ...(b ?? [])])].sort(compareWords);
  return merged.length > 0 ? merged : undefined;
}

/**
 * Fold flags and proposals into the ledger.
 *
 * A contributor who types a correction files both a flag and a proposal — the
 * flag the moment the branching question is answered, so that abandoning the
 * proposal step still leaves a signal. The two rows are therefore one opinion,
 * and the proposal subsumes the flag: matching flags from the same drain are
 * dropped rather than counted beside it.
 */
export function addReports(ledger: Ledger, rows: SignalRow[], roster: readonly Reviewer[] = []): number {
  const byKey = new Map(ledger.reports.map((r) => [reportKey(r), r]));
  const incoming: Report[] = [];
  for (const row of rows) {
    const report = asReport(row, roster);
    if (report !== undefined) incoming.push(report);
  }
  const subsumed = new Set(
    incoming
      .filter((r) => r.proposal_traditional !== undefined || r.proposal_sense !== undefined)
      .map((r) => reportKey({ ...r, proposal_traditional: undefined, proposal_sense: undefined })),
  );
  let added = 0;
  for (const report of incoming) {
    const key = reportKey(report);
    if (report.proposal_traditional === undefined && report.proposal_sense === undefined && subsumed.has(key)) {
      continue;
    }
    const existing = byKey.get(key);
    if (existing === undefined) {
      byKey.set(key, report);
      ledger.reports.push(report);
      added++;
    } else {
      existing.sessions += report.sessions;
      const reviewers = mergeLabels(existing.reviewers, report.reviewers);
      if (reviewers !== undefined) existing.reviewers = reviewers;
      if (report.first_seen < existing.first_seen) existing.first_seen = report.first_seen;
      if (report.last_seen > existing.last_seen) existing.last_seen = report.last_seen;
    }
  }
  return added;
}

/**
 * Fold queue answers into the running tallies.
 *
 * Keyed by the candidate rather than by `question_id`: a question is something
 * the page showed and may stop showing, while the candidate it was about is
 * data. Rebuilding the queue must never orphan the answers already given about
 * a spelling.
 */
export function addVerdicts(ledger: Ledger, rows: SignalRow[], roster: readonly Reviewer[] = []): number {
  const tallies = (ledger.verdicts ??= []);
  const byKey = new Map(tallies.map((v) => [`${v.cyrillic}|${v.traditional}`, v]));
  let counted = 0;
  for (const row of rows) {
    if (row.signal_type !== "verdict" || !row.traditional || row.verdict === null) continue;
    const key = `${row.cyrillic}|${row.traditional}`;
    let tally = byKey.get(key);
    if (tally === undefined) {
      tally = {
        cyrillic: row.cyrillic,
        traditional: row.traditional,
        yes: 0,
        no: 0,
        first_seen: row.created_at,
        last_seen: row.created_at,
      };
      byKey.set(key, tally);
      tallies.push(tally);
    }
    if (row.verdict) tally.yes++;
    else tally.no++;
    // A trusted answer is also an ordinary one — it is counted above like
    // anyone's — and it is additionally recorded by label, because two labels
    // are a different kind of claim than two votes. Rows arrive oldest first,
    // so a reviewer who answers again lands in the other list and leaves the
    // first: the answer that stands is the last one they gave.
    const label = reviewerLabelOf(row.reviewer_id, roster as Reviewer[]);
    if (label !== undefined) {
      const [into, outOf] = row.verdict ? (["attested", "disputed"] as const) : (["disputed", "attested"] as const);
      tally[into] = mergeLabels(tally[into], [label]);
      const remaining = (tally[outOf] ?? []).filter((l) => l !== label);
      if (remaining.length > 0) tally[outOf] = remaining;
      else delete tally[outOf];
    }
    if (row.created_at < tally.first_seen) tally.first_seen = row.created_at;
    if (row.created_at > tally.last_seen) tally.last_seen = row.created_at;
    counted++;
  }
  return counted;
}

/**
 * Whether this tally is what the fast track is for: enough different trusted
 * reviewers said yes, and no trusted reviewer said no.
 *
 * A single trusted no is a veto rather than a vote to be outweighed. Two people
 * who both read монгол бичиг disagreeing about a spelling is the most
 * informative thing this pipeline can produce, and averaging it away would turn
 * the one signal worth a maintainer's attention into a number.
 */
export function isAttested(tally: VerdictTally): boolean {
  return (tally.disputed ?? []).length === 0 && (tally.attested ?? []).length >= ATTESTATION_THRESHOLD;
}

/** Trusted reviewers who do not agree with each other. Kept in the queue even
 *  after the candidate is verified — see `verdictIsOpen`. */
export function isDisputed(tally: VerdictTally): boolean {
  return (tally.disputed ?? []).length > 0;
}

/**
 * Whether a tally still has anything to tell a reviewer.
 *
 * It stops when the answer is in the lexicon: the candidate was verified (a
 * human settled it) or the form is gone (someone acted on the no). Unlike
 * reports, tallies do not age out — a count of what people said is not a task
 * anyone forgot to do, and throwing away votes because they were slow to
 * arrive would only make the next reviewer start over.
 *
 * One thing outlives verification: a trusted reviewer saying no about a
 * spelling somebody verified. That is two people who read монгол бичиг
 * contradicting each other, and it goes on being asked every week until a human
 * settles it — by unverifying the candidate, by removing the form, or by
 * deleting the tally from data/stats/reports.json, which is how a maintainer
 * says "I have read this and I disagree".
 */
export function verdictIsOpen(tally: VerdictTally, lexicon: Map<string, Entry>): boolean {
  const candidate = lexicon
    .get(tally.cyrillic)
    ?.candidates.find((c) => c.traditional === tally.traditional);
  if (candidate === undefined) return false;
  return !candidate.verified || isDisputed(tally);
}

export type Resolution = "open" | "resolved" | "stale";

/**
 * Whether a reviewer has already answered this, or time has.
 *
 * `resolved` is read out of the lexicon rather than recorded anywhere: the
 * flagged form is gone (the correction was made) or the proposed form is now a
 * candidate (the proposal was accepted). That keeps the queue self-cleaning
 * across re-runs, and means an item cannot linger because someone forgot to
 * tick it off. To dismiss a report a reviewer disagrees with, delete its
 * object from data/stats/reports.json — if the signal is real it will be filed
 * again, which is the right way for a disagreement to come back.
 *
 * The "flagged form is gone" test only applies where an entry exists to have
 * lost it. A composed suffix candidate lives in no shard at all — номын is
 * built at runtime from ном + ᠤᠨ — so reading its absence as a fix would close
 * every composition report the moment it was filed, and those are exactly the
 * reports that indict a suffixes.json row.
 */
export function resolutionOf(report: Report, lexicon: Map<string, Entry>, now: Date): Resolution {
  const entry = lexicon.get(report.cyrillic);
  const forms = new Set(entry?.candidates.map((c) => c.traditional) ?? []);
  if (entry !== undefined && report.traditional !== undefined && !forms.has(report.traditional)) {
    return "resolved";
  }
  if (report.proposal_traditional !== undefined && forms.has(report.proposal_traditional)) return "resolved";
  const ageDays = (now.getTime() - new Date(report.first_seen).getTime()) / 86_400_000;
  if (ageDays > STALE_DAYS) return "stale";
  return "open";
}

/** A suffix variant many different words were flagged on. */
export interface SuffixSuspect {
  suffix: string;
  words: string[];
  reports: number;
}

/**
 * Composed candidates that were flagged, grouped by the suffix rather than the
 * word.
 *
 * A composed form is stem + NNBSP + suffix, built at runtime from a
 * data/suffixes.json row. When many different stems are flagged carrying the
 * same suffix variant, the suspect is the suffix row — one review item that
 * fixes N words — not N separate word reports. See data/GRAMMAR.md § Fixing a
 * wrong composition.
 */
export function suffixSuspects(reports: Report[]): SuffixSuspect[] {
  const bySuffix = new Map<string, { words: Set<string>; reports: number }>();
  for (const report of reports) {
    const at = report.traditional?.lastIndexOf(NNBSP) ?? -1;
    if (at < 0) continue;
    const suffix = report.traditional!.slice(at + 1);
    const group = bySuffix.get(suffix) ?? { words: new Set<string>(), reports: 0 };
    group.words.add(report.cyrillic);
    group.reports++;
    bySuffix.set(suffix, group);
  }
  return [...bySuffix.entries()]
    .filter(([, g]) => g.words.size > 1)
    .map(([suffix, g]) => ({ suffix, words: [...g.words].sort(compareWords), reports: g.reports }))
    .sort((a, b) => b.reports - a.reports || compareWords(a.suffix, b.suffix));
}

/**
 * The narrow mechanical case: a word the lexicon does not know, one proposed
 * spelling, agreed on by enough independent sessions.
 *
 * Everything that could destroy information is excluded — there is no entry to
 * modify, no second candidate to force a `sense` onto, and no competing
 * proposal to choose between. A word that already exists anywhere, including
 * data/names.json (the fully human-verified tier), is left alone.
 */
export function mechanicalAdditions(
  reports: Report[],
  known: Set<string>,
): { report: Report; entry: Entry }[] {
  const byWord = new Map<string, Report[]>();
  for (const report of reports) {
    if (report.proposal_traditional === undefined) continue;
    if (known.has(report.cyrillic)) continue;
    byWord.set(report.cyrillic, [...(byWord.get(report.cyrillic) ?? []), report]);
  }
  const additions: { report: Report; entry: Entry }[] = [];
  for (const [cyrillic, group] of byWord) {
    if (group.length !== 1) continue;
    const report = group[0]!;
    const traditional = report.proposal_traditional!;
    if (report.sessions < CORROBORATION_THRESHOLD) continue;
    // The database checked these too. Checking again costs nothing and keeps a
    // schema drift from writing something the validator would reject.
    if (!CYRILLIC_WORD_RE.test(cyrillic) || !TRADITIONAL_RE.test(traditional)) continue;
    if (traditional !== traditional.normalize("NFC")) continue;
    const candidate: Candidate = { traditional, verified: false, source: "community" };
    additions.push({ report, entry: { cyrillic, candidates: [candidate] } });
  }
  return additions.sort((a, b) => compareWords(a.entry.cyrillic, b.entry.cyrillic));
}

/** Where an entry lives, so a staged flip can be written back to its file. */
export type EntryIndex = Map<string, { entry: Entry; file: string }>;

/** One candidate the trusted reviewers have settled, staged for the merge. */
export interface Staged {
  tally: VerdictTally;
  file: string;
  entry: Entry;
  candidate: Candidate;
}

/**
 * The fast track: candidates two different trusted reviewers called right, with
 * no trusted reviewer calling them wrong.
 *
 * This is the one place a script writes `verified: true`, and it is worth being
 * exact about what that flag then means. It has always meant "a human read this
 * spelling and said it is right"; it still does. What changed is which human —
 * the reviewers who answered, rather than the maintainer alone — and the
 * maintainer is still the one who merges, with the attesting labels printed
 * beside every flip. A script that decided this by itself would be a different
 * thing entirely, and this is not that.
 *
 * Ordered by weight of attestation, then alphabetically; the caller applies the
 * per-pull-request cap.
 */
export function fastTrack(tallies: readonly VerdictTally[], index: EntryIndex): Staged[] {
  const staged: Staged[] = [];
  for (const tally of tallies) {
    if (!isAttested(tally)) continue;
    const found = index.get(tally.cyrillic);
    if (found === undefined) continue;
    // A composed suffix candidate lives in no file, so there is nothing to
    // flip — it drops out here rather than needing a rule of its own.
    const candidate = found.entry.candidates.find((c) => c.traditional === tally.traditional);
    if (candidate === undefined || candidate.verified) continue;
    staged.push({ tally, file: found.file, entry: found.entry, candidate });
  }
  return staged.sort(
    (a, b) =>
      (b.tally.attested?.length ?? 0) - (a.tally.attested?.length ?? 0) ||
      compareWords(a.tally.cyrillic, b.tally.cyrillic) ||
      compareWords(a.tally.traditional, b.tally.traditional),
  );
}

// ---------------------------------------------------------------------------
// Files

/**
 * Every entry a signal can be about, which file it lives in, and one array per
 * file to write back. Read once, so that a staged flip and the resolution
 * checks are looking at the same objects.
 *
 * Names are loaded beside the lexicon shards because the queue already asks
 * about them — build-queue.ts folds names.json in — so answers about them
 * arrive. Reading only the shards made every one of those tallies look like a
 * candidate that no longer exists, which this ledger reads as "settled": the
 * answers about the flagship human-verified tier were the ones being dropped.
 */
function loadEntryFiles(): { index: EntryIndex; files: Map<string, Entry[]> } {
  const files = new Map<string, Entry[]>();
  const index: EntryIndex = new Map();
  const paths = [...listShardFiles(), ...(existsSync(NAMES_FILE) ? [NAMES_FILE] : [])];
  for (const file of paths) {
    const entries = readEntriesFile(file);
    files.set(file, entries);
    for (const entry of entries) index.set(entry.cyrillic, { entry, file });
  }
  return { index, files };
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback;
}

/** Sorted on write so a weekly commit shows what changed, not a reshuffle. */
function writeFrequency(frequency: Frequency): void {
  const words: Record<string, Record<string, number>> = {};
  for (const cyrillic of Object.keys(frequency.words).sort(compareWords)) {
    const forms = frequency.words[cyrillic]!;
    words[cyrillic] = Object.fromEntries(
      Object.keys(forms)
        .sort(compareWords)
        .map((t) => [t, forms[t]!]),
    );
  }
  writeFileSync(FREQUENCY_FILE, JSON.stringify({ words }, null, 2) + "\n", "utf8");
}

/** Stable key order and sort, so a weekly commit reads as what arrived. */
function writeLedger(ledger: Ledger): void {
  const verdicts = [...(ledger.verdicts ?? [])]
    .sort((a, b) => compareWords(a.cyrillic, b.cyrillic) || compareWords(a.traditional, b.traditional))
    .map((v) => {
      // Written field by field rather than spread, so that a tally which gained
      // its attestations later still serializes in the same order as one that
      // always had them — otherwise the weekly diff shows keys moving around.
      const out: Partial<VerdictTally> = { cyrillic: v.cyrillic, traditional: v.traditional };
      out.yes = v.yes;
      out.no = v.no;
      if (v.attested !== undefined) out.attested = v.attested;
      if (v.disputed !== undefined) out.disputed = v.disputed;
      out.first_seen = v.first_seen;
      out.last_seen = v.last_seen;
      return out as VerdictTally;
    });
  const reports = [...ledger.reports]
    .sort((a, b) => compareWords(a.cyrillic, b.cyrillic) || compareWords(reportKey(a), reportKey(b)))
    .map((r) => {
      const out: Partial<Report> = { cyrillic: r.cyrillic };
      if (r.traditional !== undefined) out.traditional = r.traditional;
      out.kind = r.kind;
      if (r.proposal_traditional !== undefined) out.proposal_traditional = r.proposal_traditional;
      if (r.proposal_sense !== undefined) out.proposal_sense = r.proposal_sense;
      out.sessions = r.sessions;
      if (r.reviewers !== undefined) out.reviewers = r.reviewers;
      out.first_seen = r.first_seen;
      out.last_seen = r.last_seen;
      return out as Report;
    });
  writeFileSync(
    REPORTS_FILE,
    JSON.stringify({ through: ledger.through, reports, verdicts }, null, 2) + "\n",
    "utf8",
  );
}

// ---------------------------------------------------------------------------
// Rendering

function fmtCandidate(c: Candidate): string {
  const latin = c.latin !== undefined ? ` (_${c.latin}_)` : "";
  const sense = c.sense !== undefined ? `“${c.sense}”` : "_no sense_";
  const marks = [c.verified ? "verified ✓" : null, c.corroborated ? "corroborated" : null]
    .filter(Boolean)
    .join(", ");
  return `\`${c.traditional}\`${latin} — ${c.source}${marks ? ` (${marks})` : ""} — ${sense}`;
}

function fmtSessions(n: number): string {
  return plural(n, "session");
}

/** Roster labels, as the pull request names them: “trusted r2, r5”. The labels
 *  are opaque by design — who they are is the maintainer's private note, and
 *  what the queue needs to say is only that they are different people. */
function fmtLabels(labels: readonly string[]): string {
  return `trusted ${[...labels].sort(compareWords).join(", ")}`;
}

/** An absolute data file path as REVIEW.md should show it: `data/lexicon/у.json`.
 *  Backslashes normalized so a maintainer running this on Windows does not
 *  commit a link nobody can follow. */
function dataPath(file: string): string {
  const posix = file.replaceAll("\\", "/");
  const at = posix.lastIndexOf("/data/");
  return at === -1 ? posix : posix.slice(at + 1);
}

/** English plural for the weekly summary. The PR body is read by a human every
 *  week; "1 new reports" is the kind of seam that makes generated prose feel
 *  like output rather than a message. */
function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function chosenCount(frequency: Frequency, cyrillic: string, traditional?: string): number {
  const forms = frequency.words[cyrillic];
  if (forms === undefined) return 0;
  if (traditional !== undefined) return forms[traditional] ?? 0;
  return Object.values(forms).reduce((n, c) => n + c, 0);
}

/**
 * One report, with everything a reviewer needs to decide it in place: what the
 * lexicon says now, what was proposed, how many people said so, and how often
 * the word is actually converted.
 */
function fmtReport(report: Report, lexicon: Map<string, Entry>, frequency: Frequency): string[] {
  const lines: string[] = [];
  const chosen = chosenCount(frequency, report.cyrillic);
  const traffic = chosen > 0 ? ` — chosen ${chosen}×` : "";
  const trusted = (report.reviewers ?? []).length > 0 ? ` — **${fmtLabels(report.reviewers!)}**` : "";
  lines.push(
    `- **${report.cyrillic}**${traffic} — ${fmtSessions(report.sessions)}${trusted} — ` +
      `[Wiktionary](${wiktionaryUrl(report.cyrillic)})`,
  );
  const entry = lexicon.get(report.cyrillic);
  const joinerAt = report.traditional?.lastIndexOf(NNBSP) ?? -1;
  if (entry === undefined && joinerAt > 0) {
    // Composed by the suffix engine, so there is no stored candidate to show —
    // showing the two halves says which rule built it.
    lines.push(
      `  - reported: \`${report.traditional!.slice(0, joinerAt)}\` + ` +
        `\`${report.traditional!.slice(joinerAt + 1)}\` — composed by a suffix rule, in no shard`,
    );
  } else if (entry === undefined) {
    lines.push("  - lexicon: no entry for this word");
  } else {
    for (const c of entry.candidates) {
      const mark = c.traditional === report.traditional ? "reported" : "also";
      const count = chosenCount(frequency, report.cyrillic, c.traditional);
      lines.push(`  - ${mark}: ${fmtCandidate(c)}${count > 0 ? ` — chosen ${count}×` : ""}`);
    }
  }
  if (report.proposal_traditional !== undefined) {
    lines.push(`  - **proposed spelling**: \`${report.proposal_traditional}\``);
  }
  if (report.proposal_sense !== undefined) {
    lines.push(`  - **proposed meaning**: “${report.proposal_sense}”`);
  }
  // The seed layer carries no sense labels, so "wrong spelling" and "not the
  // meaning I wanted" are not reliably distinguishable at the source. Say so
  // rather than letting the section heading imply a certainty nobody has.
  const anchor = entry?.candidates.find((c) => c.traditional === report.traditional);
  if (report.kind === "correction" && anchor !== undefined && anchor.sense === undefined) {
    lines.push(
      "  - ⚠ ambiguous: the reported candidate carries no `sense`, so this may be a wrong " +
        "spelling (replace it) or a correct spelling of another meaning (add beside it).",
    );
  }
  return lines;
}

interface Review {
  reports: Report[];
  suspects: SuffixSuspect[];
  added: { report: Report; entry: Entry }[];
  /** Flips this run applies. Rendered first: it is what the merge decides. */
  staged: Staged[];
  /** Eligible flips left for next week by the per-pull-request cap. */
  heldBack: number;
  tallies: VerdictTally[];
  lexicon: Map<string, Entry>;
  frequency: Frequency;
  through: string | null;
}

function renderReview({
  reports: openReports,
  suspects,
  added,
  staged,
  heldBack,
  tallies,
  lexicon,
  frequency,
  through,
}: Review): string {
  let open = openReports;
  const lines: string[] = [REVIEW_BEGIN, ""];
  lines.push("## Community signals (`scripts/aggregate-signals.ts`)");
  lines.push("");
  // English only, like the rest of this file's generated sections. The
  // Mongolian sentence that used to open this paragraph said exactly what the
  // English says next — a translation of the sentence beside it is noise, not
  // bilingualism.
  lines.push(
    "Reports filed from the converter" +
      (through !== null ? `, through ${through.slice(0, 10)}` : "") +
      ". A signal is not verification: it says where to look, and every change " +
      "below is a human decision. Counts are distinct browser sessions — the " +
      "mailbox drops a repeat from the same browser, so two sessions means two " +
      "people said the same thing. To dismiss a report, delete its object from " +
      "[stats/reports.json](stats/reports.json); if the signal is real it will " +
      "be filed again.",
  );
  lines.push("");

  const disputed = tallies.filter(isDisputed);

  if (staged.length > 0) {
    lines.push(`### Verified by attestation this run (${staged.length})`);
    lines.push("");
    lines.push(
      `Each spelling below was called right by ${ATTESTATION_THRESHOLD} **different trusted ` +
        "reviewers**, with none calling it wrong, so this pull request sets `verified: true` " +
        "on it. Merging is the decision, and it is yours: read the spellings, and drop any " +
        "flip you are not willing to stand behind — deleting the tally from " +
        "[stats/reports.json](stats/reports.json) stops it being staged again. Labels are " +
        "opaque on purpose; what the queue needs to say is that they are different people.",
    );
    lines.push("");
    for (const { tally, file, candidate } of staged) {
      const where = dataPath(file);
      lines.push(
        `- **${tally.cyrillic}** — \`${tally.traditional}\` — ${fmtLabels(tally.attested!)} — ` +
          `${tally.yes} ✓ / ${tally.no} ✗ — ${candidate.source} — [${where}](${where.replace(/^data\//u, "")})`,
      );
    }
    if (heldBack > 0) {
      lines.push("");
      lines.push(
        `${plural(heldBack, "more candidate")} also qualified and ${heldBack === 1 ? "was" : "were"} ` +
          `left for next week: at most ${MAX_FAST_TRACK} flips ship per pull request, because a ` +
          "fast-track section too long to read is a section that gets merged unread.",
      );
    }
    lines.push("");
  }

  if (disputed.length > 0) {
    lines.push(`### Trusted reviewers disagree (${disputed.length})`);
    lines.push("");
    lines.push(
      "Two people who read монгол бичиг gave opposite answers about the same spelling. This is " +
        "the most informative thing this pipeline produces and the least automatable: nothing " +
        "here is staged, averaged, or closed by time. It keeps being listed until a human " +
        "settles it — by correcting the entry, by deleting the tally from " +
        "[stats/reports.json](stats/reports.json), or by asking the reviewers.",
    );
    lines.push("");
    for (const tally of [...disputed].sort(
      (a, b) => compareWords(a.cyrillic, b.cyrillic) || compareWords(a.traditional, b.traditional),
    )) {
      const candidate = lexicon
        .get(tally.cyrillic)
        ?.candidates.find((c) => c.traditional === tally.traditional);
      const verified = candidate?.verified ? " — ⚠ this candidate is already `verified: true`" : "";
      const yes = (tally.attested ?? []).length > 0 ? `yes: ${fmtLabels(tally.attested!)} — ` : "";
      lines.push(
        `- **${tally.cyrillic}** — \`${tally.traditional}\` — ${yes}` +
          `no: ${fmtLabels(tally.disputed!)} — ${tally.yes} ✓ / ${tally.no} ✗${verified}`,
      );
    }
    lines.push("");
  }

  if (suspects.length > 0) {
    lines.push(`### Suffix rules under suspicion (${suspects.length})`);
    lines.push("");
    lines.push(
      "Each of these is one row of [suffixes.json](suffixes.json) flagged on " +
        "several different words. When many stems are wrong with the same " +
        "suffix, the rule is the suspect, not the words — see " +
        "[GRAMMAR.md](GRAMMAR.md) § Fixing a wrong composition.",
    );
    lines.push("");
    for (const s of suspects) {
      lines.push(`- \`${s.suffix}\` — ${s.reports} reports across ${s.words.length} words: ${s.words.join(", ")}`);
    }
    lines.push("");
  }

  // Words named above are not listed again below: replacing N per-word items
  // with one rule item is the entire point of grouping them.
  const grouped = new Set(suspects.flatMap((s) => s.words));
  open = open.filter((r) => !grouped.has(r.cyrillic));

  const sections: [string, string, (r: Report) => boolean][] = [
    [
      "Spellings reported wrong",
      "Someone said the stored form is wrong for every meaning. Replacing a form " +
        "is the one edit that can lose data, so nothing here is applied automatically.",
      (r) => r.kind === "correction",
    ],
    [
      "Meanings reported missing",
      "The stored spelling is fine; the meaning the visitor wanted is not listed. " +
        "The fix is an added candidate, never a replaced one — and because the " +
        "schema requires a `sense` once an entry has two candidates, the existing " +
        "candidate needs a label too.",
      (r) => r.kind === "missing_sense",
    ],
    [
      "Words the lexicon does not know",
      "Proposed spellings for words that fell back to rule-based transliteration.",
      (r) => r.kind === "new_word",
    ],
  ];
  for (const [title, blurb, match] of sections) {
    const items = open.filter(match);
    lines.push(`### ${title} (${items.length})`);
    lines.push("");
    if (items.length === 0) {
      lines.push("Nothing open. 🎉");
      lines.push("");
      continue;
    }
    lines.push(blurb);
    lines.push("");
    // Trusted first, then corroborated, then by traffic: the fastest decisions
    // at the top. A report from someone who reads the script is not more likely
    // to be true than a stranger's, but it is more likely to be actionable —
    // and it usually arrives with a spelling attached.
    const ordered = [...items].sort(
      (a, b) =>
        (b.reviewers?.length ?? 0) - (a.reviewers?.length ?? 0) ||
        b.sessions - a.sessions ||
        chosenCount(frequency, b.cyrillic) - chosenCount(frequency, a.cyrillic) ||
        compareWords(a.cyrillic, b.cyrillic),
    );
    for (const report of ordered) lines.push(...fmtReport(report, lexicon, frequency));
    lines.push("");
  }

  // Tallies a trusted reviewer disputes are listed above, in their own section;
  // repeating them here as ordinary counts would bury the disagreement in a
  // list of numbers, which is exactly what it must not become.
  const counted = tallies.filter((t) => !isDisputed(t));
  if (counted.length > 0) {
    lines.push(`### Queue answers (${counted.length})`);
    lines.push("");
    lines.push(
      "Answers from [the verification queue](https://khudam.suray.mn/queue) to one " +
        "question: *is this a written form of this word, for any meaning?* Two " +
        "spellings of one word can both be right, so a yes on each is a homonym, not " +
        "a contradiction — a yes and a no name the form to delete. **A count of " +
        "strangers agreeing is not verification**, however large: a spelling becomes " +
        "`verified: true` only through a human editing the entry, or through the " +
        `attestations of ${ATTESTATION_THRESHOLD} trusted reviewers above. Where a ` +
        "tally names reviewers, it is short of that threshold — one more answer would " +
        "settle it. Unanimous tallies are listed first because they are the quickest " +
        "to check, not because they are settled.",
    );
    lines.push("");
    const ordered = [...counted].sort(
      (a, b) =>
        (b.attested?.length ?? 0) - (a.attested?.length ?? 0) ||
        b.yes + b.no - (a.yes + a.no) ||
        Math.abs(b.yes - b.no) - Math.abs(a.yes - a.no) ||
        compareWords(a.cyrillic, b.cyrillic),
    );
    for (const tally of ordered) {
      const split = tally.yes > 0 && tally.no > 0 ? " — ⚠ readers disagree" : "";
      // One attestation short of the fast track is worth naming: it says which
      // spellings a single further reviewer would settle.
      const attested = (tally.attested ?? []).length > 0 ? ` — ${fmtLabels(tally.attested!)}` : "";
      lines.push(
        `- **${tally.cyrillic}** — \`${tally.traditional}\` — ` +
          `${tally.yes} ✓ / ${tally.no} ✗${attested}${split}`,
      );
    }
    lines.push("");
  }

  if (added.length > 0) {
    lines.push(`### Added to the lexicon by this run (${added.length})`);
    lines.push("");
    lines.push(
      "Unknown words whose spelling " +
        `${CORROBORATION_THRESHOLD} independent sessions typed identically. They are ` +
        "ordinary `verified: false` community candidates — please check them, and " +
        "delete any that are wrong.",
    );
    lines.push("");
    for (const { entry, report } of added) {
      lines.push(
        `- **${entry.cyrillic}** — \`${entry.candidates[0]!.traditional}\` — ` +
          `${fmtSessions(report.sessions)} — [Wiktionary](${wiktionaryUrl(entry.cyrillic)})`,
      );
    }
    lines.push("");
  }

  lines.push(REVIEW_END);
  return lines.join("\n");
}

/** Replace the marked section, or append it if this is the first run. */
function writeReviewSection(generated: string): void {
  let content: string;
  if (existsSync(REVIEW_FILE)) {
    const current = readFileSync(REVIEW_FILE, "utf8");
    const begin = current.indexOf(REVIEW_BEGIN);
    const end = current.indexOf(REVIEW_END);
    content =
      begin !== -1 && end !== -1
        ? current.slice(0, begin) + generated + current.slice(end + REVIEW_END.length)
        : current.trimEnd() + "\n\n" + generated + "\n";
  } else {
    content = "# Хянуулахаар хүлээгдэж буй бичлэгүүд / Entries flagged for review\n\n" + generated + "\n";
  }
  writeFileSync(REVIEW_FILE, content, "utf8");
}

// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const bodyAt = args.indexOf("--pr-body");
  const titleAt = args.indexOf("--pr-title");
  const bodyFile = bodyAt === -1 ? undefined : args[bodyAt + 1];
  const titleFile = titleAt === -1 ? undefined : args[titleAt + 1];
  const consumed = new Set([bodyAt + 1, titleAt + 1].filter((i) => i > 0));
  const input = args.find((a, i) => !a.startsWith("--") && !consumed.has(i));
  if (input === undefined) {
    console.error(
      "Usage: bun scripts/aggregate-signals.ts <file.jsonl> [--pr-body <file.md>] [--pr-title <file.txt>]",
    );
    process.exit(1);
  }

  const rows = parseJsonl(readFileSync(input, "utf8"));
  const ledger = readJson<Ledger>(REPORTS_FILE, { through: null, reports: [] });
  const frequency = readJson<Frequency>(FREQUENCY_FILE, { words: {} });
  const fresh = freshRows(rows, ledger.through);

  // The roster as the merged repository holds it, so a grant revoked last week
  // carries no weight this week — including on answers it already gave.
  const roster = readReviewers();
  const selections = addSelections(frequency, fresh);
  const newReports = addReports(ledger, fresh, roster);
  const verdicts = addVerdicts(ledger, fresh, roster);
  ledger.through = latestTimestamp(fresh, ledger.through);

  // Stamped rows nobody on the roster could have sent. Usually a revoked grant
  // still sitting in somebody's browser; worth printing either way, because the
  // alternative reading is that someone is guessing at grants.
  const stamped = fresh.filter((r) => r.reviewer_id !== null && r.reviewer_id !== undefined);
  const unmatched = new Set(
    stamped.filter((r) => reviewerLabelOf(r.reviewer_id, roster) === undefined).map((r) => r.reviewer_id!),
  );

  // Resolution is recomputed against the data as it stands right now, so a
  // report a reviewer answered by hand between runs closes itself.
  const { index, files } = loadEntryFiles();
  const lexicon = new Map([...index].map(([cyrillic, { entry }]) => [cyrillic, entry]));
  const known = new Set(index.keys());
  const now = new Date();
  const open: Report[] = [];
  const resolved: Report[] = [];
  const stale: Report[] = [];
  for (const report of ledger.reports) {
    const where = { open, resolved, stale }[resolutionOf(report, lexicon, now)];
    where.push(report);
  }

  const additions = mechanicalAdditions(open, known);
  const appliedKeys = new Set(additions.map((a) => reportKey(a.report)));
  const stillOpen = open.filter((r) => !appliedKeys.has(reportKey(r)));

  // The fast track, applied before anything is written: two different trusted
  // reviewers said yes, none said no. Flipping the candidate in place is what
  // puts it in the diff the maintainer merges — the only route by which this
  // script has ever written `verified: true`, and one a human still ends.
  const eligible = fastTrack(ledger.verdicts ?? [], index);
  const staged = eligible.slice(0, MAX_FAST_TRACK);
  const heldBack = eligible.length - staged.length;
  for (const { candidate } of staged) candidate.verified = true;

  // New entries go into their shards, which stay sorted; the flips above are in
  // files already loaded and need no reordering.
  const touched = new Set(staged.map((s) => s.file));
  const resorted = new Set<string>();
  for (const { entry } of additions) {
    const file = shardFileFor(entry.cyrillic);
    if (!files.has(file)) files.set(file, existsSync(file) ? readEntriesFile(file) : []);
    files.get(file)!.push(entry);
    touched.add(file);
    resorted.add(file);
  }
  for (const file of touched) {
    const entries = files.get(file)!;
    if (resorted.has(file)) entries.sort((a, b) => compareWords(a.cyrillic, b.cyrillic));
    writeEntriesFile(file, entries);
  }

  const openTallies = (ledger.verdicts ?? []).filter((v) => verdictIsOpen(v, lexicon));
  const settledTallies = (ledger.verdicts ?? []).length - openTallies.length;

  ledger.reports = stillOpen;
  ledger.verdicts = openTallies;
  mkdirSync(STATS_DIR, { recursive: true });
  writeLedger(ledger);
  writeFrequency(frequency);
  const suspects = suffixSuspects(stillOpen);
  writeReviewSection(
    renderReview({
      reports: stillOpen,
      suspects,
      added: additions,
      staged,
      heldBack,
      tallies: openTallies,
      lexicon,
      frequency,
      through: ledger.through,
    }),
  );

  const disputes = openTallies.filter(isDisputed);
  const summary = [
    `Drained **${plural(rows.length, "signal")}** (${fresh.length} new, ${rows.length - fresh.length} already processed).`,
    "",
    staged.length > 0
      ? `- ✓ **${plural(staged.length, "candidate")}** staged \`verified: true\` — ` +
        `${ATTESTATION_THRESHOLD} trusted reviewers each, none disagreeing` +
        (heldBack > 0 ? ` (${heldBack} more qualified, held for next week)` : "")
      : "",
    disputes.length > 0
      ? `- ⚠ **${plural(disputes.length, "spelling")}** where trusted reviewers disagree — nothing staged`
      : "",
    `- **${plural(selections, "selection")}** folded into \`data/stats/frequency.json\``,
    `- **${plural(newReports, "new report")}**, **${stillOpen.length}** open in total`,
    `- **${plural(verdicts, "queue answer")}**, **${plural(openTallies.length, "candidate")}** with a tally` +
      (settledTallies > 0 ? ` (${settledTallies} settled and dropped)` : ""),
    `- **${plural(additions.length, "unknown word")}** added mechanically ` +
      `(${CORROBORATION_THRESHOLD}+ sessions agreeing, \`verified: false\`)`,
    `- **${plural(resolved.length, "report")}** closed — the lexicon already answers them`,
    `- **${stale.length}** aged out after ${STALE_DAYS} days without action`,
    suspects.length > 0
      ? `- ⚠ **${plural(suspects.length, "suffix rule")}** flagged across several words each`
      : "",
    unmatched.size > 0
      ? `- **${plural(unmatched.size, "reviewer stamp")}** matched no grant on the roster ` +
        `(${plural(stamped.length, "stamped row")} in total) — most likely a revoked link ` +
        "still in someone's browser; those rows counted as anonymous"
      : "",
    // Leading newline rather than a "" entry: the filter below drops empty
    // strings, which is what lets the conditional lines above disappear when
    // they have nothing to say — and it would swallow a blank separator too,
    // leaving this paragraph glued to the last bullet as part of it.
    staged.length > 0
      ? `\n**Read the fast-track section before merging.** ${plural(staged.length, "flip")} ` +
        `${staged.length === 1 ? "is" : "are"} the whole of what this pull request asserts;\n` +
        "everything else it touches stays `verified: false`. The queue lives in\n" +
        "[`data/REVIEW.md`](data/REVIEW.md) § Community signals."
      : "\nNothing here is verified. Every entry added or referenced is `verified: false`;\n" +
        "the queue lives in [`data/REVIEW.md`](data/REVIEW.md) § Community signals.",
    stale.length > 0
      ? "\nAged out this run (raw rows are still in the workflow artifact):\n" +
        stale.map((r) => `- ${r.cyrillic}${r.traditional ? ` — \`${r.traditional}\`` : ""} (${r.kind})`).join("\n")
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  if (bodyFile !== undefined) writeFileSync(bodyFile, summary + "\n", "utf8");
  // A pull request that changes `verified` says so where a maintainer sees it
  // without opening anything. Written here rather than grepped out of the body
  // by the workflow: the count is known at this point, and reading our own
  // generated prose back is how a rename becomes a silent behaviour change.
  if (titleFile !== undefined) {
    const date = now.toISOString().slice(0, 10);
    const flips = staged.length > 0 ? ` · ${plural(staged.length, "verification")} staged` : "";
    writeFileSync(titleFile, `Community signals — ${date}${flips}\n`, "utf8");
  }
  console.log(summary.replaceAll("**", ""));
}

if (import.meta.main) {
  main();
}
