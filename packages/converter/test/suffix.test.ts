import { describe, expect, test } from "bun:test";
import { convertText, decomposeWord, lookupWord } from "../src/index.js";
import { SUFFIX_COUNT } from "../src/generated/suffixes.js";
import { stemGender } from "../src/suffix.js";

const NNBSP = " ";

describe("decomposeWord", () => {
  test("splits a known stem + suffix, joined by NNBSP", () => {
    const [c] = decomposeWord("номын");
    expect(c.traditional).toBe(`ᠨᠣᠮ${NNBSP}ᠤᠨ`);
    expect(c.sense).toBe("genitive");
    expect(c.source).toBe("suffix-rule");
    expect(c.verified).toBeFalse();
    expect(c.latin).toBe("nom-un");
  });

  test("conditions test the TRADITIONAL stem, not the Cyrillic surface", () => {
    // багш ends in a consonant, but ᠪᠠᠭᠰᠢ ends in the vowel ᠢ →
    // vowel-form accusative ᠶᠢ, and never the consonant-form ᠢ.
    const forms = decomposeWord("багшийг").map((c) => c.traditional);
    expect(forms).toContain(`ᠪᠠᠭᠰᠢ${NNBSP}ᠶᠢ`);
    expect(forms).not.toContain(`ᠪᠠᠭᠰᠢ${NNBSP}ᠢ`);
  });

  test("feminine consonant-final stem takes the feminine variant", () => {
    expect(decomposeWord("хөлийн").map((c) => c.traditional)).toEqual([`ᠬᠥᠯ${NNBSP}ᠦᠨ`]);
    expect(decomposeWord("гэрт").map((c) => c.traditional)).toEqual([`ᠭᠡᠷ${NNBSP}ᠲᠦ`]);
  });

  test("restores a dropped final ь before и-initial suffixes (G11)", () => {
    expect(decomposeWord("морийг").map((c) => c.traditional)).toEqual([`ᠮᠣᠷᠢ${NNBSP}ᠶᠢ`]);
    expect(decomposeWord("сургуулийн").map((c) => c.traditional)).toEqual([`ᠰᠤᠷᠭᠠᠭᠤᠯᠢ${NNBSP}ᠶᠢᠨ`]);
  });

  test("genitive ᠤ after н-final stems, ᠶᠢᠨ after vowel-final stems", () => {
    expect(decomposeWord("хааны").map((c) => c.traditional)).toEqual([`ᠬᠠᠭᠠᠨ${NNBSP}ᠤ`]);
    expect(decomposeWord("далайн").map((c) => c.traditional)).toEqual([`ᠳᠠᠯᠠᠢ${NNBSP}ᠶᠢᠨ`]);
  });

  test("gender-neutral stems (only ᠢ) emit BOTH variants — never a silent pick", () => {
    const forms = decomposeWord("бичигт").map((c) => c.traditional);
    expect(forms).toContain(`ᠪᠢᠴᠢᠭ${NNBSP}ᠲᠤ`);
    expect(forms).toContain(`ᠪᠢᠴᠢᠭ${NNBSP}ᠲᠦ`);
    expect(forms).toBeArrayOfSize(2);
  });

  test("chains two suffixes in slot order (G12)", () => {
    expect(decomposeWord("гэртээ").map((c) => c.traditional)).toContain(`ᠭᠡᠷ${NNBSP}ᠲᠦ${NNBSP}ᠪᠡᠨ`);
    expect(decomposeWord("номуудыг").map((c) => c.traditional)).toContain(`ᠨᠣᠮ${NNBSP}ᠤᠳ${NNBSP}ᠢ`);
  });

  test("the second suffix's attach condition reads the first suffix, not the stem (G12)", () => {
    // ᠭᠡᠷ ends in a consonant, but the reflexive follows ᠲᠦ, which ends in a
    // vowel — so it takes the vowel form ᠪᠡᠨ and never the consonant form ᠢᠶᠡᠨ.
    const forms = decomposeWord("гэртээ").map((c) => c.traditional);
    expect(forms).toContain(`ᠭᠡᠷ${NNBSP}ᠲᠦ${NNBSP}ᠪᠡᠨ`);
    expect(forms).not.toContain(`ᠭᠡᠷ${NNBSP}ᠲᠦ${NNBSP}ᠢᠶᠡᠨ`);
  });

  test("two suffixes from the same slot never stack (G12)", () => {
    // номын must not also be offered as ном + ы + н, two genitives in a row.
    for (const c of decomposeWord("номын")) {
      expect(c.traditional.split(NNBSP)).toBeArrayOfSize(2);
    }
  });

  test("one-suffix readings are offered before two-suffix ones", () => {
    const units = decomposeWord("гэртээ").map((c) => c.traditional.split(NNBSP).length);
    expect(units).toEqual([...units].sort((a, b) => a - b));
  });

  test("restores a fleeting vowel to find the stem (G13)", () => {
    expect(decomposeWord("бичгийн").map((c) => c.traditional)).toEqual([`ᠪᠢᠴᠢᠭ${NNBSP}ᠦᠨ`]);
    expect(decomposeWord("бичгээр").map((c) => c.traditional)).toEqual([`ᠪᠢᠴᠢᠭ${NNBSP}ᠢᠶᠡᠷ`]);
    expect(decomposeWord("ажлаа").map((c) => c.traditional)).toContain(`ᠠᠵᠢᠯ${NNBSP}ᠢᠶᠠᠨ`);
  });

  test("the restored vowel must harmonize with the stem (G13)", () => {
    // хавр is a back-vowel stem, so хавар is reachable and хавир is not the
    // first answer — harmony decides the order, the lexicon decides existence.
    const [first] = decomposeWord("хаврын");
    expect(first.traditional).toBe(`ᠬᠠᠪᠤᠷ${NNBSP}ᠤᠨ`);
    expect(decomposeWord("өвлийн")[0].traditional).toBe(`ᠡᠪᠦᠯ${NNBSP}ᠦᠨ`);
  });

  test("a fleeting vowel and a chain compose (G12 + G13)", () => {
    expect(decomposeWord("бичгүүдийн").map((c) => c.traditional)).toContain(
      `ᠪᠢᠴᠢᠭ${NNBSP}ᠦᠳ${NNBSP}ᠦᠨ`,
    );
  });

  test("two real stems behind one mutated surface are both offered (G13)", () => {
    // сандл is сандал (chair) or сандил — the reader chooses, not the rule.
    const forms = decomposeWord("сандлын").map((c) => c.traditional.split(NNBSP)[0]);
    expect(new Set(forms).size).toBeGreaterThan(1);
  });

  test("privative after a consonant-final stem is the written-apart ᠦᠭᠡᠢ (G14)", () => {
    expect(decomposeWord("номгүй").map((c) => c.traditional)).toContain(`ᠨᠣᠮ${NNBSP}ᠦᠭᠡᠢ`);
    expect(decomposeWord("бичиггүй").map((c) => c.traditional)).toContain(`ᠪᠢᠴᠢᠭ${NNBSP}ᠦᠭᠡᠢ`);
    expect(decomposeWord("ааггүй").map((c) => c.traditional)).toContain(`ᠠᠭᠠᠭ${NNBSP}ᠦᠭᠡᠢ`);
  });

  test("privative is written apart after a vowel-final stem too (G14)", () => {
    // mongoltoli.mn writes ус as ᠤᠰᠤ ᠦᠭᠡᠶ — vowel-final and still apart, which
    // is why the rule carries no attach condition.
    expect(decomposeWord("усгүй").map((c) => c.traditional)).toContain(`ᠤᠰᠤ${NNBSP}ᠦᠭᠡᠢ`);
  });

  test("lexicalized privatives come from the lexicon, not the rule (G14)", () => {
    // аальгүй "improper" and хичээнгүй "diligent" are written joined because
    // they are words, not compositions. An exact match keeps the rule out.
    for (const word of ["аальгүй", "хичээнгүй"]) {
      const [entry] = lookupWord(word);
      expect(entry).toBeDefined();
      expect(entry.traditional.includes(NNBSP)).toBeFalse();
      expect(convertText(word)[0].candidates[0].source).not.toBe("suffix-rule");
    }
  });

  test("privative sits between plural and possessive (G14)", () => {
    expect(decomposeWord("бичгүүдгүй").map((c) => c.traditional)).toContain(
      `ᠪᠢᠴᠢᠭ${NNBSP}ᠦᠳ${NNBSP}ᠦᠭᠡᠢ`,
    );
    expect(decomposeWord("бичиггүйгээ").map((c) => c.traditional)).toContain(
      `ᠪᠢᠴᠢᠭ${NNBSP}ᠦᠭᠡᠢ${NNBSP}ᠪᠡᠨ`,
    );
  });

  test("substantive -х follows a genitive as ᠬᠢ (G15)", () => {
    expect(decomposeWord("номынх").map((c) => c.traditional)).toContain(`ᠨᠣᠮ${NNBSP}ᠤᠨ${NNBSP}ᠬᠢ`);
    expect(decomposeWord("багшийнх").map((c) => c.traditional)).toContain(
      `ᠪᠠᠭᠰᠢ${NNBSP}ᠶᠢᠨ${NNBSP}ᠬᠢ`,
    );
  });

  test("substantive -х never opens a chain, so verbs in -х stay whole (G15)", () => {
    // Every Mongolian infinitive ends in -х. None of them is a substantive.
    for (const verb of ["харих", "явах", "бичих", "сурах"]) {
      expect(decomposeWord(verb)).toEqual([]);
    }
  });

  test("derivational suffixes never decompose — rules do not spell stems", () => {
    // өвлийн is ᠡᠪᠦᠯ + genitive, never ᠥᠪ + the noun-forming -л + genitive.
    for (const c of decomposeWord("өвлийн")) {
      expect(c.traditional.startsWith("ᠡᠪᠦᠯ")).toBeTrue();
    }
  });

  test("unknown stems produce nothing — decomposition never guesses stems", () => {
    expect(decomposeWord("бвгджзын")).toEqual([]);
    expect(decomposeWord("ын")).toEqual([]); // a bare suffix is not a split
    expect(decomposeWord("")).toEqual([]);
  });

  test("composed candidates are never verified while their parts are unverified", () => {
    for (const word of ["номын", "гэрт", "багшийг"]) {
      for (const c of decomposeWord(word)) expect(c.verified).toBeFalse();
    }
  });

  test("the compiled suffix table actually shipped", () => {
    expect(SUFFIX_COUNT).toBeGreaterThan(40);
  });
});

describe("encoding pins (data/ENCODING.md Decision 002)", () => {
  test("suffix-initial glide keeps U+1836: багшийн → …ᠶᠢᠨ", () => {
    const [c] = decomposeWord("багшийн");
    expect(c.traditional.endsWith(`${NNBSP}ᠶᠢᠨ`)).toBeTrue();
  });

  test("diphthong coda inside a suffix stays single ᠢ (Decision 001): номтой → …ᠲᠠᠢ", () => {
    const [c] = decomposeWord("номтой");
    expect(c.traditional.endsWith(`${NNBSP}ᠲᠠᠢ`)).toBeTrue();
    expect(c.traditional.includes("ᠶ")).toBeFalse();
  });

  test("intervocalic glide keeps U+1836: гэрээр → …ᠢᠶᠡᠷ", () => {
    const [c] = decomposeWord("гэрээр");
    expect(c.traditional.endsWith(`${NNBSP}ᠢᠶᠡᠷ`)).toBeTrue();
  });
});

describe("stemGender", () => {
  test("classifies by traditional vowels, ᠢ-only stems are neutral", () => {
    expect(stemGender("ᠨᠣᠮ")).toBe("masculine");
    expect(stemGender("ᠭᠡᠷ")).toBe("feminine");
    expect(stemGender("ᠪᠢᠴᠢᠭ")).toBe("neutral");
  });
});

describe("convertText with the suffix engine", () => {
  test("an inflected word converts without falling back", () => {
    const [token] = convertText("Багшийн");
    expect(token.fallback).toBeFalse();
    expect(token.candidates[0].source).toBe("suffix-rule");
    expect(token.candidates[0].traditional).toBe(`ᠪᠠᠭᠰᠢ${NNBSP}ᠶᠢᠨ`);
  });

  test("an exact lexicon match always outranks decomposition", () => {
    // авралт is a headword AND splits as аврал + т; the dictionary entry wins.
    expect(lookupWord("авралт")).not.toBeEmpty();
    const [token] = convertText("авралт");
    expect(token.candidates).toEqual(lookupWord("авралт"));
    for (const c of token.candidates) expect(c.source).not.toBe("suffix-rule");
  });

  test("words that neither match nor decompose still fall back, clearly flagged", () => {
    const [token] = convertText("бвгджз");
    expect(token.fallback).toBeTrue();
    expect(token.candidates[0].source).toBe("fallback");
  });
});
