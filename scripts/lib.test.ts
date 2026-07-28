/**
 * Unit tests for the encoding decisions data tooling applies mechanically.
 *
 * These are code-point tests on purpose (ENCODING.md ground rule 3): every
 * string below renders near-identically to its neighbour, so an eyeball test
 * of this file would pass while the data went wrong.
 */
import { describe, expect, test } from "bun:test";
import { normalizeYiDigraph } from "./lib.ts";

const cps = (s: string) =>
  [...s].map((ch) => "U+" + ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")).join(" ");

/** Written apart, spelled out: a literal NNBSP in source is invisible, and an
 *  ordinary space typed by mistake would silently weaken every test below. */
const NNBSP = " ";

describe("normalizeYiDigraph — Decision 001", () => {
  test("drops the ᠶ of a medial diphthong coda", () => {
    expect(cps(normalizeYiDigraph("сайн", "ᠰᠠᠶᠢᠨ"))).toBe("U+1830 U+1820 U+1822 U+1828");
    expect(normalizeYiDigraph("нийгэм", "ᠨᠡᠶᠢᠭᠡᠮ")).toBe("ᠨᠡᠢᠭᠡᠮ");
  });

  test("rewrites every occurrence in one form", () => {
    expect(normalizeYiDigraph("байгуулайх", "ᠪᠠᠶᠢᠭᠤᠯᠠᠶᠢᠬᠤ")).toBe("ᠪᠠᠢᠭᠤᠯᠠᠢᠬᠤ");
  });

  test("leaves a form that already follows the decision alone", () => {
    expect(normalizeYiDigraph("сайн", "ᠰᠠᠢᠨ")).toBe("ᠰᠠᠢᠨ");
  });

  test("keeps the word-initial glide of е/ё", () => {
    // ес → ᠶᠢᠰᠦ is correct; so is a й-carrying word that opens with the glide.
    expect(normalizeYiDigraph("ерөнхийлөгч", "ᠶᠢᠰᠦᠨ")).toBe("ᠶᠢᠰᠦᠨ");
  });

  test("keeps the suffix-initial glide after NNBSP — Decision 002", () => {
    expect(normalizeYiDigraph("дэлхийн", `ᠳᠡᠯᠡᠬᠡᠢ${NNBSP}ᠶᠢᠨ`)).toBe(`ᠳᠡᠯᠡᠬᠡᠢ${NNBSP}ᠶᠢᠨ`);
    expect(normalizeYiDigraph("үгийн", `ᠦᠭᠡ${NNBSP}ᠶᠢᠨ`)).toBe(`ᠦᠭᠡ${NNBSP}ᠶᠢᠨ`);
  });

  test("still fixes the stem of a word whose suffix keeps its ᠶ", () => {
    expect(normalizeYiDigraph("нийгмийн", `ᠨᠡᠶᠢᠭᠡᠮ${NNBSP}ᠶᠢᠨ`)).toBe(`ᠨᠡᠢᠭᠡᠮ${NNBSP}ᠶᠢᠨ`);
  });

  test("never touches a word whose Cyrillic has no й — out of D1's scope", () => {
    // The wmk converter's loanword artifacts and true glides both live here,
    // and both wait for a human ruling rather than a rewrite rule.
    expect(normalizeYiDigraph("клуб", "ᠺᠯᠤᠶᠢᠪ")).toBe("ᠺᠯᠤᠶᠢᠪ");
    expect(normalizeYiDigraph("хаяг", "ᠬᠠᠶᠢᠭ")).toBe("ᠬᠠᠶᠢᠭ");
    expect(normalizeYiDigraph("ес", "ᠶᠢᠰᠦ")).toBe("ᠶᠢᠰᠦ");
  });

  test("leaves the intervocalic glide of ᠢᠶᠠᠷ untouched — it is not the digraph", () => {
    expect(normalizeYiDigraph("гэрийгээр", `ᠭᠡᠷ${NNBSP}ᠢᠶᠡᠷ`)).toBe(`ᠭᠡᠷ${NNBSP}ᠢᠶᠡᠷ`);
  });

  test("is idempotent", () => {
    const once = normalizeYiDigraph("нийслэл", "ᠨᠡᠶᠢᠰᠯᠡᠯ");
    expect(normalizeYiDigraph("нийслэл", once)).toBe(once);
  });
});
