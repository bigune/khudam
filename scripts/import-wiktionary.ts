/**
 * Import from English Wiktionary's Mongolian dictionary, machine-extracted by
 * kaikki.org (wiktextract). See data/SOURCES.md for licensing and attribution.
 *
 * Usage:
 *   bun scripts/import-wiktionary.ts [path-to-local-kaikki-jsonl]
 *
 * Behaviour:
 *   - every imported candidate is { verified: false, source: "wiktionary" } —
 *     machine imports are never marked verified;
 *   - incoming whole-word forms pass through Decision 001 (data/ENCODING.md):
 *     Wiktionary writes the diphthong coda as the ᠶᠢ digraph, so importing it
 *     verbatim would file a conflict against our own corrected spelling of the
 *     same word. Suffix rows are exempt — see mongolianForms;
 *   - when Wiktionary and an existing independent source agree on the
 *     identical (NFC) traditional form, the candidate stays single and gains
 *     corroborated: true; wmk-import candidates are also upgraded to
 *     source: "wiktionary", the higher-trust tier;
 *   - when they disagree, BOTH candidates are kept and the word joins the
 *     prioritized conflict queue in data/REVIEW.md — the machine never
 *     decides which spelling is right;
 *   - candidates with verified: true are never modified or removed;
 *   - traditional forms outside standard Unicode Mongolian go to REVIEW.md
 *     with the reason, never into the lexicon;
 *   - pos "suffix" entries go to data/suffixes.json (verified: false,
 *     deduplicated, no attach/gender conditions — humans add those);
 *     pos "name" entries are only QUEUED in REVIEW.md, because
 *     data/names.json is the 100%-human-verified tier;
 *   - idempotent: re-running against the same dump changes nothing; REVIEW.md
 *     sections are regenerated between markers.
 *
 * The raw dump is cached under .cache/ (gitignored) and never committed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CYRILLIC_WORD_RE,
  DATA_DIR,
  LEXICON_DIR,
  REPO_ROOT,
  SUFFIXES_FILE,
  TRADITIONAL_RE,
  compareWords,
  loadLexicon,
  normalizeCyrillic,
  normalizeYiDigraph,
  readSuffixesFile,
  writeEntriesFile,
  writeSuffixesFile,
  type Candidate,
  type Entry,
  type SuffixRow,
} from "./lib.ts";

const PRIMARY_URL = "https://kaikki.org/dictionary/Mongolian/kaikki.org-dictionary-Mongolian.jsonl";
const RAWDATA_PAGE_URL = "https://kaikki.org/dictionary/rawdata.html";
const RAW_FALLBACK_URL = "https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz";
const CACHE_DIR = join(REPO_ROOT, ".cache");
const CACHE_FILE = join(CACHE_DIR, "kaikki.org-dictionary-Mongolian.jsonl");
const REVIEW_FILE = join(DATA_DIR, "REVIEW.md");
const REVIEW_BEGIN = "<!-- wiktionary-import:begin (auto-generated, do not edit between markers) -->";
const REVIEW_END = "<!-- wiktionary-import:end -->";

/** Attribution URL pattern — documented in data/SOURCES.md, stored nowhere per-entry. */
export function wiktionaryUrl(word: string): string {
  return `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#Mongolian`;
}

// ---------------------------------------------------------------------------
// Extraction (pure — unit-tested in import-wiktionary.test.ts)

export interface RawForm {
  form?: string;
  roman?: string;
  tags?: string[];
}
export interface RawSense {
  glosses?: string[];
}
export interface RawTemplate {
  name?: string;
  args?: Record<string, unknown>;
  expansion?: string;
}
export interface RawLine {
  word?: string;
  pos?: string;
  lang_code?: string;
  forms?: RawForm[];
  senses?: RawSense[];
  head_templates?: RawTemplate[];
  etymology_templates?: RawTemplate[];
}

export interface FormOut {
  traditional: string;
  latin?: string;
}
export interface InvalidForm {
  word: string;
  form: string;
  reason: string;
}
export interface DraftCandidate extends FormOut {
  sense?: string;
}

/** A Classical Mongolian etymon offered for human review only — the headword
 * line has no Mongolian spelling, so this is a hint, never a candidate. */
export interface EtymologySuggestion {
  traditional: string;
  latin?: string;
  gloss?: string;
}

export type Extracted =
  | { kind: "skip"; reason: "empty" | "other-language" | "non-cyrillic" | "multi-word" | "no-mongolian-form" }
  | {
      kind: "word";
      key: string;
      word: string;
      candidates: DraftCandidate[];
      invalid: InvalidForm[];
      suggestions: EtymologySuggestion[];
    }
  | { kind: "suffix"; key: string; word: string; rows: SuffixRow[]; invalid: InvalidForm[] }
  | { kind: "name"; word: string; forms: FormOut[]; invalid: InvalidForm[]; sense?: string };

const SENSE_MAX = 80;

/** First gloss, whitespace-collapsed, cut to a short label at a word boundary. */
export function shortenGloss(gloss: string): string {
  const flat = gloss.replaceAll(/\s+/gu, " ").trim();
  if (flat.length <= SENSE_MAX) return flat;
  const cut = flat.slice(0, SENSE_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > SENSE_MAX / 2 ? cut.slice(0, lastSpace) : cut) + "…";
}

function firstGloss(line: RawLine): string | undefined {
  for (const s of line.senses ?? []) {
    const g = s.glosses?.[0]?.trim();
    if (g) return shortenGloss(g);
  }
  return undefined;
}

function invalidReason(traditional: string): string {
  if (traditional.includes(" ")) {
    return "contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md";
  }
  const bad = [...traditional]
    .filter((ch) => !TRADITIONAL_RE.test(ch))
    .map((ch) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`);
  return `characters outside standard Unicode Mongolian: ${[...new Set(bad)].join(" ")}`;
}

const MONGOLIAN_CHAR_RE = /[᠀-᢯]/u;

/**
 * Mongolian-script spellings of the headword: forms[] entries tagged
 * "Mongolian", plus spellings that wiktextract left untagged inside the
 * headword-line template arguments (e.g. {{mn-proper noun|ᠪᠡᠯᠭᠦᠲᠡᠢ}}) — the
 * same semantic slot, just a template variant the extractor missed. All
 * NFC-normalized and range-validated.
 *
 * Pass `cyrillicKey` for whole-word forms and Decision 001 is applied on the
 * way in: Wiktionary writes the diphthong coda as the ᠶᠢ digraph, and importing
 * that verbatim files a conflict against our own corrected spelling of the same
 * word — a disagreement about nothing, sent to readers to adjudicate. Omit the
 * key for suffix rows, which are stored without their NNBSP and so give the
 * rule no way to see that their ᠶ is Decision 002's glide.
 */
function mongolianForms(
  line: RawLine,
  word: string,
  cyrillicKey?: string,
): { valid: FormOut[]; invalid: InvalidForm[] } {
  const valid: FormOut[] = [];
  const invalid: InvalidForm[] = [];
  const seen = new Set<string>();
  const push = (rawForm: string, roman?: string): void => {
    const cleaned = rawForm.normalize("NFC").trim().replace(/^-/u, "");
    // Normalize before the dedup, so a headword offering both spellings of one
    // word collapses to the single candidate it always was.
    const traditional = cyrillicKey === undefined ? cleaned : normalizeYiDigraph(cyrillicKey, cleaned);
    if (!traditional || seen.has(traditional)) return;
    seen.add(traditional);
    if (!TRADITIONAL_RE.test(traditional)) {
      invalid.push({ word, form: traditional, reason: invalidReason(traditional) });
      return;
    }
    const out: FormOut = { traditional };
    const latin = roman?.trim().replace(/^-/u, "");
    if (latin) out.latin = latin;
    valid.push(out);
  };
  for (const f of line.forms ?? []) {
    if (f.tags?.includes("Mongolian")) push(f.form ?? "", f.roman);
  }
  for (const t of line.head_templates ?? []) {
    for (const v of Object.values(t.args ?? {})) {
      // Head templates describe this Mongolian headword only, so any script
      // run in their arguments is its spelling. No classical romanization is
      // available here (the expansion's parenthesis romanizes the Cyrillic).
      if (typeof v === "string" && MONGOLIAN_CHAR_RE.test(v)) push(v);
    }
  }
  return { valid, invalid };
}

/**
 * Classical Mongolian etymons, e.g. {{inh|mn|cmg|ᠠᠭᠤᠯᠠ}} "Inherited from
 * Classical Mongolian ᠠᠭᠤᠯᠠ (aɣula)". Only templates that explicitly cite
 * cmg count: other ancestor scripts (notably Manchu) share the same Unicode
 * block, so matching on characters alone would import the wrong language.
 */
function classicalEtymons(
  line: RawLine,
  gloss: string | undefined,
  cyrillicKey: string,
): EtymologySuggestion[] {
  const out: EtymologySuggestion[] = [];
  for (const t of line.etymology_templates ?? []) {
    const args = t.args ?? {};
    const etymon = args["3"];
    if (args["2"] !== "cmg" || typeof etymon !== "string") continue;
    // Decision 001 too: these are whole-word spellings a reviewer may adopt
    // into the lexicon, and queueing one in the digraph would queue a form
    // that cannot pass validation.
    const traditional = normalizeYiDigraph(cyrillicKey, etymon.normalize("NFC").trim());
    if (!traditional || !MONGOLIAN_CHAR_RE.test(traditional)) continue;
    if (out.some((s) => s.traditional === traditional)) continue;
    const s: EtymologySuggestion = { traditional };
    const roman = t.expansion?.match(/Classical Mongolian .+? \(([^)]+)\)/u)?.[1];
    if (roman) s.latin = roman;
    if (gloss !== undefined) s.gloss = gloss;
    out.push(s);
  }
  return out;
}

/** Classify one JSONL line of the kaikki dump. */
export function extractLine(line: RawLine): Extracted {
  const rawWord = (line.word ?? "").trim();
  if (!rawWord) return { kind: "skip", reason: "empty" };
  if (line.lang_code !== undefined && line.lang_code !== "mn") {
    return { kind: "skip", reason: "other-language" };
  }
  // Wiktionary also headwords Mongolian entries in Latin or traditional
  // script, and has multi-word phrases — both out of scope for whole-word v0.
  const key = normalizeCyrillic(line.pos === "suffix" ? rawWord.replace(/^-/u, "") : rawWord);
  if (!CYRILLIC_WORD_RE.test(key)) {
    return { kind: "skip", reason: /[а-яёүө]/u.test(key) ? "multi-word" : "non-cyrillic" };
  }
  const { valid, invalid } = mongolianForms(line, rawWord, line.pos === "suffix" ? undefined : key);
  const sense = firstGloss(line);
  const suggestions = line.pos === "name" || line.pos === "suffix" ? [] : classicalEtymons(line, sense, key);
  if (valid.length === 0 && invalid.length === 0 && suggestions.length === 0) {
    return { kind: "skip", reason: "no-mongolian-form" };
  }

  if (line.pos === "name") return { kind: "name", word: rawWord, forms: valid, invalid, sense };

  if (line.pos === "suffix") {
    const rows: SuffixRow[] = [];
    const suffixInvalid = [...invalid];
    for (const raw of valid) {
      // Wiktionary displays suffix forms with a leading nirugu (U+180A), its
      // "attaches here" connector — the same convention as the leading "-" on
      // the Cyrillic side. Strip it; medial nirugu is preserved.
      const f: FormOut = { ...raw, traditional: raw.traditional.replace(/^᠊+/u, "") };
      if (f.traditional.length === 0) continue;
      if (f.traditional.includes(" ")) {
        suffixInvalid.push({
          word: rawWord,
          form: f.traditional,
          reason: "suffix forms are stored without NNBSP (U+202F) — the converter inserts it when joining",
        });
        continue;
      }
      if (sense === undefined) {
        suffixInvalid.push({
          word: rawWord,
          form: f.traditional,
          reason: "no English gloss to use as the required sense label",
        });
        continue;
      }
      const row: SuffixRow = { cyrillic: key, traditional: f.traditional, sense, verified: false, source: "wiktionary" };
      if (f.latin) row.latin = f.latin;
      if (!rows.some((r) => r.traditional === row.traditional)) rows.push(row);
    }
    return { kind: "suffix", key, word: rawWord, rows, invalid: suffixInvalid };
  }

  const candidates: DraftCandidate[] = valid.map((f) => (sense === undefined ? { ...f } : { ...f, sense }));
  return { kind: "word", key, word: rawWord, candidates, invalid, suggestions };
}

// ---------------------------------------------------------------------------
// Merge (pure — unit-tested)

/** Sense placeholder for a pre-existing candidate that an import forced into a
 * multi-candidate entry; the conflict queue in REVIEW.md asks humans to label it. */
export const UNLABELED_SENSE = "unlabeled";

export interface MergeStats {
  newEntries: number;
  newCandidates: number;
  corroborated: number;
  verifiedUntouched: number;
  /** Differing forms NOT merged because the existing verified candidate has no
   * sense label yet (adding a second candidate would force one; we never touch
   * verified data). Queued in REVIEW.md instead. */
  blockedOnVerified: { cyrillic: string; traditional: string }[];
}

export function newMergeStats(): MergeStats {
  return { newEntries: 0, newCandidates: 0, corroborated: 0, verifiedUntouched: 0, blockedOnVerified: [] };
}

/**
 * Merge one word's Wiktionary candidates into the lexicon map.
 * Never modifies a verified: true candidate; idempotent on re-runs.
 */
export function mergeWord(lexicon: Map<string, Entry>, key: string, drafts: DraftCandidate[], stats: MergeStats): void {
  let entry = lexicon.get(key);
  let isNew = false;
  if (entry === undefined) {
    entry = { cyrillic: key, candidates: [] };
    lexicon.set(key, entry);
    isNew = true;
    stats.newEntries++;
  }
  for (const d of drafts) {
    const existing = entry.candidates.find((c) => c.traditional === d.traditional);
    if (existing !== undefined) {
      if (existing.verified) {
        stats.verifiedUntouched++;
        continue;
      }
      // Same form from an independent source ⇒ corroborated. A candidate that
      // is already source: "wiktionary" (from a previous run of this script)
      // is NOT independent, so re-runs never self-corroborate.
      if (existing.source !== "wiktionary" && existing.corroborated !== true) {
        existing.corroborated = true;
        stats.corroborated++;
      }
      if (existing.source === "wmk-import") existing.source = "wiktionary";
      if (existing.latin === undefined && d.latin !== undefined) existing.latin = d.latin;
      // "unlabeled" is not a meaning, it is the placeholder a previous merge
      // stamped on to satisfy the multi-candidate schema rule. A real gloss
      // always beats it — otherwise a candidate that stops being ambiguous
      // keeps the scar of having once been.
      if ((existing.sense === undefined || existing.sense === UNLABELED_SENSE) && d.sense !== undefined) {
        existing.sense = d.sense;
      }
    } else {
      // Growing an entry to 2+ candidates forces a sense on every candidate.
      // We may label an unverified one "unlabeled", but a verified candidate
      // must never be touched — so in that (rare) case the new form only goes
      // to the review queue, not into the lexicon.
      if (entry.candidates.some((c) => c.verified && c.sense === undefined)) {
        stats.blockedOnVerified.push({ cyrillic: key, traditional: d.traditional });
        continue;
      }
      const cand: Candidate = { traditional: d.traditional, verified: false, source: "wiktionary" };
      if (d.latin !== undefined) cand.latin = d.latin;
      if (d.sense !== undefined) cand.sense = d.sense;
      entry.candidates.push(cand);
      if (!isNew) stats.newCandidates++;
    }
  }
  // The schema requires a sense on every candidate of a multi-candidate entry.
  // A pre-existing bootstrap candidate has none; mark it for human labeling.
  if (entry.candidates.length > 1) {
    for (const c of entry.candidates) {
      if (c.sense === undefined && !c.verified) c.sense = UNLABELED_SENSE;
    }
  }
}

/**
 * An entry needs conflict review when Wiktionary and a different source
 * disagree on the form and the disagreement is not yet fully human-verified.
 * Computed from merged state so re-runs regenerate the same queue until
 * humans resolve it.
 */
export function isConflict(entry: Entry): boolean {
  const wik = entry.candidates.filter((c) => c.source === "wiktionary");
  if (wik.length === 0) return false;
  return entry.candidates.some(
    (other) =>
      other.source !== "wiktionary" &&
      wik.some((w) => w.traditional !== other.traditional && !(w.verified && other.verified)),
  );
}

// ---------------------------------------------------------------------------
// Download

async function loadDump(): Promise<string> {
  const localPath = process.argv[2];
  if (localPath) {
    console.log(`Reading dump from local file: ${localPath}`);
    return readFileSync(localPath, "utf8");
  }
  if (existsSync(CACHE_FILE)) {
    console.log(`Using cached dump: ${CACHE_FILE} (delete it to re-download)`);
    return readFileSync(CACHE_FILE, "utf8");
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  let text: string;
  try {
    console.log(`Downloading: ${PRIMARY_URL}`);
    const res = await fetch(PRIMARY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (err) {
    console.warn(`Primary per-language file unavailable (${err instanceof Error ? err.message : err}).`);
    text = await downloadRawFallback();
  }
  writeFileSync(CACHE_FILE, text, "utf8");
  console.log(`Cached to ${CACHE_FILE}`);
  return text;
}

/**
 * Fallback for when kaikki retires the per-language extract: stream the full
 * raw wiktextract dump (multi-GB, gzip) and keep only lang_code "mn" lines.
 */
async function downloadRawFallback(): Promise<string> {
  let url = RAW_FALLBACK_URL;
  try {
    const page = await fetch(RAWDATA_PAGE_URL);
    if (page.ok) {
      const m = (await page.text()).match(/href="([^"]*raw-wiktextract-data\.jsonl\.gz)"/u);
      if (m) url = new URL(m[1], RAWDATA_PAGE_URL).toString();
    }
  } catch {
    // keep the default URL
  }
  console.warn(`Falling back to the full raw dump (large!): ${url}`);
  const res = await fetch(url);
  if (!res.ok || res.body === null) throw new Error(`Fallback download failed: HTTP ${res.status}`);
  const reader = res.body.pipeThrough(new DecompressionStream("gzip")).getReader();
  const decoder = new TextDecoder();
  const kept: string[] = [];
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    buf += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const lines = buf.split("\n");
    buf = done ? "" : (lines.pop() ?? "");
    for (const line of lines) {
      if (line.includes('"lang_code": "mn"') || line.includes('"lang_code":"mn"')) kept.push(line);
    }
    if (done) break;
  }
  if (buf.includes('"lang_code": "mn"') || buf.includes('"lang_code":"mn"')) kept.push(buf);
  console.log(`Filtered ${kept.length} Mongolian lines from the raw dump.`);
  return kept.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main

interface NameQueueItem {
  word: string;
  forms: FormOut[];
  invalid: InvalidForm[];
  sense?: string;
}

function main(dump: string): void {
  const lines = dump.split("\n").filter((l) => l.trim().length > 0);
  console.log(`Wiktionary entries read: ${lines.length}`);

  const skips = new Map<string, number>();
  const words = new Map<string, { word: string; candidates: Map<string, DraftCandidate> }>();
  const suggestions = new Map<string, { word: string; items: EtymologySuggestion[] }>();
  const suffixRows: SuffixRow[] = [];
  const names = new Map<string, NameQueueItem>();
  const invalid: InvalidForm[] = [];
  const invalidWordUrls = new Map<string, string>();
  let linesWithForms = 0;

  for (const line of lines) {
    const extracted = extractLine(JSON.parse(line) as RawLine);
    if (extracted.kind === "skip") {
      skips.set(extracted.reason, (skips.get(extracted.reason) ?? 0) + 1);
      continue;
    }
    if (extracted.kind !== "word" || extracted.candidates.length + extracted.invalid.length > 0) {
      linesWithForms++;
    }
    for (const inv of extracted.kind === "name" ? [] : extracted.invalid) {
      invalid.push(inv);
      invalidWordUrls.set(inv.word, wiktionaryUrl(inv.word));
    }
    if (extracted.kind === "word") {
      let agg = words.get(extracted.key);
      if (agg === undefined) {
        agg = { word: extracted.word, candidates: new Map() };
        words.set(extracted.key, agg);
      }
      // One word can span several lines (one per part of speech); the first
      // occurrence of each distinct traditional form wins, with its own sense.
      for (const c of extracted.candidates) {
        if (!agg.candidates.has(c.traditional)) agg.candidates.set(c.traditional, c);
      }
      for (const s of extracted.suggestions) {
        let sg = suggestions.get(extracted.key);
        if (sg === undefined) {
          sg = { word: extracted.word, items: [] };
          suggestions.set(extracted.key, sg);
        }
        if (!sg.items.some((i) => i.traditional === s.traditional)) sg.items.push(s);
      }
    } else if (extracted.kind === "suffix") {
      suffixRows.push(...extracted.rows);
    } else {
      const prev = names.get(extracted.word);
      if (prev === undefined) {
        names.set(extracted.word, {
          word: extracted.word,
          forms: [...extracted.forms],
          invalid: [...extracted.invalid],
          sense: extracted.sense,
        });
      } else {
        for (const f of extracted.forms) {
          if (!prev.forms.some((p) => p.traditional === f.traditional)) prev.forms.push(f);
        }
        for (const i of extracted.invalid) {
          if (!prev.invalid.some((p) => p.form === i.form)) prev.invalid.push(i);
        }
      }
    }
  }

  // Merge words into the lexicon.
  const lexicon = loadLexicon();
  const stats = newMergeStats();
  for (const [key, agg] of words) {
    // A word whose every form failed validation has nothing to merge — it
    // lives in REVIEW.md only, and must not become an empty entry.
    if (agg.candidates.size > 0) mergeWord(lexicon, key, [...agg.candidates.values()], stats);
  }

  // Etymology suggestions matter only where no headword-line spelling exists.
  for (const key of [...suggestions.keys()]) {
    if ((words.get(key)?.candidates.size ?? 0) > 0) suggestions.delete(key);
  }

  // Conflict queue, computed from merged state (stable across re-runs).
  const conflicts = [...lexicon.values()].filter(isConflict).sort((a, b) => compareWords(a.cyrillic, b.cyrillic));

  // Write shards.
  mkdirSync(LEXICON_DIR, { recursive: true });
  const shards = new Map<string, Entry[]>();
  for (const entry of lexicon.values()) {
    const letter = entry.cyrillic[0];
    if (!shards.has(letter)) shards.set(letter, []);
    shards.get(letter)!.push(entry);
  }
  const shardSummary: [string, number][] = [];
  for (const [letter, entries] of [...shards.entries()].sort((a, b) => compareWords(a[0], b[0]))) {
    entries.sort((a, b) => compareWords(a.cyrillic, b.cyrillic));
    writeEntriesFile(join(LEXICON_DIR, `${letter}.json`), entries);
    shardSummary.push([letter, entries.length]);
  }

  // Merge suffixes (dedup by cyrillic+traditional against any existing source).
  const suffixes = existsSync(SUFFIXES_FILE) ? readSuffixesFile(SUFFIXES_FILE) : [];
  // A visible separator, and one that cannot occur in either half. The
  // invisible one used here before (U+0000) made the whole file read as binary
  // to grep and ripgrep — a search for this script's own exports came back
  // empty, and was believed.
  const haveSuffix = new Set(suffixes.map((s) => `${s.cyrillic}|${s.traditional}`));
  let suffixesAdded = 0;
  for (const row of suffixRows) {
    const k = `${row.cyrillic}|${row.traditional}`;
    if (haveSuffix.has(k)) continue;
    haveSuffix.add(k);
    suffixes.push(row);
    suffixesAdded++;
  }
  if (suffixesAdded > 0) {
    suffixes.sort((a, b) => compareWords(a.cyrillic, b.cyrillic) || compareWords(a.traditional, b.traditional));
    writeSuffixesFile(SUFFIXES_FILE, suffixes);
  }

  writeReviewSection(conflicts, stats, invalid, invalidWordUrls, [...names.values()], suffixesAdded, suggestions, lexicon);

  // Report.
  const totalCorroborated = [...lexicon.values()].reduce(
    (n, e) => n + e.candidates.filter((c) => c.corroborated === true).length,
    0,
  );
  const total = shardSummary.reduce((n, [, c]) => n + c, 0);
  console.log("");
  console.log("Import summary");
  console.log(`  Wiktionary entries read:        ${lines.length}`);
  console.log(`  entries with traditional forms: ${linesWithForms}`);
  console.log(`  skipped:                        ${[...skips.entries()].map(([r, n]) => `${r} ${n}`).join(", ") || "none"}`);
  console.log(`  new words added:                ${stats.newEntries}`);
  console.log(`  new candidates on existing:     ${stats.newCandidates}`);
  console.log(`  corroborated this run:          ${stats.corroborated} (total in lexicon: ${totalCorroborated})`);
  console.log(`  verified entries untouched:     ${stats.verifiedUntouched}`);
  console.log(`  conflicts in REVIEW.md queue:   ${conflicts.length}`);
  console.log(`  invalid forms sent to review:   ${invalid.length}`);
  console.log(`  suffixes imported:              ${suffixesAdded} (of ${suffixRows.length} extracted)`);
  console.log(`  names queued (NOT imported):    ${names.size}`);
  console.log(`  etymology suggestions queued:   ${suggestions.size} words (NOT imported)`);
  console.log(`  lexicon total:                  ${total} entries in ${shardSummary.length} shards`);
  console.log("");
  console.log("Lexicon totals per shard");
  for (const [letter, count] of shardSummary) console.log(`  ${letter}.json — ${count}`);
}

/**
 * Emphasis is written with underscores, never asterisks, everywhere in the
 * generated section. Prettier rewrites `*x*` to `_x_`, so a formatting pass
 * over REVIEW.md — which happened once — silently rewrites 847 lines inside
 * the "do not edit between markers" block, and the next import run reverts
 * them all. Matching Prettier's normalization keeps the generator idempotent
 * against the committed file.
 */
function fmtCandidate(c: Candidate): string {
  const latin = c.latin !== undefined ? ` (_${c.latin}_)` : "";
  const sense = c.sense === UNLABELED_SENSE ? `_${UNLABELED_SENSE}_` : c.sense !== undefined ? `“${c.sense}”` : "_no sense_";
  const marks = [c.verified ? "verified ✓" : null, c.corroborated ? "corroborated" : null].filter(Boolean).join(", ");
  return `\`${c.traditional}\`${latin} — ${c.source}${marks ? ` (${marks})` : ""} — ${sense}`;
}

function writeReviewSection(
  conflicts: Entry[],
  stats: MergeStats,
  invalid: InvalidForm[],
  invalidWordUrls: Map<string, string>,
  names: NameQueueItem[],
  suffixesAdded: number,
  suggestions: Map<string, { word: string; items: EtymologySuggestion[] }>,
  lexicon: Map<string, Entry>,
): void {
  const lines: string[] = [REVIEW_BEGIN, ""];
  lines.push("## Wiktionary import review queue (`scripts/import-wiktionary.ts`)");
  lines.push("");
  lines.push(
    "Extracted from English Wiktionary (CC BY-SA) via kaikki.org — see " +
      "[SOURCES.md](SOURCES.md). Хүний хяналт шаардлагатай мөрүүд — " +
      "туслах хүн бүрт баярлана.",
  );
  lines.push("");

  lines.push(`### Source conflicts — prioritized review queue (${conflicts.length})`);
  lines.push("");
  if (conflicts.length > 0) {
    lines.push(
      "The bootstrap seed and Wiktionary disagree on these words. Each case is " +
        "either a genuine homonym (keep both, write proper `sense` labels) or a " +
        "wrong spelling (delete the bad candidate). Candidates marked _unlabeled_ " +
        "need a human meaning label; do not trust either source blindly.",
    );
    lines.push("");
    for (const entry of conflicts) {
      lines.push(`- **${entry.cyrillic}** — [Wiktionary](${wiktionaryUrl(entry.cyrillic)})`);
      for (const c of entry.candidates) lines.push(`  - ${fmtCandidate(c)}`);
    }
  } else {
    lines.push("No open conflicts. 🎉");
  }
  lines.push("");

  if (stats.blockedOnVerified.length > 0) {
    lines.push(`### Held back — existing verified candidate needs a sense label first (${stats.blockedOnVerified.length})`);
    lines.push("");
    lines.push(
      "Wiktionary offers a second form for these words, but the existing verified " +
        "candidate has no `sense` label and the importer never modifies verified data. " +
        "Add a sense label to the verified candidate; the next import run will then merge these:",
    );
    lines.push("");
    for (const b of stats.blockedOnVerified) {
      lines.push(`- \`${b.cyrillic}\` — Wiktionary form \`${b.traditional}\` — [Wiktionary](${wiktionaryUrl(b.cyrillic)})`);
    }
    lines.push("");
  }

  if (invalid.length > 0) {
    lines.push(`### Forms that could not be imported automatically (${invalid.length})`);
    lines.push("");
    lines.push("Each needs a human decision (the stated reason says why the machine refused):");
    lines.push("");
    const sorted = [...invalid].sort((a, b) => compareWords(a.word, b.word) || compareWords(a.form, b.form));
    for (const inv of sorted) {
      lines.push(`- \`${inv.word}\` — Wiktionary gives \`${inv.form}\` — ${inv.reason} — [Wiktionary](${invalidWordUrls.get(inv.word) ?? wiktionaryUrl(inv.word)})`);
    }
    lines.push("");
  }

  if (names.length > 0) {
    lines.push(`### Proper names queued for names.json (${names.length})`);
    lines.push("");
    lines.push(
      "`names.json` is the 100%-human-verified tier, so nothing is auto-imported. " +
        "These Wiktionary name entries are suggestions for reviewers:",
    );
    lines.push("");
    const sorted = [...names].sort((a, b) => compareWords(a.word.toLowerCase(), b.word.toLowerCase()));
    for (const n of sorted) {
      const forms = n.forms.map((f) => `\`${f.traditional}\`${f.latin !== undefined ? ` (_${f.latin}_)` : ""}`);
      const bad = n.invalid.map((i) => `⚠ \`${i.form}\` (${i.reason})`);
      const sense = n.sense !== undefined ? ` — “${n.sense}”` : "";
      lines.push(`- **${n.word}** — ${[...forms, ...bad].join(" · ")}${sense} — [Wiktionary](${wiktionaryUrl(n.word)})`);
    }
    lines.push("");
  }

  if (suggestions.size > 0) {
    lines.push(`### Classical Mongolian etymology suggestions (${suggestions.size} words, NOT imported)`);
    lines.push("");
    lines.push(
      "These words have no Mongolian spelling on their Wiktionary headword line, but " +
        "their etymology cites a Classical Mongolian form. Because монгол бичиг largely " +
        "preserves classical orthography, the etymon is _usually_ the correct spelling — " +
        "but not always (it may cover a different sense or predate modern script " +
        "convention), so it is only a hint for reviewers, never imported. " +
        "“= lexicon” / “≠ lexicon” compares code points against the current candidate(s).",
    );
    lines.push("");
    const sorted = [...suggestions.entries()].sort((a, b) => compareWords(a[0], b[0]));
    for (const [key, sg] of sorted) {
      const entry = lexicon.get(key);
      for (const s of sg.items) {
        const latin = s.latin !== undefined ? ` (_${s.latin}_)` : "";
        const gloss = s.gloss !== undefined ? ` — “${s.gloss}”` : "";
        let compare: string;
        if (entry === undefined) {
          compare = "not in lexicon yet";
        } else if (entry.candidates.some((c) => c.traditional === s.traditional)) {
          compare = "= lexicon (code points identical)";
        } else {
          compare = `≠ lexicon: ${entry.candidates.map((c) => `\`${c.traditional}\` (${c.source})`).join(", ")}`;
        }
        lines.push(`- **${key}** — etymology cites \`${s.traditional}\`${latin}${gloss} — ${compare} — [Wiktionary](${wiktionaryUrl(sg.word)})`);
      }
    }
    lines.push("");
  }

  lines.push("### Suffixes");
  lines.push("");
  lines.push(
    (suffixesAdded > 0 ? `${suffixesAdded} suffix rows were imported this run. ` : "") +
      "Wiktionary-sourced rows in [suffixes.json](suffixes.json) (`\"source\": \"wiktionary\"`) " +
      "are unverified and carry no `attach`/`gender` conditions, so the suffix engine " +
      "applies them unconditionally — reviewers should add conditions from the Nadmid 1990 " +
      "rulebook (see GRAMMAR.md) and verify or remove each row.",
  );
  lines.push("");
  lines.push(REVIEW_END);
  const generated = lines.join("\n");

  let content: string;
  if (existsSync(REVIEW_FILE)) {
    const current = readFileSync(REVIEW_FILE, "utf8");
    const begin = current.indexOf(REVIEW_BEGIN);
    const end = current.indexOf(REVIEW_END);
    if (begin !== -1 && end !== -1) {
      content = current.slice(0, begin) + generated + current.slice(end + REVIEW_END.length);
    } else {
      content = current.trimEnd() + "\n\n" + generated + "\n";
    }
  } else {
    content =
      "# Хянуулахаар хүлээгдэж буй бичлэгүүд / Entries flagged for review\n\n" + generated + "\n";
  }
  writeFileSync(REVIEW_FILE, content, "utf8");
}

if (import.meta.main) {
  main(await loadDump());
}
