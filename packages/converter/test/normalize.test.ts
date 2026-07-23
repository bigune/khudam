import { describe, expect, test } from "bun:test";
import { normalizeWord } from "../src/normalize.js";

describe("normalizeWord", () => {
  test("lowercases", () => {
    expect(normalizeWord("УУЛ")).toBe("уул");
    expect(normalizeWord("Аав")).toBe("аав");
  });

  test("trims surrounding whitespace", () => {
    expect(normalizeWord("  уул\t")).toBe("уул");
  });

  test("composes decomposed characters to NFC", () => {
    // й typed as и + combining breve, ё as е + combining diaeresis
    expect(normalizeWord("сайн")).toBe("сайн");
    expect(normalizeWord("ёс")).toBe("ёс");
  });

  test("uppercase decomposed input normalizes too", () => {
    expect(normalizeWord("САЙН")).toBe("сайн");
  });
});
