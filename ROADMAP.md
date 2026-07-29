# Khudam roadmap / Замын зураг

Монгол бичгийн нээлттэй, дижитал төв болох том зорилготой; үйл ажиллагааны ачаалал хамгийн бага хэмжээнд байх ёстой (статик өгөгдөл, сервер байхгүй). The mission is big; the operational budget stays near zero. Growth comes from community and data quality, in this order: more verified data → more reviewers → governance docs → richer tooling.

## Phase 0 — scaffold ✅ (2026-07-24)

- Repo, bilingual docs, MIT + CC BY-SA 4.0 licensing
- Entry JSON Schema; beginner-friendly validator; CI on every PR/push
- wmk seed imported: 27,977 entries in 30 shards, all `verified: false`
- `khudam` package v0: `lookupWord` + `convertText`, zero deps, data compiled in at build time, flagged rule-based fallback for unknown words
- `data/names.json` starter, empty `data/suffixes.json`

## Phase 1 — name verification + public converter page

- Recruit reviewers who read монгол бичиг; verify `names.json` toward 100%
- ✅ Publish `khudam` to npm (0.1.0, 2026-07-24)
- ✅ Converter UI as `apps/web` workspace in this repo → khudam.suray.mn
  (own Vercel project; builds from the workspace so merged data PRs go live
  without an npm release; suray.mn links to it)
- Honest ambiguity UI: show all candidates + verified badges (v0 shipped
  with `apps/web`; refine with real-user feedback)
- Recover the 286 seed rows listed in `data/REVIEW.md`
- ✅ Second data source: English Wiktionary via kaikki.org, CC BY-SA
  (2026-07-27) — 167 new words, 958 candidates corroborated by two
  independent sources, 342-word conflict queue in `data/REVIEW.md` as the
  prioritized review list, plus 158 Classical-etymology suggestions and
  90 queued proper names. Optional monthly chore: re-run
  `bun run import:wiktionary` after deleting `.cache/` — kaikki.org
  refreshes with each Wiktionary dump, and the import is idempotent.

## Phase 2 — suffix engine

- Populate `data/suffixes.json` (human-curated, NNBSP-joined suffixes)
- Stem + suffix lookup in the engine so inflected words stop falling back
- Vowel-harmony-aware fallback refinements (е/ю front-back, ᠽ/ᠼ for loanwords)

## Phase 3 — community tooling

- Governance docs, reviewer guidelines, verified-tier statistics page
- Web-based correction flow that files PRs for non-GitHub users (still zero-ops)
  - ✅ First slice (2026-07-28): in-converter error reporting and implicit
    selection counting, landing in a disposable Supabase mailbox
    (`supabase/README.md`). Signals direct reviewer attention; they are never
    verification, and only a human merging a PR changes the lexicon.
  - ✅ Proposal widget (2026-07-28): corrections, missing meanings, and
    spellings for unknown words, checked at the door by code point.
  - ✅ Weekly export job + PR generator (2026-07-28): the mailbox is drained
    every Monday into one triaged pull request, with the raw rows kept as a
    90-day audit artifact and `data/stats/` as the queue's memory. The
    generator never edits an existing candidate; it adds an entry only for an
    unknown word two independent sessions spelled identically.
  - ✅ Verification queue (2026-07-28): khudam.suray.mn/queue asks one
    question — is this a written form of this word, for any meaning? — so a
    homonym survives it. Questions are compiled from the data on every build
    (flags first, then the 342 source conflicts, then traffic); answers land
    as `verdict` signals and are tallied per candidate in the weekly PR.
    Tallies are evidence, never verification.
  - ✅ Trust layer (2026-07-29): the contribution pipeline is complete. A grant
    is a UUID in a link (`bun run reviewer:add`) that the maintainer hands to
    one person; the repo holds only its SHA-256 hash beside an opaque label, so
    `data/reviewers.json` is safe in public and revoking a leaked link is
    deleting one line — which also drops that reviewer's past attestations.
    Answers from a granted browser are stamped `reviewer_id`, and **two
    different trusted reviewers agreeing, with none disagreeing, stages
    `verified: true` in the weekly pull request** for a human to merge. A single
    trusted "no" vetoes the flip and opens a "trusted reviewers disagree"
    section that never closes on its own — two people who read the script
    contradicting each other is the one thing this pipeline must not average
    away. Staged flips are capped per pull request and the held-back count is
    printed, because a fast-track section too long to read is one that gets
    merged unread.
  - Next: nothing scheduled here. The pipeline's remaining work is people —
    issuing grants to reviewers who read монгол бичиг — not code.
- Watchlist sources (see `data/SOURCES.md`) if licensing clears

## Decisions made during scaffold

1. **Hand-rolled validator instead of a JSON-Schema library** — error messages
   must speak to non-programmers editing JSON in the GitHub web UI;
   `data/schema/entry.schema.json` remains the formal contract the checks mirror.
2. **Sort order is plain Unicode code-point order** (deterministic,
   locale-independent); ё, ө, ү therefore sort after я. The validator explains
   this in its error message.
3. **Seed homoglyph repair:** Latin `x` inside otherwise-Cyrillic seed words was
   mapped to Cyrillic `х` (116 rows). This is a character-encoding fix, not an
   orthography correction. No other machine repairs are performed.
4. **286 seed rows were skipped, not guessed at** (74 with dictionary markup in
   the Cyrillic form, 212 with non-Mongolian text in the traditional field);
   all are listed in `data/REVIEW.md` for human recovery.
5. **The importer never touches an existing entry** — that is what makes it
   idempotent and incapable of overwriting `verified: true` work. Side effect:
   re-running it restores deliberately deleted entries, so bad entries should
   be corrected rather than deleted (noted in `data/SOURCES.md`).
6. **Fallback letter table** maps ж/з → ᠵ and ч/ц → ᠴ (native-word
   correspondence); the foreign-word letters ᠽ/ᠼ are deferred to Phase 2.
   The table lives in `packages/converter/src/fallback.ts` as plain data.
7. **The compiled lexicon artifact is gitignored**
   (`packages/converter/src/generated/`); CI runs `bun run build` before
   `bun test`. The artifact stores the table as a JSON string parsed lazily —
   faster to load and type-check than a giant object literal.
8. **`data/names.json` is merged into the compiled lookup table** (deduplicated
   against the lexicon), so name verification immediately benefits the engine.
9. **Multi-candidate entries produced by machine import are forbidden** — when
   the seed had conflicting traditional forms for one word, only the first was
   kept and the rest flagged for review, because `sense` labels (required for
   ambiguous entries) must be human-written. Clarified 2026-07-29, when the
   contribution pipeline began delivering human work by machine: what is
   forbidden is a **machine-generated** sense, not a human-written one a script
   carried into a pull request. The same distinction is what makes the fast
   track legitimate — a script transcribing two reviewers' answers is not a
   script deciding anything.
