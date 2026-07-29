/**
 * Revoke a trusted-reviewer grant. Run with: bun run reviewer:revoke r2
 *
 * Revocation is a tombstone, not a deletion: the object stays in
 * data/reviewers.json with a `revoked` date on it. The line has to stay
 * because `nextLabel` numbers new grants past every label that has ever
 * existed — deleting the highest line would hand its label to the next
 * person, silently merging two people's attestations in the ledger.
 *
 * What revoking does, once the change is merged: the weekly job stops
 * matching the grant's stamps (`reviewerLabelOf` skips tombstones), and it
 * drops the attestations earlier runs already recorded in
 * data/stats/reports.json (`pruneRevoked`). Anonymous counts stay — a revoked
 * reviewer was still a person who answered; what they lose is the weight of
 * the grant, not the answer.
 */
import { REVIEWERS_FILE, readReviewers, writeReviewers } from "./lib.ts";

function main(): void {
  const label = process.argv[2];
  if (!label) {
    console.error("Usage: bun scripts/revoke-reviewer.ts <label>   e.g. r2");
    process.exit(1);
  }
  const roster = readReviewers();
  const grant = roster.find((r) => r.label === label);
  if (grant === undefined) {
    const known = roster.map((r) => r.label).join(", ") || "none";
    console.error(`No grant labelled ${label} in ${REVIEWERS_FILE} (known: ${known}).`);
    process.exit(1);
  }
  if (grant.revoked !== undefined) {
    console.log(`${label} was already revoked on ${grant.revoked}. Nothing to do.`);
    return;
  }
  grant.revoked = new Date().toISOString().slice(0, 10);
  writeReviewers(roster);
  console.log(
    `\n${label} revoked ${grant.revoked}. The line stays as a tombstone, so the label is\n` +
      "never reissued to a different person.\n\n" +
      "Commit and merge data/reviewers.json to make it take effect: from the next run,\n" +
      `the weekly job ignores ${label}'s stamps and drops the attestations it already\n` +
      "recorded in data/stats/reports.json. If the holder should still be a reviewer\n" +
      "(say, the link leaked), issue them a fresh grant: bun run reviewer:add\n",
  );
}

if (import.meta.main) {
  main();
}
