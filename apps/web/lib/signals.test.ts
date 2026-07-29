import { describe, expect, test } from "bun:test";
import type { Candidate } from "khudam";
import {
  buildFlagRow,
  buildProposalRow,
  buildSelectionRows,
  buildVerdictRow,
  checkProposal,
  cleanSense,
  displaySense,
  grantInFragment,
  isLexiconCandidate,
  isTraditionalForm,
  MAX_PROPOSAL_LENGTH,
  MAX_SELECTIONS_PER_COPY,
  MAX_SENSE_LENGTH,
  needsSenseBranch,
  proposalKindFor,
  stampReviewer,
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

describe("checkProposal", () => {
  test("accepts монгол бичиг and returns what will be sent", () => {
    const result = checkProposal("ᠠᠭᠤᠯᠠ");
    expect(result).toEqual({ ok: true, value: "ᠠᠭᠤᠯᠠ" });
  });

  test("joins a written-apart suffix with NNBSP, which no keyboard types", () => {
    const result = checkProposal("ᠨᠣᠮ ᠤᠨ");
    expect(result).toEqual({ ok: true, value: `ᠨᠣᠮ${NNBSP}ᠤᠨ` });
  });

  test("leaves an already-NNBSP-joined paste alone", () => {
    expect(checkProposal(`ᠨᠣᠮ${NNBSP}ᠤᠨ`)).toEqual({ ok: true, value: `ᠨᠣᠮ${NNBSP}ᠤᠨ` });
  });

  test("trims surrounding whitespace instead of rejecting it", () => {
    expect(checkProposal("  ᠠᠭᠤᠯᠠ\n")).toEqual({ ok: true, value: "ᠠᠭᠤᠯᠠ" });
  });

  test("keeps MVS, which is a shaping control rather than a space", () => {
    const mvs = String.fromCodePoint(0x180e);
    expect(checkProposal(`ᠠᠭᠤᠯᠠ${mvs}ᠠ`).ok).toBe(true);
  });

  test("drops the zero-width characters a paste carries in", () => {
    const zwsp = String.fromCodePoint(0x200b);
    const bom = String.fromCodePoint(0xfeff);
    const lrm = String.fromCodePoint(0x200e);
    expect(checkProposal(`${bom}ᠠᠭᠤ${zwsp}ᠯᠠ${lrm}`)).toEqual({
      ok: true,
      value: "ᠠᠭᠤᠯᠠ",
    });
  });

  test("does not leave a joiner stranded at the edge after stripping", () => {
    const zwsp = String.fromCodePoint(0x200b);
    expect(checkProposal(`${zwsp} ᠠᠭᠤᠯᠠ`)).toEqual({ ok: true, value: "ᠠᠭᠤᠯᠠ" });
  });

  test("a tab between stem and suffix joins them, it does not glue them", () => {
    expect(checkProposal("ᠨᠣᠮ\tᠤᠨ")).toEqual({ ok: true, value: `ᠨᠣᠮ${NNBSP}ᠤᠨ` });
  });

  test("names Cyrillic specifically — the mistake this site invites", () => {
    expect(checkProposal("уул")).toEqual({ ok: false, problem: "cyrillic" });
  });

  test("reports blank input as empty rather than as bad characters", () => {
    expect(checkProposal("   ")).toEqual({ ok: false, problem: "empty" });
  });

  test("rejects anything outside the Mongolian block", () => {
    expect(checkProposal("agula")).toEqual({ ok: false, problem: "not_mongolian" });
    expect(checkProposal("ᠠᠭᠤᠯᠠ!")).toEqual({ ok: false, problem: "not_mongolian" });
  });

  test("rejects what the length constraint would reject", () => {
    const long = "ᠠ".repeat(MAX_PROPOSAL_LENGTH + 1);
    expect(checkProposal(long)).toEqual({ ok: false, problem: "too_long" });
    expect(checkProposal("ᠠ".repeat(MAX_PROPOSAL_LENGTH)).ok).toBe(true);
  });
});

describe("cleanSense", () => {
  test("keeps a label in either script", () => {
    expect(cleanSense("mountain")).toBe("mountain");
    expect(cleanSense("уул, өндөрлөг")).toBe("уул, өндөрлөг");
  });

  test("collapses whitespace and returns nothing for a blank label", () => {
    expect(cleanSense("  the   mountain ")).toBe("the mountain");
    expect(cleanSense("   ")).toBeUndefined();
    expect(cleanSense("")).toBeUndefined();
  });

  test("strips control characters instead of rejecting the label", () => {
    // A zero-width space and a tab: the sort of thing a paste carries in and
    // nobody can see. Built from code points — a test file that contains them
    // literally is a test nobody can review.
    const zwsp = String.fromCodePoint(0x200b);
    expect(cleanSense(`mountain${zwsp}\tзөв`)).toBe("mountain зөв");
  });

  test("caps at the length the column accepts", () => {
    expect(cleanSense("a".repeat(MAX_SENSE_LENGTH + 50))).toHaveLength(MAX_SENSE_LENGTH);
  });
});

describe("proposalKindFor", () => {
  test("a wrong lexicon spelling is a correction", () => {
    expect(proposalKindFor(candidate(), "correction")).toBe("correction");
  });

  test("a composed candidate is repaired by a new entry, not by a replacement", () => {
    // data/GRAMMAR.md § Fixing a wrong composition: an exact lexicon match
    // outranks decomposition, so the fix for a mis-composed word is an entry
    // of its own. There is nothing in any shard to correct.
    expect(proposalKindFor(candidate({ source: "suffix-rule" }), "correction")).toBe("new_word");
  });

  test("a word the lexicon does not know is a new word", () => {
    expect(proposalKindFor(candidate({ source: "fallback" }), "correction")).toBe("new_word");
  });

  test("a missing meaning stays a missing meaning whatever it was flagged on", () => {
    expect(proposalKindFor(candidate(), "missing_sense")).toBe("missing_sense");
    expect(proposalKindFor(candidate({ source: "suffix-rule" }), "missing_sense")).toBe(
      "missing_sense",
    );
  });
});

describe("isLexiconCandidate", () => {
  test("separates stored entries from runtime machine output", () => {
    expect(isLexiconCandidate(candidate())).toBe(true);
    expect(isLexiconCandidate(candidate({ source: "wiktionary" }))).toBe(true);
    expect(isLexiconCandidate(candidate({ source: "suffix-rule" }))).toBe(false);
    expect(isLexiconCandidate(candidate({ source: "fallback" }))).toBe(false);
  });
});

describe("buildProposalRow", () => {
  test("keeps the candidate's own sense apart from the proposed one", () => {
    const row = buildProposalRow(
      { cyrillic: "Уул", traditional: "ᠤᠤᠯ", sense: "original" },
      "missing_sense",
      { traditional: "ᠠᠭᠤᠯᠠ", sense: "mountain" },
      SESSION,
    );
    expect(row).toEqual({
      context: "converter",
      signal_type: "proposal",
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      sense: "original",
      proposal_kind: "missing_sense",
      proposal_traditional: "ᠠᠭᠤᠯᠠ",
      proposal_sense: "mountain",
      session_id: SESSION,
    });
  });

  test("anchors a new word to the word alone, since no candidate exists", () => {
    const row = buildProposalRow(
      { cyrillic: "уул" },
      "new_word",
      { traditional: "ᠠᠭᠤᠯᠠ" },
      SESSION,
    );
    expect("traditional" in row).toBe(false);
    expect("proposal_sense" in row).toBe(false);
    expect(row.proposal_traditional).toBe("ᠠᠭᠤᠯᠠ");
  });

  test("carries a meaning with no spelling — the constraint allows either half", () => {
    const row = buildProposalRow(
      { cyrillic: "уул", traditional: "ᠤᠤᠯ" },
      "missing_sense",
      { sense: "mountain" },
      SESSION,
    );
    expect("proposal_traditional" in row).toBe(false);
    expect(row.proposal_sense).toBe("mountain");
  });
});

describe("buildVerdictRow", () => {
  const anchor = { cyrillic: "Уул", traditional: "ᠤᠤᠯ", sense: "original" };

  test("a queue answer carries the question that was shown", () => {
    expect(buildVerdictRow(anchor, false, SESSION, "e-1234abcd")).toEqual({
      context: "queue",
      signal_type: "verdict",
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      sense: "original",
      verdict: false,
      question_id: "e-1234abcd",
      session_id: SESSION,
    });
  });

  test("a converter answer has no question behind it, and says so by omission", () => {
    // Not an invented id and not an explicit null: `signals_verdict_shape`
    // requires a question_id only where context is 'queue', precisely so that
    // this row can be honest about there having been no question.
    const row = buildVerdictRow(anchor, true, SESSION);
    expect(row.context).toBe("converter");
    expect("question_id" in row).toBe(false);
    expect(row.verdict).toBe(true);
  });

  test("anchors on the candidate either way, which is what aggregation keys on", () => {
    const fromQueue = buildVerdictRow(anchor, true, SESSION, "e-1234abcd");
    const fromConverter = buildVerdictRow(anchor, true, SESSION);
    expect(fromConverter.cyrillic).toBe(fromQueue.cyrillic);
    expect(fromConverter.traditional).toBe(fromQueue.traditional);
  });
});

describe("grantInFragment", () => {
  const GRANT = "c51f2be7-6ba8-47d0-9a1c-9334dfc8338b";

  test("reads a grant out of the fragment a reviewer link carries", () => {
    expect(grantInFragment(`#r=${GRANT}`)).toBe(GRANT);
    expect(grantInFragment(`r=${GRANT}`)).toBe(GRANT);
  });

  test("finds it beside other fragment parameters, in either order", () => {
    expect(grantInFragment(`#from=mail&r=${GRANT}`)).toBe(GRANT);
    expect(grantInFragment(`#r=${GRANT}&from=mail`)).toBe(GRANT);
  });

  test("accepts a link that survived a mail client's case mangling", () => {
    expect(grantInFragment(`#r=${GRANT.toUpperCase()}`)).toBe(GRANT);
    expect(grantInFragment(`#r=%20${GRANT}%20`)).toBe(GRANT);
  });

  test("rejects anything that is not a uuid", () => {
    // Load-bearing rather than tidy: reviewer_id is a uuid column, so one
    // malformed value makes Postgres reject the whole insert — for a queue set,
    // that is nine good answers thrown away with it.
    expect(grantInFragment("#r=trust-me")).toBeNull();
    expect(grantInFragment(`#r=${GRANT}';drop table signals;--`)).toBeNull();
    expect(grantInFragment("#r=")).toBeNull();
    expect(grantInFragment("")).toBeNull();
  });

  test("ignores a fragment that is about something else", () => {
    expect(grantInFragment("#section-2")).toBeNull();
    // The parameter is `r`, not any parameter ending in r.
    expect(grantInFragment(`#other=${GRANT}`)).toBeNull();
    expect(grantInFragment(`#referrer=${GRANT}`)).toBeNull();
  });
});

describe("stampReviewer", () => {
  const GRANT = "c51f2be7-6ba8-47d0-9a1c-9334dfc8338b";
  const rows = () => [
    buildFlagRow({ cyrillic: "уул", traditional: "ᠤᠤᠯ" }, "correction", SESSION),
    buildFlagRow({ cyrillic: "ном", traditional: "ᠨᠣᠮ" }, "correction", SESSION),
  ];

  test("stamps every row in the batch", () => {
    const stamped = stampReviewer(rows(), GRANT);
    expect(stamped.map((r) => r.reviewer_id)).toEqual([GRANT, GRANT]);
  });

  test("leaves an anonymous batch alone rather than sending a null", () => {
    const stamped = stampReviewer(rows(), null);
    expect(stamped.every((r) => !("reviewer_id" in r))).toBe(true);
  });

  test("refuses a stored value that is not a uuid", () => {
    // A grant only ever arrives through grantInFragment, but localStorage is
    // writable by anything that runs on the page, and one bad value here would
    // cost every signal the browser tries to send afterwards.
    const stamped = stampReviewer(rows(), "trust-me");
    expect(stamped.every((r) => !("reviewer_id" in r))).toBe(true);
  });

  test("does not mutate the rows it was given", () => {
    const original = rows();
    stampReviewer(original, GRANT);
    expect(original.every((r) => !("reviewer_id" in r))).toBe(true);
  });
});
