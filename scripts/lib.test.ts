/**
 * Unit tests for the encoding decisions data tooling applies mechanically.
 *
 * These are code-point tests on purpose (ENCODING.md ground rule 3): every
 * string below renders near-identically to its neighbour, so an eyeball test
 * of this file would pass while the data went wrong.
 */
import { describe, expect, test } from "bun:test";
import { hashGrant, normalizeYiDigraph, reviewerLabelOf } from "./lib.ts";

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

describe("reviewer grants", () => {
  const GRANT = "c51f2be7-6ba8-47d0-9a1c-9334dfc8338b";
  const roster = [{ label: "r1", hash: hashGrant(GRANT), granted: "2026-07-29" }];

  test("a grant hashes to 64 hex characters, and never back", () => {
    expect(hashGrant(GRANT)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashGrant(GRANT)).not.toContain(GRANT);
  });

  test("the same grant always hashes the same, whatever the link did to its case", () => {
    expect(hashGrant(GRANT.toUpperCase())).toBe(hashGrant(GRANT));
    expect(hashGrant(` ${GRANT}\n`)).toBe(hashGrant(GRANT));
  });

  test("two grants do not collide", () => {
    expect(hashGrant("c51f2be7-6ba8-47d0-9a1c-9334dfc8338c")).not.toBe(hashGrant(GRANT));
  });

  test("a grant on the roster resolves to its label", () => {
    expect(reviewerLabelOf(GRANT, roster)).toBe("r1");
  });

  test("an unstamped row is anonymous", () => {
    expect(reviewerLabelOf(null, roster)).toBeUndefined();
    expect(reviewerLabelOf(undefined, roster)).toBeUndefined();
  });

  test("a stamp nobody was granted is anonymous, not trusted", () => {
    expect(reviewerLabelOf("c51f2be7-6ba8-47d0-9a1c-000000000000", roster)).toBeUndefined();
  });

  test("a revoked grant stops counting the moment its line is deleted", () => {
    // This is what makes a leaked link recoverable: revocation reaches
    // backwards through the ledger, not just forwards.
    expect(reviewerLabelOf(GRANT, [])).toBeUndefined();
  });

  test("a stamp that is not a uuid is rejected before it is hashed", () => {
    expect(reviewerLabelOf("trust-me", roster)).toBeUndefined();
    expect(reviewerLabelOf("", roster)).toBeUndefined();
  });
});
