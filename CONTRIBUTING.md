# Хувь нэмэр оруулах заавар / Contributing guide

> Монголоор эхэлж, доор нь англиар давтав. / Mongolian first, English mirror below.

---

## Монгол

Khudam-д ямар ч төрлийн дэмжлэг нээлттэй хэдий ч, хамгийн үнэтэй хувь нэмэр бол **үгсийн сангийн засвар** юм. Програмчлал огт мэдэхгүй байсан ч болно — GitHub-ийн вэб хуудаснаас шууд засвар оруулах дэлгэрэнгүй зааврыг доор бичив.

### Юуг засах вэ?

- Монгол бичгийн буруу хэлбэрийг зөв болгох (хамгийн чухал!)
- Нэг кирилл үг олон салаа утгатай бол дутуу хувилбарыг нэмэх (жишээ нь **уул** гэдэг үг ᠠᠭᠤᠯᠠ “уул ус” ба ᠤᠤᠯ “уул нь” гэсэн хоёр өөр үг байж болно)
- `sense` (утгын тайлбар) нэмэх
- Орхигдсон үг, нэрсийг нэмэх

### GitHub-гүйгээр — хөрвүүлэгч дээрээсээ шууд

[khudam.suray.mn](https://khudam.suray.mn) дээрээс бүртгэлгүйгээр хувь нэмэр оруулж болно:

- **[Хянагдахаар хүлээгдэж буй үгс](https://khudam.suray.mn/queue)** — асуулт нэг л төрөл: тухайн үгийг монгол бичгээр **ямар нэг утгаар нь** ингэж бичдэг үү? Монгол бичиг уншдаг хүнд нэг минут л зарцуулна.
- Үг тус бүрийн тайлбар хэсгээс: **⚑ алдаа** (буруу зурлага), **⊕ салаа утга** (дутуу утга), **✎ зөв зурлага** (толь бичигт байхгүй үгийн зөв бичлэг).

Ирүүлсэн бүхэн долоо хоног тутам нэг pull request болж, хүн хянаж байж үгсийн санд ордог. Хариулт өөрөө баталгаа биш — аль үгийг эхэлж хянахыг зааж өгдөг.

Монгол бичгийг сайн уншдаг, тогтмол хянахад бэлэн бол **итгэмжлэгдсэн хянагчийн холбоос** хүсээрэй (issue нээх, эсвэл шууд холбогдох): ийм холбоостой **хоёр өөр хянагч** нэг зурлагыг зөв гэвэл, түүнийг «баталгаажсан» болгох санал тэр долоо хоногийн PR-д ордог. Холбоос нэг хүнд өгөгддөг ба хэн болохыг репод бичдэггүй.

### Вэб хуудаснаас үг засах алхмууд

1. **Файлаа олох.** Үгийн эхний үсгээр нь `data/lexicon/` доторх файлыг нээнэ. Жишээ: «уул» гэдэг үг `data/lexicon/у.json` дотор бий. Хүний нэр бол `data/names.json`.
2. **Үгээ олох.** Файл нээгдсэн үед гар дээрээ `Ctrl+F` (Mac: `Cmd+F`) дараад `"cyrillic": "уул"` гэж хайна.
3. **Засварын горимд орох.** Файлын баруун дээд буланд байгаа харандааны зураг (✏️ _Edit this file_) дээр дарна. GitHub «fork» үүсгэх тухай асуувал зөвшөөрнө үү (энэ нь таны нэр дээрх түр хуулбар гэсэн үг).
4. **Засвар хийх.** Жишээ бичлэг:

   ```json
   {
     "cyrillic": "уул",
     "candidates": [
       {
         "traditional": "ᠤᠤᠯ",
         "latin": "uul",
         "verified": false,
         "source": "wmk-import"
       }
     ]
   }
   ```

   - Монгол бичгийн хэлбэрийг засах бол `"traditional"`-ийн утгыг л солино.
   - Шинэ хувилбар нэмэх бол `candidates` дотор дээрхтэй ижил бүтэцтэй блок нэмнэ. Хоёр ба түүнээс олон хувилбартай бол **хувилбар бүрд `"sense"`** (утгын ялгаа, жишээ нь `"sense": "mountain"`) заавал бичнэ.
   - Хашилт `"`, таслал `,` , хаалт `{ }`-ыг бүү мартаарай — JSON форматад бүгд чухал. Алдвал айх зүйлгүй: автомат шалгагч алдааг тань энгийн үгээр тайлбарлаж хэлнэ.
   - `"verified"`-ийг өөрөө `true` болгох шаардлагагүй — хянагч баталгаажуулсны дараа тавьдаг.

5. **Илгээх.** Хуудасны дээд хэсгийн ногоон _Commit changes..._ товчийг дараад:
   - Товч тайлбар бичнэ (жишээ: «уул: ᠠᠭᠤᠯᠠ хувилбар нэмэв»);
   - **Эх сурвалжаа дурдна** — аль толь бичиг, сурах бичиг, эсвэл өөрийн мэдлэг үү? Энэ нь хянагчид маш их тус болно;
   - _Propose changes_ → _Create pull request_ дарна.
6. **Хүлээх.** Автомат шалгалт ажиллана (формат зөв эсэхийг шалгана). Дараа нь хянагч хүн засварыг тань үзэж, асуулт байвал PR дотор ярилцаад, нийлүүлж авна. Баярлалаа! 🎉

### Шинэ үг нэмэх

Дээрхтэй ижил, гэхдээ хоёр зүйлийг анхаараарай:

- Файл доторх үгс **кириллээрээ цагаан толгойн дарааллаар** байх ёстой — шинэ үгээ зөв байрлалд нь оруулна (алдвал шалгагч хэлж өгнө).
- `"source"` талбарт `"community"` гэж бичнэ.

### Дүрэм

- Нэг PR-д нэг сэдвийн (нэг үг, эсвэл цөөн холбоотой үгсийн) засвар байвал хамгийн хурдан хянагдана.
- Монгол бичгийн хэлбэрийг **стандарт Юникодоор** (U+1800–U+18AF) бичнэ. Бусад кодчилол хэрэглэхгүй.
- Маргаантай тохиолдлыг эх сурвалжид тулгуурлан шийднэ — PR бол хэлэлцүүлэг өрнүүлэх талбар юм.

### Кодод хувь нэмэр оруулах

```bash
bun install
bun run validate   # өгөгдлийн шалгалт
bun run build      # өгөгдөл + багц бүтээх
bun test           # тестүүд
```

Кодын өөрчлөлт бүр тесттэй байх ёстой. Асуух зүйл байвал issue нээгээрэй.

---

## English

Khudam welcomes every kind of help, but the most valuable is **lexicon correction**. You do not need to know how to program — the step-by-step guide below uses only the GitHub web UI.

### What to fix

- Wrong traditional-script spellings (most important!)
- Missing candidates where one Cyrillic word maps to several traditional words (e.g. **уул** can be ᠠᠭᠤᠯᠠ “mountain” or ᠤᠤᠯ “original”)
- Missing `sense` labels
- Missing words and names

### Without GitHub — straight from the converter

[khudam.suray.mn](https://khudam.suray.mn) takes contributions with no account at all:

- **[The verification queue](https://khudam.suray.mn/queue)** asks one question — is this a written form of this word, **for any meaning**? It takes a minute from anyone who reads монгол бичиг.
- In the per-word panel: **⚑** a wrong spelling, **⊕** a missing meaning, **✎** the real spelling of a word the lexicon does not know.

Everything filed becomes one pull request a week, which a human merges. An answer is never verification by itself; it directs a reviewer's attention.

If you read the script well and are willing to review regularly, ask for a **trusted reviewer link** (open an issue, or get in touch): when **two different** trusted reviewers agree on a spelling and none disagrees, that weekly pull request stages it as `verified: true` for the maintainer to merge. A link is given to one person, and who holds it is never recorded in the repository.

### Fixing a word from the web UI — step by step

1. **Find the file.** Lexicon files are sharded by first letter: the word «уул» lives in `data/lexicon/у.json`. Personal names live in `data/names.json`.
2. **Find the word.** With the file open, press `Ctrl+F` (Mac: `Cmd+F`) and search for `"cyrillic": "уул"`.
3. **Enter edit mode.** Click the pencil icon (✏️ _Edit this file_) at the top right. If GitHub asks to create a fork, accept — that is just your personal working copy.
4. **Make the change.** An entry looks like this:

   ```json
   {
     "cyrillic": "уул",
     "candidates": [
       {
         "traditional": "ᠤᠤᠯ",
         "latin": "uul",
         "verified": false,
         "source": "wmk-import"
       }
     ]
   }
   ```

   - To correct a spelling, change only the `"traditional"` value.
   - To add an alternative, add another block of the same shape inside `candidates`. When there are two or more candidates, **every candidate must have a `"sense"`** (a short meaning label, e.g. `"sense": "mountain"`).
   - Mind the quotes, commas, and braces — JSON needs all of them. Don't worry about mistakes: the automatic checker explains any problem in plain language.
   - You don't need to set `"verified": true` yourself — a reviewer does that after confirming.

5. **Submit.** Click the green _Commit changes..._ button:
   - Write a short description (e.g. “уул: add ᠠᠭᠤᠯᠠ candidate”);
   - **Cite your source** — which dictionary or textbook, or personal knowledge? This helps the reviewer a lot;
   - _Propose changes_ → _Create pull request_.
6. **Wait.** Automated validation runs first (format checks). Then a human reviewer looks at your change, discusses if needed, and merges. Thank you! 🎉

### Adding a new word

Same flow, plus two things to watch:

- Entries within a file are **sorted alphabetically by the Cyrillic form** — insert the new word in the right place (the validator will tell you if it's off).
- Use `"source": "community"`.

### Ground rules

- One word (or a few closely related words) per PR gets reviewed fastest.
- Traditional script must be **standard Unicode** (U+1800–U+18AF). No proprietary encodings.
- Disagreements are settled by sources and discussion — the PR is the place to talk.

### Contributing code

```bash
bun install
bun run validate   # data checks
bun run build      # compile data + build the package
bun test           # unit tests
```

Every engine change needs tests. Open an issue if you're unsure about anything.
