import { LEXICON_JSON } from "./generated/lexicon.js";
import { normalizeWord } from "./normalize.js";
import type { Candidate, CandidateSource } from "./types.js";

/** Compact candidate as emitted by scripts/build-data.ts. */
export type CompactCandidate = [
  traditional: string,
  latin: string,
  sense: string,
  verified: 0 | 1,
  source: string,
];

const SOURCE_NAMES: Record<string, CandidateSource> = {
  w: "wmk-import",
  k: "wiktionary",
  m: "manual",
  c: "community",
};

let table: Record<string, CompactCandidate[]> | undefined;

function getTable(): Record<string, CompactCandidate[]> {
  if (table === undefined) table = JSON.parse(LEXICON_JSON) as Record<string, CompactCandidate[]>;
  return table;
}

/** Decodes compact rows into public candidates. Exported for tests. */
export function decodeCandidates(rows: CompactCandidate[]): Candidate[] {
  return rows.map(([traditional, latin, sense, verified, source]) => {
    const out: Candidate = {
      traditional,
      verified: verified === 1,
      source: SOURCE_NAMES[source] ?? "community",
    };
    if (latin) out.latin = latin;
    if (sense) out.sense = sense;
    return out;
  });
}

/**
 * Exact lexicon lookup after normalization (NFC, lowercase, trim).
 * Returns ALL known candidates — ambiguity is never collapsed to one — or an
 * empty array when the word is unknown. Never returns fallback output; see
 * convertText for the clearly-flagged rule-based fallback.
 */
export function lookupWord(cyrillic: string): Candidate[] {
  const rows = getTable()[normalizeWord(cyrillic)];
  return rows === undefined ? [] : decodeCandidates(rows);
}
