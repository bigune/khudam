# Changelog

Most releases here are **data corrections**. A data correction changes converter output, which is a visible change for anyone depending on `khudam`, so each one is recorded below. Newest first.

Versioning follows [Semantic Versioning](https://semver.org/): while on `0.x`, data corrections are a patch bump and API changes are a minor bump.

> Note: this file is English-only on purpose. The rest of the repo docs are bilingual (Mongolian first), but a changelog is rewritten on every release, and maintaining a translation per bump is recurring cost for little gain.

---

## [Unreleased]

No `khudam` package changes — the engine and the lexicon are untouched, so
nothing here needs an npm release. These ship to khudam.suray.mn on merge.

### Added

- Community contribution pipeline, Phase A1 — the first door into the lexicon that is not GitHub. Every converter candidate gets a ⚑ report button, and copying records which candidate was chosen for each word. Signals land in a disposable Supabase mailbox (`supabase/schema.sql`, anonymous insert-only under RLS); a weekly job will drain them into a triaged PR. **Signals are not verification**: they direct reviewer attention, and only a human merging a PR ever changes the lexicon.

  Reporting a sense-less candidate — which is most of the lexicon, since the seed layer carries no meaning labels — first asks whether the spelling is wrong or the wanted meaning is missing. The two answers resolve to different data operations (replace the form vs. add a candidate beside it), and only the contributor can tell them apart.

  Collection is off unless `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set at build time; without them the converter hides the affordances and behaves exactly as before. Setup runbook: `supabase/README.md`.

### Fixed

- Web app: candidates whose only meaning label is the importer's `unlabeled` placeholder no longer display it as if it were a meaning — including inside the suffix engine's composed labels (`unlabeled + genitive` now reads `genitive`). The placeholder is a marker for reviewers, not a sense.

## [0.2.0] — 2026-07-27

### Added

- Second data source: English Wiktionary's Mongolian dictionary via kaikki.org (CC BY-SA, attribution in `data/SOURCES.md`). 167 new words (lexicon → 28,144), 958 candidates corroborated where the wmk seed and Wiktionary agree on the identical form (`corroborated: true`, source upgraded to the new `"wiktionary"` tier), 342 disagreements kept side-by-side and queued in `data/REVIEW.md` for human triage, 28 unverified suffix rows, and review-only queues for 90 proper names and 158 Classical-etymology suggestions. `CandidateSource` gains `"wiktionary"` (minor bump when released).

  ⚠️ Converter output changes where Wiktionary added a second candidate: those words now return multiple candidates.

- Suffix engine: words missing from the lexicon are now tried as lexicon stem + written-apart suffix (NNBSP-joined) before falling back to transliteration. Composed candidates are flagged `source: "suffix-rule"` and are never `verified`. New API: `decomposeWord()`, `SUFFIX_COUNT`; `CandidateSource` gains `"suffix-rule"` (minor bump when released).
- 56 seed suffix rows in `data/suffixes.json` (genitive, accusative, dative-locative, ablative, instrumental, comitative, plural, reflexive-possessive), transcribed from Nadmid 1990 with per-row citations, all `verified: false` pending human review.
- `data/GRAMMAR.md` — the grammar-rules log (rule ↔ citation ↔ implementation status), companion to `data/ENCODING.md`.
- ENCODING.md Decision 002: the glide ᠶ U+1836 is kept in suffix-initial (ᠶᠢᠨ, ᠶᠢ) and intervocalic (ᠢᠶᠠᠷ, ᠢᠶᠡᠨ, …) position — distinct from the Decision 001 postvocalic digraph, per UTN #57 Table 4 ([P] vs [D] conditions). Pinned by code-point tests.

### Fixed

- Removed the spurious NIRUGU (U+180A) between MVS and the detached final vowel in 1,113 candidates (ENCODING.md Decision 003) — a wmk generator hack that forced an ordinary connected final a instead of the correct detached form. Affects only `verified: false` candidates.

  ⚠️ Converter output for those words differs from earlier builds. No API changes.
- Web app: suffix shaping (e.g. ᠶᠢᠨ after NNBSP taking its I-shaped form) never rendered, because Google Fonts serves Noto Sans Mongolian sliced into unicode-range pieces that separate U+202F from the Mongolian letters, splitting the font run. The app now self-hosts the full Noto Sans Mongolian v3.002 (OFL) via `next/font/local`. Verified at the HarfBuzz level: ᠪᠠᠭᠰᠢ + NNBSP + ᠶᠢᠨ shapes ᠶ as `I.init` with the full font.

## [0.1.1] — 2026-07-26

### Fixed

- Corrected the medial `ᠶᠢ` digraph to `ᠢ` in 2,780 entries. Affects only entries with `source: "wmk-import"` and `verified: false`.

  ⚠️ Converter output for those words differs from `0.1.0`. No API changes.

## [0.1.0] — 2026-07-24

Initial release.

### Added

- Engine v0: lexicon lookup, plus a rule-based fallback for unknown words, always flagged `fallback: true`.
- API returns the full candidate list per Cyrillic word — never a single silent guess when a word is ambiguous.
- 27,977 seed entries imported from writtenMongolianKeyboard, all `verified: false`.
- Starter names file (`data/names.json`) and an empty suffix table (`data/suffixes.json`).
- Data validation (`bun run validate`) and CI on every push and PR.

[0.2.0]: https://github.com/bigune/khudam/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/bigune/khudam/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/bigune/khudam/releases/tag/v0.1.0
