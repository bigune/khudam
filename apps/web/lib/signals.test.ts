import { describe, expect, test } from "bun:test";
import type { Candidate } from "khudam";
import {
  buildFlagRow,
  buildSelectionRows,
  displaySense,
  isTraditionalForm,
  MAX_SELECTIONS_PER_COPY,
  needsSenseBranch,
  UNLABELED_SENSE,
} from "./signals";

/** NNBSP U+202F, which joins a written-apart suffix to its stem. */
const NNBSP = String.fromCodePoint(0x202f);

const SESSION = "00000000-0000-4000-8000-000000000000";

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return { traditional: "ᠠᠭᠤᠯᠠ", verified: false, source: "wmk-import", ...overrides };
}

describe("isTraditionalForm", () => {
  test("accepts the Mongolian block", () => {
    expect(isTraditionalForm("ᠠᠭᠤᠯᠠ")).toBe(true);
  });

  test("accepts NNBSP, so composed suffix candidates are reportable", () => {
    expect(isTraditionalForm(`ᠨᠣᠮ${NNBSP}ᠤᠨ`)).toBe(true);
  });

  test("rejects Cyrillic, Latin, and the empty string", () => {
    expect(isTraditionalForm("уул")).toBe(false);
    expect(isTraditionalForm("agula")).toBe(false);
    expect(isTraditionalForm("")).toBe(false);
  });

  test("rejects an ordinary space, which the DB constraint also rejects", () => {
    expect(isTraditionalForm("ᠨᠣᠮ ᠤᠨ")).toBe(false);
  });
});

describe("displaySense", () => {
  test("returns nothing when there is no sense", () => {
    expect(displaySense(candidate())).toBeUndefined();
  });

  test("hides the importer's placeholder", () => {
    expect(displaySense(candidate({ sense: UNLABELED_SENSE }))).toBeUndefined();
  });

  test("strips the placeholder out of a composed suffix label", () => {
    const composed = candidate({
      sense: `${UNLABELED_SENSE} + genitive`,
      source: "suffix-rule",
    });
    expect(displaySense(composed)).toBe("genitive");
  });

  test("keeps a real sense", () => {
    expect(displaySense(candidate({ sense: "mountain" }))).toBe("mountain");
  });
});

describe("needsSenseBranch", () => {
  test("asks when the candidate carries no meaning label", () => {
    expect(needsSenseBranch(candidate())).toBe(true);
  });

  test("asks when the only label is the placeholder", () => {
    expect(needsSenseBranch(candidate({ sense: UNLABELED_SENSE }))).toBe(true);
  });

  test("does not ask when a real meaning is on screen", () => {
    expect(needsSenseBranch(candidate({ sense: "mountain" }))).toBe(false);
  });

  test("does not ask for composed or fallback candidates, which have one machine meaning", () => {
    expect(needsSenseBranch(candidate({ source: "suffix-rule", sense: "genitive" }))).toBe(false);
    expect(needsSenseBranch(candidate({ source: "suffix-rule" }))).toBe(false);
    expect(needsSenseBranch(candidate({ source: "fallback" }))).toBe(false);
  });
});

describe("buildSelectionRows", () => {
  test("anchors on the normalized Cyrillic key, not the surface form", () => {
    const rows = buildSelectionRows([{ input: "Уул", candidate: candidate() }], SESSION);
    expect(rows).toEqual([
      {
        context: "converter",
        signal_type: "selection",
        cyrillic: "уул",
        traditional: "ᠠᠭᠤᠯᠠ",
        session_id: SESSION,
      },
    ]);
  });

  test("carries a sense as audit context when there is one", () => {
    const rows = buildSelectionRows(
      [{ input: "уул", candidate: candidate({ sense: "mountain" }) }],
      SESSION,
    );
    expect(rows[0]!.sense).toBe("mountain");
  });

  test("counts a word repeated in one copy once", () => {
    const rows = buildSelectionRows(
      [
        { input: "уул", candidate: candidate() },
        { input: "Уул", candidate: candidate() },
      ],
      SESSION,
    );
    expect(rows).toHaveLength(1);
  });

  test("keeps both candidates when the same word was copied two ways", () => {
    const rows = buildSelectionRows(
      [
        { input: "уул", candidate: candidate({ traditional: "ᠠᠭᠤᠯᠠ" }) },
        { input: "уул", candidate: candidate({ traditional: "ᠤᠤᠯ" }) },
      ],
      SESSION,
    );
    expect(rows).toHaveLength(2);
  });

  test("drops a candidate that would fail the database's code-point check", () => {
    const rows = buildSelectionRows(
      [{ input: "уул", candidate: candidate({ traditional: "???" }) }],
      SESSION,
    );
    expect(rows).toEqual([]);
  });

  test("caps a bulk paste instead of filing a row per word", () => {
    const many = Array.from({ length: MAX_SELECTIONS_PER_COPY + 10 }, (_, i) => ({
      input: `уул${"а".repeat(i)}`,
      candidate: candidate(),
    }));
    expect(buildSelectionRows(many, SESSION)).toHaveLength(MAX_SELECTIONS_PER_COPY);
  });
});

describe("buildFlagRow", () => {
  test("records which branch of the question was answered", () => {
    const row = buildFlagRow(
      { cyrillic: "Уул", traditional: "ᠤᠤᠯ", sense: "mountain" },
      "missing_sense",
      SESSION,
    );
    expect(row).toEqual({
      context: "converter",
      signal_type: "flag",
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      sense: "mountain",
      proposal_kind: "missing_sense",
      session_id: SESSION,
    });
  });

  test("omits sense entirely rather than sending null", () => {
    const row = buildFlagRow({ cyrillic: "уул", traditional: "ᠤᠤᠯ" }, "correction", SESSION);
    expect("sense" in row).toBe(false);
    expect(row.proposal_kind).toBe("correction");
  });
});
