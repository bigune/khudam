# Khudam roadmap / Замын зураг

Зорилго том — монгол бичгийн нээлттэй дижитал гэр болох; ажиллагааны дарамт байнга тэг байх ёстой (статик өгөгдөл, сервер байхгүй). The mission is big; the operational budget stays near zero. Growth comes from community and data quality, in this order: more verified data → more reviewers → governance docs → richer tooling.

## Phase 0 — scaffold ✅ (2026-07-24)

- Repo, bilingual docs, MIT + CC BY-SA 4.0 licensing
- Entry JSON Schema; beginner-friendly validator; CI on every PR/push
- wmk seed imported: 27,977 entries in 30 shards, all `verified: false`
- `khudam` package v0: `lookupWord` + `convertText`, zero deps, data compiled in at build time, flagged rule-based fallback for unknown words
- `data/names.json` starter, empty `data/suffixes.json`

## Phase 1 — name verification + suray.mn integration

- Recruit reviewers who read монгол бичиг; verify `names.json` toward 100%
- Publish `khudam` to npm; consume it from suray.mn (fully client-side)
- Honest ambiguity UI on the website: show all candidates + verified badges
- Recover the 286 seed rows listed in `data/REVIEW.md`

## Phase 2 — suffix engine

- Populate `data/suffixes.json` (human-curated, NNBSP-joined suffixes)
- Stem + suffix lookup in the engine so inflected words stop falling back
- Vowel-harmony-aware fallback refinements (е/ю front-back, ᠽ/ᠼ for loanwords)

## Phase 3 — community tooling

- Governance docs, reviewer guidelines, verified-tier statistics page
- Web-based correction flow that files PRs for non-GitHub users (still zero-ops)
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
   ambiguous entries) must be human-written.
