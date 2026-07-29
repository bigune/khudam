/**
 * Issue a trusted-reviewer grant. Run with: bun run reviewer:add
 *
 * Prints one link, once. The link contains the grant — a random UUID — and
 * this script deliberately keeps no copy of it: data/reviewers.json receives
 * only its SHA-256 hash. If the link is lost before it reaches its reader,
 * issue another one and delete the stranded line; there is no recovery, and
 * that is the property that makes the roster safe to commit.
 *
 * What a grant buys: answers from that browser are stamped `reviewer_id`, and
 * the weekly job counts them as attestations rather than as anonymous votes.
 * Two different grants answering yes on one spelling, with none answering no,
 * is what lets the job stage `verified: true` for a human to merge. Nothing is
 * verified by a script alone — see CLAUDE.md and data/REVIEW.md.
 *
 * Grants are handed to people the maintainer knows read монгол бичиг. Who holds
 * which label is a private note; it must not be written into this repository.
 */
import {
  GRANT_HASH_RE,
  REVIEWERS_FILE,
  REVIEWER_LABEL_RE,
  hashGrant,
  readReviewers,
  writeReviewers,
  type Reviewer,
} from "./lib.ts";

/** Where the reader will open the link. The queue is the page a grant is for. */
const DEFAULT_SITE = "https://khudam.suray.mn/queue";

/**
 * The grant travels in a URL **fragment**, never a query string.
 *
 * A fragment is not sent to the server, so it cannot land in an access log, a
 * referrer header, or the analytics the site loads on every page. A `?r=`
 * parameter would be all three, and a secret that is written down in three
 * places by simply being clicked is not a secret. The page reads it on load and
 * clears it from the address bar.
 */
function grantLink(site: string, grant: string): string {
  return `${site.replace(/#.*$/u, "").replace(/\/+$/u, "")}#r=${grant}`;
}

/** r1, r2, … — the next unused number, so a revoked label is never reissued to
 *  a different person (which would silently merge two people's attestations in
 *  the ledger). Git history remembers the numbers that have been used. */
export function nextLabel(existing: readonly Reviewer[]): string {
  let highest = 0;
  for (const r of existing) {
    const n = Number(r.label.slice(1));
    if (REVIEWER_LABEL_RE.test(r.label) && n > highest) highest = n;
  }
  return `r${highest + 1}`;
}

function main(): void {
  const args = process.argv.slice(2);
  const siteAt = args.indexOf("--site");
  const site = siteAt === -1 ? DEFAULT_SITE : args[siteAt + 1];
  if (!site) {
    console.error("Usage: bun scripts/add-reviewer.ts [--site https://khudam.suray.mn/queue]");
    process.exit(1);
  }

  const roster = readReviewers();
  const grant = crypto.randomUUID();
  const hash = hashGrant(grant);
  if (!GRANT_HASH_RE.test(hash)) {
    console.error(`Refusing to write a hash of an unexpected shape: ${hash}`);
    process.exit(1);
  }
  const label = nextLabel(roster);
  const granted = new Date().toISOString().slice(0, 10);

  roster.push({ label, hash, granted });
  writeReviewers(roster);

  console.log(`\nGrant ${label} issued ${granted}. Give this link to one person, once:\n`);
  console.log(`  ${grantLink(site, grant)}\n`);
  console.log(
    "This is the only time it will be shown — data/reviewers.json holds the hash,\n" +
      "not the link. Send it privately; anyone who opens it becomes " + label + ".\n\n" +
      "Keep your own note of who " + label + " is. That mapping must not be committed:\n" +
      "the repo says two trusted people agreed, never which two.\n\n" +
      `Commit ${REVIEWERS_FILE.split("/").slice(-2).join("/")} to activate the grant — ` +
      "the weekly job reads the roster\nfrom the merged repository. To revoke, delete the " +
      `object labelled ${label}: that also\ndrops their past attestations, which is how a ` +
      "leaked link is made harmless.\n",
  );
}

if (import.meta.main) {
  main();
}
