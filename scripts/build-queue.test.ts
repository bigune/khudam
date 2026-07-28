/**
 * Unit tests for the verification queue's selection and ordering — which
 * candidates get asked about, and in what order people meet them.
 */
import { describe, expect, test } from "bun:test";
import { buildQuestions, questionId } from "./build-queue.ts";
import type { Frequency } from "./aggregate-signals.ts";
import type { Entry } from "./lib.ts";

function lexiconOf(...entries: Entry[]): Map<string, Entry> {
  return new Map(entries.map((e) => [e.cyrillic, e]));
}

const NO_TRAFFIC: Frequency = { words: {} };

/** Two sources, two spellings, neither verified — what isConflict looks for. */
const CONFLICTED: Entry = {
  cyrillic: "агзайх",
  candidates: [
    { traditional: "ᠠᠭᠵᠠᠢᠬᠤ", sense: "unlabeled", verified: false, source: "wmk-import" },
    { traditional: "ᠠᠭᠵᠠᠶᠢᠬᠤ", sense: "to shiver", verified: false, source: "wiktionary" },
  ],
};

const QUIET: Entry = {
  cyrillic: "ном",
  candidates: [{ traditional: "ᠨᠣᠮ", verified: false, source: "wmk-import" }],
};

describe("questionId", () => {
  test("is stable for the same candidate and different across candidates", () => {
    expect(questionId("уул", "ᠤᠤᠯ")).toBe(questionId("уул", "ᠤᠤᠯ"));
    expect(questionId("уул", "ᠤᠤᠯ")).not.toBe(questionId("уул", "ᠠᠭᠤᠯᠠ"));
    expect(questionId("уул", "ᠤᠤᠯ")).not.toBe(questionId("ном", "ᠤᠤᠯ"));
  });

  test("fits the question_id column (64 characters)", () => {
    expect(questionId("хөгжимчин", "ᠬᠥᠭᠵᠢᠮᠴᠢᠨ").length).toBeLessThanOrEqual(64);
  });
});

describe("buildQuestions", () => {
  test("asks about both sides of a conflict, so a homonym can survive it", () => {
    const questions = buildQuestions(lexiconOf(CONFLICTED), new Set(), NO_TRAFFIC);
    expect(questions.map((q) => q.traditional)).toEqual(["ᠠᠭᠵᠠᠢᠬᠤ", "ᠠᠭᠵᠠᠶᠢᠬᠤ"]);
    expect(questions.every((q) => q.reason === "conflict")).toBe(true);
  });

  test("shows the other candidates as context", () => {
    const [first] = buildQuestions(lexiconOf(CONFLICTED), new Set(), NO_TRAFFIC);
    expect(first!.alternatives).toEqual([
      { traditional: "ᠠᠭᠵᠠᠶᠢᠬᠤ", verified: false, sense: "to shiver" },
    ]);
  });

  test("never shows the unlabeled placeholder as a meaning", () => {
    const [first] = buildQuestions(lexiconOf(CONFLICTED), new Set(), NO_TRAFFIC);
    expect(first!.sense).toBeUndefined();
  });

  test("leaves alone what nobody chose, flagged, or disputed", () => {
    expect(buildQuestions(lexiconOf(QUIET), new Set(), NO_TRAFFIC)).toEqual([]);
  });

  test("asks about a quiet candidate once someone copies it", () => {
    const questions = buildQuestions(lexiconOf(QUIET), new Set(), { words: { ном: { "ᠨᠣᠮ": 4 } } });
    expect(questions).toHaveLength(1);
    expect(questions[0]!.reason).toBe("traffic");
  });

  test("never asks about a candidate a human already verified", () => {
    const verified: Entry = {
      cyrillic: "ном",
      candidates: [{ traditional: "ᠨᠣᠮ", verified: true, source: "manual" }],
    };
    expect(buildQuestions(lexiconOf(verified), new Set(["ном|ᠨᠣᠮ"]), NO_TRAFFIC)).toEqual([]);
  });

  test("a flag outranks a source disagreement", () => {
    const questions = buildQuestions(
      lexiconOf(CONFLICTED, QUIET),
      new Set(["ном|ᠨᠣᠮ"]),
      NO_TRAFFIC,
    );
    expect(questions[0]).toMatchObject({ cyrillic: "ном", reason: "flagged" });
  });

  test("traffic orders the tier, most-copied first", () => {
    const quieter: Entry = {
      cyrillic: "гэр",
      candidates: [{ traditional: "ᠭᠡᠷ", verified: false, source: "wmk-import" }],
    };
    const questions = buildQuestions(lexiconOf(QUIET, quieter), new Set(), {
      words: { ном: { "ᠨᠣᠮ": 2 }, гэр: { "ᠭᠡᠷ": 9 } },
    });
    expect(questions.map((q) => q.cyrillic)).toEqual(["гэр", "ном"]);
  });

  test("a corroborated candidate sinks below an uncorroborated one", () => {
    const corroborated: Entry = {
      cyrillic: "гэр",
      candidates: [{ traditional: "ᠭᠡᠷ", verified: false, corroborated: true, source: "wiktionary" }],
    };
    const questions = buildQuestions(lexiconOf(QUIET, corroborated), new Set(), {
      words: { ном: { "ᠨᠣᠮ": 2 }, гэр: { "ᠭᠡᠷ": 9 } },
    });
    // Higher traffic would have put гэр first; two sources agreeing sends it back.
    expect(questions.map((q) => q.cyrillic)).toEqual(["ном", "гэр"]);
  });

  test("a flagged corroborated candidate escalates instead of sinking", () => {
    const corroborated: Entry = {
      cyrillic: "гэр",
      candidates: [{ traditional: "ᠭᠡᠷ", verified: false, corroborated: true, source: "wiktionary" }],
    };
    const questions = buildQuestions(lexiconOf(QUIET, corroborated), new Set(["гэр|ᠭᠡᠷ"]), {
      words: { ном: { "ᠨᠣᠮ": 99 } },
    });
    expect(questions[0]).toMatchObject({ cyrillic: "гэр", reason: "flagged", corroborated: true });
  });
});
