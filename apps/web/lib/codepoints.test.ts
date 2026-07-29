import { describe, expect, test } from "bun:test";
import { breakDown, spellOut } from "./codepoints";

/** Built from code points, never typed: NNBSP and the selectors are invisible
 *  in source, and a test that contains them literally pins nothing a reviewer
 *  can check. */
const NNBSP = String.fromCodePoint(0x202f);
const FVS1 = String.fromCodePoint(0x180b);
const MVS = String.fromCodePoint(0x180e);
const NIRUGU = String.fromCodePoint(0x180a);

describe("breakDown", () => {
  test("names the letters of a word", () => {
    // ᠠᠭᠤᠯᠠ — agula, "mountain": a · ga · u · la · a. The final ᠠ is easy to
    // miss by eye and impossible to miss here, which is the point.
    expect(spellOut("ᠠᠭᠤᠯᠠ")).toBe("A GA U LA A");
  });

  test("gives the code point as identity and the name as courtesy", () => {
    expect(breakDown("ᠠ")).toEqual([
      { code: "U+1820", name: "A", invisible: false },
    ]);
  });

  test("distinguishes the pairs a font draws identically", () => {
    // The whole reason this module exists. ᠣ/ᠤ and ᠥ/ᠦ are separate letters
    // that share a glyph in most positions, so a reviewer shown only the
    // rendered word cannot tell a right encoding from a wrong one.
    expect(spellOut("ᠣ")).toBe("O");
    expect(spellOut("ᠤ")).toBe("U");
    expect(spellOut("ᠥ")).toBe("OE");
    expect(spellOut("ᠦ")).toBe("UE");
  });

  test("marks what has no shape at all in the rendered word", () => {
    // Where a wrong encoding hides: two spellings differing only in one of
    // these are identical on screen, so the page has to point at them.
    expect(breakDown(FVS1)[0]).toEqual({ code: "U+180B", name: "FVS1", invisible: true });
    expect(breakDown(MVS)[0]!.invisible).toBe(true);
    expect(breakDown(NNBSP)[0]).toEqual({
      code: "U+202F",
      name: "NNBSP",
      invisible: true,
    });
  });

  test("does not mark nirugu — it draws a bar, unlike the selectors", () => {
    expect(breakDown(NIRUGU)[0]).toEqual({
      code: "U+180A",
      name: "NIRUGU",
      invisible: false,
    });
  });

  test("shows the joiner that makes a written-apart suffix a suffix", () => {
    // ᠨᠣᠮ ᠤᠨ — nom-un, the genitive of "book". Without the NNBSP this is one
    // word, and nothing on screen would say which it was.
    expect(spellOut(`ᠨᠣᠮ${NNBSP}ᠤᠨ`)).toBe("NA O MA NNBSP U NA");
  });

  test("falls back to the hex where there is no name to give", () => {
    // U+181A is unassigned. The validator lets it through — its check is the
    // block, not the letter — so the page has to be able to render it.
    const unassigned = String.fromCodePoint(0x181a);
    expect(breakDown(unassigned)).toEqual([{ code: "U+181A", invisible: false }]);
    expect(spellOut(unassigned)).toBe("U+181A");
  });

  test("names digits by their value", () => {
    expect(spellOut("᠑᠐")).toBe("1 0");
  });

  test("returns nothing for an empty spelling rather than throwing", () => {
    expect(breakDown("")).toEqual([]);
    expect(spellOut("")).toBe("");
  });
});
