/**
 * How much of real Mongolian inflection does the suffix engine actually
 * handle? Run with: bun run measure:suffix
 *
 * Grammar rules are the one part of this project that can be argued about
 * indefinitely, because every rule has a convincing example and a convincing
 * counter-example. This script replaces the argument with a number.
 *
 * The test set is Wiktionary's own `mn-decl` declension tables, already in the
 * kaikki dump we cache for the lexicon import: each row is an inflected
 * Cyrillic form, the lemma it belongs to, and the case it is in — written by
 * the same human editors who wrote the entries. Nothing is imported and
 * nothing is written; this reads data/ and reports.
 *
 * ⚠️ Two limits, both worth knowing before quoting a number from this.
 *
 * It is a coverage signal, NOT ground truth. The tables are expanded from a
 * template, so they contain forms no one checked: азот is declined as *азтон*,
 * the template applying fleeting-vowel elision to a loanword that does not
 * take it. Treat a rising number as progress and a falling one as a
 * regression, but never treat an individual row as an authority — for that,
 * ask a human, the same as everywhere else in this repo.
 *
 * And "correct" here means **the right stem was found**, nothing more. The
 * test set gives us the Cyrillic inflected form, never its traditional
 * spelling, so whether the suffixes we hung off that stem are the right ones
 * is not measurable from this data — it takes a reader of монгол бичиг. This
 * matters: allowing derivational suffixes into decomposition once scored 99
 * extra "correct" forms that were visibly wrong (ламууд → ᠯᠠᠮᠠ ᠭᠤ ᠳᠤ, where
 * the plural should be ᠨᠤᠭᠤᠳ and ᠭᠤ ᠳᠤ is not a suffix at all) — the right
 * stem with rubbish after it. A rise in this number is evidence, not proof.
 *
 * Usage:
 *   bun run measure:suffix                # summary by case
 *   bun run measure:suffix --failures 40  # also print unresolved examples
 *   bun run measure:suffix --wrong 40     # print resolved-but-wrong-stem examples
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { decomposeWord, lookupWord } from "../packages/converter/src/index.ts";
import { REPO_ROOT, SUFFIXES_FILE, readSuffixesFile } from "./lib.ts";

const CACHE_FILE = join(REPO_ROOT, ".cache", "kaikki.org-dictionary-Mongolian.jsonl");
const NNBSP = " ";

/** Wiktionary tags that mark a row as not a plain inflected form. */
const SKIP_TAGS = new Set([
  "table-tags",
  "inflection-template",
  "romanization",
  "canonical",
  // wiktextract's own marker that it could not interpret the template cell
  "error-unrecognized-form",
]);

/** The cases we report separately; anything else is bucketed by its raw tags. */
const CASES = [
  "nominative",
  "genitive",
  "accusative",
  "dative",
  "ablative",
  "instrumental",
  "comitative",
  "privative",
  "attributive",
] as const;

interface Row {
  lemma: string;
  form: string;
  grammaticalCase: string;
}

interface Bucket {
  total: number;
  resolved: number;
  correct: number;
}

function caseOf(tags: string[]): string {
  for (const c of CASES) if (tags.includes(c)) return c;
  return tags.filter((t) => t !== "singular" && t !== "indefinite").join("+") || "untagged";
}

/** Every single-word inflected form the dump knows, deduplicated. */
export function readTestSet(dump: string): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const line of dump.split("\n")) {
    if (!line) continue;
    let entry: { word?: string; lang_code?: string; forms?: { form?: string; tags?: string[]; source?: string }[] };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.lang_code !== "mn" || typeof entry.word !== "string") continue;
    for (const f of entry.forms ?? []) {
      if (f.source !== "declension" || typeof f.form !== "string") continue;
      const tags = f.tags ?? [];
      if (tags.some((t) => SKIP_TAGS.has(t))) continue;
      // The directive case is two words in Cyrillic (ном руу) — the converter
      // tokenizes it as two words, so it is not a suffix question.
      if (f.form.includes(" ") || !/^[а-яёүө]+$/u.test(f.form)) continue;
      if (f.form === entry.word) continue; // the bare nominative is the lemma
      const key = `${entry.word}|${f.form}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ lemma: entry.word, form: f.form, grammaticalCase: caseOf(tags) });
    }
  }
  return rows;
}

/** Traditional forms of suffixes written together with the stem. Needed to read
 *  a composed candidate: most suffixes are preceded by NNBSP and so can be found
 *  by splitting, but a joined one (the privative after a vowel stem, G14) leaves
 *  no separator at all — ᠠᠭᠠᠯᠢᠭᠦᠢ is one run of letters. */
const JOINED_SUFFIXES = readSuffixesFile(SUFFIXES_FILE)
  .filter((s) => s.joined === true)
  .map((s) => s.traditional);

/** Did decomposition find this form's actual lemma, or some other stem? */
export function judge(row: Row): "unresolved" | "correct" | "wrong-stem" {
  const composed = decomposeWord(row.form);
  if (composed.length === 0) return "unresolved";
  const lemmaForms = lookupWord(row.lemma).map((c) => c.traditional);
  const startsWithLemma = (candidate: string): boolean =>
    lemmaForms.some(
      (lemma) =>
        candidate === lemma ||
        candidate.startsWith(lemma + NNBSP) ||
        // A joined suffix must follow immediately; a bare prefix match would
        // credit ᠨᠣᠮᠣᠬᠠᠨ ᠦᠨ to the lemma ᠨᠣᠮ.
        JOINED_SUFFIXES.some((j) => candidate.startsWith(lemma + j)),
    );
  return composed.some((c) => startsWithLemma(c.traditional)) ? "correct" : "wrong-stem";
}

function pct(a: number, b: number): string {
  return b === 0 ? "—" : `${((a / b) * 100).toFixed(1)}%`;
}

function main(): void {
  if (!existsSync(CACHE_FILE)) {
    console.error(`No Wiktionary dump to measure against.\n`);
    console.error(`  Expected: ${CACHE_FILE}`);
    console.error(`  Get it:   bun run import:wiktionary   (downloads and caches it)\n`);
    console.error(`The dump is gitignored and large (~13 MB), so this measurement is a`);
    console.error(`maintainer tool, not part of CI. The regression tests that do run in CI`);
    console.error(`live in packages/converter/test/suffix.test.ts.`);
    process.exit(2);
  }

  const rows = readTestSet(readFileSync(CACHE_FILE, "utf8"));
  const measurable = rows.filter((r) => lookupWord(r.lemma).length > 0);

  const byCase = new Map<string, Bucket>();
  const unresolved: Row[] = [];
  const wrongStem: Row[] = [];
  let resolved = 0;
  let correct = 0;

  for (const row of measurable) {
    const bucket = byCase.get(row.grammaticalCase) ?? { total: 0, resolved: 0, correct: 0 };
    bucket.total++;
    const verdict = judge(row);
    if (verdict !== "unresolved") {
      resolved++;
      bucket.resolved++;
      if (verdict === "correct") {
        correct++;
        bucket.correct++;
      } else {
        wrongStem.push(row);
      }
    } else {
      unresolved.push(row);
    }
    byCase.set(row.grammaticalCase, bucket);
  }

  console.log(`Suffix engine coverage — Wiktionary mn-decl tables\n`);
  console.log(`  inflected forms in the dump:     ${rows.length}`);
  console.log(`  …whose lemma is in our lexicon:  ${measurable.length}   <- the measurable set`);
  console.log(`  …decomposed to anything:         ${resolved}  (${pct(resolved, measurable.length)})`);
  console.log(`  …decomposed to the RIGHT stem:   ${correct}  (${pct(correct, measurable.length)})`);
  if (resolved > 0) {
    console.log(`  precision (right stem | resolved): ${pct(correct, resolved)}`);
  }

  console.log(`\n  ${"case".padEnd(14)}${"forms".padStart(7)}${"resolved".padStart(11)}${"correct".padStart(10)}`);
  for (const [name, b] of [...byCase].sort((a, b) => b[1].total - a[1].total)) {
    console.log(
      `  ${name.padEnd(14)}${String(b.total).padStart(7)}${pct(b.resolved, b.total).padStart(11)}${pct(b.correct, b.total).padStart(10)}`,
    );
  }

  // Unresolved forms split into the two known gaps: the stem survived in the
  // surface string (so a suffix or a chain is missing) or it did not (so the
  // stem itself needs repairing before any lookup can succeed).
  const stemChanged = unresolved.filter((r) => !r.form.startsWith(r.lemma));
  console.log(`\n  unresolved:                      ${unresolved.length}`);
  console.log(`    stem string changed:           ${stemChanged.length}  (${pct(stemChanged.length, unresolved.length)})`);
  console.log(
    `    stem intact:                   ${unresolved.length - stemChanged.length}  (${pct(unresolved.length - stemChanged.length, unresolved.length)})`,
  );

  printSample("--failures", "unresolved", unresolved);
  printSample("--wrong", "resolved to the wrong stem", wrongStem);
}

function printSample(flag: string, label: string, rows: Row[]): void {
  const i = process.argv.indexOf(flag);
  if (i === -1) return;
  const n = Number(process.argv[i + 1]) || 20;
  console.log(`\n  --- ${label} (${Math.min(n, rows.length)} of ${rows.length}) ---`);
  for (const r of rows.slice(0, n)) {
    console.log(`    ${r.lemma} → ${r.form}  (${r.grammaticalCase})`);
  }
}

if (import.meta.main) {
  main();
}
