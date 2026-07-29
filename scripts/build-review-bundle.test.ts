/**
 * Unit tests for what the expert review page is shown — which spellings reach
 * a reviewer, which are already answered by the data, and in what order.
 */
import { describe, expect, test } from "bun:test";
import { proposalItems, verificationItems, wrongItems } from "./build-review-bundle.ts";
import type { Frequency, Report, VerdictTally } from "./aggregate-signals.ts";
import type { Entry } from "./lib.ts";

function lexiconOf(...entries: Entry[]): Map<string, Entry> {
  return new Map(entries.map((e) => [e.cyrillic, e]));
}

const NO_TRAFFIC: Frequency = { words: {} };

const UUL: Entry = {
  cyrillic: "уул",
  candidates: [
    { traditional: "ᠠᠭᠤᠯᠠ", latin: "agula", sense: "mountain", verified: false, source: "wmk-import" },
    { traditional: "ᠤᠤᠯ", latin: "uul", sense: "original", verified: true, source: "manual" },
  ],
};

const NOM: Entry = {
  cyrillic: "ном",
  candidates: [{ traditional: "ᠨᠣᠮ", verified: false, source: "wmk-import" }],
};

function tally(over: Partial<VerdictTally> = {}): VerdictTally {
  return {
    cyrillic: "уул",
    traditional: "ᠠᠭᠤᠯᠠ",
    yes: 1,
    no: 0,
    first_seen: "2026-07-01T00:00:00Z",
    last_seen: "2026-07-01T00:00:00Z",
    ...over,
  };
}

function report(over: Partial<Report> = {}): Report {
  return {
    cyrillic: "уул",
    kind: "correction",
    sessions: 1,
    first_seen: "2026-07-01T00:00:00Z",
    last_seen: "2026-07-01T00:00:00Z",
    ...over,
  };
}

describe("verificationItems", () => {
  test("asks about a candidate people have answered on", () => {
    const items = verificationItems([tally()], lexiconOf(UUL), NO_TRAFFIC);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      cyrillic: "уул",
      traditional: "ᠠᠭᠤᠯᠠ",
      latin: "agula",
      sense: "mountain",
      source: "wmk-import",
      yes: 1,
      no: 0,
    });
  });

  test("shows the entry's other candidates as context", () => {
    const items = verificationItems([tally()], lexiconOf(UUL), NO_TRAFFIC);
    expect(items[0]!.siblings).toEqual([
      { traditional: "ᠤᠤᠯ", latin: "uul", sense: "original", verified: true },
    ]);
  });

  test("drops a tally a human already settled", () => {
    // ᠤᠤᠯ is verified: true. Asking about it again would spend a reviewer's
    // attention on a question the data already answers.
    const settled = tally({ traditional: "ᠤᠤᠯ" });
    expect(verificationItems([settled], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("drops a tally whose spelling is no longer in the lexicon", () => {
    const orphan = tally({ traditional: "ᠣᠷᠣᠬᠤ" });
    expect(verificationItems([orphan], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("puts a disagreement between trusted reviewers first", () => {
    // Nothing else on this page needs a person more: two readers of монгол
    // бичиг contradicting each other cannot be resolved by more votes.
    const busy = tally({ cyrillic: "ном", traditional: "ᠨᠣᠮ", yes: 40, no: 2 });
    const disputed = tally({ attested: ["r1"], disputed: ["r2"], yes: 1, no: 1 });
    const items = verificationItems([busy, disputed], lexiconOf(UUL, NOM), NO_TRAFFIC);
    expect(items.map((i) => i.traditional)).toEqual(["ᠠᠭᠤᠯᠠ", "ᠨᠣᠮ"]);
  });

  test("otherwise orders by how much a single answer would settle", () => {
    const quiet = tally({ yes: 1, no: 0 });
    const busy = tally({ cyrillic: "ном", traditional: "ᠨᠣᠮ", yes: 3, no: 4 });
    const items = verificationItems([quiet, busy], lexiconOf(UUL, NOM), NO_TRAFFIC);
    expect(items.map((i) => i.traditional)).toEqual(["ᠨᠣᠮ", "ᠠᠭᠤᠯᠠ"]);
  });

  test("hides the importer's placeholder rather than showing it as a meaning", () => {
    const unlabeled: Entry = {
      cyrillic: "ном",
      candidates: [{ traditional: "ᠨᠣᠮ", sense: "unlabeled", verified: false, source: "wiktionary" }],
    };
    const items = verificationItems(
      [tally({ cyrillic: "ном", traditional: "ᠨᠣᠮ" })],
      lexiconOf(unlabeled),
      NO_TRAFFIC,
    );
    expect("sense" in items[0]!).toBe(false);
  });
});

describe("wrongItems", () => {
  test("shows a stored spelling somebody reported", () => {
    const items = wrongItems([report({ traditional: "ᠠᠭᠤᠯᠠ" })], lexiconOf(UUL), NO_TRAFFIC);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ traditional: "ᠠᠭᠤᠯᠠ", sessions: 1 });
  });

  test("keeps a report against an already-verified spelling, and says so", () => {
    // Somebody contradicting a verification is the most informative row here.
    // Hiding it would make a mistaken verification permanent.
    const items = wrongItems([report({ traditional: "ᠤᠤᠯ" })], lexiconOf(UUL), NO_TRAFFIC);
    expect(items[0]).toMatchObject({ traditional: "ᠤᠤᠯ", verified: true });
  });

  test("collapses several reports about one spelling into one row", () => {
    const bare = report({ traditional: "ᠠᠭᠤᠯᠠ", sessions: 2 });
    const withFix = report({ traditional: "ᠠᠭᠤᠯᠠ", sessions: 3, proposal_traditional: "ᠠᠭᠤᠯᠠᠨ" });
    const items = wrongItems([bare, withFix], lexiconOf(UUL), NO_TRAFFIC);
    expect(items).toHaveLength(1);
    expect(items[0]!.sessions).toBe(5);
  });

  test("ignores a report about a spelling that is no longer stored", () => {
    // Whoever removed the form answered the report. It is also how a composed
    // suffix candidate falls out: it lives in no shard to begin with.
    expect(wrongItems([report({ traditional: "ᠣᠷᠣᠬᠤ" })], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("ignores anything that is not a wrong-spelling report", () => {
    const missing = report({ traditional: "ᠠᠭᠤᠯᠠ", kind: "missing_sense" });
    expect(wrongItems([missing], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("puts a report from somebody who reads the script first", () => {
    const crowd = report({ cyrillic: "ном", traditional: "ᠨᠣᠮ", sessions: 9 });
    const expert = report({ traditional: "ᠠᠭᠤᠯᠠ", sessions: 1, reviewers: ["r1"] });
    const items = wrongItems([crowd, expert], lexiconOf(UUL, NOM), NO_TRAFFIC);
    expect(items.map((i) => i.traditional)).toEqual(["ᠠᠭᠤᠯᠠ", "ᠨᠣᠮ"]);
    expect(items[0]!.trusted).toEqual(["r1"]);
  });
});

describe("proposalItems", () => {
  test("offers a spelling for a word the lexicon does not know", () => {
    const proposed = report({ cyrillic: "хур", kind: "new_word", proposal_traditional: "ᠬᠤᠷ" });
    const items = proposalItems([proposed], lexiconOf(UUL), NO_TRAFFIC);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ cyrillic: "хур", traditional: "ᠬᠤᠷ" });
    // Nothing to sit beside, so nothing needs a label.
    expect("senseRequired" in items[0]!).toBe(false);
  });

  test("asks for a meaning where the entry will end up with two candidates", () => {
    // The entry schema requires a `sense` on every candidate once there is
    // more than one, so an acceptance without a label could not be written.
    const proposed = report({ traditional: "ᠠᠭᠤᠯᠠ", proposal_traditional: "ᠠᠭᠤᠯᠠᠨ" });
    const items = proposalItems([proposed], lexiconOf(UUL), NO_TRAFFIC);
    expect(items[0]!.senseRequired).toBe(true);
  });

  test("prefills the meaning a contributor suggested", () => {
    const proposed = report({
      cyrillic: "хур",
      kind: "new_word",
      proposal_traditional: "ᠬᠤᠷ",
      proposal_sense: "rain",
    });
    expect(proposalItems([proposed], lexiconOf(), NO_TRAFFIC)[0]!.proposedSense).toBe("rain");
  });

  test("drops a proposal the lexicon has already taken", () => {
    const proposed = report({ proposal_traditional: "ᠠᠭᠤᠯᠠ" });
    expect(proposalItems([proposed], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("leaves a meaning-only proposal out — that is an edit, not an addition", () => {
    // "This candidate is missing the meaning X" asks for a label on a
    // candidate that already exists. This pipeline never edits a candidate
    // mechanically, and the question wants prose, so it stays in REVIEW.md.
    const senseOnly = report({ traditional: "ᠠᠭᠤᠯᠠ", kind: "missing_sense", proposal_sense: "hill" });
    expect(proposalItems([senseOnly], lexiconOf(UUL), NO_TRAFFIC)).toEqual([]);
  });

  test("counts two people proposing the same spelling as one row", () => {
    const a = report({ cyrillic: "хур", kind: "new_word", proposal_traditional: "ᠬᠤᠷ", sessions: 1 });
    const b = report({
      cyrillic: "хур",
      kind: "new_word",
      proposal_traditional: "ᠬᠤᠷ",
      proposal_sense: "rain",
      sessions: 2,
    });
    const items = proposalItems([a, b], lexiconOf(), NO_TRAFFIC);
    expect(items).toHaveLength(1);
    expect(items[0]!.sessions).toBe(3);
    expect(items[0]!.proposedSense).toBe("rain");
  });

  test("keeps competing proposals for one word apart, so neither is chosen for anyone", () => {
    const a = report({ cyrillic: "хур", kind: "new_word", proposal_traditional: "ᠬᠤᠷ" });
    const b = report({ cyrillic: "хур", kind: "new_word", proposal_traditional: "ᠬᠤᠷᠠ" });
    const items = proposalItems([a, b], lexiconOf(), NO_TRAFFIC);
    expect(items.map((i) => i.traditional).sort()).toEqual(["ᠬᠤᠷ", "ᠬᠤᠷᠠ"]);
  });
});
