# Grammar rules (suffix engine)

Traditional Mongolian morphology *is* rule-governed — unlike stems. This file records every grammar rule the converter implements: what the rule says, where it comes from, and how far the engine applies it. The data lives in [`suffixes.json`](suffixes.json); the code lives in `packages/converter/src/suffix.ts`. Code-point-level policy (which Unicode characters spell what) is a separate concern recorded in [ENCODING.md](ENCODING.md).

> Note: this file is English-only on purpose. Repo docs are normally bilingual (Mongolian first), but this is a living rules log that grows with every addition — same policy as [ENCODING.md](ENCODING.md) and [CHANGELOG.md](../CHANGELOG.md).

## Ground rules

1. **Rules never spell stems.** The primary rulebook itself opens with this: *"Хуучин бичигт үгийн язгуурыг хэрхэн бичих тусгай дүрэм байдаггүй. Үгнүүдийг толиноос харж цээжлэн, уламжлалыг баримтлан бичнэ."* (Nadmid 1990, p. 2) — there are no rules for word roots; they come from a dictionary. Roots are the lexicon's job. Rules govern suffixes and how they attach. Accuracy = verified lexicon × suffix rules; the letter-map fallback is only a legibility aid.
2. **Conditions test the traditional stem, not the Cyrillic one.** Example: багш ends in a consonant, but its traditional form ᠪᠠᠭᠰᠢ ends in the vowel ᠢ, so the accusative is ᠪᠠᠭᠰᠢ ᠶᠢ (vowel-form suffix), not ᠢ. The Cyrillic surface routinely disagrees with the traditional stem shape; only the traditional form decides.
3. **Machine-transcribed forms are never verified.** Every `suffixes.json` row was transcribed into Unicode from cited rule tables by AI/maintainers and starts `verified: false`. Only human review via PR may flip it — same policy as the lexicon.
4. **Overgeneration over silence.** Suffix decomposition may emit a wrong candidate (always flagged unverified, `source: "suffix-rule"`), but it must never hide an alternative or pretend to certainty. When a whole word has an exact lexicon match, decomposition is skipped entirely — dictionary data outranks rules.

## How `suffixes.json` works

One row = one (Cyrillic suffix → traditional suffix) variant:

| Field | Meaning |
| --- | --- |
| `cyrillic` | The suffix as it appears at the end of the modern Cyrillic word. |
| `traditional` | The written-apart traditional suffix, standard Unicode, **without** the NNBSP — the engine inserts U+202F when joining (rule G1). |
| `attach` | Optional condition: the traditional stem must end in a `"vowel"` or a `"consonant"`. |
| `gender` | Optional condition: the traditional stem's vowel class must be `"masculine"` (contains ᠠ/ᠣ/ᠤ) or `"feminine"` (contains ᠡ/ᠥ/ᠦ). Stems with neither (only ᠢ) are neutral and match both — the engine then emits both variants deliberately. |
| `sense` | Grammatical label (`"genitive"`, `"plural"`, …) — surfaces in the UI so users can tell candidates apart. |
| `citation` | Where the rule variant comes from, e.g. `"Nadmid 1990 p. 15"`. |

The same `cyrillic` value may appear in several rows — that is the one-to-many principle applied to suffixes.

The engine (depth 1, longest suffix first, all matches collected): strip a known suffix → look the remaining stem up in the lexicon (retrying with a restored final ь, rule G11) → for each traditional stem candidate, attach every suffix variant whose conditions the stem satisfies → join with NNBSP. Composed candidates inherit `verified` as stem AND suffix (currently always false).

## Rules

### G1 — Written-apart suffixes join with NNBSP (U+202F)

Case endings, possessives, and the plural suffixes below are written as separate units after the stem, joined by the narrow no-break space. Nadmid 1990 p. 14 (*"…салангид бичимүй"*); Unicode core spec §13.5. **Status: implemented.**

### G2 — Suffixes have only two harmony variants (эр/эм)

*"Хуучин монгол бичигт уруулын талаар эгшиг зохицох ёс байдаггүй учраас дагавар, нөхцлүүд нь зөвхөн эр, эм хоёр хувилбартай баймуй."* — no labial (rounding) harmony in the traditional script; each suffix has exactly a masculine and a feminine form. Nadmid 1990 p. 13 §1. This is why `gender` is a two-value field. **Status: implemented.**

### G3 — Genitive (харьяалах)

Nadmid 1990 p. 15: ᠶᠢᠨ after vowels and й; ᠤᠨ/ᠦᠨ after consonants other than й/н; ᠤ/ᠦ only after н.

| Cyrillic | Traditional | Conditions |
| --- | --- | --- |
| -ын | ᠤᠨ | consonant-final, masculine |
| -ын | ᠶᠢᠨ | vowel-final, masculine |
| -ийн | ᠦᠨ | consonant-final, feminine |
| -ийн, -гийн, -н | ᠶᠢᠨ | vowel-final |
| -ы | ᠤ | consonant-final, masculine |
| -ий | ᠦ | consonant-final, feminine |

The "only after н" scope of ᠤ/ᠦ is approximated as consonant-final (see Gaps). **Status: implemented, data unverified.**

### G4 — Accusative (заах)

Nadmid 1990 p. 15: ᠶᠢ after vowels and й; ᠢ after other consonants.

| Cyrillic | Traditional | Conditions |
| --- | --- | --- |
| -ыг, -ийг | ᠢ | consonant-final |
| -ыг, -ийг, -г | ᠶᠢ | vowel-final |

**Status: implemented, data unverified.**

### G5 — Dative-locative (өгөх орших)

Nadmid 1990 pp. 15–16: ᠳᠤ/ᠳᠦ generally; ᠲᠤ/ᠲᠦ after the hard finals (хатуу дэвсгэр: б, г, р, с, д). Modern Cyrillic already chooses -д vs -т along the same line, so the Cyrillic surface carries the hard/soft decision:

| Cyrillic | Traditional | Conditions |
| --- | --- | --- |
| -д, -нд | ᠳᠤ / ᠳᠦ | masculine / feminine |
| -т | ᠲᠤ / ᠲᠦ | masculine / feminine |

**Status: implemented, data unverified.**

### G6 — Ablative (гарах)

Nadmid 1990 p. 16: ᠠᠴᠠ (masculine) / ᠡᠴᠡ (feminine), attaches after anything. Cyrillic -аас/-оос → ᠠᠴᠠ, -ээс/-өөс → ᠡᠴᠡ. **Status: implemented, data unverified.**

### G7 — Instrumental (үйлдэх)

Nadmid 1990 p. 16: ᠪᠠᠷ/ᠪᠡᠷ after vowels and й; ᠢᠶᠠᠷ/ᠢᠶᠡᠷ after other consonants. Cyrillic -аар/-оор/-гаар/-гоор map to the masculine pair, -ээр/-өөр/-гээр/-гөөр to the feminine pair, selected by the traditional stem's final. **Status: implemented, data unverified.**

### G8 — Comitative (хамтрах)

Nadmid 1990 p. 16: ᠲᠠᠢ/ᠲᠡᠢ after anything (-тай/-той → ᠲᠠᠢ, -тэй → ᠲᠡᠢ). The literary alternative ᠯᠤᠭ᠎ᠠ/ᠯᠦᠭᠡ (-луга/-лүгэ) is deliberately excluded for now: rare in modern Cyrillic input and its MVS-bearing spelling needs a human ruling first. **Status: implemented, data unverified.**

### G9 — Plural

Nadmid 1990 pp. 14–15: ᠨᠤᠭᠤᠳ/ᠨᠦᠭᠦᠳ after vowels and н/й; ᠤᠳ/ᠦᠳ after other consonants; ᠴᠤᠳ/ᠴᠦᠳ (collective) after some human-related nouns. Cyrillic -нууд/-нүүд, -ууд/-үүд, -чууд/-чүүд respectively. ᠨᠠᠷ/ᠨᠡᠷ is excluded: Cyrillic writes нар as a separate word, so it never reaches the suffix engine — it belongs in the lexicon. **Status: implemented, data unverified.**

### G10 — Reflexive-possessive (хамаатуулах)

Nadmid 1990 pp. 16–17: ᠪᠠᠨ/ᠪᠡᠨ after vowels and й; ᠢᠶᠠᠨ/ᠢᠶᠡᠨ after other consonants. Cyrillic -аа/-оо/-гаа/-гоо → masculine pair, -ээ/-өө/-гээ/-гөө → feminine pair. ⚠️ Highest overgeneration risk in the table: -аа/-ээ/-оо/-өө also end countless verb forms (аваа, байгаа), which can produce spurious noun+reflexive candidates. Acceptable under ground rule 4; tighten later. **Status: implemented, data unverified.**

### G11 — Stem repair: restored final ь (engine heuristic, not from Nadmid)

Cyrillic stems ending in ь lose it before и-initial suffixes (сургууль + ийн → сургуулийн, морь + ийг → морийг). After stripping a suffix, if the remainder misses the lexicon, the engine retries with ь appended. This is our own orthographic-surface repair, not a rule from the sources. **Status: implemented.**

## Known gaps (future work, roughly in value order)

- **Suffix chains** — depth is 1, so гэр+т+ээ (гэртээ), ном+ууд+ыг (номуудыг) miss. Needs depth-2 decomposition with chain-order rules (Nadmid p. 13 §2).
- **Fleeting vowels** — ажил + -аа → ажлаа changes the stem string; no repair rule yet.
- **Fleeting/doubled н** — уул + н + -аас → уулнаас; хаан + -ууд degeminates to хаанууд, which the engine currently maps to ᠤᠳ where p. 14 wants ᠨᠤᠭᠤᠳ after н.
- **-чууд → ᠴᠤᠳ transcription** is the least certain row in the table (read from a low-resolution scan) — flagged in [REVIEW.md](REVIEW.md).
- **ᠤ/ᠦ genitive "only after н"** is approximated by consonant-final; a dedicated attach value (e.g. `"n"`) would be exact.
- **Verb morphology** (-лаа, -сан, -даг, …) — mostly written stem-internally, out of scope for the written-apart suffix engine; needs its own design.

## Sources

- **Nadmid 1990** — Я. Надмид, *Монгол бичгийн зөв бичих толь бичиг*, Улсын хэвлэлийн газар, Улаанбаатар, 1990. Rules section available as PDF: <https://coo.mn/uploads/a/Almas/dusal2020/mongol-bichig-durem.pdf>. Copyrighted work: rules and facts are restated here with citation; the text is not copied and the PDF is not committed to this repo. Its traditional-script examples are page images — any Unicode re-entry must be typed and human-verified, never scraped.
- **Wiktionary, Монгол бичгийн галиглах тогтолцоо** — <https://mn.wiktionary.org/wiki/Монгол_бичгийн_галиглах_тогтолцоо> (CC BY-SA 4.0, license-compatible with our data). Letter correspondence tables and transliteration systems.
- **Wikipedia, Монгол бичиг** — <https://mn.wikipedia.org/wiki/Монгол_бичиг>. Background reference.
