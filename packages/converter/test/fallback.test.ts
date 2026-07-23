import { describe, expect, test } from "bun:test";
import { FALLBACK_LETTER_MAP, transliterateFallback } from "../src/fallback.js";

const MONGOLIAN_ONLY_RE = /^[᠀-᢯ ]*$/u;

describe("fallback transliteration", () => {
  test("maps letter by letter", () => {
    expect(transliterateFallback("бат")).toBe("ᠪᠠᠲ");
    expect(transliterateFallback("эх")).toBe("ᠡᠬ");
  });

  test("covers the full Mongolian Cyrillic alphabet", () => {
    const alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюяөү";
    for (const letter of alphabet) {
      expect(FALLBACK_LETTER_MAP).toContainKey(letter);
    }
    expect(Object.keys(FALLBACK_LETTER_MAP).length).toBe([...alphabet].length);
  });

  test("iotated vowels expand to ᠶ + vowel", () => {
    expect(transliterateFallback("е")).toBe("ᠶᠡ");
    expect(transliterateFallback("юм")).toBe("ᠶᠤᠮ");
  });

  test("hard sign is dropped; may produce empty output", () => {
    expect(transliterateFallback("аъа")).toBe("ᠠᠠ");
    expect(transliterateFallback("ъ")).toBe("");
  });

  test("output stays inside standard Unicode Mongolian ranges", () => {
    for (const word of ["бвгджз", "щёлк", "пүрэвжаргалын", "ъыь"]) {
      expect(transliterateFallback(word)).toMatch(MONGOLIAN_ONLY_RE);
    }
    for (const mapped of Object.values(FALLBACK_LETTER_MAP)) {
      expect(mapped).toMatch(MONGOLIAN_ONLY_RE);
    }
  });

  test("normalizes before mapping (case, NFC)", () => {
    expect(transliterateFallback("БАТ")).toBe(transliterateFallback("бат"));
    expect(transliterateFallback("сайн")).toBe(transliterateFallback("сайн"));
  });
});
