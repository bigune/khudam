/**
 * One-time bootstrap import from sura0111/writtenMongolianKeyboard (MIT).
 * See data/SOURCES.md for provenance and licensing details.
 *
 * Usage:
 *   bun scripts/import-wmk.ts [path-to-local-dictionary.json]
 *
 * Behaviour:
 *   - every imported candidate is { verified: false, source: "wmk-import" } —
 *     machine imports are never marked verified;
 *   - idempotent: a cyrillic form that already exists in the lexicon is left
 *     completely untouched (candidates with verified: true can therefore never
 *     be modified or overwritten by this script), and re-runs add no duplicates;
 *   - seed entries that are not clean single Cyrillic words, or whose
 *     traditional field is not valid standard-Unicode Mongolian, are skipped
 *     and listed in data/REVIEW.md for human recovery;
 *   - the only content repair performed is a homoglyph fix: Latin "x" (U+0078)
 *     inside otherwise-Cyrillic words is replaced with Cyrillic "х" (U+0445).
 *     No orthographic corrections are ever made by machine.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CYRILLIC_WORD_RE,
  DATA_DIR,
  LEXICON_DIR,
  TRADITIONAL_RE,
  compareWords,
  loadLexicon,
  normalizeCyrillic,
  writeEntriesFile,
  type Candidate,
  type Entry,
} from "./lib.ts";

const SEED_URL =
  "https://raw.githubusercontent.com/sura0111/writtenMongolianKeyboard/main/src/database/dictionary.json";
const REVIEW_FILE = join(DATA_DIR, "REVIEW.md");
const REVIEW_BEGIN = "<!-- wmk-import:begin (auto-generated, do not edit between markers) -->";
const REVIEW_END = "<!-- wmk-import:end -->";

interface RawEntry {
  cyrillic?: string;
  latin?: string;
  traditional?: string;
}

async function loadSeed(): Promise<RawEntry[]> {
  const localPath = process.argv[2];
  if (localPath) {
    console.log(`Reading seed from local file: ${localPath}`);
    return JSON.parse(readFileSync(localPath, "utf8"));
  }
  console.log(`Downloading seed: ${SEED_URL}`);
  const res = await fetch(SEED_URL);
  if (!res.ok) throw new Error(`Seed download failed: HTTP ${res.status}`);
  return (await res.json()) as RawEntry[];
}

function main(seed: RawEntry[]): void {
  if (!Array.isArray(seed)) throw new Error("Seed is not a JSON array — format changed upstream?");
  console.log(`Seed entries: ${seed.length}`);

  const skippedCyrillic: string[] = [];
  const skippedTraditional: { cyrillic: string; traditional: string }[] = [];
  const collapsedHomonyms: { cyrillic: string; kept: string; dropped: string }[] = [];
  let homoglyphFixes = 0;
  let emptyFields = 0;

  // 1. Clean and group the seed by normalized cyrillic form.
  const fromSeed = new Map<string, Entry>();
  for (const raw of seed) {
    if (!raw.cyrillic || !raw.traditional) {
      emptyFields++;
      continue;
    }
    let cyr = normalizeCyrillic(raw.cyrillic);
    if (!CYRILLIC_WORD_RE.test(cyr) && cyr.includes("x")) {
      const fixed = cyr.replaceAll("x", "х");
      if (CYRILLIC_WORD_RE.test(fixed)) {
        cyr = fixed;
        homoglyphFixes++;
      }
    }
    if (!CYRILLIC_WORD_RE.test(cyr)) {
      skippedCyrillic.push(raw.cyrillic);
      continue;
    }
    const traditional = raw.traditional.normalize("NFC").trim();
    if (!TRADITIONAL_RE.test(traditional)) {
      skippedTraditional.push({ cyrillic: cyr, traditional: raw.traditional });
      continue;
    }
    const candidate: Candidate = { traditional, verified: false, source: "wmk-import" };
    const latin = raw.latin?.trim();
    if (latin) candidate.latin = latin;

    const existing = fromSeed.get(cyr);
    if (!existing) {
      fromSeed.set(cyr, { cyrillic: cyr, candidates: [candidate] });
    } else if (!existing.candidates.some((c) => c.traditional === traditional)) {
      // A second, different traditional form for the same word. Our schema
      // requires a human-written sense label to keep multiple candidates, so
      // the machine import keeps the first and flags the rest for review.
      collapsedHomonyms.push({
        cyrillic: cyr,
        kept: existing.candidates[0].traditional,
        dropped: traditional,
      });
    }
  }

  // 2. Merge into the existing lexicon. Existing entries are never touched.
  const lexicon = loadLexicon();
  let added = 0;
  let untouched = 0;
  for (const [cyr, entry] of fromSeed) {
    if (lexicon.has(cyr)) {
      untouched++;
    } else {
      lexicon.set(cyr, entry);
      added++;
    }
  }

  // 3. Shard by first letter and write canonically.
  mkdirSync(LEXICON_DIR, { recursive: true });
  const shards = new Map<string, Entry[]>();
  for (const entry of lexicon.values()) {
    const letter = entry.cyrillic[0];
    if (!shards.has(letter)) shards.set(letter, []);
    shards.get(letter)!.push(entry);
  }
  for (const [letter, entries] of [...shards.entries()].sort((a, b) => compareWords(a[0], b[0]))) {
    entries.sort((a, b) => compareWords(a.cyrillic, b.cyrillic));
    writeEntriesFile(join(LEXICON_DIR, `${letter}.json`), entries);
  }

  writeReviewFile(skippedCyrillic, skippedTraditional, collapsedHomonyms);

  // 4. Report.
  console.log("");
  console.log("Import summary");
  console.log(`  seed entries:               ${seed.length}`);
  console.log(`  new entries added:          ${added}`);
  console.log(`  existing entries untouched: ${untouched}`);
  console.log(`  homoglyph fixes (x -> х):   ${homoglyphFixes}`);
  console.log(`  skipped (cyrillic form):    ${skippedCyrillic.length}`);
  console.log(`  skipped (traditional form): ${skippedTraditional.length}`);
  console.log(`  collapsed homonyms:         ${collapsedHomonyms.length}`);
  console.log(`  empty seed rows:            ${emptyFields}`);
  console.log(`  lexicon total:              ${lexicon.size} entries in ${shards.size} shards`);
  if (skippedCyrillic.length || skippedTraditional.length || collapsedHomonyms.length) {
    console.log(`  skipped entries listed in:  data/REVIEW.md`);
  }
}

function writeReviewFile(
  skippedCyrillic: string[],
  skippedTraditional: { cyrillic: string; traditional: string }[],
  collapsedHomonyms: { cyrillic: string; kept: string; dropped: string }[],
): void {
  const lines: string[] = [REVIEW_BEGIN, ""];
  lines.push("## Seed entries skipped by `scripts/import-wmk.ts`");
  lines.push("");
  lines.push(
    "These rows from the writtenMongolianKeyboard seed could not be imported " +
      "automatically. They are listed here so humans can recover them by hand " +
      "(see CONTRIBUTING.md). Машин импортоор оруулж чадаагүй мөрүүд — гараар " +
      "сэргээж оруулахад тусламж хэрэгтэй.",
  );
  lines.push("");
  if (skippedCyrillic.length) {
    lines.push(`### Not a clean Cyrillic word (${skippedCyrillic.length})`);
    lines.push("");
    lines.push(
      "Dictionary markup (trailing `:`, homonym numbering, stray characters) " +
        "needs stripping, and homonym rows need `sense` labels:",
    );
    lines.push("");
    for (const w of skippedCyrillic) lines.push(`- \`${w}\``);
    lines.push("");
  }
  if (skippedTraditional.length) {
    lines.push(`### Corrupt traditional field (${skippedTraditional.length})`);
    lines.push("");
    lines.push(
      "The seed's traditional column contains Latin/Cyrillic text instead of " +
        "Mongolian script. The correct spelling must be supplied by a human:",
    );
    lines.push("");
    for (const s of skippedTraditional)
      lines.push(`- \`${s.cyrillic}\` (seed had \`${JSON.stringify(s.traditional)}\`)`);
    lines.push("");
  }
  if (collapsedHomonyms.length) {
    lines.push(`### Collapsed homonyms (${collapsedHomonyms.length})`);
    lines.push("");
    lines.push(
      "The seed had several different traditional forms for one Cyrillic word. " +
        "Only the first was imported; adding the others needs human sense labels:",
    );
    lines.push("");
    for (const h of collapsedHomonyms)
      lines.push(`- \`${h.cyrillic}\`: kept \`${h.kept}\`, dropped \`${h.dropped}\``);
    lines.push("");
  }
  if (!skippedCyrillic.length && !skippedTraditional.length && !collapsedHomonyms.length) {
    lines.push("Nothing was skipped. 🎉");
    lines.push("");
  }
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
      "# Хянуулахаар хүлээгдэж буй бичлэгүүд / Entries flagged for review\n\n" +
      "Суурь өгөгдлөөс автоматаар оруулж чадаагүй, эсвэл эргэлзээтэй бичлэгүүдийг " +
      "энд жагсаана. This file collects entries that need human eyes — either " +
      "skipped during import or flagged as suspicious.\n\n" +
      generated +
      "\n";
  }
  writeFileSync(REVIEW_FILE, content, "utf8");
}

main(await loadSeed());
