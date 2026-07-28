/**
 * Shared helpers for Khudam data tooling (import / validate / build).
 * Everything here must stay dependency-free and deterministic.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_DIR = join(REPO_ROOT, "data");
export const LEXICON_DIR = join(DATA_DIR, "lexicon");
export const NAMES_FILE = join(DATA_DIR, "names.json");
export const SUFFIXES_FILE = join(DATA_DIR, "suffixes.json");

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
