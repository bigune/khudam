/**
 * scripts/preview.ts — render lexicon entries to a static HTML page for HUMAN
 * REVIEW: large, VERTICAL traditional script beside its Cyrillic, Latin, and
 * code points.
 *
 * Encoding correctness cannot be judged from tiny horizontal JSON — several
 * Mongolian letters share a glyph, so you review by CODE POINT + Latin, with a
 * proper vertical rendering for legibility. (The ᠶᠢ defect existed precisely
 * because ᠶ and ᠢ look alike.) This is the tool that makes review humane.
 *
 * Usage:
 *   bun scripts/preview.ts с                      # a whole shard (data/lexicon/с.json)
 *   bun scripts/preview.ts сайн уул монгол         # specific words (looked up anywhere)
 *   bun scripts/preview.ts --names                # data/names.json
 *   bun scripts/preview.ts х --unverified-only --limit 300
 *   bun scripts/preview.ts data/lexicon/у.json --out .plans/u.html
 *
 * Options:
 *   --names             also include data/names.json
 *   --unverified-only   only entries with at least one unverified candidate
 *   --limit <n>         cap entries rendered (default 800)
 *   --out <path>        output file (default .plans/preview.html)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  CYRILLIC_WORD_RE,
  LEXICON_DIR,
  NAMES_FILE,
  REPO_ROOT,
  listShardFiles,
  readEntriesFile,
  type Candidate,
  type Entry,
} from "./lib.ts";

// ---- args ----
const argv = process.argv.slice(2);
let out = join(REPO_ROOT, ".plans", "preview.html");
let limit = 800;
let unverifiedOnly = false;
let includeNames = false;
const targets: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--out") out = resolve(argv[++i]);
  else if (a === "--limit") limit = Number(argv[++i]);
  else if (a === "--unverified-only") unverifiedOnly = true;
  else if (a === "--names") includeNames = true;
  else targets.push(a);
}

// ---- collect entries ----
const collected: { entry: Entry; file: string }[] = [];
const add = (file: string) => {
  for (const e of readEntriesFile(file)) collected.push({ entry: e, file });
};

const words = new Set<string>();
for (const t of targets) {
  if (t.endsWith(".json") && existsSync(t)) add(resolve(t));
  else if ([...t].length === 1 && CYRILLIC_WORD_RE.test(t)) {
    const shard = join(LEXICON_DIR, `${t}.json`);
    if (existsSync(shard)) add(shard);
    else console.warn(`  (no shard for "${t}")`);
  } else words.add(t.normalize("NFC").toLowerCase());
}
if (includeNames && existsSync(NAMES_FILE)) add(NAMES_FILE);

if (words.size) {
  const files = [...listShardFiles()];
  if (existsSync(NAMES_FILE)) files.push(NAMES_FILE);
  for (const file of files) for (const e of readEntriesFile(file)) if (words.has(e.cyrillic)) collected.push({ entry: e, file });
}

if (collected.length === 0) {
  console.error(
    "Nothing to preview. Give a shard letter (с), word(s) (сайн уул), a .json path, or --names.\n" +
      "  e.g. bun scripts/preview.ts сайн уул монгол",
  );
  process.exit(1);
}

let list = collected;
if (unverifiedOnly) list = list.filter(({ entry }) => entry.candidates.some((c) => !c.verified));
const total = list.length;
const shown = list.slice(0, limit);

// ---- render ----
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
const cps = (s: string) =>
  [...s].map((ch) => "U+" + ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")).join(" ");

function badge(c: Candidate): string {
  if (c.verified) return `<span class="b v">verified ✓</span>`;
  return `<span class="b u">unverified · ${esc(c.source)}</span>`;
}

function candHtml(c: Candidate): string {
  return `
    <div class="cand ${c.verified ? "isv" : "isu"}">
      <span class="mong">${esc(c.traditional)}</span>
      <div class="cmeta">
        ${c.latin ? `<span class="lat">${esc(c.latin)}</span>` : ""}
        ${c.sense ? `<span class="sense">${esc(c.sense)}</span>` : ""}
        ${badge(c)}
        <code class="cp">${esc(cps(c.traditional))}</code>
      </div>
    </div>`;
}

const cards = shown
  .map(
    ({ entry, file }) => `
  <div class="entry">
    <div class="head"><span class="cyr">${esc(entry.cyrillic)}</span><span class="file">${esc(basename(file))}</span></div>
    <div class="cands">${entry.candidates.map(candHtml).join("")}</div>
  </div>`,
  )
  .join("");

const title = targets.concat(includeNames ? ["names"] : []).join(" ") || "preview";
const note = total > shown.length ? ` · showing ${shown.length} of ${total} (raise --limit)` : "";

const html = `<!doctype html>
<html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>khudam preview · ${esc(title)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap');
  :root{--bg:#faf9f7;--panel:#fff;--ink:#1a1c1e;--muted:#6b7280;--border:#e3e1dc;
        --v:#1a7f4b;--v-bg:#e6f4ec;--u:#56606b;--u-bg:#eef0f2;}
  @media (prefers-color-scheme:dark){:root{--bg:#101214;--panel:#181b1e;--ink:#e8e6e3;--muted:#9aa0a6;
        --border:#2a2e33;--v:#57c98a;--v-bg:#12301f;--u:#aab2ba;--u-bg:#23272c;}}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,"Segoe UI",sans-serif;line-height:1.5}
  main{max-width:1100px;margin:0 auto;padding:1.5rem 1.25rem 4rem}
  h1{font-size:1.25rem;margin:0 0 .2rem}
  .sub{color:var(--muted);margin:0 0 1.25rem;font-size:.9rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.75rem}
  .entry{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:.75rem .85rem}
  .head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--border);padding-bottom:.4rem;margin-bottom:.5rem}
  .cyr{font-weight:700;font-size:1.1rem}
  .file{color:var(--muted);font-size:.72rem}
  .cands{display:flex;flex-wrap:wrap;gap:.6rem}
  .cand{display:flex;gap:.55rem;align-items:flex-start;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.5rem .6rem;min-width:100%}
  .cand.isu{border-style:dashed}
  .mong{font-family:"Noto Sans Mongolian","Mongolian Baiti",serif;writing-mode:vertical-lr;font-size:3rem;line-height:1.02}
  .cmeta{display:flex;flex-direction:column;gap:.3rem;font-size:.8rem;min-width:0}
  .lat{color:var(--muted);font-style:italic}
  .sense{color:var(--ink)}
  .b{align-self:flex-start;border-radius:999px;padding:.05rem .5rem;font-size:.72rem;font-weight:600;white-space:nowrap}
  .b.v{color:var(--v);background:var(--v-bg)}
  .b.u{color:var(--u);background:var(--u-bg)}
  .cp{font-family:ui-monospace,Consolas,monospace;font-size:.64rem;color:var(--muted);word-break:break-all}
</style></head>
<body><main>
  <h1>${esc(title)}</h1>
  <p class="sub">${total} entr${total === 1 ? "y" : "ies"}${note} · read by code point + Latin, not the glyph · dashed = unverified</p>
  <div class="grid">${cards}</div>
</main></body></html>`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html, "utf8");
console.log(`Wrote ${shown.length} entr${shown.length === 1 ? "y" : "ies"} → ${out}`);
