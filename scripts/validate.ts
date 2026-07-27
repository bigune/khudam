/**
 * Data validation for every file under data/. Run with: bun run validate
 *
 * The checks mirror data/schema/entry.schema.json (hand-rolled instead of a
 * schema library so error messages stay human-friendly — many contributors
 * edit JSON in the GitHub web UI and have never programmed).
 * Exits non-zero when anything is wrong.
 */
import { existsSync, readFileSync } from "node:fs";
import { basename, relative } from "node:path";
import {
  CYRILLIC_WORD_RE,
  NAMES_FILE,
  REPO_ROOT,
  SOURCES,
  SUFFIXES_FILE,
  SUFFIX_ATTACH,
  SUFFIX_GENDERS,
  TRADITIONAL_RE,
  compareWords,
  listShardFiles,
} from "./lib.ts";

const MAX_PRINTED_ERRORS = 60;

interface Problem {
  file: string;
  where: string;
  message: string;
}

const problems: Problem[] = [];
let checkedEntries = 0;
let checkedFiles = 0;
const shardSummary: [string, number][] = [];
const seenAcrossShards = new Map<string, string>();

function report(file: string, where: string, message: string): void {
  problems.push({ file: relative(REPO_ROOT, file).replaceAll("\\", "/"), where, message });
}

function parseJsonFile(file: string): unknown | undefined {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    report(file, "file", "The file could not be read.");
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    report(
      file,
      "file",
      "This file is not valid JSON, so no other checks could run. " +
        "The most common causes are a missing or extra comma, a missing quote, " +
        'or "smart quotes" (“ ”) pasted from a word processor — JSON only accepts ' +
        'straight quotes ("). Technical detail: ' +
        (err instanceof Error ? err.message : String(err)),
    );
    return undefined;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function quoteList(values: readonly string[]): string {
  return values.map((v) => `"${v}"`).join(", ");
}

function checkCyrillicKey(file: string, where: string, value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) {
    report(file, where, '"cyrillic" must be a non-empty text value in quotes, e.g. "уул".');
    return false;
  }
  if (value !== value.normalize("NFC")) {
    report(
      file,
      where,
      `"cyrillic" (“${value}”) is not NFC-normalized. Some letters were typed as ` +
        "letter + accent instead of the single combined character (this often happens " +
        "with ё or й). Please retype the word with a normal Mongolian Cyrillic keyboard.",
    );
    return false;
  }
  if (value !== value.toLowerCase()) {
    report(file, where, `"cyrillic" must be all lowercase — please change “${value}” to “${value.toLowerCase()}”.`);
    return false;
  }
  if (!CYRILLIC_WORD_RE.test(value)) {
    report(
      file,
      where,
      `"cyrillic" (“${value}”) may only contain lowercase Mongolian Cyrillic letters ` +
        "(а–я, ё, ө, ү) — no spaces, digits, punctuation, or Latin lookalike letters " +
        "(watch out for Latin x/a/o typed instead of Cyrillic х/а/о).",
    );
    return false;
  }
  return true;
}

function checkCandidate(file: string, where: string, cand: unknown, senseRequired: boolean): void {
  if (!isPlainObject(cand)) {
    report(file, where, "Each candidate must be an object wrapped in { }.");
    return;
  }
  const allowed = ["traditional", "latin", "sense", "verified", "source", "corroborated"];
  for (const key of Object.keys(cand)) {
    if (!allowed.includes(key)) {
      report(file, where, `Unknown field "${key}" — allowed fields are: ${quoteList(allowed)}. Is it a typo?`);
    }
  }
  const t = cand.traditional;
  if (typeof t !== "string" || t.length === 0) {
    report(file, where, '"traditional" is required and must be the word in Mongolian script, e.g. "ᠠᠪᠤ".');
  } else if (!TRADITIONAL_RE.test(t)) {
    const badChars = [...t]
      .filter((ch) => !TRADITIONAL_RE.test(ch))
      .map((ch) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`);
    report(
      file,
      where,
      `"traditional" contains characters outside standard Unicode Mongolian ` +
        `(allowed: U+1800–U+18AF and the narrow no-break space U+202F): ${badChars.join(", ")}. ` +
        "Note that several Mongolian letters look identical — correctness can only be judged " +
        "by code point, not by appearance — and presentation forms or private encodings " +
        "(e.g. Bolorsoft Тунгаамал) are not accepted, only standard Unicode.",
    );
  } else if (t !== t.normalize("NFC")) {
    report(file, where, '"traditional" is not NFC-normalized — please re-enter it with a standard Unicode input method.');
  }
  if ("latin" in cand && (typeof cand.latin !== "string" || cand.latin.length === 0)) {
    report(file, where, '"latin" must be a non-empty text value when present (or remove the field).');
  }
  if ("sense" in cand && (typeof cand.sense !== "string" || cand.sense.length === 0)) {
    report(file, where, '"sense" must be a non-empty text value when present (or remove the field).');
  }
  if (senseRequired && !("sense" in cand)) {
    report(
      file,
      where,
      'This word has more than one candidate, so every candidate needs a "sense" — ' +
        'a short meaning label that tells readers which is which, e.g. "sense": "mountain".',
    );
  }
  if (typeof cand.verified !== "boolean") {
    report(file, where, '"verified" is required and must be true or false (without quotes).');
  }
  if ("corroborated" in cand && typeof cand.corroborated !== "boolean") {
    report(
      file,
      where,
      '"corroborated" must be true or false (without quotes) when present, or remove the field. ' +
        "It marks forms that two independent sources agree on — import tooling sets it; " +
        "contributors normally never need to.",
    );
  }
  if (typeof cand.source !== "string" || !(SOURCES as readonly string[]).includes(cand.source)) {
    report(
      file,
      where,
      `"source" is required and must be one of: ${quoteList(SOURCES)}. ` +
        `For hand-written contributions use "community".`,
    );
  }
}

function checkEntry(file: string, index: number, entry: unknown): string | undefined {
  const label = isPlainObject(entry) && typeof entry.cyrillic === "string" ? ` (“${entry.cyrillic}”)` : "";
  const where = `entry #${index + 1}${label}`;
  if (!isPlainObject(entry)) {
    report(file, where, "Each entry must be an object wrapped in { }.");
    return undefined;
  }
  for (const key of Object.keys(entry)) {
    if (key !== "cyrillic" && key !== "candidates") {
      report(file, where, `Unknown field "${key}" — an entry has exactly two fields: "cyrillic" and "candidates".`);
    }
  }
  if (!checkCyrillicKey(file, where, entry.cyrillic)) return undefined;
  const cyr = entry.cyrillic as string;
  const cands = entry.candidates;
  if (!Array.isArray(cands) || cands.length === 0) {
    report(file, where, '"candidates" must be a list [ ... ] with at least one candidate in it.');
    return cyr;
  }
  const senseRequired = cands.length > 1;
  const seenTraditional = new Set<string>();
  cands.forEach((cand, i) => {
    const cwhere = `${where}, candidate #${i + 1}`;
    checkCandidate(file, cwhere, cand, senseRequired);
    if (isPlainObject(cand) && typeof cand.traditional === "string") {
      if (seenTraditional.has(cand.traditional)) {
        report(file, cwhere, "This traditional form appears twice in the same entry — please remove the duplicate.");
      }
      seenTraditional.add(cand.traditional);
    }
  });
  checkedEntries++;
  return cyr;
}

function checkEntriesFile(file: string, shardLetter?: string): number {
  checkedFiles++;
  const data = parseJsonFile(file);
  if (data === undefined) return 0;
  if (!Array.isArray(data)) {
    report(file, "file", "The top level of this file must be a list: it should start with [ and end with ].");
    return 0;
  }
  let previous: string | undefined;
  for (let i = 0; i < data.length; i++) {
    const cyr = checkEntry(file, i, data[i]);
    if (cyr === undefined) continue;
    const where = `entry #${i + 1} (“${cyr}”)`;
    if (shardLetter !== undefined) {
      if (!cyr.startsWith(shardLetter)) {
        report(
          file,
          where,
          `This word starts with “${cyr[0]}”, so it belongs in data/lexicon/${cyr[0]}.json, ` +
            `not in the “${shardLetter}” file.`,
        );
      }
      const firstSeenIn = seenAcrossShards.get(cyr);
      if (firstSeenIn !== undefined) {
        report(
          file,
          where,
          `“${cyr}” already exists in ${firstSeenIn}. Each Cyrillic word may appear only once ` +
            "in the whole lexicon — to add another traditional spelling, add a second candidate " +
            "to the existing entry instead.",
        );
      } else {
        seenAcrossShards.set(cyr, relative(REPO_ROOT, file).replaceAll("\\", "/"));
      }
    }
    if (previous !== undefined) {
      const cmp = compareWords(previous, cyr);
      if (cmp === 0 && shardLetter === undefined) {
        report(file, where, `“${cyr}” appears twice in this file — each word may appear only once.`);
      } else if (cmp > 0) {
        report(
          file,
          where,
          `Entries must be in alphabetical (Unicode) order: “${cyr}” should come before “${previous}”, ` +
            "not after it. Please move the entry to its sorted position. " +
            "(Note: ё, ө, ү sort after я in Unicode order.)",
        );
      }
    }
    previous = cyr;
  }
  return data.length;
}

function checkSuffixesFile(file: string): void {
  checkedFiles++;
  const data = parseJsonFile(file);
  if (data === undefined) return;
  if (!Array.isArray(data)) {
    report(file, "file", "The top level of this file must be a list: it should start with [ and end with ].");
    return;
  }
  const seenVariants = new Map<string, number>();
  let previous: { cyrillic: string; traditional: string } | undefined;
  data.forEach((item, i) => {
    const label = isPlainObject(item) && typeof item.cyrillic === "string" ? ` (“-${item.cyrillic}”)` : "";
    const where = `suffix #${i + 1}${label}`;
    if (!isPlainObject(item)) {
      report(file, where, "Each suffix mapping must be an object wrapped in { }.");
      return;
    }
    const allowed = ["cyrillic", "traditional", "latin", "sense", "attach", "gender", "verified", "source", "citation"];
    for (const key of Object.keys(item)) {
      if (!allowed.includes(key)) {
        report(file, where, `Unknown field "${key}" — allowed fields are: ${quoteList(allowed)}. Is it a typo?`);
      }
    }
    if (typeof item.cyrillic !== "string" || !CYRILLIC_WORD_RE.test(item.cyrillic)) {
      report(file, where, '"cyrillic" is required: the suffix in lowercase Cyrillic letters, e.g. "ын".');
      return;
    }
    if (typeof item.traditional !== "string" || item.traditional.length === 0) {
      report(file, where, '"traditional" is required: the suffix in standard Unicode Mongolian script, e.g. "ᠤᠨ".');
    } else if (item.traditional.includes(" ")) {
      report(
        file,
        where,
        '"traditional" must not contain the narrow no-break space (U+202F) — the converter ' +
          "inserts it automatically when joining the suffix to a word, so store the suffix letters only.",
      );
    } else if (!TRADITIONAL_RE.test(item.traditional)) {
      report(
        file,
        where,
        '"traditional" contains characters outside standard Unicode Mongolian (U+1800–U+18AF). ' +
          "Note that several Mongolian letters look identical — correctness can only be judged " +
          "by code point, not by appearance.",
      );
    }
    if (typeof item.sense !== "string" || item.sense.length === 0) {
      report(
        file,
        where,
        '"sense" is required: a short grammatical label such as "genitive" or "plural", ' +
          "so users can tell suffix candidates apart.",
      );
    }
    if ("latin" in item && (typeof item.latin !== "string" || item.latin.length === 0)) {
      report(file, where, '"latin" must be a non-empty text value when present (or remove the field).');
    }
    if ("attach" in item && !(SUFFIX_ATTACH as readonly unknown[]).includes(item.attach)) {
      report(
        file,
        where,
        `"attach" must be one of: ${quoteList(SUFFIX_ATTACH)} — what the traditional stem must end in ` +
          "for this variant to apply (or remove the field when the suffix attaches to anything).",
      );
    }
    if ("gender" in item && !(SUFFIX_GENDERS as readonly unknown[]).includes(item.gender)) {
      report(
        file,
        where,
        `"gender" must be one of: ${quoteList(SUFFIX_GENDERS)} — the vowel-harmony class of stems ` +
          "this variant attaches to (or remove the field).",
      );
    }
    if ("citation" in item && (typeof item.citation !== "string" || item.citation.length === 0)) {
      report(file, where, '"citation" must be a non-empty text value when present, e.g. "Nadmid 1990 p. 15".');
    }
    if (typeof item.verified !== "boolean") {
      report(file, where, '"verified" is required and must be true or false (without quotes).');
    }
    if (typeof item.source !== "string" || !(SOURCES as readonly string[]).includes(item.source)) {
      report(file, where, `"source" is required and must be one of: ${quoteList(SOURCES)}.`);
    }
    if (typeof item.traditional === "string") {
      const variantKey = `${item.cyrillic} ${item.traditional} ${item.attach ?? ""} ${item.gender ?? ""}`;
      const firstAt = seenVariants.get(variantKey);
      if (firstAt !== undefined) {
        report(file, where, `This exact suffix variant already appears as suffix #${firstAt} — please remove the duplicate.`);
      } else {
        seenVariants.set(variantKey, i + 1);
      }
      if (previous !== undefined) {
        const cmp = compareWords(previous.cyrillic, item.cyrillic);
        if (cmp > 0 || (cmp === 0 && compareWords(previous.traditional, item.traditional) > 0)) {
          report(
            file,
            where,
            `Suffixes must be in alphabetical (Unicode) order by "cyrillic", then by "traditional": ` +
              `“-${item.cyrillic}” should come before “-${previous.cyrillic}”, not after it. ` +
              "(Note: ё, ө, ү sort after я in Unicode order.)",
          );
        }
      }
      previous = { cyrillic: item.cyrillic, traditional: item.traditional };
    }
    checkedEntries++;
  });
}

// ---------------------------------------------------------------------------

const shardFiles = listShardFiles();
if (shardFiles.length === 0) {
  console.error("No lexicon shards found in data/lexicon/ — run: bun run import:wmk");
  process.exit(1);
}
for (const file of shardFiles) {
  const letter = basename(file, ".json");
  if (!CYRILLIC_WORD_RE.test(letter) || [...letter].length !== 1) {
    report(file, "file name", "Lexicon files must be named after a single lowercase Cyrillic letter, e.g. а.json.");
    continue;
  }
  const count = checkEntriesFile(file, letter);
  shardSummary.push([letter, count]);
}
if (existsSync(NAMES_FILE)) checkEntriesFile(NAMES_FILE);
if (existsSync(SUFFIXES_FILE)) checkSuffixesFile(SUFFIXES_FILE);

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const p of problems.slice(0, MAX_PRINTED_ERRORS)) {
    console.error(`  ✖ ${p.file} — ${p.where}`);
    console.error(`    ${p.message}\n`);
  }
  if (problems.length > MAX_PRINTED_ERRORS) {
    console.error(`  … and ${problems.length - MAX_PRINTED_ERRORS} more.`);
  }
  console.error(
    "Validation failed. Nothing is broken permanently — fix the issues above and try again.\n" +
      "Need help? Open an issue or ask in your pull request; someone will gladly assist.",
  );
  process.exit(1);
}

const total = shardSummary.reduce((n, [, c]) => n + c, 0);
for (const [letter, count] of shardSummary) {
  console.log(`  ✓ data/lexicon/${letter}.json — ${count} entries`);
}
console.log(`\n✓ ${total} lexicon entries in ${shardSummary.length} shards, ${checkedFiles} files checked, 0 problems.`);
