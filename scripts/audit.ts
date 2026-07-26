/**
 * scripts/audit.ts — hunt for SYSTEMATIC converter artifacts in the wmk-import
 * traditional forms, the way the ᠶᠢ defect was found. Runs a set of mechanical
 * detectors, ranks them by frequency (frequency = leverage), and renders samples
 * to .plans/audit.html so a native speaker can rule each pattern in or out.
 *
 * It NEVER changes data and NEVER judges orthography — it only surfaces
 * candidates. Confirmed patterns become fix scripts like scripts/fix-yi-digraph.ts.
 *
 * Usage:
 *   bun scripts/audit.ts                 # console ranking + .plans/audit.html
 *   bun scripts/audit.ts --samples 60    # more samples per pattern in the report
 *   bun scripts/audit.ts --out .plans/audit.html
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { NAMES_FILE, REPO_ROOT, listShardFiles, readEntriesFile, type Candidate, type Entry } from "./lib.ts";

// ---- args ----
const argv = process.argv.slice(2);
let out = join(REPO_ROOT, ".plans", "audit.html");
let sampleN = 40;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--out") out = resolve(argv[++i]);
  else if (argv[i] === "--samples") sampleN = Number(argv[++i]);
}

// ---- load ----
const rows: { entry: Entry; cand: Candidate; file: string }[] = [];
const files = [...listShardFiles()];
if (existsSync(NAMES_FILE)) files.push(NAMES_FILE);
for (const file of files) for (const e of readEntriesFile(file)) for (const c of e.candidates) rows.push({ entry: e, cand: c, file });

// ---- helpers ----
const cp = (ch: string) => ch.codePointAt(0)!;
const has = (s: string, code: number) => s.includes(String.fromCodePoint(code));
const isVowel = (c: number) => c >= 0x1820 && c <= 0x1827; // ᠠ ᠡ ᠢ ᠣ ᠤ ᠥ ᠦ ᠧ
const isConsonant = (c: number) => c >= 0x1828 && c <= 0x183f; // ᠨ … ᠿ (native + foreign)
const inMongolian = (c: number) => (c >= 0x1800 && c <= 0x18af) || c === 0x202f || c === 0x0020;

const YA = 0x1836; // ᠶ
const MVS = 0x180e; // vowel separator
const NIRUGU = 0x180a;
const FVS = [0x180b, 0x180c, 0x180d];
const GLIDE_CYR = /[еёюяй]/; // Cyrillic letters that legitimately produce ᠶ

// ---- detectors ----
interface Detector {
  key: string;
  title: string;
  desc: string;
  flag: (c: number) => boolean; // code points to highlight in the report
  test: (cyr: string, trad: string) => boolean;
}

const detectors: Detector[] = [
  {
    key: "spurious-ya",
    title: "ᠶ (U+1836) with no Cyrillic glide",
    desc: "Traditional contains ᠶ but the Cyrillic has none of е/ё/ю/я/й — the ᠶ has no source, so it is probably a spurious insertion (same family as the fixed ᠶᠢ bug; includes the excluded loanword cases).",
    flag: (c) => c === YA,
    test: (cyr, trad) => has(trad, YA) && !GLIDE_CYR.test(cyr),
  },
  {
    key: "mvs-nirugu",
    title: "MVS / Nirugu (U+180E / U+180A)",
    desc: "Uses the vowel separator or nirugu. Sometimes a correct separated final vowel, but machine converters place them inconsistently — worth a ruling.",
    flag: (c) => c === MVS || c === NIRUGU,
    test: (_cyr, trad) => has(trad, MVS) || has(trad, NIRUGU),
  },
  {
    key: "fvs",
    title: "Free Variation Selector (U+180B–180D)",
    desc: "Uses an FVS. Legitimate for forcing a variant, but inconsistent machine use can break exact-match lookup.",
    flag: (c) => FVS.includes(c),
    test: (_cyr, trad) => FVS.some((f) => has(trad, f)),
  },
  {
    key: "doubled-consonant",
    title: "Doubled consonant",
    desc: "Two identical consonant code points in a row (e.g. ᠮᠮ, ᠰᠰ). Rare natively; usually a loanword conversion artifact.",
    flag: () => false,
    test: (_cyr, trad) => {
      const a = [...trad].map(cp);
      for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1] && isConsonant(a[i])) return true;
      return false;
    },
  },
  {
    key: "out-of-range",
    title: "Non-Mongolian code point",
    desc: "A character outside U+1800–U+18AF (+ NNBSP). validate.ts should already forbid this — a non-zero count means a real integrity problem.",
    flag: (c) => !inMongolian(c),
    test: (_cyr, trad) => [...trad].some((ch) => !inMongolian(cp(ch))),
  },
  {
    key: "length-outlier",
    title: "Traditional much longer than Cyrillic",
    desc: "Traditional code-point length > 2× the Cyrillic length + 3. Often inflated/garbled loanword conversions; noisy signal, eyeball the samples.",
    flag: () => false,
    test: (cyr, trad) => [...trad].length > 2 * [...cyr].length + 3,
  },
];

// ---- run ----
interface Hit {
  cyrillic: string;
  latin: string;
  traditional: string;
  verified: boolean;
  source: string;
  file: string;
}
const results = new Map<string, Hit[]>();
for (const d of detectors) results.set(d.key, []);
for (const { entry, cand, file } of rows) {
  for (const d of detectors) {
    if (d.test(entry.cyrillic, cand.traditional)) {
      results.get(d.key)!.push({
        cyrillic: entry.cyrillic,
        latin: cand.latin ?? "",
        traditional: cand.traditional,
        verified: cand.verified,
        source: cand.source,
        file: basename(file),
      });
    }
  }
}

const ranked = [...detectors].sort((a, b) => results.get(b.key)!.length - results.get(a.key)!.length);

// ---- console ----
console.log(`Audited ${rows.length} candidate forms across ${files.length} files\n`);
for (const d of ranked) {
  const hits = results.get(d.key)!;
  console.log(`  ${String(hits.length).padStart(5)}  ${d.key} — ${d.title}`);
  for (const h of hits.slice(0, 3)) console.log(`         ${h.cyrillic}${h.latin ? ` (${h.latin})` : ""}  ${h.traditional}`);
}

// ---- html report ----
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
const cpsHtml = (s: string, flag: (c: number) => boolean) =>
  [...s]
    .map((ch) => {
      const code = cp(ch);
      const label = "U+" + code.toString(16).toUpperCase().padStart(4, "0");
      return flag(code) ? `<b class="hot">${label}</b>` : label;
    })
    .join(" ");

const section = (d: Detector) => {
  const hits = results.get(d.key)!;
  const samples = hits.slice(0, sampleN);
  const more = hits.length > samples.length ? `<span class="more">+${hits.length - samples.length} more</span>` : "";
  const cards = samples
    .map(
      (h) => `
      <div class="entry">
        <div class="head"><span class="cyr">${esc(h.cyrillic)}</span><span class="file">${esc(h.file)}</span></div>
        <div class="cand ${h.verified ? "isv" : "isu"}">
          <span class="mong">${esc(h.traditional)}</span>
          <div class="cmeta">
            ${h.latin ? `<span class="lat">${esc(h.latin)}</span>` : ""}
            <span class="b ${h.verified ? "v" : "u"}">${h.verified ? "verified ✓" : "unverified"}</span>
            <code class="cp">${cpsHtml(h.traditional, d.flag)}</code>
          </div>
        </div>
      </div>`,
    )
    .join("");
  return `
    <section>
      <h2>${esc(d.title)} <span class="count">${hits.length}</span> ${more}</h2>
      <p class="desc"><code>${d.key}</code> — ${esc(d.desc)}</p>
      ${hits.length ? `<div class="grid">${cards}</div>` : `<p class="clean">✓ none found</p>`}
    </section>`;
};

const html = `<!doctype html>
<html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>khudam audit</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap');
  :root{--bg:#faf9f7;--panel:#fff;--ink:#1a1c1e;--muted:#6b7280;--border:#e3e1dc;--hot:#b42318;
        --v:#1a7f4b;--v-bg:#e6f4ec;--u:#56606b;--u-bg:#eef0f2;}
  @media (prefers-color-scheme:dark){:root{--bg:#101214;--panel:#181b1e;--ink:#e8e6e3;--muted:#9aa0a6;
        --border:#2a2e33;--hot:#ff7b72;--v:#57c98a;--v-bg:#12301f;--u:#aab2ba;--u-bg:#23272c;}}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,"Segoe UI",sans-serif;line-height:1.5}
  main{max-width:1100px;margin:0 auto;padding:1.5rem 1.25rem 4rem}
  h1{font-size:1.35rem;margin:0 0 .2rem}
  .lead{color:var(--muted);margin:0 0 1rem;font-size:.9rem}
  h2{font-size:1.1rem;margin:2rem 0 .3rem;padding-top:1rem;border-top:2px solid var(--border)}
  .count{background:var(--u-bg);color:var(--u);border-radius:999px;padding:.05rem .55rem;font-size:.85rem;font-weight:600}
  .more{color:var(--muted);font-size:.8rem;font-weight:400}
  .desc{color:var(--muted);margin:.1rem 0 .75rem;font-size:.88rem}
  .clean{color:var(--v)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.7rem}
  .entry{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:.6rem .75rem}
  .head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--border);padding-bottom:.35rem;margin-bottom:.45rem}
  .cyr{font-weight:700}
  .file{color:var(--muted);font-size:.7rem}
  .cand{display:flex;gap:.5rem;align-items:flex-start}
  .cand.isu .mong{opacity:.95}
  .mong{font-family:"Noto Sans Mongolian","Mongolian Baiti",serif;writing-mode:vertical-lr;font-size:2.7rem;line-height:1.02}
  .cmeta{display:flex;flex-direction:column;gap:.3rem;font-size:.78rem;min-width:0}
  .lat{color:var(--muted);font-style:italic}
  .b{align-self:flex-start;border-radius:999px;padding:.05rem .5rem;font-size:.68rem;font-weight:600}
  .b.v{color:var(--v);background:var(--v-bg)}.b.u{color:var(--u);background:var(--u-bg)}
  .cp{font-family:ui-monospace,Consolas,monospace;font-size:.62rem;color:var(--muted);word-break:break-all}
  .cp b.hot{color:var(--hot)}
</style></head>
<body><main>
  <h1>Suspicious-pattern audit</h1>
  <p class="lead">${rows.length} candidate forms · ranked by frequency · red code points are the flagged trigger · this only surfaces candidates — you rule each in or out.</p>
  ${ranked.map(section).join("")}
</main></body></html>`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html, "utf8");
console.log(`\nReport → ${out}`);
