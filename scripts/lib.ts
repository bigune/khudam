/**
 * Shared helpers for Khudam data tooling (import / validate / build).
 * Everything here must stay dependency-free and deterministic.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_DIR = join(REPO_ROOT, "data");
export const LEXICON_DIR = join(DATA_DIR, "lexicon");
export const NAMES_FILE = join(DATA_DIR, "names.json");
export const SUFFIXES_FILE = join(DATA_DIR, "suffixes.json");
export const REVIEWERS_FILE = join(DATA_DIR, "reviewers.json");

export const SOURCES = ["wmk-import", "wiktionary", "manual", "community"] as const;
export type Source = (typeof SOURCES)[number];

export interface Candidate {
  traditional: string;
  latin?: string;
  sense?: string;
  verified: boolean;
  source: Source;
  /** true when two independent sources produced the identical traditional form. */
  corroborated?: boolean;
}

export interface Entry {
  cyrillic: string;
  candidates: Candidate[];
}

export const SUFFIX_ATTACH = ["vowel", "consonant"] as const;
export const SUFFIX_GENDERS = ["masculine", "feminine"] as const;

/** One row of data/suffixes.json — see data/GRAMMAR.md for field semantics. */
export interface SuffixRow {
  cyrillic: string;
  traditional: string;
  latin?: string;
  sense: string;
  attach?: (typeof SUFFIX_ATTACH)[number];
  gender?: (typeof SUFFIX_GENDERS)[number];
  verified: boolean;
  source: Source;
  citation?: string;
}

export function readSuffixesFile(path: string): SuffixRow[] {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Canonical serialization for data/suffixes.json: stable key order, 2-space
 * indent, trailing newline — same diff-friendly conventions as the lexicon. */
export function writeSuffixesFile(path: string, rows: SuffixRow[]): void {
  const canonical = rows.map((s) => {
    const out: Partial<SuffixRow> = { cyrillic: s.cyrillic, traditional: s.traditional };
    if (s.latin !== undefined) out.latin = s.latin;
    out.sense = s.sense;
    if (s.attach !== undefined) out.attach = s.attach;
    if (s.gender !== undefined) out.gender = s.gender;
    out.verified = s.verified;
    out.source = s.source;
    if (s.citation !== undefined) out.citation = s.citation;
    return out as SuffixRow;
  });
  writeFileSync(path, JSON.stringify(canonical, null, 2) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// Trusted reviewer grants (contribution pipeline, Phase C)

/**
 * One trusted-reviewer grant, as data/reviewers.json stores it.
 *
 * A grant is a UUID inside a link the maintainer hands to one person. The repo
 * stores only its SHA-256 hash, so the file can sit in a public repository
 * without giving anyone the ability to stamp their own answers as trusted: a
 * hash cannot be turned back into the 122 bits of randomness it came from.
 *
 * `label` is deliberately opaque (r1, r2, …). Which person holds which grant is
 * the maintainer's private note and belongs in no repository and no database —
 * the pull request needs to say *which labels stand behind a spelling*, so that
 * a revocation can find them again, never who those people are.
 */
export interface Reviewer {
  label: string;
  hash: string;
  /** ISO date the grant was issued. Audit context; nothing reads it. */
  granted: string;
}

/** Opaque sequential labels. The pattern is enforced rather than suggested:
 *  a free-text label is an invitation to write somebody's name in it. */
export const REVIEWER_LABEL_RE = /^r[1-9][0-9]*$/;

/** The grant itself — a v4 UUID as `crypto.randomUUID()` prints it. This must
 *  never appear in the repo; the validator rejects one that does. */
export const GRANT_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Hex SHA-256, which is what the roster stores instead. */
export const GRANT_HASH_RE = /^[0-9a-f]{64}$/;

/**
 * The stored form of a grant. Unsalted on purpose: the input is 122 bits of
 * randomness, so there is no dictionary to attack and a salt would only add a
 * second secret to keep. Both sides lowercase and trim first, because the grant
 * makes a round trip through a link somebody may have retyped.
 */
export function hashGrant(grant: string): string {
  return createHash("sha256").update(grant.trim().toLowerCase(), "utf8").digest("hex");
}

export function readReviewers(): Reviewer[] {
  if (!existsSync(REVIEWERS_FILE)) return [];
  return JSON.parse(readFileSync(REVIEWERS_FILE, "utf8")) as Reviewer[];
}

/** Canonical serialization, matching the other data files. */
export function writeReviewers(reviewers: Reviewer[]): void {
  const canonical = reviewers.map((r) => ({ label: r.label, hash: r.hash, granted: r.granted }));
  writeFileSync(REVIEWERS_FILE, JSON.stringify(canonical, null, 2) + "\n", "utf8");
}

/**
 * Turn a `reviewer_id` from the mailbox into a roster label, or undefined.
 *
 * Undefined covers three cases that all mean the same thing downstream — treat
 * the row as anonymous: no stamp at all, a stamp nobody was ever granted, and a
 * grant that has since been revoked. Revocation therefore reaches backwards:
 * deleting a line from data/reviewers.json drops that reviewer's past
 * attestations too, which is what makes a leaked link recoverable.
 */
export function reviewerLabelOf(reviewerId: string | null | undefined, roster: Reviewer[]): string | undefined {
  if (!reviewerId || !GRANT_RE.test(reviewerId.trim().toLowerCase())) return undefined;
  const hash = hashGrant(reviewerId);
  return roster.find((r) => r.hash === hash)?.label;
}

/** Lowercase modern Mongolian Cyrillic: а–я (U+0430–U+044F) plus ё, ө, ү. */
export const CYRILLIC_WORD_RE = /^[а-яёүө]+$/u;

/**
 * Standard Unicode traditional Mongolian: main block U+1800–U+18AF
 * (letters, digits, punctuation, FVS1–FVS3, MVS) plus NNBSP U+202F,
 * which joins written-apart suffixes. Logical code points only.
 */
export const TRADITIONAL_RE = /^[᠀-᢯ ]+$/u;

export function normalizeCyrillic(raw: string): string {
  return raw.normalize("NFC").toLowerCase().trim().normalize("NFC");
}

/** NNBSP U+202F — joins a written-apart suffix to its stem. */
export const NNBSP = " ";
/** ᠶᠢ — the ya+i digraph Decision 001 rules out for a diphthong coda. */
export const YI_DIGRAPH = "ᠶᠢ";
/** ᠢ — the single i that spells that coda. */
export const I_SINGLE = "ᠢ";

/**
 * Decision 001, as a function: drop the spurious ᠶ before ᠢ where Cyrillic й
 * is a diphthong coda. See data/ENCODING.md for the rule and its evidence.
 *
 * Three conditions, each protecting a spelling that looks identical and is
 * correct:
 *   - the Cyrillic key must contain **й**. This is D1's safe scope. It keeps
 *     the true word-initial glide of е/ё (ес → ᠶᠢᠰᠦ, ертөнц → ᠶᠢᠷᠲᠢᠨᠴᠦ) and the
 *     loanword artifacts of the wmk converter (клуб → ᠺᠯᠤᠶᠢᠪ) out of reach of
 *     any script — those need per-entry human rulings, not a rewrite rule.
 *   - the ᠶ must not open the word, where it is that same glide.
 *   - the ᠶ must not follow NNBSP, where it opens a written-apart suffix and
 *     Decision 002 keeps it: дэлхийн → ᠳᠡᠯᠡᠬᠡᠢ ᠶᠢᠨ has й in the key and a
 *     perfectly correct ᠶᠢᠨ.
 *
 * The scope is a heuristic and knows it: a key holding both я and й could
 * still hide a real intervocalic glide. That is the price of never touching
 * the 65 out-of-scope forms without a human, and it is the right way round.
 *
 * Whole-word lexicon forms only. Suffix rows in data/suffixes.json are stored
 * without their NNBSP, so a bare ᠶᠢᠨ there is Decision 002's glide with no
 * separator left to recognize it by — never run this over them.
 */
export function normalizeYiDigraph(cyrillic: string, traditional: string): string {
  if (!cyrillic.includes("й") || !traditional.includes(YI_DIGRAPH)) return traditional;
  let out = "";
  for (let i = 0; i < traditional.length; i++) {
    const opensUnit = i === 0 || traditional[i - 1] === NNBSP;
    if (traditional.startsWith(YI_DIGRAPH, i) && !opensUnit) {
      out += I_SINGLE;
      i++; // the ᠢ of the digraph is what we just emitted
      continue;
    }
    out += traditional[i];
  }
  return out;
}

/**
 * Deterministic Unicode code-point order (plain string comparison — correct
 * for our ranges, locale-independent). ё, ө, ү deliberately sort after я.
 */
export function compareWords(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function shardFileFor(cyrillic: string): string {
  return join(LEXICON_DIR, `${cyrillic[0]}.json`);
}

export function listShardFiles(): string[] {
  if (!existsSync(LEXICON_DIR)) return [];
  return readdirSync(LEXICON_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => join(LEXICON_DIR, f));
}

export function readEntriesFile(path: string): Entry[] {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Load every lexicon shard into one map keyed by the cyrillic form. */
export function loadLexicon(): Map<string, Entry> {
  const map = new Map<string, Entry>();
  for (const file of listShardFiles()) {
    for (const entry of readEntriesFile(file)) map.set(entry.cyrillic, entry);
  }
  return map;
}

/** Canonical serialization: stable key order, 2-space indent, trailing newline. */
export function writeEntriesFile(path: string, entries: Entry[]): void {
  const canonical = entries.map((e) => ({
    cyrillic: e.cyrillic,
    candidates: e.candidates.map(canonicalCandidate),
  }));
  writeFileSync(path, JSON.stringify(canonical, null, 2) + "\n", "utf8");
}

function canonicalCandidate(c: Candidate): Candidate {
  const out: Partial<Candidate> = { traditional: c.traditional };
  if (c.latin !== undefined) out.latin = c.latin;
  if (c.sense !== undefined) out.sense = c.sense;
  out.verified = c.verified;
  out.source = c.source;
  if (c.corroborated !== undefined) out.corroborated = c.corroborated;
  return out as Candidate;
}
