# Changelog

Most releases here are **data corrections**. A data correction changes converter output, which is a visible change for anyone depending on `khudam`, so each one is recorded below. Newest first.

Versioning follows [Semantic Versioning](https://semver.org/): while on `0.x`, data corrections are a patch bump and API changes are a minor bump.

> Note: this file is English-only on purpose. The rest of the repo docs are bilingual (Mongolian first), but a changelog is rewritten on every release, and maintaining a translation per bump is recurring cost for little gain.

---

## [Unreleased]

### Added

- Suffix engine: words missing from the lexicon are now tried as lexicon stem + written-apart suffix (NNBSP-joined) before falling back to transliteration. Composed candidates are flagged `source: "suffix-rule"` and are never `verified`. New API: `decomposeWord()`, `SUFFIX_COUNT`; `CandidateSource` gains `"suffix-rule"` (minor bump when released).
- 56 seed suffix rows in `data/suffixes.json` (genitive, accusative, dative-locative, ablative, instrumental, comitative, plural, reflexive-possessive), transcribed from Nadmid 1990 with per-row citations, all `verified: false` pending human review.
- `data/GRAMMAR.md` — the grammar-rules log (rule ↔ citation ↔ implementation status), companion to `data/ENCODING.md`.

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

[0.1.1]: https://github.com/bigune/khudam/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/bigune/khudam/releases/tag/v0.1.0
