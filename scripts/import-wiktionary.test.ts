/**
 * Unit tests for the pure transform/merge pieces of import-wiktionary.ts.
 * Fixtures are small hand-written kaikki.org JSONL objects; the хуваарь one
 * mirrors the real dump line.
 */
import { describe, expect, test } from "bun:test";
import {
  UNLABELED_SENSE,
  extractLine,
  isConflict,
  mergeWord,
  newMergeStats,
  shortenGloss,
  wiktionaryUrl,
  type RawLine,
} from "./import-wiktionary.ts";
import type { Entry } from "./lib.ts";

const KHUVAAR: RawLine = {
  word: "хуваарь",
  pos: "noun",
  lang_code: "mn",
  forms: [
    { form: "khuvaari", tags: ["romanization"] },
    { form: "ᠬᠤᠪᠢᠶᠠᠷᠢ", roman: "qubiyari", tags: ["Mongolian"] },
  ],
  senses: [{ glosses: ["schedule; timetable"] }],
};

describe("extractLine", () => {
  test("extracts the traditional form, classical latin, and sense (хуваарь)", () => {
    const out = extractLine(KHUVAAR);
    expect(out).toEqual({
      kind: "word",
      key: "хуваарь",
      word: "хуваарь",
      candidates: [{ traditional: "ᠬᠤᠪᠢᠶᠠᠷᠢ", latin: "qubiyari", sense: "schedule; timetable" }],
      invalid: [],
      suggestions: [],
    });
  });

  test("recovers untagged spellings from headword-line template arguments", () => {
    const out = extractLine({
      word: "говь",
      pos: "noun",
      forms: [],
      head_templates: [{ name: "mn-noun", args: { "1": "ᠭᠣᠪᠢ" }, expansion: "говь • (govʹ)" }],
      senses: [{ glosses: ["desert"] }],
    });
    if (out.kind !== "word") throw new Error("expected word");
    // no classical romanization exists in head templates — latin is omitted
    expect(out.candidates).toEqual([{ traditional: "ᠭᠣᠪᠢ", sense: "desert" }]);
  });

  test("a Classical Mongolian etymon becomes a suggestion, never a candidate", () => {
    const out = extractLine({
      word: "уул",
      pos: "noun",
      forms: [],
      etymology_templates: [
        { name: "inh", args: { "1": "mn", "2": "cmg", "3": "ᠠᠭᠤᠯᠠ" }, expansion: "Classical Mongolian ᠠᠭᠤᠯᠠ (aɣula)" },
        { name: "inh", args: { "1": "mn", "2": "xgn-pro", "3": "*aɣula" }, expansion: "Proto-Mongolic *aɣula" },
      ],
      senses: [{ glosses: ["mountain"] }],
    });
    if (out.kind !== "word") throw new Error("expected word");
    expect(out.candidates).toEqual([]);
    expect(out.suggestions).toEqual([{ traditional: "ᠠᠭᠤᠯᠠ", latin: "aɣula", gloss: "mountain" }]);
  });

  test("etymons in other scripts of the same Unicode block (Manchu) are ignored", () => {
    const out = extractLine({
      word: "уул",
      pos: "noun",
      forms: [],
      etymology_templates: [
        { name: "der", args: { "1": "mn", "2": "mnc", "3": "ᡤᡡᠯᡥᠠ" }, expansion: "Manchu ᡤᡡᠯᡥᠠ (gūlha, “boot”)" },
      ],
      senses: [{ glosses: ["a type of boots"] }],
    });
    expect(out).toEqual({ kind: "skip", reason: "no-mongolian-form" });
  });

  test("skips an entry with no Mongolian-script form", () => {
    const out = extractLine({
      word: "хуваарь",
      pos: "noun",
      forms: [{ form: "khuvaari", tags: ["romanization"] }],
      senses: [{ glosses: ["schedule"] }],
    });
    expect(out).toEqual({ kind: "skip", reason: "no-mongolian-form" });
  });

  test("skips non-Cyrillic headwords (Latin- and Mongolian-script entries)", () => {
    for (const word of ["qubiyari", "ᠬᠤᠪᠢᠶᠠᠷᠢ"]) {
      expect(extractLine({ ...KHUVAAR, word })).toEqual({ kind: "skip", reason: "non-cyrillic" });
    }
  });

  test("skips multi-word phrases and other languages", () => {
    expect(extractLine({ ...KHUVAAR, word: "сайн байна уу" })).toEqual({ kind: "skip", reason: "multi-word" });
    expect(extractLine({ ...KHUVAAR, lang_code: "ru" })).toEqual({ kind: "skip", reason: "other-language" });
  });

  test("routes an out-of-range traditional form to review, never the lexicon", () => {
    const out = extractLine({
      word: "сарын",
      pos: "noun",
      forms: [{ form: "ᠰᠠᠷ᠎ᠠ ᠶᠢᠨ", tags: ["Mongolian"] }],
      senses: [{ glosses: ["monthly"] }],
    });
    expect(out.kind).toBe("word");
    if (out.kind !== "word") throw new Error("unreachable");
    expect(out.candidates).toEqual([]);
    expect(out.invalid).toHaveLength(1);
    expect(out.invalid[0].reason).toContain("U+0020");
  });

  test("one entry with several distinct forms yields several candidates", () => {
    const out = extractLine({
      word: "хур",
      pos: "noun",
      forms: [
        { form: "ᠬᠤᠷ", tags: ["Mongolian"] },
        { form: "ᠬᠣᠷ", tags: ["Mongolian"] },
        { form: "ᠬᠤᠷ", tags: ["Mongolian"] },
      ],
      senses: [{ glosses: ["precipitation"] }],
    });
    if (out.kind !== "word") throw new Error("expected word");
    expect(out.candidates.map((c) => c.traditional)).toEqual(["ᠬᠤᠷ", "ᠬᠣᠷ"]);
    expect(out.candidates.every((c) => c.sense === "precipitation")).toBeTrue();
  });

  test("suffix entries become unverified suffix rows, hyphen stripped", () => {
    const out = extractLine({
      word: "-т",
      pos: "suffix",
      forms: [{ form: "ᠲᠤ", roman: "tu", tags: ["Mongolian"] }],
      senses: [{ glosses: ["Dative-locative case marker equating to to, at, or in in English. It is used often."] }],
    });
    if (out.kind !== "suffix") throw new Error("expected suffix");
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]).toEqual({
      cyrillic: "т",
      traditional: "ᠲᠤ",
      latin: "tu",
      sense: out.rows[0].sense,
      verified: false,
      source: "wiktionary",
    });
    expect(out.rows[0].sense.length).toBeLessThanOrEqual(81);
  });

  test("suffix forms shed Wiktionary's leading nirugu connector, keep medial ones", () => {
    const out = extractLine({
      word: "-аасай",
      pos: "suffix",
      forms: [{ form: "᠊ᠭᠠᠰᠠᠢ", roman: "ɣasai", tags: ["Mongolian"] }],
      senses: [{ glosses: ["Used to mark the desiderative mood."] }],
    });
    if (out.kind !== "suffix") throw new Error("expected suffix");
    expect(out.rows[0].traditional).toBe("ᠭᠠᠰᠠᠢ");
    expect(out.rows[0].traditional.includes("᠊")).toBeFalse();
  });

  test("applies Decision 001 to an incoming diphthong coda", () => {
    // Wiktionary spells нийгэм with the ᠶᠢ digraph; ours is already corrected,
    // and importing theirs verbatim would file a conflict about nothing.
    const out = extractLine({
      word: "нийгэм",
      pos: "noun",
      lang_code: "mn",
      forms: [{ form: "ᠨᠡᠶᠢᠭᠡᠮ", roman: "neyigem", tags: ["Mongolian"] }],
      senses: [{ glosses: ["society"] }],
    });
    if (out.kind !== "word") throw new Error("expected word");
    expect(out.candidates).toEqual([{ traditional: "ᠨᠡᠢᠭᠡᠮ", latin: "neyigem", sense: "society" }]);
  });

  test("a headword offering both spellings yields one candidate, not a conflict", () => {
    const out = extractLine({
      word: "сайн",
      pos: "adj",
      lang_code: "mn",
      forms: [
        { form: "ᠰᠠᠶᠢᠨ", tags: ["Mongolian"] },
        { form: "ᠰᠠᠢᠨ", tags: ["Mongolian"] },
      ],
      senses: [{ glosses: ["good"] }],
    });
    if (out.kind !== "word") throw new Error("expected word");
    expect(out.candidates).toEqual([{ traditional: "ᠰᠠᠢᠨ", sense: "good" }]);
  });

  test("suffix rows keep their ᠶ — Decision 002, and no NNBSP left to prove it", () => {
    // Stored without the NNBSP that marks it written-apart, -ийн's ᠶᠢᠨ would
    // look exactly like a diphthong coda to the D1 rule. Suffixes are exempt.
    const out = extractLine({
      word: "-ийн",
      pos: "suffix",
      lang_code: "mn",
      forms: [{ form: "᠊ᠶᠢᠨ", roman: "yin", tags: ["Mongolian"] }],
      senses: [{ glosses: ["genitive suffix"] }],
    });
    if (out.kind !== "suffix") throw new Error("expected suffix");
    expect(out.rows[0].traditional).toBe("ᠶᠢᠨ");
  });

  test("proper names are queued, never imported", () => {
    const out = extractLine({
      word: "Ирак",
      pos: "name",
      lang_code: "mn",
      forms: [{ form: "ᠢᠷᠠᠺ", tags: ["Mongolian"] }],
      senses: [{ glosses: ["Iraq (a country in West Asia in the Middle East)"] }],
    });
    expect(out.kind).toBe("name");
    if (out.kind !== "name") throw new Error("unreachable");
    expect(out.word).toBe("Ирак");
    expect(out.forms).toEqual([{ traditional: "ᠢᠷᠠᠺ" }]);
  });
});

describe("mergeWord", () => {
  const wmkUul = (): Entry => ({
    cyrillic: "уул",
    candidates: [{ traditional: "ᠤᠤᠯ", latin: "uul", verified: false, source: "wmk-import" }],
  });

  test("a new word becomes a new unverified wiktionary entry", () => {
    const lexicon = new Map<string, Entry>();
    const stats = newMergeStats();
    mergeWord(lexicon, "хуваарь", [{ traditional: "ᠬᠤᠪᠢᠶᠠᠷᠢ", latin: "qubiyari", sense: "schedule; timetable" }], stats);
    expect(stats.newEntries).toBe(1);
    expect(lexicon.get("хуваарь")).toEqual({
      cyrillic: "хуваарь",
      candidates: [
        { traditional: "ᠬᠤᠪᠢᠶᠠᠷᠢ", latin: "qubiyari", sense: "schedule; timetable", verified: false, source: "wiktionary" },
      ],
    });
  });

  test("a differing form produces a conflict: both candidates kept, review queued", () => {
    const lexicon = new Map<string, Entry>([["уул", wmkUul()]]);
    const stats = newMergeStats();
    mergeWord(lexicon, "уул", [{ traditional: "ᠠᠭᠤᠯᠠ", latin: "aɣula", sense: "mountain" }], stats);
    const entry = lexicon.get("уул")!;
    expect(entry.candidates).toHaveLength(2);
    // the pre-existing candidate is kept, labeled for humans, source unchanged
    expect(entry.candidates[0]).toEqual({
      traditional: "ᠤᠤᠯ",
      latin: "uul",
      sense: UNLABELED_SENSE,
      verified: false,
      source: "wmk-import",
    });
    expect(entry.candidates[1]).toEqual({
      traditional: "ᠠᠭᠤᠯᠠ",
      latin: "aɣula",
      sense: "mountain",
      verified: false,
      source: "wiktionary",
    });
    expect(stats.newCandidates).toBe(1);
    expect(isConflict(entry)).toBeTrue();
  });

  test("an identical form corroborates: single candidate, upgraded source", () => {
    const lexicon = new Map<string, Entry>([
      ["аав", { cyrillic: "аав", candidates: [{ traditional: "ᠠᠪᠤ", latin: "aav", verified: false, source: "wmk-import" }] }],
    ]);
    const stats = newMergeStats();
    mergeWord(lexicon, "аав", [{ traditional: "ᠠᠪᠤ", latin: "abu", sense: "father" }], stats);
    const entry = lexicon.get("аав")!;
    expect(entry.candidates).toHaveLength(1);
    expect(entry.candidates[0]).toEqual({
      traditional: "ᠠᠪᠤ",
      latin: "aav", // existing latin kept — only missing fields are adopted
      sense: "father", // adopted from Wiktionary because the seed had none
      verified: false,
      source: "wiktionary",
      corroborated: true,
    });
    expect(stats.corroborated).toBe(1);
    expect(isConflict(entry)).toBeFalse();
  });

  test("a real gloss replaces the 'unlabeled' placeholder of a candidate that is alone again", () => {
    // Left behind when a phantom conflict is resolved: the entry is single
    // again, so the label the schema once forced on it means nothing.
    const lexicon = new Map<string, Entry>([
      [
        "найр",
        {
          cyrillic: "найр",
          candidates: [
            { traditional: "ᠨᠠᠢᠷ", latin: "nayir", sense: UNLABELED_SENSE, verified: false, source: "wmk-import" },
          ],
        },
      ],
    ]);
    mergeWord(lexicon, "найр", [{ traditional: "ᠨᠠᠢᠷ", sense: "feast" }], newMergeStats());
    expect(lexicon.get("найр")!.candidates[0].sense).toBe("feast");
  });

  test("re-running the same merge changes nothing (idempotent, no self-corroboration)", () => {
    const lexicon = new Map<string, Entry>([["уул", wmkUul()]]);
    const drafts = [{ traditional: "ᠠᠭᠤᠯᠠ", sense: "mountain" }, { traditional: "ᠤᠤᠯ", sense: "original" }];
    mergeWord(lexicon, "уул", drafts, newMergeStats());
    const snapshot = structuredClone(lexicon.get("уул"));
    const stats2 = newMergeStats();
    mergeWord(lexicon, "уул", drafts, stats2);
    expect(lexicon.get("уул")).toEqual(snapshot!);
    expect(stats2).toEqual(newMergeStats());
    // and the corroborated flag from run 1 stayed (wmk agreed on ᠤᠤᠯ)
    expect(snapshot!.candidates.find((c) => c.traditional === "ᠤᠤᠯ")?.corroborated).toBeTrue();
  });

  test("verified candidates are never modified", () => {
    const verified = { traditional: "ᠠᠪᠤ", latin: "abu", sense: "father", verified: true, source: "manual" as const };
    const lexicon = new Map<string, Entry>([["аав", { cyrillic: "аав", candidates: [{ ...verified }] }]]);
    const stats = newMergeStats();
    mergeWord(lexicon, "аав", [{ traditional: "ᠠᠪᠤ", latin: "different", sense: "different" }], stats);
    expect(lexicon.get("аав")!.candidates[0]).toEqual(verified);
    expect(stats.verifiedUntouched).toBe(1);
    expect(stats.corroborated).toBe(0);
  });

  test("a differing form is held back when the verified candidate lacks a sense", () => {
    const verified = { traditional: "ᠠᠪᠤ", verified: true, source: "manual" as const };
    const lexicon = new Map<string, Entry>([["аав", { cyrillic: "аав", candidates: [{ ...verified }] }]]);
    const stats = newMergeStats();
    mergeWord(lexicon, "аав", [{ traditional: "ᠠᠪᠠᠢ", sense: "daddy" }], stats);
    expect(lexicon.get("аав")!.candidates).toEqual([verified]); // untouched, still valid
    expect(stats.blockedOnVerified).toEqual([{ cyrillic: "аав", traditional: "ᠠᠪᠠᠢ" }]);
  });
});

describe("helpers", () => {
  test("shortenGloss keeps short glosses verbatim and cuts long ones at a word", () => {
    expect(shortenGloss("schedule; timetable")).toBe("schedule; timetable");
    expect(shortenGloss("  spaced   out\tgloss ")).toBe("spaced out gloss");
    const long = shortenGloss(
      "Dative-locative case marker equating to to, at, or in in English. It is used to show the indirect object.",
    );
    expect(long.length).toBeLessThanOrEqual(81);
    expect(long.endsWith("…")).toBeTrue();
  });

  test("wiktionaryUrl follows the documented pattern", () => {
    expect(wiktionaryUrl("хуваарь")).toBe(
      "https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%B2%D0%B0%D0%B0%D1%80%D1%8C#Mongolian",
    );
  });
});
