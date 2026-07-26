/**
 * Systematic correction: remove the spurious ᠶ (U+1836) that the wmk-import
 * converter inserted before ᠢ (U+1822), rewriting the ᠶᠢ digraph to a single ᠢ.
 *
 * In medial position ᠶ (U+1836) and ᠢ (U+1822) are near-homoglyphs, so the
 * source's machine converter stored Cyrillic й as ᠶᠢ (ya+i) — one tooth too
 * many. The correct form is a single ᠢ, which forms the diphthong after the
 * preceding vowel (e.g. сайн: ᠰᠠᠶᠢᠨ → ᠰᠠᠢᠨ). Confirmed by a native speaker via
 * side-by-side rendering of the candidate encodings.
 *
 * Safety rules:
 *   - never modifies a candidate marked verified: true (human-reviewed data);
 *   - corrected candidates stay verified: false — a machine correction is NOT
 *     human verification, so they still need review before becoming verified;
 *   - after the rewrite, candidates that become identical within one entry are
 *     de-duplicated (the validator forbids duplicate traditional forms), keeping
 *     a verified candidate over an unverified one;
 *   - default scope is SAFE: only entries whose Cyrillic key contains й. That
 *     excludes word-initial ᠶᠢ that spells a legitimate е/ё/ю/я glide (e.g. ес →
 *     ᠶᠢᠰᠦ) and loanword artifacts. Pass --include-no-short-i to rewrite every
 *     ᠶᠢ regardless (not recommended without per-entry human review).
 *   - DRY-RUN by default. Pass --apply to write files.
 *
 * Usage:
 *   bun scripts/fix-yi-digraph.ts                          # dry-run: report only
 *   bun scripts/fix-yi-digraph.ts --changeset out.json     # dry-run + dump changeset JSON
 *   bun scripts/fix-yi-digraph.ts --apply                  # write corrected files
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

const YI = String.fromCodePoint(0x1836, 0x1822); // ᠶᠢ  (spurious ya + i)
const I = String.fromCodePoint(0x1822); //          ᠢ   (single i — the correction)

const apply = process.argv.includes("--apply");
const includeNoShortI = process.argv.includes("--include-no-short-i");
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
  cyrHasShortI: boolean; // does the Cyrillic key contain й?
  occurrences: number; // how many ᠶᠢ were replaced in this form
}

const changes: Change[] = []; // rewrites that WERE applied (in scope)
const suspicious: Change[] = []; // rewritten despite no й in the key (only with --include-no-short-i)
const excluded: Change[] = []; // ᠶᠢ present but no й in the key — skipped by the default safe scope
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
    const cyrHasShortI = entry.cyrillic.includes("й");
    const kept: Candidate[] = [];
    const indexByForm = new Map<string, number>();

    for (const cand of entry.candidates) {
      if (cand.verified !== true && cand.traditional.includes(YI)) {
        const occurrences = cand.traditional.split(YI).length - 1;
        const before = cand.traditional;
        const after = before.replaceAll(YI, I);
        const change: Change = {
          file: rel(file),
          cyrillic: entry.cyrillic,
          latin: cand.latin ?? "",
          before,
          after,
          beforeCps: cps(before),
          afterCps: cps(after),
          cyrHasShortI,
          occurrences,
        };
        const inScope = cyrHasShortI || includeNoShortI;
        if (!inScope) {
          excluded.push(change);
        } else {
          changes.push(change);
          if (!cyrHasShortI) suspicious.push(change);
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
console.log(`ᠶᠢ (${cps(YI)}) → ᠢ (${cps(I)}) correction — drop the spurious ᠶ`);
console.log(`  scope: ${includeNoShortI ? "ALL ᠶᠢ (--include-no-short-i)" : "entries whose Cyrillic contains й (safe default)"}\n`);
console.log(`  files affected:               ${filesChanged}`);
console.log(`  candidate forms rewritten:    ${candidatesRewritten}`);
console.log(`  ᠶᠢ occurrences replaced:       ${occurrencesReplaced}`);
console.log(`  candidates de-duplicated:     ${dedups.length}`);
console.log(`  excluded (no й, out of scope): ${excluded.length}`);
if (suspicious.length) console.log(`  rewritten WITHOUT й in key:   ${suspicious.length}  <- forced in by --include-no-short-i`);

if (excluded.length) {
  console.log(`\n  excluded — ᠶᠢ but no й in the Cyrillic (held for manual review, all ${excluded.length}):`);
  for (const c of excluded) console.log(`    ${c.cyrillic}${c.latin ? ` (${c.latin})` : ""}  ${c.before} → would be ${c.after}`);
}

console.log(`\n  sample (first 12):`);
for (const c of changes.slice(0, 12)) {
  console.log(`    ${c.cyrillic}${c.latin ? ` (${c.latin})` : ""}`);
  console.log(`      before ${c.before}   [${c.beforeCps}]`);
  console.log(`      after  ${c.after}   [${c.afterCps}]`);
}

if (changesetPath) {
  writeFileSync(changesetPath, JSON.stringify({ changes, suspicious, excluded, dedups }, null, 2), "utf8");
  console.log(`\n  changeset written: ${changesetPath}`);
}

console.log(
  apply
    ? `\n  APPLIED — ${filesChanged} files written. Run \`bun run validate\` next.`
    : `\n  DRY-RUN — no files written. Pass --apply to write.`,
);
