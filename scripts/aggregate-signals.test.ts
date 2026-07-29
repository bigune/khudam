/**
 * Unit tests for the pure aggregation in aggregate-signals.ts — the part that
 * decides what a reviewer is asked to look at, and the one case where a signal
 * is allowed to write to the lexicon by itself.
 */
import { describe, expect, test } from "bun:test";
import {
  ATTESTATION_THRESHOLD,
  CORROBORATION_THRESHOLD,
  STALE_DAYS,
  addReports,
  addSelections,
  addVerdicts,
  fastTrack,
  freshRows,
  isAttested,
  isDisputed,
  latestTimestamp,
  mechanicalAdditions,
  pruneRevoked,
  reportKey,
  resolutionOf,
  revokedFlips,
  acceptanceClaims,
  acceptances,
  carriedClaims,
  decisionVerdicts,
  declinedProposals,
  freshDecisions,
  latestDecisionId,
  removeDeclinedReports,
  suffixSuspects,
  supersede,
  verdictIsOpen,
  type EntryIndex,
  type Flip,
  type Ledger,
  type Report,
  type VerdictTally,
} from "./aggregate-signals.ts";
import type { DecisionRow, SignalRow } from "./export-signals.ts";
import { hashGrant, type Entry } from "./lib.ts";

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

// ---------------------------------------------------------------------------
// Trusted reviewers (contribution pipeline, Phase C)

const GRANT_A = "c51f2be7-6ba8-47d0-9a1c-9334dfc8338b";
const GRANT_B = "9a1c9334-dfc8-4338-b6ba-847d0c51f2be";
const GRANT_C = "11111111-2222-4333-8444-555555555555";
/** A minimal tally, for assertions about the quorum rather than about a word. */
const BASE_TALLY: VerdictTally = {
  cyrillic: "уул",
  traditional: "ᠤᠤᠯ",
  yes: 0,
  no: 0,
  first_seen: "2026-08-01T00:00:00Z",
  last_seen: "2026-08-01T00:00:00Z",
};

const ROSTER = [
  { label: "r1", hash: hashGrant(GRANT_A), granted: "2026-07-29" },
  { label: "r2", hash: hashGrant(GRANT_B), granted: "2026-07-29" },
  { label: "r3", hash: hashGrant(GRANT_C), granted: "2026-07-29" },
];

function verdictRow(verdict: boolean, over: Partial<SignalRow> = {}): SignalRow {
  return row({ signal_type: "verdict", context: "queue", verdict, question_id: "e-1a2b3c4d", ...over });
}

describe("addVerdicts — attestations", () => {
  function ledger(): Ledger {
    return { through: null, reports: [] };
  }

  test("records a trusted answer by label as well as counting it", () => {
    const l = ledger();
    addVerdicts(l, [verdictRow(true, { reviewer_id: GRANT_A })], ROSTER);
    expect(l.verdicts![0]!.yes).toBe(1);
    expect(l.verdicts![0]!.attested).toEqual(["r1"]);
    expect(l.verdicts![0]!.disputed).toBeUndefined();
  });

  test("one reviewer answering from two browsers is one attestation", () => {
    // The quorum is people, not sessions — the mailbox cannot dedupe across
    // browsers, so counting sessions would let one grant reach the threshold.
    const l = ledger();
    addVerdicts(
      l,
      [
        verdictRow(true, { reviewer_id: GRANT_A, session_id: "session-a" }),
        verdictRow(true, { reviewer_id: GRANT_A, session_id: "session-b" }),
      ],
      ROSTER,
    );
    // One person is one label however many devices they answer from. Asserted
    // as the label list rather than as `isAttested`, which is a question about
    // the threshold and would change meaning every time the threshold moved.
    expect(l.verdicts![0]!.attested).toEqual(["r1"]);
  });

  test("two different reviewers are two labels", () => {
    const l = ledger();
    addVerdicts(l, [verdictRow(true, { reviewer_id: GRANT_A }), verdictRow(true, { reviewer_id: GRANT_B })], ROSTER);
    expect(l.verdicts![0]!.attested).toEqual(["r1", "r2"]);
    expect(isAttested(l.verdicts![0]!)).toBe(true);
  });

  test("the quorum is however many labels ATTESTATION_THRESHOLD names", () => {
    // Written against the constant so it stays true when the constant moves,
    // which it is meant to: one reviewer today, two when there are two.
    const enough = Array.from({ length: ATTESTATION_THRESHOLD }, (_, i) => `r${i + 1}`);
    expect(isAttested({ ...BASE_TALLY, attested: enough })).toBe(true);
    expect(isAttested({ ...BASE_TALLY, attested: enough.slice(0, -1) })).toBe(false);
  });

  test("the threshold is 1 today, and lowering it was a documented decision", () => {
    // A tripwire, not a tautology. This number is quoted in CLAUDE.md,
    // CONTRIBUTING.md, ROADMAP.md, supabase/README.md and the reviewer badge
    // in apps/web; changing it here without changing those leaves the project
    // telling contributors something untrue about what their answers do.
    expect(ATTESTATION_THRESHOLD).toBe(1);
  });

  test("a single trusted no vetoes any number of trusted yeses", () => {
    const l = ledger();
    addVerdicts(
      l,
      [
        verdictRow(true, { reviewer_id: GRANT_A }),
        verdictRow(true, { reviewer_id: GRANT_B }),
        verdictRow(false, { reviewer_id: GRANT_C }),
      ],
      ROSTER,
    );
    expect(isAttested(l.verdicts![0]!)).toBe(false);
    expect(isDisputed(l.verdicts![0]!)).toBe(true);
  });

  test("a reviewer who changes their mind moves lists rather than appearing in both", () => {
    const l = ledger();
    addVerdicts(l, [verdictRow(true, { reviewer_id: GRANT_A })], ROSTER);
    addVerdicts(l, [verdictRow(false, { reviewer_id: GRANT_A, created_at: "2026-08-08T00:00:00Z" })], ROSTER);
    expect(l.verdicts![0]!.attested).toBeUndefined();
    expect(l.verdicts![0]!.disputed).toEqual(["r1"]);
  });

  test("a stamp nobody was granted counts as an anonymous vote", () => {
    const l = ledger();
    addVerdicts(l, [verdictRow(true, { reviewer_id: "00000000-0000-4000-8000-000000000000" })], ROSTER);
    expect(l.verdicts![0]!.yes).toBe(1);
    expect(l.verdicts![0]!.attested).toBeUndefined();
  });

  test("a stamp of a grant revoked before the fold counts as anonymous", () => {
    // The fold-time half of revocation: reviewerLabelOf skips tombstones, so
    // a row arriving after the revocation merges never earns a label. The
    // other half — attestations already folded in — is pruneRevoked, below.
    const l = ledger();
    const stamps = [verdictRow(true, { reviewer_id: GRANT_A }), verdictRow(true, { reviewer_id: GRANT_B })];
    addVerdicts(l, stamps, ROSTER.map((r) => (r.label === "r2" ? { ...r, revoked: "2026-08-02" } : r)));
    expect(l.verdicts![0]!.attested).toEqual(["r1"]);
    // The votes themselves survive. A revoked reviewer was still a person who
    // answered; what they lose is the weight of the grant, not the answer.
    expect(l.verdicts![0]!.yes).toBe(2);
  });

  test("with no roster at all, nothing is trusted", () => {
    const l = ledger();
    addVerdicts(l, [verdictRow(true, { reviewer_id: GRANT_A })]);
    expect(l.verdicts![0]!.attested).toBeUndefined();
  });
});

describe("pruneRevoked", () => {
  // The scenario that makes this function necessary: labels live in the
  // ledger across weeks — a flip the cap held back, a dispute, a report's
  // filers — and the raw rows that earned them are deleted after one drain.
  // Without this pass, a revoked grant would keep verifying spellings from
  // the file long after its tombstone was written.
  function revoked(...labels: string[]) {
    return ROSTER.map((r) => (labels.includes(r.label) ? { ...r, revoked: "2026-08-02" } : r));
  }

  test("drops attestations the ledger already holds for a tombstoned grant", () => {
    const l: Ledger = {
      through: null,
      reports: [],
      verdicts: [{ ...BASE_TALLY, yes: 2, no: 0, attested: ["r1", "r2"] }],
    };
    const pruned = pruneRevoked(l, revoked("r2"));
    expect(pruned).toBe(1);
    expect(l.verdicts![0]!.attested).toEqual(["r1"]);
    // The anonymous count is the answer, not the grant; it stays.
    expect(l.verdicts![0]!.yes).toBe(2);
  });

  test("a fully pruned tally is no longer attested and cannot reach the fast track", () => {
    const l: Ledger = {
      through: null,
      reports: [],
      verdicts: [{ ...BASE_TALLY, yes: 1, no: 0, attested: ["r2"] }],
    };
    pruneRevoked(l, revoked("r2"));
    expect(l.verdicts![0]!.attested).toBeUndefined();
    expect(isAttested(l.verdicts![0]!)).toBe(false);
  });

  test("a revoked no stops vetoing", () => {
    // Symmetry matters: a veto is trust in the other direction, and a grant
    // that lost one loses both.
    const l: Ledger = {
      through: null,
      reports: [],
      verdicts: [{ ...BASE_TALLY, yes: 1, no: 1, attested: ["r1"], disputed: ["r2"] }],
    };
    pruneRevoked(l, revoked("r2"));
    expect(l.verdicts![0]!.disputed).toBeUndefined();
    expect(isAttested(l.verdicts![0]!)).toBe(true);
  });

  test("a report's filers are pruned the same way", () => {
    const l: Ledger = {
      through: null,
      reports: [
        {
          cyrillic: "уул",
          kind: "correction",
          sessions: 2,
          reviewers: ["r1", "r2"],
          first_seen: "2026-08-01T00:00:00Z",
          last_seen: "2026-08-01T00:00:00Z",
        },
      ],
    };
    pruneRevoked(l, revoked("r1", "r2"));
    expect(l.reports[0]!.reviewers).toBeUndefined();
    expect(l.reports[0]!.sessions).toBe(2);
  });

  test("an intact roster prunes nothing", () => {
    const l: Ledger = {
      through: null,
      reports: [],
      verdicts: [{ ...BASE_TALLY, yes: 1, no: 0, attested: ["r1"] }],
    };
    expect(pruneRevoked(l, ROSTER)).toBe(0);
    expect(l.verdicts![0]!.attested).toEqual(["r1"]);
  });
});

describe("addReports — trusted reports", () => {
  test("names the reviewer who filed it, and merges labels across drains", () => {
    const l: Ledger = { through: null, reports: [] };
    const flag = { signal_type: "flag" as const, proposal_kind: "correction" as const };
    addReports(l, [row({ ...flag, reviewer_id: GRANT_A })], ROSTER);
    addReports(l, [row({ ...flag, reviewer_id: GRANT_B, session_id: "session-b" })], ROSTER);
    expect(l.reports[0]!.sessions).toBe(2);
    expect(l.reports[0]!.reviewers).toEqual(["r1", "r2"]);
  });

  test("an anonymous report carries no reviewers field at all", () => {
    const l: Ledger = { through: null, reports: [] };
    addReports(l, [row({ signal_type: "flag", proposal_kind: "correction" })], ROSTER);
    expect("reviewers" in l.reports[0]!).toBe(false);
  });
});

describe("fastTrack", () => {
  function tally(over: Partial<VerdictTally> = {}): VerdictTally {
    return {
      cyrillic: "уул",
      traditional: "ᠤᠤᠯ",
      yes: 2,
      no: 0,
      attested: ["r1", "r2"],
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
      ...over,
    };
  }

  function index(...entries: Entry[]): EntryIndex {
    return new Map(entries.map((e) => [e.cyrillic, { entry: e, file: "/repo/data/lexicon/у.json" }]));
  }

  test("stages a candidate trusted reviewers attested", () => {
    const staged = fastTrack([tally()], index(structuredClone(UUL)));
    expect(staged).toHaveLength(1);
    expect(staged[0]!.candidate.traditional).toBe("ᠤᠤᠯ");
    expect(staged[0]!.file).toBe("/repo/data/lexicon/у.json");
  });

  test("stages nothing on anonymous agreement, however much of it there is", () => {
    // The sentence this whole pipeline rests on, and the one thing no
    // threshold change may ever touch: a count of strangers agreeing is
    // evidence about where to look, never verification.
    expect(fastTrack([tally({ attested: undefined, yes: 40 })], index(structuredClone(UUL)))).toEqual([]);
    expect(fastTrack([tally({ attested: [] })], index(structuredClone(UUL)))).toEqual([]);
  });

  test("stages nothing one attestation short of the threshold", () => {
    const short = Array.from({ length: ATTESTATION_THRESHOLD - 1 }, (_, i) => `r${i + 1}`);
    expect(fastTrack([tally({ attested: short })], index(structuredClone(UUL)))).toEqual([]);
  });

  test("stages nothing when a trusted reviewer disagrees", () => {
    expect(fastTrack([tally({ disputed: ["r3"] })], index(structuredClone(UUL)))).toEqual([]);
  });

  test("leaves an already verified candidate alone", () => {
    const verified: Entry = {
      cyrillic: "уул",
      candidates: [{ traditional: "ᠤᠤᠯ", verified: true, source: "manual" }],
    };
    expect(fastTrack([tally()], index(verified))).toEqual([]);
  });

  test("cannot stage a composed suffix candidate, which lives in no file", () => {
    const composed = tally({ cyrillic: "номын", traditional: `ᠨᠣᠮ${NNBSP}ᠤᠨ` });
    expect(fastTrack([composed], index(structuredClone(UUL)))).toEqual([]);
  });

  test("cannot stage a spelling the entry does not have", () => {
    expect(fastTrack([tally({ traditional: "ᠠᠭᠤᠯᠠ" })], index(structuredClone(UUL)))).toEqual([]);
  });

  test("orders by weight of attestation, so the cap keeps the strongest", () => {
    const two = tally({ cyrillic: "ном", traditional: "ᠨᠣᠮ" });
    const three = tally({ attested: ["r1", "r2", "r3"] });
    const entries = index(structuredClone(UUL), {
      cyrillic: "ном",
      candidates: [{ traditional: "ᠨᠣᠮ", verified: false, source: "wmk-import" }],
    });
    expect(fastTrack([two, three], entries).map((s) => s.tally.cyrillic)).toEqual(["уул", "ном"]);
  });
});

describe("revokedFlips", () => {
  function flip(over: Partial<Flip> = {}): Flip {
    return { cyrillic: "уул", traditional: "ᠤᠤᠯ", labels: ["r1"], date: "2026-08-01", ...over };
  }

  function indexOf(...entries: Entry[]): EntryIndex {
    return new Map(entries.map((e) => [e.cyrillic, { entry: e, file: "/repo/data/lexicon/у.json" }]));
  }

  const VERIFIED: Entry = {
    cyrillic: "уул",
    candidates: [{ traditional: "ᠤᠤᠯ", verified: true, source: "wmk-import" }],
  };

  function revoked(...labels: string[]) {
    return ROSTER.map((r) => (labels.includes(r.label) ? { ...r, revoked: "2026-08-02" } : r));
  }

  test("a flip stands untouched while one of its labels is active", () => {
    const { keep, reverts } = revokedFlips([flip({ labels: ["r1", "r2"] })], revoked("r2"), indexOf(VERIFIED));
    expect(reverts).toEqual([]);
    // Kept verbatim — the record says who stood behind it, not who still does.
    expect(keep).toEqual([flip({ labels: ["r1", "r2"] })]);
  });

  test("unwinds a flip whose every grant is revoked, and drops its record", () => {
    const { keep, reverts } = revokedFlips([flip()], revoked("r1"), indexOf(structuredClone(VERIFIED)));
    expect(keep).toEqual([]);
    expect(reverts).toHaveLength(1);
    expect(reverts[0]!.flip.cyrillic).toBe("уул");
    // The caller applies the write; this only stages it.
    expect(reverts[0]!.candidate.verified).toBe(true);
  });

  test("a candidate that is gone has nothing to unwind — the record just leaves", () => {
    const { keep, reverts } = revokedFlips([flip()], revoked("r1"), indexOf());
    expect(keep).toEqual([]);
    expect(reverts).toEqual([]);
  });

  test("a candidate already unverified by hand is left alone", () => {
    const { keep, reverts } = revokedFlips([flip()], revoked("r1"), indexOf(structuredClone(UUL)));
    expect(keep).toEqual([]);
    expect(reverts).toEqual([]);
  });

  test("a hand-verified spelling has no record here and is never touched", () => {
    // Revocation unwinds what the pipeline did, not what a person decided:
    // only fast-track flips write records, so a verification typed into an
    // entry by a human is simply not in this ledger.
    const { reverts } = revokedFlips([], revoked("r1"), indexOf(VERIFIED));
    expect(reverts).toEqual([]);
  });
});

describe("verdictIsOpen — trusted disputes", () => {
  const verified: Entry = {
    cyrillic: "уул",
    candidates: [{ traditional: "ᠤᠤᠯ", verified: true, source: "manual" }],
  };
  const base: VerdictTally = {
    cyrillic: "уул",
    traditional: "ᠤᠤᠯ",
    yes: 1,
    no: 1,
    first_seen: "2026-08-01T00:00:00Z",
    last_seen: "2026-08-01T00:00:00Z",
  };

  test("a verified candidate normally settles its tally", () => {
    expect(verdictIsOpen(base, lexiconOf(verified))).toBe(false);
  });

  test("a trusted no about a verified candidate keeps being asked", () => {
    // Two people who read the script contradicting each other is the one thing
    // this pipeline must not quietly close.
    expect(verdictIsOpen({ ...base, disputed: ["r3"] }, lexiconOf(verified))).toBe(true);
  });

  test("but a form that is gone stays gone", () => {
    const replaced: Entry = {
      cyrillic: "уул",
      candidates: [{ traditional: "ᠠᠭᠤᠯᠠ", verified: true, source: "manual" }],
    };
    expect(verdictIsOpen({ ...base, disputed: ["r3"] }, lexiconOf(replaced))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Expert review decisions

let nextDecisionId = 0;
function decision(over: Partial<DecisionRow> = {}): DecisionRow {
  nextDecisionId++;
  return {
    id: nextDecisionId,
    created_at: "2026-08-01T00:00:00Z",
    cyrillic: "уул",
    traditional: "ᠤᠤᠯ",
    action: "verify",
    sense: null,
    reviewer_id: GRANT_A,
    ...over,
  };
}

function indexOf(...entries: Entry[]): EntryIndex {
  return new Map(entries.map((e) => [e.cyrillic, { entry: e, file: "/data/lexicon/х.json" }]));
}

describe("supersede", () => {
  test("a reviewer who changed their mind is counted once, the later way", () => {
    const first = decision({ id: 10, action: "verify" });
    const second = decision({ id: 11, action: "reject" });
    expect(supersede([first, second])).toEqual([second]);
  });

  test("two reviewers about one spelling both stand", () => {
    const a = decision({ id: 20, reviewer_id: GRANT_A });
    const b = decision({ id: 21, reviewer_id: GRANT_B });
    expect(supersede([a, b])).toHaveLength(2);
  });

  test("one reviewer about two spellings both stand", () => {
    const a = decision({ id: 30, traditional: "ᠤᠤᠯ" });
    const b = decision({ id: 31, traditional: "ᠠᠭᠤᠯᠠ" });
    expect(supersede([a, b])).toHaveLength(2);
  });

  test("order is row order, which is why the export sorts by id", () => {
    // now() is transaction time, so every row of one review session shares a
    // created_at. Only the identity column can tell them apart.
    const same = { created_at: "2026-08-01T00:00:00Z" };
    const first = decision({ id: 40, action: "reject", ...same });
    const second = decision({ id: 41, action: "verify", ...same });
    expect(supersede([first, second])[0]!.action).toBe("verify");
  });
});

describe("freshDecisions", () => {
  test("skips what a previous run already transcribed", () => {
    const rows = [decision({ id: 100 }), decision({ id: 101 })];
    expect(freshDecisions(rows, null).map((d) => d.id)).toEqual([100, 101]);
    expect(freshDecisions(rows, 100).map((d) => d.id)).toEqual([101]);
    expect(freshDecisions(rows, latestDecisionId(rows, null))).toEqual([]);
  });

  test("a watermark survives a run that drained nothing", () => {
    expect(latestDecisionId([], 55)).toBe(55);
  });
});

describe("decisionVerdicts", () => {
  test("verify and accept are both yes; reject is no", () => {
    const rows = decisionVerdicts([
      decision({ action: "verify" }),
      decision({ action: "accept_proposal" }),
      decision({ action: "reject" }),
    ]);
    expect(rows.map((r) => r.verdict)).toEqual([true, true, false]);
  });

  test("carries the stamp, so the roster decides what it is worth", () => {
    const [row] = decisionVerdicts([decision()]);
    expect(row!.reviewer_id).toBe(GRANT_A);
    expect(row!.signal_type).toBe("verdict");
  });

  test("a decision reaches the fast track through the ordinary machinery", () => {
    // The whole reason decisions become verdicts: one threshold, one veto, one
    // per-pull-request cap, and one place that writes `verified: true`.
    const l: Ledger = { through: null, reports: [] };
    addVerdicts(
      l,
      decisionVerdicts([
        decision({ reviewer_id: GRANT_A }),
        decision({ reviewer_id: GRANT_B }),
      ]),
      ROSTER,
    );
    expect(isAttested(l.verdicts![0]!)).toBe(true);
    expect(fastTrack(l.verdicts!, indexOf(UUL))).toHaveLength(1);
  });

  test("one trusted rejection vetoes however many accept", () => {
    const l: Ledger = { through: null, reports: [] };
    addVerdicts(
      l,
      decisionVerdicts([
        decision({ reviewer_id: GRANT_A }),
        decision({ reviewer_id: GRANT_B }),
        decision({ reviewer_id: GRANT_C, action: "reject" }),
      ]),
      ROSTER,
    );
    expect(isDisputed(l.verdicts![0]!)).toBe(true);
    expect(fastTrack(l.verdicts!, indexOf(UUL))).toEqual([]);
  });
});

describe("acceptances", () => {
  const HUR: Entry = {
    cyrillic: "хур",
    candidates: [{ traditional: "ᠬᠤᠷ", sense: "last year's", verified: false, source: "wiktionary" }],
  };
  const accept = (over: Partial<DecisionRow> = {}) =>
    decision({ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", action: "accept_proposal", ...over });
  const claims = (...decisions: DecisionRow[]) => acceptanceClaims(decisions, ROSTER);

  test("a word with no entry needs no meaning label", () => {
    const got = acceptances(claims(accept()), indexOf());
    expect(got).toHaveLength(1);
    expect(got[0]!.blocked).toBeUndefined();
    expect(got[0]!.labels).toEqual(["r1"]);
  });

  test("two reviewers accepting one spelling is one candidate, not two", () => {
    // Writing it twice puts a duplicate form in the entry, which the schema
    // forbids — so the whole pull request fails validation in CI and the
    // maintainer gets a broken diff instead of a judgement.
    const got = acceptances(claims(accept({ reviewer_id: GRANT_A }), accept({ reviewer_id: GRANT_B })), indexOf());
    expect(got).toHaveLength(1);
    expect(got[0]!.labels).toEqual(["r1", "r2"]);
  });

  test("a second reviewer's label unblocks what the first left unlabelled", () => {
    const got = acceptances(
      claims(accept({ reviewer_id: GRANT_A }), accept({ reviewer_id: GRANT_B, sense: "rain" })),
      indexOf(HUR),
    );
    expect(got).toHaveLength(1);
    expect(got[0]!.blocked).toBeUndefined();
    expect(got[0]!.sense).toBe("rain");
  });

  test("a second candidate needs one, and says so rather than failing later", () => {
    // The entry schema requires a `sense` on every candidate once there are
    // two. Writing this without one would fail `bun run validate` in CI, where
    // nobody would connect the failure back to a reviewer's judgement.
    const got = acceptances(claims(accept()), indexOf(HUR));
    expect(got[0]!.blocked).toContain("`sense`");
  });

  test("a labelled acceptance beside a labelled candidate goes through", () => {
    const got = acceptances(claims(accept({ sense: "rain" })), indexOf(HUR));
    expect(got[0]!.blocked).toBeUndefined();
  });

  test("an unlabelled candidate already stored blocks it, and is named", () => {
    // This pipeline never edits a candidate that already exists, so the label
    // the other one needs has to come from a human.
    const bare: Entry = {
      cyrillic: "хур",
      candidates: [{ traditional: "ᠬᠤᠷ", verified: false, source: "wmk-import" }],
    };
    const got = acceptances(claims(accept({ sense: "rain" })), indexOf(bare));
    expect(got[0]!.blocked).toContain("ᠬᠤᠷ");
  });

  test("ignores a stamp nobody was granted", () => {
    const stranger = "00000000-0000-4000-8000-000000000000";
    expect(claims(accept({ reviewer_id: stranger }))).toEqual([]);
  });

  test("ignores a spelling the entry already holds — there is nothing to add", () => {
    // The attestation that came with it still counts; only the write is moot.
    expect(acceptances(claims(accept({ traditional: "ᠬᠤᠷ" })), indexOf(HUR))).toEqual([]);
  });

  test("ignores anything that is not an acceptance", () => {
    expect(claims(decision({ action: "verify" }))).toEqual([]);
    expect(claims(decision({ action: "reject" }))).toEqual([]);
  });

  test("refuses what the validator would refuse", () => {
    expect(acceptances(claims(accept({ traditional: "hura" })), indexOf())).toEqual([]);
    expect(acceptances(claims(accept({ cyrillic: "hur" })), indexOf())).toEqual([]);
  });

  test("a carried acceptance is a claim again, and writes once unblocked", () => {
    // The lifecycle the ledger exists for: accepted last week, blocked on a
    // missing `sense`, carried — then somebody labels the stored candidate by
    // hand, and this run the same judgement goes through, no re-review asked.
    const l: Ledger = {
      through: null,
      reports: [],
      blocked_acceptances: [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", sense: "rain", labels: ["r1"] }],
    };
    const blockedRun = acceptances(carriedClaims(l), indexOf({
      cyrillic: "хур",
      candidates: [{ traditional: "ᠬᠤᠷ", verified: false, source: "wmk-import" }],
    }));
    expect(blockedRun[0]!.blocked).toContain("ᠬᠤᠷ");
    const unblockedRun = acceptances(carriedClaims(l), indexOf(HUR));
    expect(unblockedRun).toHaveLength(1);
    expect(unblockedRun[0]!.blocked).toBeUndefined();
    expect(unblockedRun[0]!.labels).toEqual(["r1"]);
  });

  test("a tally about a still-pending spelling stays open", () => {
    // Its attestation is what will flip the candidate the run the acceptance
    // finally writes it; dropping the tally would strand that candidate
    // verified: false with its verification lost.
    const tally: VerdictTally = {
      cyrillic: "хур",
      traditional: "ᠬᠤᠷᠠ",
      yes: 1,
      no: 0,
      attested: ["r1"],
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
    };
    expect(verdictIsOpen(tally, lexiconOf())).toBe(false);
    expect(verdictIsOpen(tally, lexiconOf(), new Set(["хур|ᠬᠤᠷᠠ"]))).toBe(true);
  });

  test("pruneRevoked drops a carried acceptance with nobody left behind it", () => {
    const l: Ledger = {
      through: null,
      reports: [],
      blocked_acceptances: [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r2"] }],
    };
    pruneRevoked(l, ROSTER.map((r) => (r.label === "r2" ? { ...r, revoked: "2026-08-02" } : r)));
    expect(l.blocked_acceptances).toBeUndefined();
  });
});

describe("declinedProposals", () => {
  const reject = (over: Partial<DecisionRow> = {}) =>
    decision({ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", action: "reject", ...over });

  test("a trusted no to a spelling the lexicon does not hold is a decline", () => {
    const got = declinedProposals([reject()], ROSTER, indexOf());
    expect(got).toEqual([{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r1"] }]);
  });

  test("a no to a stored candidate is a rejection, never a decline", () => {
    // A stored candidate travels the other road: a dispute in the ledger and
    // a write-up naming the file — removing it stays a human's edit.
    expect(declinedProposals([reject({ traditional: "ᠤᠤᠯ", cyrillic: "уул" })], ROSTER, indexOf(UUL))).toEqual([]);
  });

  test("two reviewers declining one spelling merge into one line", () => {
    const got = declinedProposals([reject({ reviewer_id: GRANT_A }), reject({ reviewer_id: GRANT_B })], ROSTER, indexOf());
    expect(got).toHaveLength(1);
    expect(got[0]!.labels).toEqual(["r1", "r2"]);
  });

  test("an unknown stamp declines nothing", () => {
    const stranger = "00000000-0000-4000-8000-000000000000";
    expect(declinedProposals([reject({ reviewer_id: stranger })], ROSTER, indexOf())).toEqual([]);
  });

  test("verify and accept are not declines", () => {
    expect(declinedProposals([decision({ action: "verify" })], ROSTER, indexOf())).toEqual([]);
    expect(declinedProposals([decision({ action: "accept_proposal" })], ROSTER, indexOf())).toEqual([]);
  });
});

describe("removeDeclinedReports", () => {
  function proposalReport(over: Partial<Report> = {}): Report {
    return {
      cyrillic: "хур",
      kind: "new_word",
      proposal_traditional: "ᠬᠤᠷᠠ",
      sessions: 2,
      first_seen: "2026-08-01T00:00:00Z",
      last_seen: "2026-08-01T00:00:00Z",
      ...over,
    };
  }

  test("closes every report carrying the declined spelling", () => {
    const l: Ledger = { through: null, reports: [proposalReport(), proposalReport({ kind: "correction" })] };
    const removed = removeDeclinedReports(l, [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r1"] }]);
    expect(removed).toBe(2);
    expect(l.reports).toEqual([]);
  });

  test("a different proposed spelling for the same word stays open", () => {
    // The reviewer declined a spelling, not the word.
    const other = proposalReport({ proposal_traditional: "ᠬᠤᠷ" });
    const l: Ledger = { through: null, reports: [proposalReport(), other] };
    removeDeclinedReports(l, [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r1"] }]);
    expect(l.reports).toEqual([other]);
  });

  test("a closed report cannot become a mechanical addition", () => {
    // The veto: two strangers typing the same spelling stops mattering in the
    // run a trusted reviewer says that spelling is wrong.
    const l: Ledger = { through: null, reports: [proposalReport()] };
    expect(mechanicalAdditions(l.reports, new Set())).toHaveLength(1);
    removeDeclinedReports(l, [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r1"] }]);
    expect(mechanicalAdditions(l.reports, new Set())).toEqual([]);
  });

  test("reports without a proposal are untouched", () => {
    const flag = proposalReport({ proposal_traditional: undefined, kind: "correction", traditional: "ᠬᠤᠷ" });
    const l: Ledger = { through: null, reports: [flag] };
    expect(removeDeclinedReports(l, [{ cyrillic: "хур", traditional: "ᠬᠤᠷᠠ", labels: ["r1"] }])).toBe(0);
    expect(l.reports).toEqual([flag]);
  });
});
