/**
 * Unit tests for the pure aggregation in aggregate-signals.ts — the part that
 * decides what a reviewer is asked to look at, and the one case where a signal
 * is allowed to write to the lexicon by itself.
 */
import { describe, expect, test } from "bun:test";
import {
  CORROBORATION_THRESHOLD,
  STALE_DAYS,
  addReports,
  addSelections,
  addVerdicts,
  freshRows,
  latestTimestamp,
  mechanicalAdditions,
  reportKey,
  resolutionOf,
  suffixSuspects,
  verdictIsOpen,
  type Ledger,
  type Report,
  type VerdictTally,
} from "./aggregate-signals.ts";
import type { SignalRow } from "./export-signals.ts";
import type { Entry } from "./lib.ts";

const NNBSP = String.fromCodePoint(0x202f);

let nextId = 0;
function row(overrides: Partial<SignalRow>): SignalRow {
  nextId++;
  return {
    id: `id-${nextId}`,
    created_at: "2026-08-01T00:00:00Z",
    context: "converter",
    signal_type: "selection",
    cyrillic: "уул",
    traditional: "ᠤᠤᠯ",
    sense: null,
    proposal_kind: null,
    proposal_traditional: null,
    proposal_sense: null,
    verdict: null,
    question_id: null,
    reviewer_id: null,
    session_id: "session-a",
    ...overrides,
  };
}

function lexiconOf(...entries: Entry[]): Map<string, Entry> {
  return new Map(entries.map((e) => [e.cyrillic, e]));
}

const UUL: Entry = {
  cyrillic: "уул",
  candidates: [{ traditional: "ᠤᠤᠯ", verified: false, source: "wmk-import" }],
};

describe("freshRows", () => {
  test("drops rows already folded in, by id and by watermark", () => {
    const a = row({ id: "a", created_at: "2026-08-01T00:00:00Z" });
    const b = row({ id: "b", created_at: "2026-08-02T00:00:00Z" });
    expect(freshRows([a, a, b], null).map((r) => r.id)).toEqual(["a", "b"]);
    expect(freshRows([a, b], "2026-08-01T00:00:00Z").map((r) => r.id)).toEqual(["b"]);
    expect(freshRows([a, b], "2026-08-02T00:00:00Z")).toEqual([]);
  });

  test("a re-exported drain (delete failed last week) counts nothing twice", () => {
    const rows = [row({ id: "a" }), row({ id: "b" })];
    const through = latestTimestamp(rows, null);
    expect(freshRows(rows, through)).toEqual([]);
  });
});

describe("addSelections", () => {
  test("counts per candidate and ignores everything that is not a selection", () => {
    const frequency = { words: {} };
    const counted = addSelections(frequency, [
      row({}),
      row({}),
      row({ traditional: "ᠠᠭᠤᠯᠠ" }),
      row({ signal_type: "flag", proposal_kind: "correction" }),
      row({ traditional: null }),
    ]);
    expect(counted).toBe(3);
    expect(frequency.words).toEqual({ уул: { "ᠤᠤᠯ": 2, "ᠠᠭᠤᠯᠠ": 1 } });
  });
});

describe("addReports", () => {
  function ledger(): Ledger {
    return { through: null, reports: [] };
  }

  test("a flag and the proposal it led to are one opinion, not two", () => {
    const l = ledger();
    addReports(l, [
      row({ signal_type: "flag", proposal_kind: "correction" }),
      row({ signal_type: "proposal", proposal_kind: "correction", proposal_traditional: "ᠠᠭᠤᠯᠠ" }),
    ]);
    expect(l.reports).toHaveLength(1);
    expect(l.reports[0]).toMatchObject({ proposal_traditional: "ᠠᠭᠤᠯᠠ", sessions: 1 });
  });

  test("a flag with no proposal stands on its own", () => {
    const l = ledger();
    addReports(l, [row({ signal_type: "flag", proposal_kind: "correction" })]);
    expect(l.reports).toHaveLength(1);
    expect(l.reports[0]!.proposal_traditional).toBeUndefined();
  });

  test("the same report from two sessions is one item with two sessions", () => {
    const l = ledger();
    addReports(l, [
      row({
        signal_type: "proposal",
        proposal_kind: "correction",
        proposal_traditional: "ᠠᠭᠤᠯᠠ",
        created_at: "2026-08-01T00:00:00Z",
      }),
      row({
        signal_type: "proposal",
        proposal_kind: "correction",
        proposal_traditional: "ᠠᠭᠤᠯᠠ",
        session_id: "session-b",
        created_at: "2026-08-03T00:00:00Z",
      }),
    ]);
    expect(l.reports).toHaveLength(1);
    expect(l.reports[0]).toMatchObject({
      sessions: 2,
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-03T00:00:00Z",
    });
  });

  test("counts accumulate across drains instead of restarting", () => {
    const l = ledger();
    addReports(l, [row({ signal_type: "flag", proposal_kind: "correction" })]);
    addReports(l, [row({ signal_type: "flag", proposal_kind: "correction", session_id: "session-b" })]);
    expect(l.reports).toHaveLength(1);
    expect(l.reports[0]!.sessions).toBe(2);
  });

  test("different proposed spellings stay separate items", () => {
    const l = ledger();
    addReports(l, [
      row({ signal_type: "proposal", proposal_kind: "correction", proposal_traditional: "ᠠᠭᠤᠯᠠ" }),
      row({ signal_type: "proposal", proposal_kind: "correction", proposal_traditional: "ᠠᠭᠣᠯᠠ" }),
    ]);
    expect(l.reports).toHaveLength(2);
  });

  test("selections and rows with no branch answer are not reports", () => {
    const l = ledger();
    addReports(l, [row({}), row({ signal_type: "flag", proposal_kind: null })]);
    expect(l.reports).toEqual([]);
  });
});

describe("addVerdicts", () => {
  function ledger(): Ledger {
    return { through: null, reports: [] };
  }

  function vote(verdict: boolean, over: Partial<SignalRow> = {}): SignalRow {
    return row({
      signal_type: "verdict",
      context: "queue",
      verdict,
      question_id: "e-1a2b3c4d",
      ...over,
    });
  }

  test("tallies yes and no per candidate", () => {
    const l = ledger();
    const counted = addVerdicts(l, [
      vote(true),
      vote(true, { session_id: "session-b" }),
      vote(false, { session_id: "session-c" }),
    ]);
    expect(counted).toBe(3);
    expect(l.verdicts).toEqual([
      {
        cyrillic: "уул",
        traditional: "ᠤᠤᠯ",
        yes: 2,
        no: 1,
        first_seen: "2026-08-01T00:00:00Z",
        last_seen: "2026-08-01T00:00:00Z",
      },
    ]);
  });

  test("keeps candidates apart and accumulates across drains", () => {
    const l = ledger();
    addVerdicts(l, [vote(true), vote(true, { traditional: "ᠠᠭᠤᠯᠠ" })]);
    addVerdicts(l, [vote(true, { session_id: "session-b" })]);
    expect(l.verdicts).toHaveLength(2);
    expect(l.verdicts![0]!.yes).toBe(2);
    expect(l.verdicts![1]!.yes).toBe(1);
  });

  test("ignores every other kind of signal", () => {
    const l = ledger();
    expect(addVerdicts(l, [row({}), row({ signal_type: "flag", proposal_kind: "correction" })])).toBe(0);
    expect(l.verdicts).toEqual([]);
  });
});

describe("verdictIsOpen", () => {
  const tally: VerdictTally = {
    cyrillic: "уул",
    traditional: "ᠤᠤᠯ",
    yes: 3,
    no: 0,
    first_seen: "2026-08-01T00:00:00Z",
    last_seen: "2026-08-01T00:00:00Z",
  };

  test("stays open while the candidate is unverified", () => {
    expect(verdictIsOpen(tally, lexiconOf(UUL))).toBe(true);
  });

  test("closes once a human verified the candidate", () => {
    const verified: Entry = {
      cyrillic: "уул",
      candidates: [{ traditional: "ᠤᠤᠯ", verified: true, source: "community" }],
    };
    expect(verdictIsOpen(tally, lexiconOf(verified))).toBe(false);
  });

  test("closes once the form is gone", () => {
    const replaced: Entry = {
      cyrillic: "уул",
      candidates: [{ traditional: "ᠠᠭᠤᠯᠠ", verified: false, source: "community" }],
    };
    expect(verdictIsOpen(tally, lexiconOf(replaced))).toBe(false);
  });
});

describe("resolutionOf", () => {
  const now = new Date("2026-08-10T00:00:00Z");
  const fresh = { sessions: 1, first_seen: "2026-08-01T00:00:00Z", last_seen: "2026-08-01T00:00:00Z" };

  test("open while the lexicon still says what was reported", () => {
    const report: Report = { cyrillic: "уул", traditional: "ᠤᠤᠯ", kind: "correction", ...fresh };
    expect(resolutionOf(report, lexiconOf(UUL), now)).toBe("open");
  });

  test("resolved once the reported form is gone", () => {
    const report: Report = { cyrillic: "уул", traditional: "ᠤᠤᠯ", kind: "correction", ...fresh };
    const fixed: Entry = {
      cyrillic: "уул",
      candidates: [{ traditional: "ᠠᠭᠤᠯᠠ", verified: true, source: "manual" }],
    };
    expect(resolutionOf(report, lexiconOf(fixed), now)).toBe("resolved");
  });

  test("resolved once the proposed form is a candidate", () => {
    const report: Report = {
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      kind: "missing_sense",
      proposal_traditional: "ᠠᠭᠤᠯᠠ",
      ...fresh,
    };
    const both: Entry = {
      cyrillic: "уул",
      candidates: [
        { traditional: "ᠤᠤᠯ", sense: "original", verified: false, source: "wmk-import" },
        { traditional: "ᠠᠭᠤᠯᠠ", sense: "mountain", verified: false, source: "community" },
      ],
    };
    expect(resolutionOf(report, lexiconOf(both), now)).toBe("resolved");
  });

  test("a composed suffix candidate is not resolved by living in no shard", () => {
    // номын is built at runtime from ном + ᠤᠨ, so no entry will ever hold it.
    // Reading that absence as a fix would close every composition report on
    // arrival — and those are the ones that indict a suffixes.json row.
    const report: Report = {
      cyrillic: "номын",
      traditional: `ᠨᠣᠮ${NNBSP}ᠤᠨ`,
      kind: "correction",
      ...fresh,
    };
    expect(resolutionOf(report, lexiconOf(UUL), now)).toBe("open");
  });

  test("a composition report closes once the inflected form gets its own entry", () => {
    const report: Report = {
      cyrillic: "номын",
      traditional: `ᠨᠣᠮ${NNBSP}ᠤᠨ`,
      kind: "correction",
      ...fresh,
    };
    const entered: Entry = {
      cyrillic: "номын",
      candidates: [{ traditional: "ᠨᠣᠮᠤᠨ", verified: false, source: "community" }],
    };
    expect(resolutionOf(report, lexiconOf(entered), now)).toBe("resolved");
  });

  test("an unknown-word proposal stays open until the word exists", () => {
    const report: Report = { cyrillic: "хөгжим", kind: "new_word", proposal_traditional: "ᠬᠥᠭᠵᠢᠮ", ...fresh };
    expect(resolutionOf(report, lexiconOf(UUL), now)).toBe("open");
  });

  test("stale after the age-out window", () => {
    const old = new Date(now.getTime() - (STALE_DAYS + 1) * 86_400_000).toISOString();
    const report: Report = {
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      kind: "correction",
      sessions: 1,
      first_seen: old,
      last_seen: old,
    };
    expect(resolutionOf(report, lexiconOf(UUL), now)).toBe("stale");
  });
});

describe("suffixSuspects", () => {
  function composed(cyrillic: string, stem: string, suffix: string): Report {
    return {
      cyrillic,
      traditional: `${stem}${NNBSP}${suffix}`,
      kind: "correction",
      sessions: 1,
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
    };
  }

  test("blames the suffix row when several different words carry it", () => {
    const suspects = suffixSuspects([
      composed("номын", "ᠨᠣᠮ", "ᠤᠨ"),
      composed("гэрийн", "ᠭᠡᠷ", "ᠤᠨ"),
      composed("уул", "ᠠᠭᠤᠯᠠ", "ᠤᠨ"),
    ]);
    expect(suspects).toEqual([{ suffix: "ᠤᠨ", words: ["гэрийн", "номын", "уул"], reports: 3 }]);
  });

  test("one word flagged repeatedly does not indict the rule", () => {
    expect(suffixSuspects([composed("номын", "ᠨᠣᠮ", "ᠤᠨ"), composed("номын", "ᠨᠣᠮ", "ᠤᠨ")])).toEqual([]);
  });

  test("lexicon candidates carry no joiner and are never grouped", () => {
    const report: Report = {
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      kind: "correction",
      sessions: 2,
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
    };
    expect(suffixSuspects([report])).toEqual([]);
  });
});

describe("mechanicalAdditions", () => {
  const seen = { first_seen: "2026-08-01T00:00:00Z", last_seen: "2026-08-01T00:00:00Z" };
  const unknown: Report = {
    cyrillic: "хөгжим",
    kind: "new_word",
    proposal_traditional: "ᠬᠥᠭᠵᠢᠮ",
    sessions: CORROBORATION_THRESHOLD,
    ...seen,
  };

  test("adds an unknown word two sessions spelled identically", () => {
    const additions = mechanicalAdditions([unknown], new Set(["уул"]));
    expect(additions).toHaveLength(1);
    expect(additions[0]!.entry).toEqual({
      cyrillic: "хөгжим",
      candidates: [{ traditional: "ᠬᠥᠭᠵᠢᠮ", verified: false, source: "community" }],
    });
  });

  test("never marks what it adds as verified", () => {
    const [addition] = mechanicalAdditions([unknown], new Set());
    expect(addition!.entry.candidates.every((c) => !c.verified)).toBe(true);
  });

  test("one session is not agreement", () => {
    expect(mechanicalAdditions([{ ...unknown, sessions: 1 }], new Set())).toEqual([]);
  });

  test("leaves any word the lexicon already knows to a reviewer", () => {
    expect(mechanicalAdditions([unknown], new Set(["хөгжим"]))).toEqual([]);
  });

  test("two competing spellings are a decision, not a mechanical add", () => {
    const rival: Report = { ...unknown, proposal_traditional: "ᠬᠥᠭᠵᠢᠮᠦ" };
    expect(mechanicalAdditions([unknown, rival], new Set())).toEqual([]);
  });

  test("a report with only a meaning adds nothing", () => {
    const senseOnly: Report = {
      cyrillic: "хөгжим",
      kind: "missing_sense",
      proposal_sense: "music",
      sessions: 5,
      ...seen,
    };
    expect(mechanicalAdditions([senseOnly], new Set())).toEqual([]);
  });

  test("rejects anything outside the Mongolian block, whatever the database allowed", () => {
    const latin: Report = { ...unknown, proposal_traditional: "khogjim" };
    expect(mechanicalAdditions([latin], new Set())).toEqual([]);
  });
});

describe("reportKey", () => {
  test("separates reports that differ only in the proposed meaning", () => {
    const base: Report = {
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      kind: "missing_sense",
      sessions: 1,
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
    };
    expect(reportKey({ ...base, proposal_sense: "mountain" })).not.toBe(
      reportKey({ ...base, proposal_sense: "original" }),
    );
  });
});
