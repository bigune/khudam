import { describe, expect, test } from "bun:test";
import { buildDecisionRow, cleanLabel, type Decision } from "./decisions";

const GRANT = "c51f2be7-6ba8-47d0-9a1c-9334dfc8338b";
/** NNBSP U+202F, which joins a written-apart suffix to its stem. Built from
 *  its code point: an invisible character in a test pins nothing reviewable. */
const NNBSP = String.fromCodePoint(0x202f);

function decision(over: Partial<Decision> = {}): Decision {
  return { cyrillic: "уул", traditional: "ᠠᠭᠤᠯᠠ", action: "verify", ...over };
}

describe("buildDecisionRow", () => {
  test("carries the spelling being judged and the grant that judged it", () => {
    expect(buildDecisionRow(decision(), GRANT)).toEqual({
      cyrillic: "уул",
      traditional: "ᠠᠭᠤᠯᠠ",
      action: "verify",
      reviewer_id: GRANT,
    });
  });

  test("normalizes the Cyrillic key the way every other row is normalized", () => {
    // Aggregation looks the spelling up by this key weeks later. A row keyed
    // on "Уул" would find nothing and be discarded without a word to anyone.
    expect(buildDecisionRow(decision({ cyrillic: "Уул" }), GRANT)!.cyrillic).toBe("уул");
  });

  test("keeps the joiner in a written-apart suffix", () => {
    const composed = `ᠨᠣᠮ${NNBSP}ᠤᠨ`;
    const row = buildDecisionRow(
      decision({ cyrillic: "номын", traditional: composed, action: "accept_proposal" }),
      GRANT,
    );
    expect(row!.traditional).toBe(composed);
  });

  test("attaches a meaning label to an accepted proposal", () => {
    const row = buildDecisionRow(
      decision({ action: "accept_proposal", sense: "  mountain  " }),
      GRANT,
    );
    expect(row!.sense).toBe("mountain");
  });

  test("drops a label from anything but an accepted proposal", () => {
    // `decisions_sense_shape` allows one only there. Dropping it here keeps
    // the constraint a description of the design rather than something the
    // client trips over — and a rejected insert would take the whole session
    // of judgements down with it.
    for (const action of ["verify", "reject"] as const) {
      const row = buildDecisionRow(decision({ action, sense: "mountain" }), GRANT);
      expect("sense" in row!).toBe(false);
    }
  });

  test("omits an empty label rather than sending a blank one", () => {
    const row = buildDecisionRow(
      decision({ action: "accept_proposal", sense: "   " }),
      GRANT,
    );
    expect("sense" in row!).toBe(false);
  });

  test("refuses a spelling that is not монгол бичиг", () => {
    // The database would refuse it too — as one statement, taking every other
    // judgement in the batch with it. Checking here costs one dropped row.
    expect(buildDecisionRow(decision({ traditional: "uul" }), GRANT)).toBeUndefined();
    expect(buildDecisionRow(decision({ traditional: "ᠨᠣᠮ ᠤᠨ" }), GRANT)).toBeUndefined();
    expect(buildDecisionRow(decision({ traditional: "" }), GRANT)).toBeUndefined();
  });

  test("refuses a grant that is not a uuid", () => {
    // reviewer_id is a uuid column, so one malformed value makes Postgres
    // reject the insert — and localStorage is writable by anything on the page.
    expect(buildDecisionRow(decision(), "trust-me")).toBeUndefined();
    expect(buildDecisionRow(decision(), `${GRANT}';drop table decisions;--`)).toBeUndefined();
  });

  test("refuses a word that normalizes to nothing", () => {
    expect(buildDecisionRow(decision({ cyrillic: "   " }), GRANT)).toBeUndefined();
  });
});

describe("cleanLabel", () => {
  test("keeps a label in either script", () => {
    expect(cleanLabel("mountain")).toBe("mountain");
    expect(cleanLabel("уул, өндөрлөг")).toBe("уул, өндөрлөг");
  });

  test("strips what a paste carries in, rather than rejecting the label", () => {
    const zwsp = String.fromCodePoint(0x200b);
    expect(cleanLabel(`mountain${zwsp}\tзөв`)).toBe("mountain зөв");
  });

  test("returns nothing for a blank label or none at all", () => {
    expect(cleanLabel("   ")).toBeUndefined();
    expect(cleanLabel(undefined)).toBeUndefined();
  });

  test("caps at the length the column accepts", () => {
    expect(cleanLabel("a".repeat(250))).toHaveLength(200);
  });
});
