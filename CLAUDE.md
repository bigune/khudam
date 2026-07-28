# CLAUDE.md — Khudam (Худам)

## What this project is

Khudam is an open-source Cyrillic ↔ Traditional Mongolian script (монгол бичиг) lexicon and converter library. The name comes from Худам монгол бичиг, the classical/historical name of the script itself. Public naming: "Khudam — нээлттэй монгол бичиг хөрвүүлэгч" (repo: khudam, npm package: khudam; keep "монгол бичиг хөрвүүлэгч" in descriptions for searchability). The long-term mission: become the free, open, standard-Unicode home for digital traditional Mongolian writing — a community-corrected lexicon anyone can use, plus a client-side conversion engine. The converter's public UI lives in this repo (`apps/web`, deployed at khudam.suray.mn) so merged data PRs go live without an npm release; the broader site suray.mn (separate repo) links to it and can consume the npm package for anything else.

The ambition is large — mainstream infrastructure for a national script — but the maintenance budget is a few hours per week. Resolve that tension with a **lean core**: zero ops, static data, contributor accessibility. Complexity must pay rent; scale comes from community and data quality, not from features.

Toolchain: **bun** (runtime, package manager, script runner, and test runner). TypeScript scripts run directly via `bun`. The published package remains standard ESM consumable by any npm/pnpm/yarn/bun user.

- Code license: MIT (`LICENSE`)
- Data license: CC BY-SA 4.0 (`data/LICENSE`) — ShareAlike chosen deliberately so improved versions of the lexicon must remain open
- Language: repo docs bilingual, Mongolian first, English second. Code identifiers and comments in English.

## Critical domain knowledge (read before touching data or engine)

**Conversion is NOT transliteration.** Traditional script preserves ~13th-century orthography; Cyrillic reflects modern pronunciation. Example: уул ("mountain") → ᠠᠭᠤᠯᠠ (*agula*) — the historical intervocalic ᠭ was dropped in speech and vowels merged into long уу, but бичиг still writes the old form. The historical spelling is not derivable from Cyrillic by rules; it requires dictionary lookup.

**One-to-many is fundamental.** A single Cyrillic word can map to multiple traditional words with different meanings. уул itself: ᠠᠭᠤᠯᠠ (*agula*, mountain) vs ᠤᠤᠯ (*uul*, original — as in уул нь). The schema stores an ARRAY of candidates per Cyrillic form; the engine returns all candidates and lets the UI/user choose. Never silently collapse to one candidate.

**Mongolian is agglutinative.** Words = stem + chain of suffixes. Suffix inventories differ between scripts, and in traditional script many suffixes are written as separate units joined by NNBSP (U+202F). Full morphological handling is a later phase; v0 handles whole-word lookup plus a curated common-suffix table (`data/suffixes.json`) applied by the suffix engine (`packages/converter/src/suffix.ts`) — depth 1, conditions evaluated on the traditional stem. Grammar rules are recorded with citations in `data/GRAMMAR.md`; route new morphology-rule questions through that file (code-point questions still go to `data/ENCODING.md`).

**Unicode gotchas (traditional Mongolian is notoriously hard):**
- Main block: U+1800–U+18AF. Also uses FVS1–FVS3 (U+180B–U+180D) free variation selectors, MVS (U+180E), and NNBSP (U+202F) before suffixes.
- Letters take positional forms (initial/medial/final) rendered by the font — we store logical code points only, never presentation forms.
- Several distinct letters share identical glyphs; encoding correctness cannot be judged visually. Validate by code point, not by appearance.
- Font support is inconsistent across OS/browsers. The library never assumes rendering works; the web layer (`apps/web`) deals with fonts (Noto Sans Mongolian webfont, `writing-mode: vertical-lr`) and PNG export.
- Use standard Unicode only. Do NOT adopt Bolorsoft's proprietary "Тунгаамал" encoding model.
- Encoding-model decisions (e.g. postvocalic й = single ᠢ U+1822, never the ᠶᠢ digraph) are recorded with citations in `data/ENCODING.md` — follow them, and route any new code-point-level policy question through that file.

**Competitive context:** Bolorsoft's KIMO is the commercial incumbent (paid, Windows, MS Word plugin). We do not compete on full-document official accuracy. Our wedge: free, web-first, instant conversion of names / words / short phrases, with honest ambiguity UI and verified-quality tiers.

## Data model

All data lives in this repo as JSON. Git is the database. No servers, ever.

```
data/
  lexicon/а.json … я.json    # sharded by first Cyrillic letter, sorted by `cyrillic`
  names.json                 # personal names — target: 100% verified, this is the flagship subset
  suffixes.json              # common Cyrillic suffix → traditional suffix mappings
  stats/frequency.json       # how often each candidate was copied — ordering signal, never truth
  stats/reports.json         # open community reports; the weekly job's memory
  schema/entry.schema.json   # JSON Schema for lexicon entries
  LICENSE                    # CC BY 4.0
```

Entry shape:

```json
{
  "cyrillic": "уул",
  "candidates": [
    { "traditional": "ᠠᠭᠤᠯᠠ", "latin": "agula", "sense": "mountain", "verified": true,  "source": "manual" },
    { "traditional": "ᠤᠤᠯ",  "latin": "uul",   "sense": "original", "verified": false, "source": "wmk-import" }
  ]
}
```

Rules:
- `cyrillic` is the unique key within the whole lexicon (lowercase, NFC-normalized).
- `verified: true` may only be set by a human reviewer via PR — never by scripts. Machine imports are always `verified: false`.
- `source` values so far: `"wmk-import"`, `"wiktionary"` (see provenance below), `"manual"`, `"community"`.
- `corroborated: true` (optional) marks a candidate whose traditional form was produced identically by two independent sources (e.g. wmk bootstrap + Wiktionary). Set by import tooling only; it raises confidence but is NOT verification.
- `sense` is optional for single-candidate entries, required when candidates > 1.
- Community signals never edit or remove an existing candidate — "this spelling is wrong" and "this is a correct spelling of a meaning I did not want" arrive through the same button. The weekly job (`scripts/aggregate-signals.ts`) may add one candidate in exactly one case: a word with no entry at all, one proposed spelling, typed identically by two independent sessions. Everything else is a reviewer decision written up in `data/REVIEW.md`.
- Files must stay sorted and diff-friendly (2-space indent, one entry object per logical block). Every data mutation goes through scripts in `scripts/` — never hand-edit formatting conventions.

## Seed data provenance (important, do not misrepresent)

Bootstrap source: `dictionary.json` (28,263 entries `{cyrillic, latin, traditional}`) from github.com/sura0111/writtenMongolianKeyboard — MIT per its package.json (no LICENSE file in repo; attribution kept in `data/SOURCES.md`). Its traditional forms were machine-generated by an undisclosed third-party converter over words scraped from ikon.mn RSS. Therefore: import everything as `verified: false`, one candidate per entry, and treat the entire layer as "unverified bootstrap." Known defect: one-to-many collapsed to one (e.g. уул has only ᠤᠤᠯ; ᠠᠭᠤᠯᠠ "mountain" is missing). The mission is gradually verifying/correcting entries via community PRs.

Second tier: `"wiktionary"` — English Wiktionary's Mongolian entries, machine-extracted by wiktextract/kaikki.org (CC BY-SA, same license as our data; attribution in `data/SOURCES.md`). Wiktionary content is community-reviewed by human editors, so this tier is **higher trust than `wmk-import` but still `verified: false`** — verification remains our reviewers' job. When both sources produce the identical traditional form the candidate gets `corroborated: true`; when they disagree, both candidates are kept and the word joins the prioritized conflict queue in `data/REVIEW.md`. Re-import with `bun run import:wiktionary` (idempotent; kaikki refreshes with each Wiktionary dump).

Watchlist: the CoPiT paper (arXiv 2607.05849) released a 14,125-entry verified lexicon with vowel-harmony labels, currently behind an anonymized review repo with unstated license — do not import until the authors confirm licensing. The JIMDT 2024 "Mon_data" (63k pairs) is CC BY-NC — legally incompatible with our CC BY-SA data (NC and SA cannot be combined) and with commercial consumers like suray.mn; never import it, even partially, unless the authors grant an explicit license exception in writing (record it in data/SOURCES.md if ever obtained).

## Package layout

```
apps/web/               # static Next.js converter UI -> khudam.suray.mn (own Vercel project,
                        #   root directory apps/web; consumes khudam via the bun workspace)
packages/converter/     # TypeScript npm package: khudam
  src/
    index.ts            # public API
    normalize.ts        # NFC, lowercase, whitespace/punct handling
    lookup.ts           # word → candidates (data compiled in at build)
    convert.ts          # tokenizes text, converts word-by-word, returns per-token candidates
  test/
supabase/              # disposable community-signal mailbox (schema.sql + runbook);
                       #   never a source of truth — losing it loses at most a week
scripts/
  import-wmk.ts         # one-time bootstrap import (idempotent)
  import-wiktionary.ts  # second-tier import via kaikki.org (idempotent, re-runnable)
  validate.ts           # schema + Unicode-range + duplicate + sort checks; exits non-zero on failure
  build-data.ts         # compiles data/ into a compact artifact bundled with the package
  export-signals.ts     # drains the mailbox to JSONL; deletes by row id, never by timestamp
  aggregate-signals.ts  # JSONL → data/stats/ + REVIEW.md queue + the weekly PR body
.github/workflows/
  validate.yml          # runs scripts/validate.ts on every PR and push
  signals.yml           # weekly: drain → archive → aggregate → validate → one PR → delete
  keepalive.yml         # mid-week ping so the free-tier mailbox never pauses
```

Engine principles:
- Zero runtime dependencies. Must run in the browser (suray.mn is fully client-side).
- Pure functions, deterministic. Public API returns candidate lists with `verified` flags — never a single silent guess when ambiguity exists.
- Unknown words: return a rule-based fallback transliteration clearly flagged `fallback: true`, never disguised as dictionary output.

## Commands

- `bun run validate` — full data validation (same as CI)
- `bun run build` — compile data + build the package
- `bun test` — engine unit tests (bun's built-in test runner)
- `bun run import:wmk` — bootstrap import (idempotent; refuses to overwrite `verified: true` candidates)
- `bun run signals:export <file>` — drain the community mailbox (`--delete <file>` removes what it drained); needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `bun run signals:aggregate <file>` — turn a drain into `data/stats/` + the review queue in `data/REVIEW.md`

## Working agreements for Claude

- Never mark data `verified: true` yourself, and never "fix" a traditional spelling from your own knowledge — your training data on монгол бичиг orthography is unreliable. Data corrections come from humans via PRs; you may flag suspicious entries in `data/REVIEW.md`.
- Keep every piece zero-ops: static data, build-time compilation, GitHub Actions only. No databases, no APIs, no servers.
- Contributor experience is a feature: error messages from `validate.ts` must be beginner-friendly (contributors include non-programmer teachers editing JSON in the GitHub web UI).
- Tests accompany any engine change. Validation must pass before any commit touching `data/`.
- Small, reviewable commits; conventional commit messages.
- When scope questions arise, prefer the simplest design that serves the mission. The mission itself is big — becoming the open home of digital монгол бичиг — so don't cap ambition; cap operational burden. Growth path when the community arrives: more verified data, more reviewers, governance docs, richer tooling — in that order, and still zero-ops.
