# Changelog

Most releases here are **data corrections**. A data correction changes converter output, which is a visible change for anyone depending on `khudam`, so each one is recorded below. Newest first.

Versioning follows [Semantic Versioning](https://semver.org/): while on `0.x`, data corrections are a patch bump and API changes are a minor bump.

> Note: this file is English-only on purpose. The rest of the repo docs are bilingual (Mongolian first), but a changelog is rewritten on every release, and maintaining a translation per bump is recurring cost for little gain.

---

## [Unreleased]

The engine is untouched, but the lexicon is not: one data correction below
changes converter output and so needs an npm patch release. Everything else
ships to khudam.suray.mn on merge.

### Changed

- **уул** now returns two candidates: `ᠠᠭᠤᠯᠠ` (_agula_, "mountain") beside the
  existing `ᠤᠤᠯ` (_uul_, "original", as in уул нь). This is the wmk seed's
  known one-to-many collapse — the flagship example of it, and the first entry
  fixed through the community pipeline rather than by hand: someone reported
  the missing meaning from the converter, the weekly job wrote it up, and a
  human made the change.

  `ᠠᠭᠤᠯᠠ` is also **the first `verified: true` candidate in the lexicon** — one
  of 28,538. The maintainer read it and said so; that is the only thing that
  flag has ever meant, and no script may set it. `ᠤᠤᠯ` keeps
  `verified: false`: it came from the machine seed and nobody has checked it.

  ⚠️ Converter output for уул changes. `ᠠᠭᠤᠯᠠ` is listed first and is now the
  default, on the grounds that the mountain sense is the common one; frequency
  data can reorder it later.

### Added

- Community contribution pipeline, Phase B2 — the verification queue at [khudam.suray.mn/queue](https://khudam.suray.mn/queue). A page for people who read монгол бичиг but arrived with no error to report: one spelling at a time, ten to a sitting, and a link back to the converter. Every question is the same one, deliberately the weakest that still helps — **is this a written form of this word, for any meaning?** Yes/no answers compose into everything else: two spellings both answered yes are homonyms and both belong, a yes and a no name the form to delete. Asking "which of these is right?" would force a choice where the honest answer is often "both". Answering «үгүй» offers the proposal field, since someone who can tell a spelling is wrong sometimes knows the right one.

  Questions are compiled from the data on every build (`apps/web/public/queue.json`, gitignored like the lexicon artifact), ordered by what is worth a stranger's minute: candidates a reader flagged first, then the 342 words where the bootstrap seed and Wiktionary disagree, then whatever people actually copy — and never a candidate a human already verified, or one nobody has chosen, flagged, or disputed. Corroborated candidates sink; a *flagged* corroborated candidate escalates instead, because two sources and a reader disagreeing is the opposite of routine.

  Answers land as `verdict` signals and are tallied per candidate in the weekly pull request (`N ✓ / M ✗`, disagreement marked). **A tally is not verification**: `verified: true` is still one human reading монгол бичиг and one merged pull request. A tally stops being carried once the lexicon answers it — the candidate was verified, or the form is gone.

- Community contribution pipeline, Phase B1 — the weekly job that carries signals from the mailbox into git. Every Monday `.github/workflows/signals.yml` drains the Supabase mailbox, archives the raw rows as a 90-day workflow artifact, aggregates them, runs `bun run validate`, and opens one pull request; merging it is the review. Deletion happens last and by explicit row id, so a failure anywhere above it leaves the mail where it was and signals filed mid-run become next week's. Only one signals pull request is open at a time — if last week's is still waiting, the job stands down rather than draining on top of it.

  Triage is what makes the pull request quick to read. `data/stats/frequency.json` records how often each candidate was actually copied, `data/stats/reports.json` is the open queue, and `data/REVIEW.md` § Community signals renders it: corroborated reports first, traffic next, each with what the lexicon says now, what was proposed, and how many independent sessions said so. Composition flags are grouped by suffix rather than by word — many stems wrong with the same suffix indicts the `suffixes.json` row, not the words — and a report closes itself once the lexicon answers it.

  The aggregator adds a lexicon entry in exactly one case: a word with no entry at all, one proposed spelling, typed identically by two independent sessions. Nothing existing is ever edited or removed, no `sense` label is invented, and nothing is ever marked verified. Runbook: `supabase/README.md` § Draining the mailbox. A mid-week `keepalive` workflow keeps the free-tier project from pausing between drains.

- Community contribution pipeline, Phase A2 — the report flow now takes an answer, not just a complaint. After flagging a candidate the contributor is offered a field to type the correct монгол бичиг; each word card offers «⊕ салаа утга» for a meaning the entry is missing; and a word the lexicon does not know asks «✎ зөв зурлага» rather than showing a report button — nothing is wrong with a guess already labelled as one. Every field is optional: the flag is filed the moment the branching question is answered, so someone who can tell that a spelling is wrong without knowing the right one still leaves the signal.

  Proposals are checked at the door by code point (the Mongolian block U+1800–U+18AF plus NNBSP) and again by database constraint. Whitespace collapses to the NNBSP that joins a written-apart suffix to its stem, since no ordinary keyboard produces it, and a vertical preview shows what will actually be sent. A correction on a composed suffix candidate is filed as a new-word proposal — per `data/GRAMMAR.md` § Fixing a wrong composition there is no stored entry to replace, and an exact lexicon match outranks the composition anyway. **Proposals are still not verification**: they reach the lexicon only through the weekly PR a human merges.

  `supabase/schema.sql` now declares its constraints as drop-and-add statements instead of inline in `create table`, so re-running the file re-applies them to a project that already exists rather than silently skipping past the table.

- Community contribution pipeline, Phase A1 — the first door into the lexicon that is not GitHub. Converter candidates get a ⚑ report button, and copying records which candidate was chosen for each word. Signals land in a disposable Supabase mailbox (`supabase/schema.sql`, anonymous insert-only under RLS); a weekly job will drain them into a triaged PR. **Signals are not verification**: they direct reviewer attention, and only a human merging a PR ever changes the lexicon.

  Reporting a sense-less candidate — which is most of the lexicon, since the seed layer carries no meaning labels — first asks whether the spelling is wrong or the wanted meaning is missing. The two answers resolve to different data operations (replace the form vs. add a candidate beside it), and only the contributor can tell them apart.

  Collection is off unless `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set at build time; without them the converter hides the affordances and behaves exactly as before. Setup runbook: `supabase/README.md`.

### Fixed

- Community signals: one browser saying the same thing twice now files it once. Copying the same text again, reloading and re-reporting the same candidate, or re-sending an identical proposal produced a row indistinguishable from one already in the mailbox, and a reviewer learned nothing from reading it twice. A `BEFORE INSERT` trigger skips a row the same session has already filed, with a unique index over the whole content of a signal as the floor beneath it.

  The scope is one browser, not one signal: two different sessions filing the identical proposal stay two rows, because that agreement is exactly the corroboration the weekly PR ranks highest. Applying the schema to a project that already collected duplicates fails on the new index; `supabase/README.md` § Removing duplicates has the one-time cleanup.

  The first attempt at this asked PostgREST for the deduplication (`on_conflict` + `Prefer: resolution=ignore-duplicates`) and **broke all signal collection while it was deployed**: that path needs more than an INSERT policy, and the anon role has exactly one, so every insert — duplicate or not — came back `42501 new row violates row-level security policy`. Reports, selections and queue answers filed during that window were refused by the database and are lost. Deduplication now happens in a trigger, where the anon role stays insert-only, and `supabase/README.md` records the probe that tells a policy bug from a client bug in one request.

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
