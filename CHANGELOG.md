# Changelog

Most releases here are **data corrections**. A data correction changes converter output, which is a visible change for anyone depending on `khudam`, so each one is recorded below. Newest first.

Versioning follows [Semantic Versioning](https://semver.org/): while on `0.x`, data corrections are a patch bump and API changes are a minor bump.

> Note: this file is English-only on purpose. The rest of the repo docs are bilingual (Mongolian first), but a changelog is rewritten on every release, and maintaining a translation per bump is recurring cost for little gain.

---

## [Unreleased]

Both the engine and the lexicon changed here: the suffix engine now reads
inflection it used to miss, and two data corrections change converter output.
Together they need an npm release. Everything else ships to khudam.suray.mn on
merge.

### Added

- The suffix engine handles **suffix chains and mutated stems** — two of the three gaps that made it miss most real inflected Mongolian. Coverage over Wiktionary's own declension tables went from **16.9% to 45.4%** of forms resolved to the right stem, at higher precision than before (90.4% → 93.8%).

  **Chains, depth 2 (`GRAMMAR.md` G12).** гэртээ → `ᠭᠡᠷ ᠲᠦ ᠪᠡᠨ`, номуудыг → `ᠨᠣᠮ ᠤᠳ ᠢ`. Suffixes must climb a slot order — plural, then case, then possessive — which is what stops номын also being read as ном + ы + н. Chaining splits the two attachment conditions that looked alike at depth 1: `attach` tests the unit the suffix actually follows (гэртээ takes ᠪᠡᠨ, not ᠢᠶᠡᠨ, because ᠲᠦ ends in a vowel even though ᠭᠡᠷ does not), while `gender` keeps testing the stem, which governs harmony for the whole word.

  **Fleeting vowel (`GRAMMAR.md` G13).** бичгийн → `ᠪᠢᠴᠢᠭ ᠦᠨ`, ажлаа → `ᠠᠵᠢᠯ ᠢᠶᠠᠨ`, хаврын → `ᠬᠠᠪᠤᠷ ᠤᠨ`. A Cyrillic stem drops its last short vowel under suffixation while **traditional script keeps the stem whole** — the same split that makes уул → ᠠᠭᠤᠯᠠ — so this is purely about recovering the lookup key. The engine does not guess which vowel was lost: vowel harmony narrows the candidates and the lexicon decides which stem exists, which means the rule improves on its own as the lexicon grows. Where two real stems exist (сандл → сандал / сандил) both are offered.

  **Derivational suffixes no longer decompose.** -ч, -л, -лт build new words, and by ground rule 1 a new word is a lexicon entry with its own spelling — deriving one at runtime is the engine spelling a stem. Removing them cost nothing and removed visible nonsense (өвлийн had been offered as ᠥᠪ + -л + genitive beside the correct ᠡᠪᠦᠯ ᠦᠨ).

  ⚠️ Converter output changes for inflected words: many that previously fell back to letter-by-letter transliteration now return composed candidates, and some gain a second reading. No API changes.

- Two suffix rows the table had been missing, both cited: **privative -гүй → ᠦᠭᠡᠢ** (`GRAMMAR.md` G14) and the **substantive genitive -х → ᠬᠢ** (G15). номгүй → `ᠨᠣᠮ ᠦᠭᠡᠢ`, номынх → `ᠨᠣᠮ ᠤᠨ ᠬᠢ`, багшийнх → `ᠪᠠᠭᠰᠢ ᠶᠢᠨ ᠬᠢ`. The privative was the single largest hole left in the engine — 1,114 forms in the measurement set, 0.2% of them resolved; it now reads 52.2%, and overall coverage goes from 45.4% to **51.8%** at 94.1% precision.

  Both forms come from English Wiktionary and are corroborated inside the repo rather than taken on trust: `-гүй` is "aphaeresed from үгүй", whose script form ᠦᠭᠡᠢ the wmk bootstrap gives independently; `-х` (etymology 3, "converts a genitive to a substantive genitive") is spelled ᠬᠢ, and our манайх entry stores exactly `ᠮᠠᠨ ᠤ ᠬᠢ` — stem, NNBSP, genitive, NNBSP, ᠬᠢ.

  -ынх and -ийнх are deliberately **not** rows: they are the genitive plus this one, chained by G12. That is also why the substantive may never open a chain — Cyrillic -х ends every verb infinitive in the language, and without the restriction харих, явах and бичих would each acquire a substantive reading.

  Both rows are `verified: false` with the open question each one leaves recorded in `data/REVIEW.md`, and the privative's question is live in output rather than theoretical. The rule writes it apart; the lexicon writes it joined, and 30 of its 32 -гүй words use a contracted `…ᠭᠦᠢ` rather than ᠦᠭᠡᠢ at all. Since an exact lexicon match outranks decomposition, both conventions ship side by side — бичиггүй → `ᠪᠢᠴᠢᠭ ᠦᠭᠡᠢ` because it has no entry, аальгүй → `ᠠᠭᠠᠯᠢᠭᠦᠢ` because it has one. Ruling either way moves one side or the other. (The second question is whether ᠬᠢ has a harmony pair.) A citation is not verification; a human reading монгол бичиг still is.

- `bun run measure:suffix` — a coverage harness for the suffix engine, because grammar rules can be argued about indefinitely and a number cannot. It runs the engine over Wiktionary's `mn-decl` declension tables (already in the cached kaikki dump): 12,208 inflected Cyrillic forms tagged with lemma and case, 8,840 of whose lemmas we hold, reported by case with unresolved examples on request.

  It is honest about what it cannot see. The tables are template-expanded and contain rows no one checked (азот declines as *азтон*), and **"correct" means only that the right stem was found** — the test set never gives the traditional spelling, so whether the suffixes are right still takes a human reader. That limit has already earned its keep: allowing derivational suffixes scored 99 more forms "correct", every one of them the right stem with rubbish attached, which is how they came to be excluded.

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

- Community contribution pipeline, Phase B2 — the verification queue at [khudam.suray.mn/queue](https://khudam.suray.mn/queue). A page for people who read монгол бичиг but arrived with no error to report: one spelling at a time, ten to a set, with ← → through the set and every answer editable until you send it. A misclick on question two is fixable from question seven, and closing the tab loses nothing — the draft stays on the device until it is sent or skipped. Where a word has exactly one other recorded spelling, the two sit side by side, because with two forms the comparison *is* the question and vertical script is read side by side or not at all. Every question is the same one, deliberately the weakest that still helps — **is this a written form of this word, for any meaning?** Yes/no answers compose into everything else: two spellings both answered yes are homonyms and both belong, a yes and a no name the form to delete. Asking "which of these is right?" would force a choice where the honest answer is often "both". Answering «үгүй» offers the proposal field, since someone who can tell a spelling is wrong sometimes knows the right one.

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

- Decision 001 is enforced instead of remembered. 47 candidate forms still spelled the diphthong coda as the ᠶᠢ digraph (U+1836 U+1822) and are now a single ᠢ, and 32 of them turned out to be duplicates of a spelling the entry already had — **нийгэм, найр, дайсан, айраг, нийслэл, сэргийлэх and 26 more were each carrying two candidates that differ by nothing a reader can see.** Those entries are single again, `corroborated: true`, and holding Wiktionary's real gloss rather than the `unlabeled` placeholder a phantom second candidate had forced on them.

  They came back because the decision was a script that ran once: the Wiktionary tier imported the next day, wrote the digraph as Wiktionary writes it, and every reimported form registered as a *source disagreement* with our own corrected spelling. The verification queue ranks disagreements first, so 38 of the 300 questions on [khudam.suray.mn/queue](https://khudam.suray.mn/queue) — one in eight — were asking readers to choose between two identical-looking spellings of the same word. The review queue in `data/REVIEW.md` is down from 342 conflicts to 310, and the queue's question pool from 687 to 622.

  The rule is now one function (`normalizeYiDigraph` in `scripts/lib.ts`) read by the fix script, the Wiktionary importer, and `validate.ts` — so CI rejects the digraph on any pull request, with the corrected form in the error message. It carries the two exceptions with it: a ᠶ opening a word is the glide of е/ё (ес → ᠶᠢᠰᠦ), and a ᠶ opening a written-apart suffix after NNBSP is Decision 002's glide (дэлхийн → ᠳᠡᠯᠡᠬᠡᠢ ᠶᠢᠨ). Re-running the old script without that second guard would have corrupted them, since Decision 002 was made the day after the script last ran. The 67 forms that still contain a ᠶᠢ now split cleanly: 14 are real glides the rule protects, and 53 are loanword artifacts like клуб → ᠺᠯᠤᠶᠢᠪ that no script may touch — out of scope and waiting for human rulings, as they have from the start.

  ⚠️ Converter output changes for the 32 words that had a duplicate candidate: they now return one candidate instead of two. No API changes.

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
