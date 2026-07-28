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
 *   - It never sets `verified: true`. Signals are evidence about where to
 *     look; verification is a human reading монгол бичиг, and nothing here
 *     can substitute for that.
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
  loadLexicon,
  readEntriesFile,
  shardFileFor,
  writeEntriesFile,
  type Candidate,
  type Entry,
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
  first_seen: string;
  last_seen: string;
}

export interface Ledger {
  /** Latest `created_at` already folded in. Rows at or before it are ignored,
   *  so a re-run — or a week whose delete failed and re-exported the same
   *  rows — cannot count anything twice. */
  through: string | null;
  reports: Report[];
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

function asReport(row: SignalRow): Report | undefined {
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
  return report;
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
export function addReports(ledger: Ledger, rows: SignalRow[]): number {
  const byKey = new Map(ledger.reports.map((r) => [reportKey(r), r]));
  const incoming: Report[] = [];
  for (const row of rows) {
    const report = asReport(row);
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
      if (report.first_seen < existing.first_seen) existing.first_seen = report.first_seen;
      if (report.last_seen > existing.last_seen) existing.last_seen = report.last_seen;
    }
  }
  return added;
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

// ---------------------------------------------------------------------------
// Files

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
  const reports = [...ledger.reports]
    .sort((a, b) => compareWords(a.cyrillic, b.cyrillic) || compareWords(reportKey(a), reportKey(b)))
    .map((r) => {
      const out: Partial<Report> = { cyrillic: r.cyrillic };
      if (r.traditional !== undefined) out.traditional = r.traditional;
      out.kind = r.kind;
      if (r.proposal_traditional !== undefined) out.proposal_traditional = r.proposal_traditional;
      if (r.proposal_sense !== undefined) out.proposal_sense = r.proposal_sense;
      out.sessions = r.sessions;
      out.first_seen = r.first_seen;
      out.last_seen = r.last_seen;
      return out as Report;
    });
  writeFileSync(REPORTS_FILE, JSON.stringify({ through: ledger.through, reports }, null, 2) + "\n", "utf8");
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
  return n === 1 ? "1 session" : `${n} sessions`;
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
  lines.push(
    `- **${report.cyrillic}**${traffic} — ${fmtSessions(report.sessions)} — ` +
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

function renderReview(
  openReports: Report[],
  suspects: SuffixSuspect[],
  added: { report: Report; entry: Entry }[],
  lexicon: Map<string, Entry>,
  frequency: Frequency,
  through: string | null,
): string {
  let open = openReports;
  const lines: string[] = [REVIEW_BEGIN, ""];
  lines.push("## Community signals (`scripts/aggregate-signals.ts`)");
  lines.push("");
  lines.push(
    "Хөрвүүлэгчээс ирсэн дохио — баталгаа биш, хаана харахыг заасан дараалал. " +
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
    // Corroborated first, then by traffic: the fastest decisions at the top.
    const ordered = [...items].sort(
      (a, b) =>
        b.sessions - a.sessions ||
        chosenCount(frequency, b.cyrillic) - chosenCount(frequency, a.cyrillic) ||
        compareWords(a.cyrillic, b.cyrillic),
    );
    for (const report of ordered) lines.push(...fmtReport(report, lexicon, frequency));
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
  const bodyFile = bodyAt === -1 ? undefined : args[bodyAt + 1];
  const input = args.find((a, i) => !a.startsWith("--") && i !== (bodyAt === -1 ? -1 : bodyAt + 1));
  if (input === undefined) {
    console.error("Usage: bun scripts/aggregate-signals.ts <file.jsonl> [--pr-body <file.md>]");
    process.exit(1);
  }

  const rows = parseJsonl(readFileSync(input, "utf8"));
  const ledger = readJson<Ledger>(REPORTS_FILE, { through: null, reports: [] });
  const frequency = readJson<Frequency>(FREQUENCY_FILE, { words: {} });
  const fresh = freshRows(rows, ledger.through);

  const selections = addSelections(frequency, fresh);
  const newReports = addReports(ledger, fresh);
  ledger.through = latestTimestamp(fresh, ledger.through);

  // Resolution is recomputed against the lexicon as it stands right now, so a
  // report a reviewer answered by hand between runs closes itself.
  const lexicon = loadLexicon();
  const known = new Set(lexicon.keys());
  if (existsSync(NAMES_FILE)) for (const e of readEntriesFile(NAMES_FILE)) known.add(e.cyrillic);
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

  // Write new entries into their shards, keeping each file sorted.
  const touchedShards = new Map<string, Entry[]>();
  for (const { entry } of additions) {
    const file = shardFileFor(entry.cyrillic);
    if (!touchedShards.has(file)) {
      touchedShards.set(file, existsSync(file) ? readEntriesFile(file) : []);
    }
    touchedShards.get(file)!.push(entry);
  }
  for (const [file, entries] of touchedShards) {
    entries.sort((a, b) => compareWords(a.cyrillic, b.cyrillic));
    writeEntriesFile(file, entries);
  }

  ledger.reports = stillOpen;
  mkdirSync(STATS_DIR, { recursive: true });
  writeLedger(ledger);
  writeFrequency(frequency);
  writeReviewSection(renderReview(stillOpen, suffixSuspects(stillOpen), additions, lexicon, frequency, ledger.through));

  const suspects = suffixSuspects(stillOpen);
  const summary = [
    `Drained **${rows.length}** signals (${fresh.length} new, ${rows.length - fresh.length} already processed).`,
    "",
    `- **${selections}** selections folded into \`data/stats/frequency.json\``,
    `- **${newReports}** new reports, **${stillOpen.length}** open in total`,
    `- **${additions.length}** unknown ${additions.length === 1 ? "word" : "words"} added mechanically ` +
      `(${CORROBORATION_THRESHOLD}+ sessions agreeing, \`verified: false\`)`,
    `- **${resolved.length}** reports closed — the lexicon already answers them`,
    `- **${stale.length}** aged out after ${STALE_DAYS} days without action`,
    suspects.length > 0
      ? `- ⚠ **${suspects.length}** suffix ${suspects.length === 1 ? "rule" : "rules"} flagged across several words each`
      : "",
    "",
    "Nothing here is verified. Every entry added or referenced is `verified: false`;",
    "the queue lives in [`data/REVIEW.md`](data/REVIEW.md) § Community signals.",
    stale.length > 0
      ? "\nAged out this run (raw rows are still in the workflow artifact):\n" +
        stale.map((r) => `- ${r.cyrillic}${r.traditional ? ` — \`${r.traditional}\`` : ""} (${r.kind})`).join("\n")
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  if (bodyFile !== undefined) writeFileSync(bodyFile, summary + "\n", "utf8");
  console.log(summary.replaceAll("**", ""));
}

if (import.meta.main) {
  main();
}
