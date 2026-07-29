/**
 * Reading монгол бичиг by code point, for the expert review page.
 *
 * This exists because of the one property of traditional Mongolian that makes
 * every other quality control insufficient: **several distinct letters share
 * identical glyphs**. ᠣ and ᠤ, ᠥ and ᠦ, ᠭ and ᠬ in some positions — a font
 * draws them the same, so a wrong encoding renders as a right word. A reviewer
 * shown only the rendered form can therefore confirm a spelling that is wrong,
 * in perfect good faith, and nothing downstream would ever catch it: the
 * validator checks that code points are inside the Mongolian block, not that
 * they are the intended ones, and a diff renders nothing at all.
 *
 * So the page never shows a spelling without this beside it. It is not a
 * debugging aid or a power-user affordance — it is the only thing on the page
 * that distinguishes two spellings the eye cannot.
 */

/**
 * Unicode names for U+1820–U+1842, with the "MONGOLIAN LETTER " prefix cut.
 *
 * Indexed from U+1820, so position is identity — a name inserted or dropped
 * shifts every letter after it. Transcribed from Python's `unicodedata` rather
 * than from memory, because a plausible-looking wrong name here would be worse
 * than no name: it would read as authoritative to the one reader who cannot
 * check it against the glyph.
 */
const LETTERS = [
  "A", "E", "I", "O", "U", "OE", "UE", "EE",
  "NA", "ANG", "BA", "PA", "QA", "GA", "MA", "LA",
  "SA", "SHA", "TA", "DA", "CHA", "JA", "YA", "RA",
  "WA", "FA", "KA", "KHA", "TSA", "ZA", "HAA", "ZRA",
  "LHA", "ZHI", "CHI",
];

/**
 * The controls and marks that carry orthography without carrying a glyph.
 *
 * These matter more than the letters, not less. An FVS selects which shape a
 * letter takes and is invisible; MVS separates a final vowel and is invisible;
 * NNBSP is what makes a written-apart suffix a suffix rather than part of the
 * stem. Two spellings differing only in one of these look completely identical
 * on screen, which is precisely the case this module exists for.
 */
const MARKS = new Map<number, string>([
  [0x1800, "BIRGA"],
  [0x1801, "ELLIPSIS"],
  [0x1802, "COMMA"],
  [0x1803, "FULL STOP"],
  [0x1804, "COLON"],
  [0x1805, "FOUR DOTS"],
  [0x1806, "TODO SOFT HYPHEN"],
  [0x1807, "SIBE SYLLABLE BOUNDARY"],
  [0x1808, "MANCHU COMMA"],
  [0x1809, "MANCHU FULL STOP"],
  [0x180a, "NIRUGU"],
  [0x180b, "FVS1"],
  [0x180c, "FVS2"],
  [0x180d, "FVS3"],
  [0x180e, "MVS"],
  [0x180f, "FVS4"],
  [0x202f, "NNBSP"],
]);

/**
 * One code point of a spelling, ready to render as a column under the word.
 *
 * Deliberately carries no character to display. A Mongolian letter shown on its
 * own renders in its **isolated** form, which is a different shape from the
 * initial, medial or final form the same letter takes inside a word — so a row
 * of isolated glyphs beneath a word does not help a reader match one to the
 * other, and quietly suggests a shape that is not there. The name and the code
 * point are the two facts that cannot mislead, and they are what this carries.
 */
export interface Glyph {
  /** `U+1820`. Always present: it is the identity, the name is the courtesy. */
  code: string;
  /** A short label — `A`, `FVS1`, `NNBSP` — or undefined for an unassigned
   *  code point, where the hex is the only honest thing to say. */
  name?: string;
  /** Whether this code point has no shape at all in the rendered word. The
   *  page marks these: they are the differences a reader cannot see, so they
   *  are the ones a wrong encoding hides behind. */
  invisible: boolean;
}

/**
 * True for code points that carry meaning without carrying a shape.
 *
 * FVS1–4 (one contiguous range only because FVS4 was added at U+180F in
 * Unicode 14, directly after the first three), MVS, and NNBSP. Deliberately
 * NOT nirugu: it draws a joining bar, so blanking it would hide something the
 * reader can actually see. It still gets its name from `MARKS` — a stray
 * nirugu is a real defect in this data, but it is a visible one.
 */
function isInvisible(cp: number): boolean {
  return (cp >= 0x180b && cp <= 0x180f) || cp === 0x202f;
}

/**
 * A spelling, one code point per entry, in logical order.
 *
 * Iterates by code point rather than by UTF-16 unit. Everything in the
 * Mongolian block is a single unit today, so this changes nothing now — and it
 * is the difference between a correct breakdown and two halves of a surrogate
 * pair the day anything outside the BMP arrives.
 */
export function breakDown(traditional: string): Glyph[] {
  const glyphs: Glyph[] = [];
  for (const ch of traditional) {
    const cp = ch.codePointAt(0)!;
    const name =
      cp >= 0x1820 && cp < 0x1820 + LETTERS.length
        ? LETTERS[cp - 0x1820]
        : cp >= 0x1810 && cp <= 0x1819
          ? String(cp - 0x1810)
          : MARKS.get(cp);
    glyphs.push({
      code: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
      ...(name === undefined ? {} : { name }),
      invisible: isInvisible(cp),
    });
  }
  return glyphs;
}

/**
 * The same thing as one line of text, for a screen reader and for anywhere a
 * column layout will not fit.
 *
 * Names rather than hex where a name exists: "A GA U LA" is something a
 * reviewer can hold in their head against the word they expect, and
 * "U+1820 U+182D U+1824 U+182F" is not.
 */
export function spellOut(traditional: string): string {
  return breakDown(traditional)
    .map((g) => g.name ?? g.code)
    .join(" ");
}
