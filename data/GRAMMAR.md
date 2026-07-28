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

### G12 — Suffix chains: depth 2, in slot order (engine policy, needs human review)

A Mongolian nominal builds outward in fixed slots, and the engine peels up to two suffixes back off, requiring each to sit in a strictly later slot than the one before it:

| Slot | Contents |
| --- | --- |
| 0 | derivational (word-forming) — **excluded from decomposition**, see below |
| 1 | plural, collective plural |
| 2 | case: genitive, accusative, dative-locative, ablative, instrumental, comitative; privative (G14) |
| 3 | substantive (G15) — may never open a chain |
| 4 | reflexive-possessive |

```
гэртээ    → ᠭᠡᠷ ᠲᠦ ᠪᠡᠨ    (stem + case + possessive)
номуудыг  → ᠨᠣᠮ ᠤᠳ ᠢ      (stem + plural + case)
```

Each unit takes its own NNBSP (G1). The strict-increase requirement is what stops номын also being offered as ном + ы + н: two case suffixes cannot stack.

Chaining splits the two attachment conditions, which at depth 1 were indistinguishable. **`attach` tests the unit the suffix physically follows** — the stem for the first suffix, the preceding suffix for the second: гэртээ takes ᠪᠡᠨ rather than ᠢᠶᠡᠨ because ᠲᠦ ends in a vowel, though ᠭᠡᠷ does not. **`gender` tests the stem**, which governs harmony for the whole word (G2).

**Derivational suffixes are excluded from decomposition entirely.** -ч, -л, -лт and the rest build new words, and by ground rule 1 a new word is a lexicon entry with its own traditional spelling — deriving one at runtime would be the engine spelling a stem. They remain in `suffixes.json` as documentation. This was measured, not assumed: allowing them scored 99 more forms "correct" in the harness, every one of them the right stem with rubbish attached (ламууд → *ᠯᠠᠮᠠ ᠭᠤ ᠳᠤ*, where the plural should be ᠨᠤᠭᠤᠳ and ᠭᠤ ᠳᠤ is not a suffix), and nothing was lost by removing them.

The slot table is **engine policy, not transcribed from a source**: Nadmid 1990 p. 13 §2 covers chain order, and a human reading it should check this table against it. Depth 3+ (номуудынхаа) remains a gap. **Status: implemented, ordering unverified.**

### G13 — Stem repair: restored fleeting vowel (тогтворгүй эгшиг)

A polysyllabic Cyrillic stem drops the short vowel of its final syllable when a suffix follows:

```
бичиг + ийн → бичгийн        ажил + аа → ажлаа        хавар + ын → хаврын
```

**Traditional script keeps the stem whole** — ᠪᠢᠴᠢᠭ ᠦᠨ, not *ᠪᠢᠴᠭ ᠦᠨ. Cyrillic follows modern pronunciation while бичиг preserves the older full form, the same split that makes уул → ᠠᠭᠤᠯᠠ. So this is purely about recovering the Cyrillic lookup key; nothing about composition changes.

The engine does not predict which vowel was dropped. After stripping a suffix, if the remainder misses the lexicon and ends in two consonants, it puts each candidate vowel back and asks the lexicon which stem exists. Vowel harmony (G2) narrows the candidates — а/о/у for a back-vowel stem, э/ө/ү for a front-vowel one, plus neutral и — and the lexicon decides the rest. ы is excluded: it spells suffixes, never a stem's final syllable.

Two stems sometimes both exist (сандл → сандал "chair" / сандил). Both are returned, per ground rule 4 — choosing between two real words is a reader's job, not a rule's. Measured against the harness below, exactly one stem exists 94% of the time.

Like G11 this is an orthographic-surface repair of our own, not a rule transcribed from Nadmid. **Status: implemented.**

### G14 — Privative (хэрэглэхгүй нөхцөл): -гүй → ᠦᠭᠡᠢ

| Cyrillic | Traditional | Conditions |
| --- | --- | --- |
| -гүй | ᠦᠭᠡᠢ | none — attaches after anything |

```
номгүй      → ᠨᠣᠮ ᠦᠭᠡᠢ
бичгүүдгүй  → ᠪᠢᠴᠢᠭ ᠦᠳ ᠦᠭᠡᠢ      (plural, then privative)
бичиггүйгээ → ᠪᠢᠴᠢᠭ ᠦᠭᠡᠢ ᠪᠡᠨ     (privative, then possessive)
```

The suffix is a worn-down copy of a free word: English Wiktionary's `-гүй` gives the etymology as *"aphaeresed from үгүй"*, and its entry for **үгүй** gives the Mongolian-script form **ᠦᠭᠡᠢ** (*ügei*) — corroborated inside this repo, where the lexicon's own `үгүй` entry reads ᠦᠭᠡᠢ from the independent wmk bootstrap. It takes no harmony variants because Cyrillic has none: there is no *-гуй.

The slot follows from what it combines with: after a plural (бичгүүдгүй) and before a possessive (бичиггүйгээ), and never alongside a case — which is slot 2.

⚠️ **Open for human review:** whether the privative is written *apart* (NNBSP, as here) or joined to the stem. The written-apart form is what G1 implies and what the ᠮᠠᠨ ᠤ ᠬᠢ precedent supports, but the lexicon's own ааггүй reads ᠠᠭᠠᠭᠦᠭᠡᠢ, joined — from the machine seed, so it settles nothing. Flagged in [REVIEW.md](REVIEW.md). **Status: implemented, data unverified.**

### G15 — Substantive genitive: -х → ᠬᠢ, only after a genitive

| Cyrillic | Traditional | Conditions |
| --- | --- | --- |
| -х | ᠬᠢ | must follow another suffix; in practice the genitive |

```
номынх   → ᠨᠣᠮ ᠤᠨ ᠬᠢ
багшийнх → ᠪᠠᠭᠰᠢ ᠶᠢᠨ ᠬᠢ
```

English Wiktionary's `-х` (etymology 3) is defined as *"converts a genitive to a substantive genitive"* and gives the Mongolian script form **ᠬᠢ** (*-ki*). Our lexicon corroborates the shape independently: манайх is stored as ᠮᠠᠨ ᠤ ᠬᠢ — stem, NNBSP, genitive, NNBSP, ᠬᠢ — which is exactly what the engine now composes.

Cyrillic -ынх/-ийнх are not separate rows: they are the genitive rows plus this one, chained by G12. That is also why **this suffix may never open a chain** (`NEVER_FIRST` in `suffix.ts`). The definition demands a genitive to convert, and the restriction is what makes the row safe to ship at all — Cyrillic -х ends every verb infinitive in the language, so an unrestricted row would offer a substantive reading of харих, явах and бичих alike.

⚠️ **Open for human review:** whether ᠬᠢ has a harmony pair (a masculine ᠬᠢ / feminine variant) — one invariant row is what the source shows, but the source is a dictionary entry, not a rule table. Flagged in [REVIEW.md](REVIEW.md). **Status: implemented, data unverified.**

## Fixing a wrong composition

When the suffix engine produces a wrong candidate for some word, there are two
repair paths, both via PR:

1. **The rule is wrong** (the whole class misbehaves): fix the row in
   [`suffixes.json`](suffixes.json) — one change corrects every word the rule
   touches.
2. **The word is an exception** (the rule is fine, this word isn't): add the
   full inflected form as a regular lexicon entry with the correct traditional
   spelling. An exact lexicon match always outranks decomposition by design, so
   the entry overrides the composed candidate immediately — no engine change
   needed. This is the intended escape hatch; exceptions accumulating in the
   lexicon are data, not debt.

## Measuring coverage

Grammar rules can be argued about indefinitely, because every rule has a convincing example and a convincing counter-example. `bun run measure:suffix` replaces the argument with a number: it runs the engine over Wiktionary's own `mn-decl` declension tables (already in the kaikki dump cached for the lexicon import) — 12,208 inflected Cyrillic forms, each tagged with its lemma and case, 8,840 of whose lemmas we hold.

| | resolved | right stem | precision |
| --- | --- | --- | --- |
| depth 1, no stem repair (before G12/G13) | 18.6% | 16.9% | 90.4% |
| + G12 suffix chains | 42.3% | 38.4% | 90.9% |
| + G13 fleeting vowel | 50.0% | 46.6% | 93.1% |
| − derivational suffixes (G12) | 48.5% | 45.4% | 93.8% |
| + G14 privative, G15 substantive | **55.1%** | **51.8%** | **94.1%** |

Two limits are load-bearing. The tables are template-expanded, so some rows are junk no one checked (азот declines as *азтон*, the template eliding a vowel a loanword does not drop). And **"right stem" is all it measures** — the test set gives the Cyrillic form, never its traditional spelling, so whether the suffixes hung off that stem are correct takes a reader of монгол бичиг. A rise is evidence, not proof. The measurement needs the cached dump, so it is a maintainer tool; the regression tests that run in CI live in `packages/converter/test/suffix.test.ts`.

## Known gaps (future work, roughly in value order)

- **Suffix chains beyond depth 2** — номуудынхаа (plural + genitive + substantive + possessive) still misses; G12 stops at two, and G15 makes three-suffix chains ordinary rather than exotic.
- **-нхан** (манайхан "our people") — the collective of G15's substantive, still absent.
- **Genitive is the weakest case at 30.6%** — the largest single bucket and the lowest score of the core six. Worth a look at G3's conditions before adding anything new.
- **Fleeting/doubled н** — уул + н + -аас → уулнаас; хаан + -ууд degeminates to хаанууд, which the engine currently maps to ᠤᠳ where p. 14 wants ᠨᠤᠭᠤᠳ after н.
- **-чууд → ᠴᠤᠳ transcription** is the least certain row in the table (read from a low-resolution scan) — flagged in [REVIEW.md](REVIEW.md).
- **ᠤ/ᠦ genitive "only after н"** is approximated by consonant-final; a dedicated attach value (e.g. `"n"`) would be exact.
- **Verb morphology** (-лаа, -сан, -даг, …) — mostly written stem-internally, out of scope for the written-apart suffix engine; needs its own design.

## Sources

- **Nadmid 1990** — Я. Надмид, *Монгол бичгийн зөв бичих толь бичиг*, Улсын хэвлэлийн газар, Улаанбаатар, 1990. Rules section available as PDF: <https://coo.mn/uploads/a/Almas/dusal2020/mongol-bichig-durem.pdf>. Copyrighted work: rules and facts are restated here with citation; the text is not copied and the PDF is not committed to this repo. Its traditional-script examples are page images — any Unicode re-entry must be typed and human-verified, never scraped.
- **Wiktionary, Монгол бичгийн галиглах тогтолцоо** — <https://mn.wiktionary.org/wiki/Монгол_бичгийн_галиглах_тогтолцоо> (CC BY-SA 4.0, license-compatible with our data). Letter correspondence tables and transliteration systems.
- **Wikipedia, Монгол бичиг** — <https://mn.wikipedia.org/wiki/Монгол_бичиг>. Background reference.
