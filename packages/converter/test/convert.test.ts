import { describe, expect, test } from "bun:test";
import { convertText, lookupWord } from "../src/index.js";

describe("convertText", () => {
  test("splits words and separators, converting known words", () => {
    const tokens = convertText("сайн байна уу");
    expect(tokens.map((t) => t.input)).toEqual(["сайн", " ", "байна", " ", "уу"]);
    for (const t of [tokens[0], tokens[2], tokens[4]]) {
      expect(t.fallback).toBeFalse();
      expect(t.candidates.length).toBeGreaterThan(0);
      expect(t.candidates[0].source).toBe("wmk-import");
    }
    expect(tokens[1].candidates).toEqual([]);
  });

  test("concatenated token inputs reconstruct the (NFC) input", () => {
    const text = "Сайн уу? 123 hello, аав!";
    const tokens = convertText(text);
    expect(tokens.map((t) => t.input).join("")).toBe(text.normalize("NFC"));
  });

  test("preserves punctuation and non-Cyrillic runs as separators", () => {
    const tokens = convertText("аав, ээж! ok 42");
    const separators = tokens.filter((t) => t.candidates.length === 0);
    expect(separators.map((t) => t.input)).toEqual([", ", "! ok 42"]);
    for (const s of separators) expect(s.fallback).toBeFalse();
  });

  test("uppercase words hit the lexicon via normalization", () => {
    const [token] = convertText("Аав");
    expect(token.input).toBe("Аав");
    expect(token.fallback).toBeFalse();
    expect(token.candidates).toEqual(lookupWord("аав"));
  });

  test("unknown words fall back to transliteration, clearly flagged", () => {
    const [token] = convertText("бвгджз");
    expect(token.fallback).toBeTrue();
    expect(token.candidates).toBeArrayOfSize(1);
    expect(token.candidates[0].source).toBe("fallback");
    expect(token.candidates[0].verified).toBeFalse();
    expect(token.candidates[0].traditional).toMatch(/^[᠀-᢯ ]+$/u);
  });

  test("a word that transliterates to nothing yields no candidates, no flag", () => {
    const [token] = convertText("ъ");
    expect(token.candidates).toEqual([]);
    expect(token.fallback).toBeFalse();
  });

  test("fallback output is NEVER disguised as dictionary output", () => {
    const tokens = convertText("аав бвгджз уул мвкртп, сайн!");
    expect(tokens.some((t) => t.fallback)).toBeTrue();
    expect(tokens.some((t) => !t.fallback && t.candidates.length > 0)).toBeTrue();
    for (const token of tokens) {
      if (token.fallback) {
        // every fallback candidate says so, and none claims verification
        for (const c of token.candidates) {
          expect(c.source).toBe("fallback");
          expect(c.verified).toBeFalse();
        }
        expect(token.candidates.length).toBeGreaterThan(0);
      } else {
        // dictionary tokens never smuggle fallback candidates
        for (const c of token.candidates) {
          expect(c.source).not.toBe("fallback");
        }
      }
    }
    // and direct lookup never falls back at all
    expect(lookupWord("бвгджз")).toEqual([]);
  });

  test("empty and non-Cyrillic input", () => {
    expect(convertText("")).toEqual([]);
    const tokens = convertText("hello world");
    expect(tokens).toBeArrayOfSize(1);
    expect(tokens[0].candidates).toEqual([]);
    expect(tokens[0].fallback).toBeFalse();
  });
});
