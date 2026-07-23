# Хувь нэмэр оруулах заавар / Contributing guide

> Монголоор эхэлж, доор нь англиар давтав. / Mongolian first, English mirror below.

---

## Монгол

Khudam-д тусламж хэлбэр бүрээр хэрэгтэй, гэхдээ хамгийн үнэтэй нь **үгсийн сангийн засвар** юм. Програмчлал огт мэдэхгүй байсан ч болно — GitHub-ийн вэб хуудаснаас шууд засвар оруулах алхам алхмаар зааврыг доор бичив.

### Юуг засах вэ?

- Монгол бичгийн буруу хэлбэрийг зөв болгох (хамгийн чухал!)
- Нэг кирилл үг олон утгатай бол дутуу хувилбарыг нэмэх (жишээ нь **уул** гэдэг үг ᠠᠭᠤᠯᠠ “уул ус” ба ᠤᠤᠯ “уул нь” гэсэн хоёр өөр үг байж болно)
- `sense` (утгын тайлбар) нэмэх
- Дутуу үг, дутуу нэр нэмэх

### Вэб хуудаснаас үг засах — алхам алхмаар

1. **Файлаа ол.** Үгийн эхний үсгээр нь `data/lexicon/` доторх файлыг нээнэ. Жишээ: «уул» гэдэг үг `data/lexicon/у.json` дотор бий. Хүний нэр бол `data/names.json`.
2. **Үгээ ол.** Файл нээгдсэн үед гар дээрээ `Ctrl+F` (Mac: `Cmd+F`) дараад `"cyrillic": "уул"` гэж хайна.
3. **Засварын горимд ор.** Файлын баруун дээд буланд байгаа харандааны зураг (✏️ *Edit this file*) дээр дар. GitHub «fork» үүсгэх тухай асуувал зөвшөөрнө үү (энэ нь таны нэр дээрх түр хуулбар гэсэн үг).
4. **Засвараа хий.** Жишээ бичлэг:

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
5. **Илгээ.** Хуудасны дээд хэсгийн ногоон *Commit changes...* товчийг дараад:
   - Товч тайлбар бич (жишээ: «уул: ᠠᠭᠤᠯᠠ хувилбар нэмэв»);
   - **Эх сурвалжаа дурд** — аль толь бичиг, сурах бичиг, эсвэл өөрийн мэдлэг үү? Энэ нь хянагчид маш их тус болно;
   - *Propose changes* → *Create pull request* дарна.
6. **Хүлээ.** Автомат шалгалт ажиллана (формат зөв эсэхийг шалгана). Дараа нь хянагч хүн засварыг тань үзэж, асуулт байвал PR дотор ярилцаад, нийлүүлж авна. Баярлалаа! 🎉

### Шинэ үг нэмэх

Мөн адил, гэхдээ хоёр зүйл анхаараарай:

- Файл доторх үгс **кириллээрээ цагаан толгойн дарааллаар** байх ёстой — шинэ үгээ зөв байрлалд нь оруулна (алдвал шалгагч хэлж өгнө).
- `"source"`-д `"community"` гэж бичнэ.

### Дүрэм

- Нэг PR-д нэг сэдвийн (нэг үг, эсвэл цөөн холбоотой үгсийн) засвар байвал хамгийн хурдан хянагдана.
- Монгол бичгийн хэлбэрийг **стандарт Юникодоор** (U+1800–U+18AF) бичнэ. Бусад кодчилол хэрэглэхгүй.
- Маргаантай тохиолдолд эх сурвалжтай нь ярилцъя — PR бол яриа өрнүүлэх газар.

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

### Fixing a word from the web UI — step by step

1. **Find the file.** Lexicon files are sharded by first letter: the word «уул» lives in `data/lexicon/у.json`. Personal names live in `data/names.json`.
2. **Find the word.** With the file open, press `Ctrl+F` (Mac: `Cmd+F`) and search for `"cyrillic": "уул"`.
3. **Enter edit mode.** Click the pencil icon (✏️ *Edit this file*) at the top right. If GitHub asks to create a fork, accept — that is just your personal working copy.
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
5. **Submit.** Click the green *Commit changes...* button:
   - Write a short description (e.g. “уул: add ᠠᠭᠤᠯᠠ candidate”);
   - **Cite your source** — which dictionary or textbook, or personal knowledge? This helps the reviewer a lot;
   - *Propose changes* → *Create pull request*.
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
