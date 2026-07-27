/**
 * Systematic correction (ENCODING.md Decision 003): remove the spurious
 * NIRUGU (U+180A) that the wmk-import converter inserted between MVS (U+180E)
 * and the detached final vowel, rewriting MVS+NIRUGU+vowel to MVS+vowel.
 *
 * The nirugu is a ZWJ-like stem extender (UTN #57: patronymic abbreviations);
 * wedged after MVS it forces an ordinary connected final a/e, defeating MVS's
 * purpose — producing the special detached final vowel form. The seed encodes
 * the same phenomenon both ways (1,113 hacked vs 134 standard), which is how
 * the hack was caught. See data/ENCODING.md Decision 003 for the evidence.
 *
 * Safety rules (same as fix-yi-digraph.ts):
 *   - never modifies a candidate marked verified: true (human-reviewed data);
 *   - corrected candidates stay verified: false — a machine correction is NOT
 *     human verification;
 *   - candidates that become identical within one entry after the rewrite are
 *     de-duplicated, keeping a verified candidate over an unverified one;
 *   - DRY-RUN by default. Pass --apply to write files.
 *
 * Usage:
 *   bun scripts/fix-mvs-nirugu.ts                       # dry-run: report only
 *   bun scripts/fix-mvs-nirugu.ts --changeset out.json  # dry-run + changeset dump
 *   bun scripts/fix-mvs-nirugu.ts --apply               # write corrected files
 */
import { existsSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import {
  NAMES_FILE,
  REPO_ROOT,
  listShardFiles,
  readEntriesFile,
  writeEntriesFile,
  type Candidate,
  type Entry,
} from "./lib.ts";

const MVS_NIRUGU = String.fromCodePoint(0x180e, 0x180a); // ᠎᠊  (MVS + spurious nirugu)
const MVS = String.fromCodePoint(0x180e); //                ᠎   (MVS alone — the correction)

const apply = process.argv.includes("--apply");
const csFlag = process.argv.indexOf("--changeset");
const changesetPath = csFlag !== -1 ? process.argv[csFlag + 1] : undefined;

const rel = (f: string) => relative(REPO_ROOT, f).replaceAll("\\", "/");
const cps = (s: string) =>
  [...s].map((ch) => "U+" + ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")).join(" ");

interface Change {
  file: string;
  cyrillic: string;
  latin: string;
  before: string;
  after: string;
  beforeCps: string;
  afterCps: string;
  occurrences: number;
}

const changes: Change[] = [];
const skippedVerified: Change[] = [];
const dedups: { file: string; cyrillic: string; dropped: string; keptVerified: boolean }[] = [];

const files = [...listShardFiles()];
if (existsSync(NAMES_FILE)) files.push(NAMES_FILE);

let filesChanged = 0;
let candidatesRewritten = 0;
let occurrencesReplaced = 0;

for (const file of files) {
  const entries: Entry[] = readEntriesFile(file);
  let fileChanged = false;

  for (const entry of entries) {
    const kept: Candidate[] = [];
    const indexByForm = new Map<string, number>();

    for (const cand of entry.candidates) {
      if (cand.traditional.includes(MVS_NIRUGU)) {
        const occurrences = cand.traditional.split(MVS_NIRUGU).length - 1;
        const before = cand.traditional;
        const after = before.replaceAll(MVS_NIRUGU, MVS);
        const change: Change = {
          file: rel(file),
          cyrillic: entry.cyrillic,
          latin: cand.latin ?? "",
          before,
          after,
          beforeCps: cps(before),
          afterCps: cps(after),
          occurrences,
        };
        if (cand.verified === true) {
          skippedVerified.push(change);
        } else {
          changes.push(change);
          candidatesRewritten++;
          occurrencesReplaced += occurrences;
          cand.traditional = after;
          fileChanged = true;
        }
      }

      // De-duplicate candidates that are now identical within this entry.
      const dupIdx = indexByForm.get(cand.traditional);
      if (dupIdx !== undefined) {
        const survivor = kept[dupIdx];
        const preferNew = cand.verified === true && survivor.verified !== true;
        dedups.push({
          file: rel(file),
          cyrillic: entry.cyrillic,
          dropped: cand.traditional,
          keptVerified: preferNew ? true : survivor.verified === true,
        });
        if (preferNew) kept[dupIdx] = cand;
        fileChanged = true;
        continue;
      }
      indexByForm.set(cand.traditional, kept.length);
      kept.push(cand);
    }

    entry.candidates = kept;
  }

  if (fileChanged) {
    filesChanged++;
    if (apply) writeEntriesFile(file, entries);
  }
}

// ---- report ----
console.log(`MVS+NIRUGU (${cps(MVS_NIRUGU)}) → MVS (${cps(MVS)}) correction — drop the spurious nirugu\n`);
console.log(`  files affected:                ${filesChanged}`);
console.log(`  candidate forms rewritten:     ${candidatesRewritten}`);
console.log(`  sequences replaced:            ${occurrencesReplaced}`);
console.log(`  candidates de-duplicated:      ${dedups.length}`);
if (skippedVerified.length) {
  console.log(`  skipped (verified: true):      ${skippedVerified.length}  <- need a human PR instead`);
  for (const c of skippedVerified) console.log(`    ${c.cyrillic}  ${c.before}`);
}

console.log(`\n  sample (first 12):`);
for (const c of changes.slice(0, 12)) {
  console.log(`    ${c.cyrillic}${c.latin ? ` (${c.latin})` : ""}`);
  console.log(`      before ${c.before}   [${c.beforeCps}]`);
  console.log(`      after  ${c.after}   [${c.afterCps}]`);
}

if (changesetPath) {
  writeFileSync(changesetPath, JSON.stringify({ changes, skippedVerified, dedups }, null, 2), "utf8");
  console.log(`\n  changeset written: ${changesetPath}`);
}

console.log(
  apply
    ? `\n  APPLIED — ${filesChanged} files written. Run \`bun run validate\` next.`
    : `\n  DRY-RUN — no files written. Pass --apply to write.`,
);
