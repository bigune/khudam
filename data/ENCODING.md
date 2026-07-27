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

**Date:** 2026-07-26 · **Applied by:** [`scripts/fix-yi-digraph.ts`](../scripts/fix-yi-digraph.ts) (2,780 entries, v0.1.1)

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
