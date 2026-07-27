import { SUFFIXES_JSON } from "./generated/suffixes.js";
import { lookupWord } from "./lookup.js";
import { normalizeWord } from "./normalize.js";
import type { Candidate } from "./types.js";

/** Compact suffix row as emitted by scripts/build-data.ts. */
export type CompactSuffix = [
  cyrillic: string,
  traditional: string,
  latin: string,
  sense: string,
  attach: "" | "vowel" | "consonant",
  gender: "" | "masculine" | "feminine",
  verified: 0 | 1,
];

/** NNBSP U+202F joins written-apart suffixes to their stem (data/GRAMMAR.md G1). */
const NNBSP = "\u202f";

const MASCULINE_VOWELS = /[ᠠᠣᠤ]/; // ᠠ ᠣ ᠤ
const FEMININE_VOWELS = /[ᠡᠥᠦᠧ]/; // ᠡ ᠥ ᠦ ᠧ
const VOWELS = /[ᠠ-ᠧ]/;
/** FVS1–FVS3, MVS, nirugu — formatting characters, never the final letter. */
const NON_LETTERS = /[᠊-᠎]+$/u;

let table: Map<string, CompactSuffix[]> | undefined;
let suffixesLongestFirst: string[] | undefined;

function getTable(): Map<string, CompactSuffix[]> {
  if (table === undefined) {
    table = new Map();
    for (const row of JSON.parse(SUFFIXES_JSON) as CompactSuffix[]) {
      const rows = table.get(row[0]);
      if (rows === undefined) table.set(row[0], [row]);
      else rows.push(row);
    }
    suffixesLongestFirst = [...table.keys()].sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
  }
  return table;
}

/** The last real letter of a traditional stem, skipping FVS/MVS/nirugu. */
function finalLetter(traditional: string): string {
  const trimmed = traditional.replace(NON_LETTERS, "");
  return trimmed.slice(-1);
}

/**
 * Vowel-harmony class of a traditional stem. Stems containing only ᠢ (or no
 * vowel at all) are "neutral" and satisfy either gender condition — the
 * caller then emits both variants rather than guessing (GRAMMAR.md G2).
 */
export function stemGender(traditional: string): "masculine" | "feminine" | "neutral" {
  const masc = MASCULINE_VOWELS.test(traditional);
  const fem = FEMININE_VOWELS.test(traditional);
  if (masc && !fem) return "masculine";
  if (fem && !masc) return "feminine";
  return "neutral";
}

/** Whether a traditional stem satisfies a suffix variant's conditions. */
function conditionsMatch(stemTraditional: string, [, , , , attach, gender]: CompactSuffix): boolean {
  if (attach !== "") {
    const isVowel = VOWELS.test(finalLetter(stemTraditional));
    if (attach === "vowel" ? !isVowel : isVowel) return false;
  }
  if (gender !== "") {
    const g = stemGender(stemTraditional);
    if (g !== "neutral" && g !== gender) return false;
  }
  return true;
}

/**
 * Splits an inflected Cyrillic word into lexicon stem + known suffix and
 * returns the composed traditional candidates, or [] when no split works.
 *
 * - Depth 1: exactly one suffix is stripped (chains like гэр+т+ээ are a
 *   known gap — see data/GRAMMAR.md).
 * - A stem that misses the lexicon is retried with a restored final ь
 *   (сургуулийн → сургууль, GRAMMAR.md G11).
 * - Conditions are evaluated against each TRADITIONAL stem candidate, never
 *   the Cyrillic surface (багшийг → ᠪᠠᠭᠰᠢ ᠶᠢ because ᠪᠠᠭᠰᠢ ends in a vowel).
 * - Every match is returned (`source: "suffix-rule"`), never a silent pick;
 *   verified only when both stem and suffix row are human-verified.
 */
export function decomposeWord(word: string): Candidate[] {
  const w = normalizeWord(word);
  const suffixTable = getTable();
  const results: Candidate[] = [];
  const seen = new Set<string>();
  for (const suffix of suffixesLongestFirst!) {
    if (w.length <= suffix.length || !w.endsWith(suffix)) continue;
    const base = w.slice(0, -suffix.length);
    let stems = lookupWord(base);
    if (stems.length === 0 && !base.endsWith("ь")) stems = lookupWord(base + "ь");
    for (const stem of stems) {
      for (const row of suffixTable.get(suffix)!) {
        if (!conditionsMatch(stem.traditional, row)) continue;
        const [, traditional, latin, sense, , , verified] = row;
        const composed = stem.traditional + NNBSP + traditional;
        if (seen.has(composed)) continue;
        seen.add(composed);
        const candidate: Candidate = {
          traditional: composed,
          verified: stem.verified && verified === 1,
          source: "suffix-rule",
          sense: stem.sense ? `${stem.sense} + ${sense}` : sense,
        };
        if (stem.latin && latin) candidate.latin = `${stem.latin}-${latin}`;
        results.push(candidate);
      }
    }
  }
  return results;
}
