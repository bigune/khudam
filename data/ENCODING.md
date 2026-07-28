# Encoding decisions

In the Mongolian script one letter has many shapes and several letters share a shape, so "correctly written" ultimately means "written with which code points." This file records the encoding-model decisions Khudam has made and the evidence behind each one. Data corrections that apply a decision are logged in the [CHANGELOG](../CHANGELOG.md); entries awaiting a human ruling live in [REVIEW.md](REVIEW.md).

> Note: this file is English-only on purpose. Repo docs are normally bilingual (Mongolian first), but this is a living decision log that grows with every ruling — same policy as [CHANGELOG.md](../CHANGELOG.md).

## Ground rules

1. **Standard Unicode only.** The main block U+1800–U+18AF plus NNBSP (U+202F) before written-apart suffixes. No proprietary encoding models (e.g. "Тунгаамал").
2. **Logical code points only.** Positional forms are the font's job, never stored.
3. **Judge by code point, not by appearance.** Identically-rendered strings can differ in code points, so every ruling here is made and cited at the code-point level.
4. **Every decision is reversible.** Open an issue with code-point-level evidence and citations; overturning a decision costs one fix-script run and one patch release.

Applying a decision never sets `verified: true` — a machine correction is not human verification.

---

## Decision 001 — Postvocalic й: single ᠢ (U+1822), not the ᠶᠢ digraph

**Date:** 2026-07-26 · **Applied by:** [`scripts/fix-yi-digraph.ts`](../scripts/fix-yi-digraph.ts) (2,780 entries, v0.1.1; second sweep 2026-07-28, 47 forms) · **Enforced by:** `normalizeYiDigraph()` in [`scripts/lib.ts`](../scripts/lib.ts)

### The rule

Cyrillic **й** acting as a diphthong coda (after a vowel: ай, ой, уй, эй, үй, ий…) is encoded as a **single ᠢ U+1822**. The double-tooth shape seen in rendered text is the *contextual postvocalic form of the letter ᠢ*, supplied by the font — not a separate ᠶ letter. A true consonant glide keeps **ᠶ U+1836**: word-initial ᠶᠢ from е/ё (e.g. ес → ᠶᠢᠰᠦ) is correct and untouched.

| Word | Encoding | Code points | |
| --- | --- | --- | --- |
| сайн | ᠰᠠᠢᠨ | U+1830 U+1820 **U+1822** U+1828 | ✔ Khudam |
| сайн | ᠰᠠᠶᠢᠨ | U+1830 U+1820 **U+1836 U+1822** U+1828 | ✘ legacy digraph (seed data) |
| ес | ᠶᠢᠰᠦ | **U+1836 U+1822** U+1830 U+1826 | ✔ true glide — keep |

### Evidence

1. **UTN #57, "Encoding and Shaping of the Mongolian Script"** (Kushim Jiang, version 4, 2024) — Table 4 (Hudum phonetic letters) lists the two-teeth medial written form **under the letter *i* (U+1822)** with condition **[D] "Devsger"**, defined in the Notation section as "found in … the vowel letter after a vowel," and illustrates it with ***sain irögel*** — i.e. the standard's own example encodes *sain* with a single U+1822. The examples under *y* (U+1836) are true glides (*huda-yin*, *ger-iyar*), and a two-teeth written form appears under U+1836 only as an FVS-requested override, not a default spelling. <https://www.unicode.org/notes/tn57/>
2. **GB/T 25914—2023** — per UTN #57's introduction, the shaping requirements for Hudum embodied there are established as the Chinese national standard, so this model is what mainstream fonts and shapers implement. (UTNs are formally informative, but UTN #57 is the only complete public specification of the modern model.)
3. **The historical dispute, honestly:** Liang Hai, *Current problems in the Mongolian encoding* (MWG/2-N12, [L2/18-106](https://www.unicode.org/L2/L2018/18106-mwg2-12-current-problems.pdf), 2017), §3.2 and figure 3, documents that the identification of diphthong letters was "heavily debated," with both ⟨A I⟩ and ⟨A YA I⟩ circulating for words like *sain* (see also the [W3C i18n Mongolian task force archives](https://lists.w3.org/Archives/Public/public-i18n-mongolian/), 2015). This is why the wmk seed — and plenty of older text in the wild — carries the ᠶᠢ digraph. The debate was real; the resolution above is where the standardization effort landed.
4. **Native-speaker review** (2026-07-26): side-by-side rendering of both encodings was confirmed by a native reader. Corroborating only — rendering is font-dependent, so visual review can never be primary evidence for an encoding choice (ground rule 3).
5. **Internal consistency:** the engine's rule-based fallback transliteration (`packages/converter/src/fallback.ts`) has always mapped й → ᠢ; this decision makes the lexicon agree with it.

### Consequences

- New entries and corrections must encode diphthong й as single ᠢ; do not add ᠶᠢ spellings of the same word as extra candidates.
- Text from older tools and corpora may carry ᠶᠢ: visually (near-)identical, different code points. Normalize ᠶᠢ → ᠢ before comparing khudam output against external text. (Lookup-time normalization is a possible future engine feature.)
- Edge cases excluded from the automatic fix (word-initial glides, loanwords without й) await per-entry human rulings in [REVIEW.md](REVIEW.md).

### Enforcement — why a decision is a function, not a script

The first application of this decision was a one-shot migration, and a one-shot migration only holds until the next import. The Wiktionary tier arrived the following day writing the digraph as Wiktionary writes it, and 52 forms walked straight back in. Each one landed beside our corrected spelling of the same word and registered as a *source disagreement*, which is how 19 words reached the top of the verification queue asking readers to adjudicate a question this file had already answered.

So the rule now lives in one function, `normalizeYiDigraph(cyrillic, traditional)` in [`scripts/lib.ts`](../scripts/lib.ts), and three places read it:

| Where | What it does |
| --- | --- |
| [`scripts/fix-yi-digraph.ts`](../scripts/fix-yi-digraph.ts) | corrects data already in the lexicon (dry-run by default) |
| [`scripts/import-wiktionary.ts`](../scripts/import-wiktionary.ts) | applies it to incoming whole-word forms, so a re-import corroborates our spelling instead of disputing it |
| [`scripts/validate.ts`](../scripts/validate.ts) | rejects a digraph in D1's scope, with the corrected form in the message — CI, and every pull request |

The function also carries the two exceptions that make the rule safe, and both had teeth. A ᠶ that **opens a word** is the true glide of е/ё (ес → ᠶᠢᠰᠦ). A ᠶ that **opens a written-apart suffix**, immediately after NNBSP, is Decision 002's glide — дэлхийн → ᠳᠡᠯᠡᠬᠡᠢ ᠶᠢᠨ has й in its Cyrillic and a perfectly correct ᠶᠢᠨ. Decision 002 was made a day after the fix script's first run, so the script had never heard of it; re-running it unguarded would have corrupted exactly the spellings that decision protects.

Suffix rows in [`suffixes.json`](suffixes.json) are stored **without** their NNBSP, which leaves the rule no way to see that a bare ᠶᠢᠨ is a suffix. They are exempt, and `mongolianForms()` documents that at the call site.

---

## Decision 002 — Suffix-initial and intervocalic glide keeps ᠶ (U+1836): ᠶᠢᠨ, ᠶᠢ, ᠢᠶᠠᠷ…

**Date:** 2026-07-27 · **Applies to:** [`suffixes.json`](suffixes.json) (no lexicon entries carry NNBSP suffix units yet, so no data migration)

### The rule

The written-apart suffixes beginning with the glide *y* — genitive **ᠶᠢᠨ** (*yin*), accusative **ᠶᠢ** (*yi*) — and the suffixes with *y* between vowels — **ᠢᠶᠠᠷ/ᠢᠶᠡᠷ** (*iyar/iyer*), **ᠢᠶᠠᠨ/ᠢᠶᠡᠨ** (*iyan/iyen*) — keep the letter **ᠶ U+1836**. This is not the Decision 001 digraph. Decision 001 removes ᠶ where Cyrillic й is a **diphthong coda inside a vowel run** (UTN #57 condition [D] "Devsger"); in these suffixes the *y* is a **true consonant glide** in suffix-initial (condition [P] "Particle") or intervocalic position — the same "true glide" case Decision 001 explicitly keeps. Diphthong codas *inside* suffixes still follow Decision 001: comitative ᠲᠠᠢ/ᠲᠡᠢ ends in a single ᠢ, never ᠶᠢ.

| Suffix | Encoding | Code points | |
| --- | --- | --- | --- |
| genitive (багшийн) | ᠪᠠᠭᠰᠢ ᠶᠢᠨ | … U+202F **U+1836 U+1822** U+1828 | ✔ suffix-initial glide — keep ᠶ |
| comitative (номтой) | ᠨᠣᠮ ᠲᠠᠢ | … U+202F U+1832 U+1820 **U+1822** | ✔ diphthong coda — Decision 001 applies |
| instrumental (гэрээр) | ᠭᠡᠷ ᠢᠶᠡᠷ | … U+202F U+1822 **U+1836** U+1821 U+1837 | ✔ intervocalic glide — keep ᠶ |

### Evidence

1. **UTN #57 v4, Table 4** — under the letter ***y* (U+1836)**, condition **[P] "Particle: found as an auxiliary or grammatical appositive"**, the listed examples are ***huda–yin*** (genitive) and ***ger–iyar*** (instrumental): the reference shaping model itself encodes the vowel-stem genitive and the instrumental with U+1836. Under the letter *i* (U+1822), the [P] examples are ***gen–i*** (bare accusative after consonants — our ᠢ row) — while the two-teeth *medial* form belongs to *i* only under condition [D], which is Decision 001's case. <https://www.unicode.org/notes/tn57/>
2. **Why the confusion is natural:** in particle position U+1836 takes I-shaped written forms (UTN #57 lists them as "I.init, I.medi"), so ᠶᠢᠨ renders nearly identically to a ᠢᠨ spelling. Identical appearance, different code points — exactly why rulings are made at the code-point level (ground rule 3).
3. **Classical grammar:** the genitive after vowel-final stems is uniformly romanized *-yin* and the accusative *-yi* (vs *-un/-ün*, *-u/-ü*, *-i* elsewhere) — the glide is a real consonant of the suffix, not an artifact of й transcription.

### Consequences

- `suffixes.json` keeps U+1836 in ᠶᠢᠨ, ᠶᠢ, ᠢᠶᠠᠷ, ᠢᠶᠡᠷ, ᠢᠶᠠᠨ, ᠢᠶᠡᠨ; the ᠲᠠᠢ/ᠲᠡᠢ coda stays a single ᠢ. Pinned by code-point tests in `packages/converter/test/suffix.test.ts`.
- Human review of the suffix table ([REVIEW.md](REVIEW.md)) can overturn this like any decision — with code-point-level evidence.

---

## Decision 003 — Detached final vowel: MVS + vowel, never MVS + NIRUGU + vowel

**Date:** 2026-07-27 · **Approved by:** maintainer · **Applied by:** [`scripts/fix-mvs-nirugu.ts`](../scripts/fix-mvs-nirugu.ts) (1,113 candidates)

### The rule

The detached final vowel (Cyrillic words like цаана, батга whose traditional form ends in the separated ᠎ᠠ/᠎ᠡ) is encoded **MVS (U+180E) directly followed by the vowel**. The wmk seed frequently inserted a NIRUGU (᠊ U+180A) between them; that sequence is removed. NIRUGU remains valid in its documented role (patronymic abbreviations and other deliberate joining), which the seed never used.

| Word | Encoding | Code points | |
| --- | --- | --- | --- |
| авга | ᠠᠪᠠᠭ᠎ᠠ | … U+182D **U+180E U+1820** | ✔ Khudam |
| авга | ᠠᠪᠠᠭ᠎᠊ᠠ | … U+182D **U+180E U+180A U+1820** | ✘ seed hack (removed) |

### Evidence

1. **Purpose of the characters.** MVS exists precisely to produce the special detached final vowel form. UTN #57 (v4, §2.3) defines U+180A NIRUGU as a character that "behaves exactly like ZWJ but is visible as a piece of stem stroke," used "to cause joining in everyday text," canonically in patronymic abbreviations. Inserting it after MVS *re-joins* the vowel the MVS just detached — the two cancel out.
2. **Rendering confirms** (HarfBuzz 12 + Noto Sans Mongolian v3.002): `MVS+NIRUGU+ᠠ` shapes as `mvs.wide nirugu uni1820.A.fina` — an ordinary connected final a; `MVS+ᠠ` shapes as the consonant's MVS form + `mvs.narrow uni1820.Aa.isol` — the correct detached form. (Corroborating only; the ruling stands on the character semantics, per ground rule 3.)
3. **Internal inconsistency of the seed:** 1,113 candidates used the hacked sequence vs 134 the standard one — the same phenomenon encoded two ways in one machine-generated dataset. U+180A appeared *nowhere else* in the seed (zero legitimate uses), so the removal is loss-free.
4. **External corroboration:** the батга spelling observed on other Mongolian-script sites carries no nirugu (see REVIEW.md — its remaining letter-level differences are a separate, per-word question).

### Consequences

- New entries and corrections must write the detached final vowel as MVS + vowel. NIRUGU is accepted only in its documented joining role, never adjacent to MVS.
- As always: corrected candidates stay `verified: false`, `source` unchanged; the fix script is idempotent and never touches `verified: true` candidates.
- Whether a *particular* word should have the MVS final vowel at all remains a dictionary-level question per word (e.g. батга), not covered by this decision.
