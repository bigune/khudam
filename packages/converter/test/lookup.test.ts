import { describe, expect, test } from "bun:test";
import { LEXICON_ENTRY_COUNT } from "../src/generated/lexicon.js";
import { decodeCandidates, lookupWord, type CompactCandidate } from "../src/lookup.js";

describe("lookupWord", () => {
  test("finds a known word from the imported data", () => {
    const candidates = lookupWord("аав");
    expect(candidates).toBeArrayOfSize(1);
    expect(candidates[0]).toEqual({
      traditional: "ᠠᠪᠤ",
      latin: "aav",
      verified: false,
      source: "wmk-import",
    });
  });

  test("normalizes uppercase input", () => {
    expect(lookupWord("ААВ")).toEqual(lookupWord("аав"));
    expect(lookupWord("Уул")).toEqual(lookupWord("уул"));
  });

  test("normalizes decomposed (non-NFC) input", () => {
    // сайн with й typed as и + combining breve
    expect(lookupWord("сайн")).toEqual(lookupWord("сайн"));
    expect(lookupWord("сайн")).not.toBeEmpty();
  });

  test("returns an empty array for unknown words — never a guess", () => {
    expect(lookupWord("бвгджз")).toEqual([]);
    expect(lookupWord("")).toEqual([]);
    expect(lookupWord("hello")).toEqual([]);
  });

  test("always returns an array (ambiguity-ready shape)", () => {
    for (const word of ["уул", "аав", "байхгүйүг"]) {
      expect(Array.isArray(lookupWord(word))).toBeTrue();
    }
  });

  test("the compiled lexicon actually shipped", () => {
    expect(LEXICON_ENTRY_COUNT).toBeGreaterThan(20000);
  });
});

describe("decodeCandidates (ambiguous entries)", () => {
  test("a one-to-many entry decodes into multiple labeled candidates", () => {
    // Synthetic fixture in the compiled format: the уул homonym pair from
    // README. The imported data does not carry it yet — this pins the shape.
    const rows: CompactCandidate[] = [
      ["ᠠᠭᠤᠯᠠ", "agula", "mountain", 1, "m"],
      ["ᠤᠤᠯ", "uul", "original", 0, "w"],
    ];
    const decoded = decodeCandidates(rows);
    expect(decoded).toBeArrayOfSize(2);
    expect(decoded[0]).toEqual({
      traditional: "ᠠᠭᠤᠯᠠ",
      latin: "agula",
      sense: "mountain",
      verified: true,
      source: "manual",
    });
    expect(decoded[1]).toEqual({
      traditional: "ᠤᠤᠯ",
      latin: "uul",
      sense: "original",
      verified: false,
      source: "wmk-import",
    });
  });

  test("wiktionary source code decodes to its full name", () => {
    const [c] = decodeCandidates([["ᠬᠤᠪᠢᠶᠠᠷᠢ", "qubiyari", "schedule; timetable", 0, "k"]]);
    expect(c.source).toBe("wiktionary");
    expect(c.verified).toBeFalse();
  });

  test("empty latin/sense fields are omitted, not empty strings", () => {
    const [c] = decodeCandidates([["ᠠᠪᠤ", "", "", 0, "w"]]);
    expect(c).toEqual({ traditional: "ᠠᠪᠤ", verified: false, source: "wmk-import" });
    expect("latin" in c).toBeFalse();
    expect("sense" in c).toBeFalse();
  });
});
