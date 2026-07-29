import { describe, expect, test } from "bun:test";
import { nextLabel } from "./add-reviewer.ts";
import type { Reviewer } from "./lib.ts";

function grant(label: string, revoked?: string): Reviewer {
  return {
    label,
    hash: "0".repeat(64),
    granted: "2026-07-29",
    ...(revoked !== undefined ? { revoked } : {}),
  };
}

describe("nextLabel", () => {
  test("numbers from r1 on an empty roster", () => {
    expect(nextLabel([])).toBe("r1");
  });

  test("continues past the highest label in use", () => {
    expect(nextLabel([grant("r1"), grant("r2")])).toBe("r3");
  });

  test("never reissues a revoked label — the tombstone holds its number", () => {
    // The failure this prevents: revoke r2, issue a new grant, and a different
    // person becomes r2 — merging two people's attestations under one label.
    expect(nextLabel([grant("r1"), grant("r2", "2026-08-01")])).toBe("r3");
  });

  test("a roster of nothing but tombstones still moves forward", () => {
    expect(nextLabel([grant("r1", "2026-08-01"), grant("r2", "2026-08-01")])).toBe("r3");
  });
});
