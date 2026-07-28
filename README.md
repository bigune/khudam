# Khudam — нээлттэй монгол бичиг хөрвүүлэгч

> Khudam — an open-source Cyrillic ↔ traditional Mongolian script (монгол бичиг) lexicon and converter. _(English below.)_

**Худам монгол бичиг** бол уламжлалт монгол бичгийн сонгодог, түүхэн нэр юм. Төслийн зорилго нь монгол бичгийг дижитал орчинд хэн бүхэнд үнэгүй, нээлттэй, стандарт Юникодоор хүртээмжтэй болгох билээ.

---

## Монгол

### Төслийн тухай

Khudam бол кирилл ↔ монгол бичиг хөрвүүлэлтийн **нээлттэй үгсийн сан** (lexicon) болон **хөрвүүлэгч сан** (TypeScript library) юм.

- Бүх өгөгдөл энэхүү репод JSON хэлбэрээр хадгалагдана — Git нь бидний “мэдээллийн сан” болох бөгөөд сервергүй, бүртгэл шаардахгүй, үнэгүй байна.
- Хөрвүүлэгч нь хөтөч дээр шууд ажилладаг ба бусад сангаас хамааралгүй TypeScript/JavaScript сан (`khudam` npm package) юм.
- Код нь MIT, өгөгдөл нь CC BY-SA 4.0 лицензтэй — хэн ч чөлөөтэй ашиглаж, сайжруулж болно, харин сайжруулсан хувилбар нь мөн нээлттэй эхийн байх ёстой.

### Нөхөрсөг сануулга

Бид дөнгөж эхэлж байгаа ба одоогоор үгсийн сангийн **дийлэнх нь машинаар үүсгэгдсэн, хүн шалгаагүй** өгөгдөл тул алдаа цөөнгүй бий. Энэ бол “бэлэн бүтээгдэхүүн” биш — хамт олноороо үг үгээр нь засаж баталгаажуулах **олон нийтийн төсөл** юм. Монгол бичиг мэддэг хүн бүрийн хувь нэмэр үнэ цэнтэй: [CONTRIBUTING.md](CONTRIBUTING.md)-г үзээрэй — програмчлал мэдэхгүй байсан ч GitHub вэб дээрээс шууд засвар оруулах боломжтой.

### Баталгаажсан ба баталгаажаагүй өгөгдөл

Үгсийн сангийн үг бүр `verified` тэмдэглэгээтэй:

- `"verified": true` — **хүн** шалгаж баталгаажуулсан. Зөвхөн PR-ээр, хянасан хүний оролцоотой тавигдана.
- `"verified": false` — машин импортын түвшний өгөгдөл. Алдаатай байж болно.

Хөрвүүлэгч нь энэхүү ялгааг хэрэглэгчид нээлттэй харуулах бөгөөд үр дүн бүр `verified` тэмдэглэгээтэй буцаагдана. Мөн нэг кирилл үг олон салаа утгатай (олон зурлагатай) байж болох ба бүх хувилбаруудын хамт харуулна.

### Нэрсийн сан — эхний зорилт

`data/names.json` бол хүний нэрсийн тусгай сан. **Эхний том зорилт: нэрсийг 100% хүн баталгаажуулах.** Нэрээ монгол бичгээр зөв бичих нь хамгийн түгээмэл, чухал хэрэгцээ учраас чанарыг нэн тэргүүнд тавьж байгаа. Одоогоор энэ файлд импортоос хуулсан, баталгаажаагүй цөөн жишээ л бий.

### Эх сурвалж

Анхны 28 мянга орчим бичлэгийг [sura0111/writtenMongolianKeyboard](https://github.com/sura0111/writtenMongolianKeyboard) (MIT) төслөөс импортолсон. Тэдгээрийн монгол бичгийн хэлбэрүүд нь гуравдагч машин хөрвүүлэгчээр үүссэн тул **бүгд `verified: false`** төлөвтэй.

Хоёр дахь эх сурвалж: Английн [Wiktionary](https://en.wiktionary.org/)-гийн монгол үгсийг [kaikki.org](https://kaikki.org/dictionary/Mongolian/)-оор дамжуулан импортолсон (© Wiktionary contributors, CC BY-SA). Wiktionary-гийн бичлэгийг хүмүүс бичиж хянадаг тул итгэлцлийн түвшин арай өндөр ч мөн л `verified: false` хэвээр. Хоёр эх сурвалж яг ижил хэлбэр өгсөн үгс `corroborated: true` тэмдэгтэй; зөрсөн тохиолдолд хоёр хувилбарыг хоёуланг нь хадгалж, [data/REVIEW.md](data/REVIEW.md)-ийн хянан засварлах дараалалд жагсаасан. Дэлгэрэнгүйг [data/SOURCES.md](data/SOURCES.md)-с үзнэ үү.

### Ашиглах

```bash
bun add khudam    # эсвэл: npm install khudam
```

```ts
import { lookupWord, convertText } from "khudam";

lookupWord("аав");
// → [{ traditional: "ᠠᠪᠤ", latin: "aav", verified: false, source: "wmk-import" }]

convertText("сайн байна уу");
// → үг бүрийн хувилбаруудыг (candidates) буцаана;
//   үгсийн санд байхгүй үгийг дүрмээр галиглаж, fallback: true гэж тодорхой тэмдэглэнэ
```

---

## English

### What is this?

Khudam is an **open lexicon** and **converter library** for Cyrillic ↔ traditional Mongolian script (монгол бичиг).

- All data lives in this repository as JSON — Git is the database. No servers, no accounts, free forever.
- The converter is a zero-dependency TypeScript/JavaScript library (`khudam` on npm) that runs in the browser.
- Code is MIT-licensed; data is CC BY-SA 4.0 — anyone may use and improve it, but improved versions must stay open.

### An honest disclaimer

This project is at an early stage. The bulk of the current lexicon is **machine-generated, unreviewed** bootstrap data and contains plenty of errors. This is not a finished product — it is a **community project** whose mission is to verify and correct the lexicon entry by entry. If you can read монгол бичиг, your help matters: see [CONTRIBUTING.md](CONTRIBUTING.md) — you can fix a word entirely from the GitHub web UI, no programming required.

### Verified vs. unverified data

Every candidate in the lexicon carries a `verified` flag:

- `"verified": true` — reviewed and confirmed by a **human**, only ever set through a pull request.
- `"verified": false` — machine-imported bootstrap data; may be wrong.

The converter never hides this distinction: every result is returned with its `verified` flag. Ambiguity is never hidden either — one Cyrillic word can map to several traditional spellings with different meanings, and the library always returns the full candidate list rather than silently picking one.

### Names — the first target

`data/names.json` is a dedicated lexicon of personal names. **The first major goal is 100% human verification of names**, because writing one's own name correctly in монгол бичиг is the most common and most important use case. Right now the file holds only a few unverified placeholder examples copied from the imported lexicon.

### Data provenance

The initial ~28k entries were imported from [sura0111/writtenMongolianKeyboard](https://github.com/sura0111/writtenMongolianKeyboard) (MIT). Its traditional-script forms were produced by a third-party machine converter, so **everything is imported as `verified: false`**.

The second layer comes from the Mongolian dictionary of English [Wiktionary](https://en.wiktionary.org/), extracted via [kaikki.org](https://kaikki.org/dictionary/Mongolian/) (© Wiktionary contributors, CC BY-SA — the same ShareAlike family as our data). Wiktionary entries are written and reviewed by human editors, so this tier is higher-trust than the bootstrap — but still `verified: false`. Where the two sources agree on the identical form, candidates carry `corroborated: true`; where they disagree, both candidates are kept and the word is queued for human review in [data/REVIEW.md](data/REVIEW.md). Full provenance and attribution: [data/SOURCES.md](data/SOURCES.md).

### Usage

```bash
bun add khudam    # or: npm install khudam
```

```ts
import { lookupWord, convertText } from "khudam";

lookupWord("аав");
// → [{ traditional: "ᠠᠪᠤ", latin: "aav", verified: false, source: "wmk-import" }]

convertText("сайн байна уу");
// → returns per-word candidate lists; words missing from the lexicon get a
//   rule-based transliteration clearly flagged fallback: true
```

### Repository layout

```
data/                    lexicon data (CC BY-SA 4.0) — the heart of the project
  lexicon/а.json …       sharded by first Cyrillic letter
  names.json             personal names (first 100%-verification target)
  suffixes.json          common suffix mappings (placeholder, Phase 2)
  schema/entry.schema.json
packages/converter/      the `khudam` npm package (MIT)
scripts/                 import / validate / build tooling (bun + TypeScript)
```

### Development

```bash
bun install
bun run validate   # check all data files
bun run build      # compile data + build the package
bun test           # engine unit tests
```

### Licenses

- Code: [MIT](LICENSE)
- Data (`data/`): [CC BY-SA 4.0](data/LICENSE)
