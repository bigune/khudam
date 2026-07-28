# Хянуулахаар хүлээгдэж буй бичлэгүүд / Entries flagged for review

Суурь өгөгдлөөс автоматаар оруулж чадаагүй, эсвэл эргэлзээтэй бичлэгүүдийг энд жагсаана. This file collects entries that need human eyes — either skipped during import or flagged as suspicious.

<!-- wmk-import:begin (auto-generated, do not edit between markers) -->

## Seed entries skipped by `scripts/import-wmk.ts`

These rows from the writtenMongolianKeyboard seed could not be imported automatically. They are listed here so humans can recover them by hand (see CONTRIBUTING.md). Машин импортоор оруулж чадаагүй мөрүүд — гараар сэргээж оруулахад тусламж хэрэгтэй.

### Not a clean Cyrillic word (74)

Dictionary markup (trailing `:`, homonym numbering, stray characters) needs stripping, and homonym rows need `sense` labels:

- `зоо:`
- `зөгөн:`
- `идээ-2`
- `идээ-3`
- `ил-2`
- `мантуулиг:`
- `нал:`
- `налай:`
- `нэс:`
- `нэхэл:`
- `овру��лах`
- `оног:`
- `онон:`
- `өвдөл:`
- `өвхөг:`
- `өвхөс:`
- `өлiii`
- `өө-i`
- `өө-ii`
- `пар:`
- `пид:`
- `пир:`
- `пор:`
- `садархай-ii`
- `садга-ii`
- `садганах-ii`
- `сажлах-i`
- `сажлах-ii`
- `сай-i`
- `сай-ii`
- `сайр-i`
- `сайр-ii`
- `сайр-iii`
- `согшин:`
- `солиг:`
- `сундуй:`
- `сүйтгүү��эх`
- `сэвэхⅰ`
- `сэвэхⅱ`
- `сэгⅰ`
- `сэгⅱ`
- `сэглэхⅰ`
- `сэглэхⅱ`
- `сэдэвⅰ`
- `сэдэвⅱ`
- `сэдэвлэхⅰ`
- `сэдэвлэхⅱ`
- `сэжигдэхⅰ`
- `сэжигдэхⅱ`
- `сэрүүнⅰ`
- `сэрүүнⅱ`
- `сэршⅰ`
- `сэршⅱ`
- `уваа:`
- `уваан:`
- `уван:`
- `удар:`
- `улцар:`
- `унаш:`
- `ундуй:`
- `унжин:`
- `унжир:`
- `уудлахii`
- `ухаа/н/`
- `хайлган:`
- `халт:`
- `хушит:`
- `хэрээ_iii`
- `цагцхайт:`
- `цал:`
- `цангис:`
- `цасч:`
- `эвлэн:`
- `эргэн:`

### Corrupt traditional field (212)

The seed's traditional column contains Latin/Cyrillic text instead of Mongolian script. The correct spelling must be supplied by a human:

- `амь` (seed had `"ami"`)
- `анх` (seed had `"anh"`)
- `арав` (seed had `"arav"`)
- `аргуу` (seed had `"arguu"`)
- `архич` (seed had `"arhich"`)
- `бид` (seed had `"bid"`)
- `бич` (seed had `"bich"`)
- `бөрөл` (seed had `"burulborj"`)
- `гинжлэх` (seed had `"ᠭᠢᠨᠵᠢᠯᠡx"`)
- `гинших` (seed had `"ᠭᠢᠩᠰᠢx"`)
- `гиншигнэх` (seed had `"ᠭᠢᠩᠰᠢᠩᠨᠡx"`)
- `гиншүүлэх` (seed had `"ᠭᠢᠩᠰᠢᠭᠦᠯᠡx"`)
- `гирэвших` (seed had `"ᠭᠢᠷᠪᠢᠰᠢx"`)
- `гичлэх` (seed had `"ᠭᠢᠴᠢᠯᠡx"`)
- `гишгүүлэх` (seed had `"ᠭᠢᠰᠬᠢᠭᠦᠯᠡx"`)
- `гишгэх` (seed had `"ᠭᠢᠰᠬᠢx"`)
- `гишгэгдэх` (seed had `"ᠭᠢᠰᠬᠢᠭᠳᠡx"`)
- `гишгэлэх` (seed had `"ᠭᠢᠰᠬᠢᠯᠡx"`)
- `гиюүрүүлэх` (seed had `"ᠭᠡᠶᠦᠷᠡᠭᠦᠯᠡx"`)
- `гиюүрэх` (seed had `"ᠭᠡᠶᠦᠷᠡx"`)
- `годхийх` (seed had `"ᠭᠣᠳxᠢᠢx"`)
- `годволзох` (seed had `"ᠭᠣᠳᠣᠪᠠᠯᠵᠠx"`)
- `годгодох` (seed had `"ᠭᠣᠳᠣᠭᠣᠳᠣx"`)
- `годгойдох` (seed had `"ᠭᠣᠳᠣᠭᠣᠶᠢᠳᠣx"`)
- `годгонох` (seed had `"ᠭᠣᠳᠣᠭᠣᠨᠠx"`)
- `годгонуулах` (seed had `"ᠭᠣᠳᠣᠭᠣᠨᠠᠭᠤᠯx"`)
- `годгосхийх` (seed had `"ᠭᠣᠳᠣᠭᠣᠰxᠢᠢx"`)
- `годилдох` (seed had `"ᠭᠣᠳᠣᠯᠢᠳᠠx"`)
- `годойх` (seed had `"ᠭᠣᠳᠣᠢx"`)
- `годойлгох` (seed had `"ᠭᠣᠳᠣᠶᠢᠯᠭ᠎᠊ᠠx"`)
- `годолзох` (seed had `"ᠭᠣᠳᠣᠯᠵᠠx"`)
- `годонтох` (seed had `"ᠭᠣᠳᠣᠩᠲᠠx"`)
- `годройтох` (seed had `"ᠭᠣᠳᠣᠷᠣᠶᠢᠲᠤx"`)
- `годройтуулах` (seed had `"ᠭᠣᠳᠣᠷᠣᠶᠢᠲᠠᠭᠤᠯx"`)
- `годронтох` (seed had `"ᠭᠣᠳᠣᠷᠣᠩᠲᠤx"`)
- `годронтуулах` (seed had `"ᠭᠣᠳᠣᠷᠣᠩᠲᠤᠭᠤᠯx"`)
- `гоёдох` (seed had `"ᠭᠣᠶᠣᠳᠠx"`)
- `гоёлхийлэх` (seed had `"ᠭᠣᠶᠣᠯxᠢᠢᠯx"`)
- `гоёмсоглох` (seed had `"ᠭᠣᠶᠣᠮᠰᠣᠭᠯᠠx"`)
- `гоёмсогмолох` (seed had `"ᠭᠣᠶᠣᠮᠰᠣᠭᠮᠣᠯᠣx"`)
- `гөлтрөг` (seed had `"gultrugbusreg"`)
- `гүег` (seed had `"басар"`)
- `гүем` (seed had `"guyemguyen"`)
- `долоо` (seed had `"doloo"`)
- `долрох` (seed had `"ᠳᠣᠯᠣᠷᠠx"`)
- `долшрох` (seed had `"ᠳᠣᠯᠣᠰᠢᠷᠣx"`)
- `домнох` (seed had `"ᠳᠣᠮᠨᠣx"`)
- `домнуулах` (seed had `"ᠳᠣᠮᠨᠣᠭᠤᠯᠠx"`)
- `домоглох` (seed had `"ᠳᠣᠮᠣᠭᠯᠠx"`)
- `домтох` (seed had `"ᠳᠣᠮᠲᠣx"`)
- `домчлох` (seed had `"ᠳᠣᠮᠴᠢᠯᠠx"`)
- `донгиохон` (seed had `"ᠳᠣᠩᠭᠢᠶ᠎᠊ᠠxᠣᠨ"`)
- `донгиодох` (seed had `"ᠳᠣᠩᠭᠢᠶᠠᠳᠠx"`)
- `донгиорох` (seed had `"ᠳᠣᠩᠭᠢᠶᠠᠷᠠx"`)
- `донгиотох` (seed had `"ᠳᠣᠩᠭᠢᠶᠠᠲᠠx"`)
- `донгодох` (seed had `"ᠳᠣᠩᠭᠣᠳx"`)
- `донгодуулах` (seed had `"ᠳᠣᠩᠭᠣᠳᠤᠭᠤᠯx"`)
- `донгосох` (seed had `"ᠳᠣᠩᠭᠣᠰx"`)
- `донгосуулах` (seed had `"ᠳᠣᠩᠭᠣᠰᠤᠭᠤᠯx"`)
- `доноголзох` (seed had `"ᠳᠣᠨᠣᠭᠣᠯᠵᠠx"`)
- `доош` (seed had `"doosh"`)
- `доргио` (seed had `"dorgio"`)
- `дөнж` (seed had `"dunj"`)
- `дөнө` (seed had `"dunu"`)
- `дөрөв` (seed had `"duruv"`)
- `дөч` (seed had `"duch"`)
- `дугаруулах` (seed had `"ᠳᠤᠤᠭᠠᠷᠠᠭ��ᠯᠬᠤ"`)
- `дүдэр` (seed had `"duderdudrai"`)
- `жанч` (seed had `"janch"`)
- `жүжигч` (seed had `"jujigch"`)
- `загасч` (seed had `"zagasch"`)
- `замч` (seed had `"zamch"`)
- `зандалч` (seed had `"zandalch"`)
- `зогой` (seed had `"zogoihuvilgana"`)
- `илч` (seed had `"ilch"`)
- `лавших` (seed had `"ᠯᠠᠪᠰᠢx"`)
- `лавшрах` (seed had `"ᠯᠠᠪᠰᠢᠷᠠx"`)
- `лавшруулах` (seed had `"ᠯᠠᠪᠰᠢᠷᠠᠭᠤᠯx"`)
- `манх` (seed had `"manh"`)
- `мах` (seed had `"mah"`)
- `машин` (seed had `"mashin"`)
- `мойл` (seed had `"moil"`)
- `монио` (seed had `"moniomonish"`)
- `мөлүү` (seed had `"muluu"`)
- `мянга` (seed had `"myanga"`)
- `мяндас` (seed had `"myandas"`)
- `найм` (seed had `"naim"`)
- `наймаач` (seed had `"naimaach"`)
- `найрч` (seed had `"nairch"`)
- `ноос` (seed had `"noos"`)
- `нүүрс` (seed had `"nuurs"`)
- `нүүрсч` (seed had `"nuursch"`)
- `нэхмэлч` (seed had `"nehmelch"`)
- `онги` (seed had `"ongi"`)
- `орд` (seed had `"ord"`)
- `панс` (seed had `"pans"`)
- `сахлархуу` (seed had `"ᠰᠠᠬᠠ��ᠠᠷᠬᠠᠤ"`)
- `тавиу` (seed had `"taviu"`)
- `тавиул` (seed had `"taviul"`)
- `тавуул` (seed had `"tavuul"`)
- `тайвшруулах` (seed had `"ᠲᠠᠶᠢᠪᠤᠰ��ᠷᠠᠭᠤᠯᠬᠤ"`)
- `тамхи` (seed had `"tamhi"`)
- `тарвага` (seed had `"tarvaga"`)
- `тариа` (seed had `"taria"`)
- `ташаа` (seed had `"tashaa"`)
- `тоох` (seed had `"ᠲᠣᠭ᠎᠊ᠠx"`)
- `тоохгүй` (seed had `"ᠲᠣᠭ᠎᠊ᠠxᠭᠦᠢ"`)
- `тооройлох` (seed had `"ᠲᠣᠭᠤᠷᠤᠶᠢᠯᠠx"`)
- `тоосгорох` (seed had `"ᠲᠣᠭᠣᠰᠣᠭᠣᠷᠣx"`)
- `тоослох` (seed had `"ᠲᠣᠭᠣᠰᠣᠯᠠx"`)
- `тоослуулах` (seed had `"ᠲᠣᠭᠣᠰᠣᠯᠠᠭᠤᠯx"`)
- `тоосорхог` (seed had `"ᠲᠣᠭᠣᠰᠣᠷᠠxᠣᠭ"`)
- `тоосорхуу` (seed had `"ᠲᠣᠭᠣᠰᠣᠷᠠxᠤᠤ"`)
- `тоосрох` (seed had `"ᠲᠣᠭᠣᠰᠣᠷᠠx"`)
- `тоосруулах` (seed had `"ᠲᠣᠭᠣᠰᠣᠷᠠᠭᠤᠯx"`)
- `тооцох` (seed had `"ᠲᠣᠭᠠᠴᠠx"`)
- `тооцогдох` (seed had `"ᠲᠣᠭᠠᠴᠠᠭᠳᠠx"`)
- `тооцоолох` (seed had `"ᠲᠣᠭᠠᠴᠠᠭᠠᠯᠠx"`)
- `тооцуулах` (seed had `"ᠲᠣᠭᠠᠴᠠᠭᠤᠯx"`)
- `тоочих` (seed had `"ᠲᠣᠭᠠᠴᠢx"`)
- `тоочигдох` (seed had `"ᠲᠣᠭᠠᠴᠢᠭᠳᠠx"`)
- `тоочуулах` (seed had `"ᠲᠣᠭᠠᠴᠢᠭᠤᠯx"`)
- `түм` (seed had `"tum"`)
- `тэмээ` (seed had `"temee"`)
- `тэмээч` (seed had `"temeech"`)
- `тэрхүү` (seed had `"��ᠡᠷᠬᠡᠦ"`)
- `үнэг` (seed had `"uneg"`)
- `үргээлэг` (seed had `"urgeeleg"`)
- `үрээ` (seed had `"uree"`)
- `үүлгэрдүү` (seed had `"ᠡᠭᠦᠯᠭᠡᠷᠳ���ᠭᠦᠦ"`)
- `халуухан` (seed had `"ᠬᠠᠯᠠᠭ��ᠬᠠᠨ"`)
- `харьцаа` (seed had `"haritsaa"`)
- `харьяа` (seed had `"hariyaa"`)
- `хогч` (seed had `"hogch"`)
- `хоёул` (seed had `"hoyoul"`)
- `холбооч` (seed had `"holbooch"`)
- `хөгжимч` (seed had `"hugjimch"`)
- `хувгай` (seed had `"huvgaihorildoi"`)
- `хутга` (seed had `"hutga"`)
- `хүүшлэх` (seed had `"ᠬᠡᠦ��ᠢᠯᠡᠬᠦ"`)
- `хэд` (seed had `"hed"`)
- `хятруу` (seed had `"���ᠢᠲᠠᠷᠤᠤ"`)
- `цаас` (seed had `"tsaas"`)
- `цавуу` (seed had `"tsavuu"`)
- `цавчдас` (seed had `"tsavchdas"`)
- `цавь` (seed had `"tsavi"`)
- `цамч` (seed had `"tsamch"`)
- `цанач` (seed had `"tsanach"`)
- `цонх` (seed had `"tsonh"`)
- `цоолго` (seed had `"tsoolgo"`)
- `цуваа` (seed had `"tsuvaa"`)
- `чийрс` (seed had `"chiirs"`)
- `шовшуур` (seed had `"shovshuurshovshooron"`)
- `шөрвөс` (seed had `"shurvus"`)
- `шувууч` (seed had `"shuvuuch"`)
- `шулдас` (seed had `"shuldas"`)
- `элхэг` (seed had `"ᠡᠯ᠎᠊ᠡxᠡᠭᠡ"`)
- `элхэгдүүлэх` (seed had `"ᠡᠯ᠎᠊ᠡxᠡᠭᠳᠡᠭᠦᠯᠡx"`)
- `элхэгдэх` (seed had `"ᠡᠯ᠎᠊ᠡxᠡᠩᠳᠡx"`)
- `элдүүрч` (seed had `"elduurch"`)
- `элмэгдэх` (seed had `"ᠡᠯᠡᠮᠡᠭᠳᠡx"`)
- `элмэгрэх` (seed had `"ᠡᠯᠡᠮᠡᠭᠷᠡx"`)
- `элмэгших` (seed had `"ᠡᠯᠡᠮᠡᠭᠰᠢx"`)
- `элмэрэх` (seed had `"ᠡᠯᠮᠡᠷᠡx"`)
- `элсдэх` (seed had `"ᠡᠯᠰᠡᠳᠡx"`)
- `элслэх` (seed had `"ᠡᠯᠡᠰᠦᠯᠡx"`)
- `элсрэх` (seed had `"ᠡᠯᠡᠰᠦᠷᠡx"`)
- `элсүүлэх` (seed had `"ᠡᠯᠰᠡᠭᠦᠯᠡx"`)
- `элсүүлэгдэх` (seed had `"ᠡᠯᠰᠡᠭᠦᠯᠢᠭᠳᠡx"`)
- `элсэх` (seed had `"ᠡᠯᠰᠡx"`)
- `элсэгдэх` (seed had `"ᠡᠯᠰᠡᠭᠳᠡx"`)
- `элсэглэх` (seed had `"ᠡᠯᠰᠡᠭᠯᠡx"`)
- `элсэрхүү` (seed had `"ᠡᠯᠡᠰᠦᠷᠡxᠦᠦ"`)
- `элсэрхэг` (seed had `"ᠡᠯᠡᠰᠦᠷᠡxᠡᠭᠡ"`)
- `элтлүүлэх` (seed had `"ᠡᠯᠲᠡᠯᠦᠭᠦᠯᠡx"`)
- `элтлэх` (seed had `"ᠡᠯᠲᠡᠯᠡx"`)
- `элтрүүлэх` (seed had `"ᠡᠯᠲᠦᠷᠢᠭᠦᠯᠡx"`)
- `элтрэх` (seed had `"ᠡᠯᠲᠡᠷᠭᠡx"`)
- `элтэрхий` (seed had `"ᠡᠯᠲᠡᠷᠡxᠢᠢ"`)
- `элүүлэх` (seed had `"ᠡᠯᠢᠭᠦᠯᠡx"`)
- `элэх` (seed had `"ᠡᠯᠡx"`)
- `элэгдэх` (seed had `"ᠡᠯᠢᠭᠡᠳᠡx"`)
- `элэглүүлэх` (seed had `"ᠡᠯᠡᠭᠯᠡᠭᠦᠯᠡx"`)
- `элэглэх` (seed had `"ᠡᠯᠡᠭᠯᠡx"`)
- `элэглэгдэх` (seed had `"ᠡᠯᠡᠭᠯᠡᠭᠳᠡx"`)
- `элэгрэх` (seed had `"ᠡᠯᠢᠭᠡᠷ᠎᠊ᠡx"`)
- `элэгсэх` (seed had `"ᠡᠯᠢᠭᠡᠰᠡx"`)
- `элэгшээх` (seed had `"ᠡᠯᠢᠭᠡᠰᠢᠶᠡx"`)
- `элэгшээлгэх` (seed had `"ᠡᠯᠢᠭᠡᠰᠢᠶᠡᠯᠭᠡx"`)
- `элэнхий` (seed had `"ᠡᠯᠢᠨxᠢᠢ"`)
- `элэнхийтэх` (seed had `"ᠡᠯᠢᠨxᠢᠭᠢᠲᠡx"`)
- `элээх` (seed had `"ᠡᠯᠢᠭᠡx"`)
- `эмбэрэх` (seed had `"ᠡᠮᠪᠡᠷᠢx"`)
- `эмгэглүүлэх` (seed had `"ᠡᠮᠭᠡᠭᠯᠡᠭᠦᠯᠡx"`)
- `эмгэглэх` (seed had `"ᠡᠮᠭᠡᠭᠯᠡx"`)
- `эмгэгрэх` (seed had `"ᠡᠮᠭᠡᠭᠷᠡx"`)
- `эмгэнэх` (seed had `"ᠡᠮᠭᠡᠨᠢx"`)
- `эмжих` (seed had `"ᠡᠮᠵᠢx"`)
- `эмжүүлэх` (seed had `"ᠡᠮᠵᠢᠭᠦᠯᠡx"`)
- `эмжээрлүүлэх` (seed had `"ᠡᠮᠵᠢᠶᠡᠷᠯᠡᠭᠦᠯᠡx"`)
- `эмжээрлэх` (seed had `"ᠡᠮᠵᠢᠶᠡᠷᠢᠯᠡx"`)
- `эмзэглүүлэх` (seed had `"ᠡᠮᠵᠡᠭᠯᠡᠭᠦᠯᠡx"`)
- `эмзэглэх` (seed had `"ᠡᠮᠵᠡᠭᠯᠡx"`)
- `эмлэх` (seed had `"ᠡᠮᠡᠯᠡx"`)
- `эмнүүлэх` (seed had `"ᠡᠮᠨᠡᠭᠦᠯᠡx"`)
- `энэхэн` (seed had `"ᠡ���ᠡᠬᠡᠨ"`)
- `ялаа` (seed had `"yalaa"`)
- `ялман` (seed had `"yalmanchoiron"`)
- `ямаа` (seed had `"yamaa"`)
- `янгадай` (seed had `"yangadaiyanguudai"`)
- `янзагалах` (seed had `"ᠢᠨᠵ��ᠭᠠᠯᠠᠬᠤ"`)
- `нийслэлийн` (seed had `"您输入的文本过多！"`)

<!-- wmk-import:end -->

## Systematic correction: ᠶᠢ (U+1836 U+1822) → ᠢ (U+1822)

**Correction applied** via [`scripts/fix-yi-digraph.ts`](../scripts/fix-yi-digraph.ts): medial ᠶᠢ → ᠢ (drop the spurious ᠶ) in the **2,780** entries whose Cyrillic key contains й. Full rationale and citations: [ENCODING.md, Decision 001](ENCODING.md). These remain `verified: false` — a machine correction is not human verification, so they still need review before anyone sets `verified: true`.

Word-initial ᠶᠢ (a legitimate е/ё/ю/я glide, e.g. `ес` → ᠶᠢᠰᠦ) and entries with no й were deliberately **excluded** from the automatic fix and are listed below for a human to decide. Rerun the script with `--include-no-short-i` only after reviewing them.

### Excluded from the automatic fix — need human review (63)

#### Word-initial ᠶᠢ — probably a real е/ё glide, likely KEEP (11)

- `ертөнц` (_yertunts_) — `ᠶᠢᠷᠲᠢᠨᠴᠦ` → would be `ᠢᠷᠲᠢᠨᠴᠦ`
- `ес` (_yes_) — `ᠶᠢᠰᠦ` → would be `ᠢᠰᠦ`
- `есдүгээр` (_yesdugeer_) — `ᠶᠢᠰᠦᠳᠦᠭᠡᠷ` → would be `ᠢᠰᠦᠳᠦᠭᠡᠷ`
- `еслөх` (_yesluh_) — `ᠶᠢᠰᠦᠯᠬᠦ` → would be `ᠢᠰᠦᠯᠬᠦ`
- `есүүл` (_yesuul_) — `ᠶᠢᠰᠦᠭᠦᠯᠡ` → would be `ᠢᠰᠦᠭᠦᠯᠡ`
- `есөгчин` (_yesugchin_) — `ᠶᠢᠰᠦᠭᠴᠢᠨ` → would be `ᠢᠰᠦᠭᠴᠢᠨ`
- `есөн` (_yesun_) — `ᠶᠢᠰᠦᠨ` → would be `ᠢᠰᠦᠨ`
- `есөөд` (_yesuud_) — `ᠶᠢᠰᠦᠭᠡᠳ` → would be `ᠢᠰᠦᠭᠡᠳ`
- `илбэдэгдэх` (_ilbedegdeh_) — `ᠶᠢᠯᠸᠢᠳᠡᠭᠳᠡᠬᠦ` → would be `ᠢᠯᠸᠢᠳᠡᠭᠳᠡᠬᠦ`
- `илбэдэх` (_ilbedeh_) — `ᠶᠢᠯᠸᠢᠳᠡᠬᠦ` → would be `ᠢᠯᠸᠢᠳᠡᠬᠦ`
- `ин` (_in_) — `ᠶᠢᠨ` → would be `ᠢᠨ`

#### Other (loanword artifacts / ии words) — decide case by case (52)

- `аккумулятор` (_akkumulyator_) — `ᠠᠺᠺᠦᠢᠮᠦᠦᠶᠢᠶᠠᠲ᠋ᠣᠷ` → would be `ᠠᠺᠺᠦᠢᠮᠦᠦᠢᠶᠠᠲ᠋ᠣᠷ`
- `амбулатори` (_ambulatori_) — `ᠠᠮᠪᠤᠶᠢᠯᠠᠲ᠋ᠣᠷᠢ` → would be `ᠠᠮᠪᠤᠢᠯᠠᠲ᠋ᠣᠷᠢ`
- `ангаалдах` (_angaaldah_) — `ᠠᠩᠭᠠᠶᠢᠯᠳᠤᠬᠤ` → would be `ᠠᠩᠭᠠᠢᠯᠳᠤᠬᠤ`
- `аэробик` (_aerobik_) — `ᠠᠶᠢᠷᠣᠪᠢᠺ` → would be `ᠠᠢᠷᠣᠪᠢᠺ`
- `баярмөнх` (_bayarmunh_) — `ᠪᠠᠶᠠᠷᠮᠥᠶᠢᠩᠬᠡ` → would be `ᠪᠠᠶᠠᠷᠮᠥᠢᠩᠬᠡ`
- `буддизм` (_buddizm_) — `ᠪᠤᠳ᠋ᠳ᠋ᠾᠠᠶᠢᠰᠮ` → would be `ᠪᠤᠳ᠋ᠳ᠋ᠾᠠᠢᠰᠮ`
- `гаалилах` (_gaalilah_) — `ᠭᠠᠶᠢᠯᠢᠯᠠᠬᠤ` → would be `ᠭᠠᠢᠯᠢᠯᠠᠬᠤ`
- `гааль` (_gaali_) — `ᠭᠠᠶᠢᠯᠢ` → would be `ᠭᠠᠢᠯᠢ`
- `градус` (_gradus_) — `ᠭᠷᠠᠳᠦᠶᠢᠰ` → would be `ᠭᠷᠠᠳᠦᠢᠰ`
- `даяан` (_dayan_) — `ᠳᠠᠶᠢᠨ` → would be `ᠳᠠᠢᠨ`
- `даяг` (_dayag_) — `ᠳᠠᠶᠢᠭ` → would be `ᠳᠠᠢᠭ`
- `даян` (_dayan_) — `ᠳᠠᠶᠢᠨ` → would be `ᠳᠠᠢᠨ`
- `диктатур` (_diktatur_) — `ᠳ᠋ᠢᠺᠲ᠋ᠠᠲ᠋ᠦᠶᠢᠷ` → would be `ᠳ᠋ᠢᠺᠲ᠋ᠠᠲ᠋ᠦᠢᠷ`
- `индонез` (_indonyez_) — `ᠢᠨᠳᠥᠶᠢᠨᠧᠽ` → would be `ᠢᠨᠳᠥᠢᠨᠧᠽ`
- `институт` (_institut_) — `ᠢᠨᠰᠲ᠋ᠢᠲ᠋ᠦᠶᠢᠲ` → would be `ᠢᠨᠰᠲ᠋ᠢᠲ᠋ᠦᠢᠲ`
- `интурист` (_inturist_) — `ᠢᠨᠲᠤᠶᠢᠷᠢᠰᠲ` → would be `ᠢᠨᠲᠤᠢᠷᠢᠰᠲ`
- `каракуль` (_karakuli_) — `ᠺᠠᠷᠠᠺᠦᠶᠢᠯᠢ` → would be `ᠺᠠᠷᠠᠺᠦᠢᠯᠢ`
- `карбюратор` (_karbyurator_) — `ᠺᠠᠷᠪᠶᠤᠶᠢᠷᠠᠲ᠋ᠣᠷ` → would be `ᠺᠠᠷᠪᠶᠤᠢᠷᠠᠲ᠋ᠣᠷ`
- `карбюрац` (_karbyurats_) — `ᠺᠠᠷᠪᠶᠤᠶᠢᠷᠠᠼ` → would be `ᠺᠠᠷᠪᠶᠤᠢᠷᠠᠼ`
- `каучук` (_kauchuk_) — `ᠺᠠᠤᠢᠴᠤᠤᠶᠢ` → would be `ᠺᠠᠤᠢᠴᠤᠤᠢ`
- `клуб` (_klub_) — `ᠺᠯᠤᠶᠢᠪ` → would be `ᠺᠯᠤᠢᠪ`
- `коллоид` (_kolloid_) — `ᠺᠣᠯᠯᠣᠶᠢᠳ᠋` → would be `ᠺᠣᠯᠯᠣᠢᠳ᠋`
- `коммун` (_kommun_) — `ᠺᠣᠮᠮᠤᠶᠢᠨ` → would be `ᠺᠣᠮᠮᠤᠢᠨ`
- `коммунизм` (_kommunizm_) — `ᠺᠣᠮᠮᠤᠶᠢᠨᠢᠰᠮ` → would be `ᠺᠣᠮᠮᠤᠢᠨᠢᠰᠮ`
- `коммутатор` (_kommutator_) — `ᠺᠣᠮᠮᠤᠶᠢᠲ᠋ᠠᠲ᠋ᠣᠷ` → would be `ᠺᠣᠮᠮᠤᠢᠲ᠋ᠠᠲ᠋ᠣᠷ`
- `кондуктор` (_konduktor_) — `ᠺᠣᠨᠳᠤᠶᠢᠺᠲ᠋ᠣᠷ` → would be `ᠺᠣᠨᠳᠤᠢᠺᠲ᠋ᠣᠷ`
- `конструкторч` (_konstruktorch_) — `ᠺᠣᠨᠰᠲ᠋ᠷᠤᠶᠢᠺᠲ᠋ᠣᠷᠴᠢ` → would be `ᠺᠣᠨᠰᠲ᠋ᠷᠤᠢᠺᠲ᠋ᠣᠷᠴᠢ`
- `консул` (_konsul_) — `ᠺᠣᠨᠰᠤᠶᠢᠯ` → would be `ᠺᠣᠨᠰᠤᠢᠯ`
- `консультац` (_konsulitats_) — `ᠺᠣᠨᠰᠤᠶᠢᠯᠢᠲ᠋ᠠᠼ` → would be `ᠺᠣᠨᠰᠤᠢᠯᠢᠲ᠋ᠠᠼ`
- `корпус` (_korpus_) — `ᠺᠣᠷᠫᠤᠶᠢᠰ` → would be `ᠺᠣᠷᠫᠤᠢᠰ`
- `костюм` (_kostyum_) — `ᠺᠣᠰᠲ᠋ᠶᠤᠶᠢᠮ` → would be `ᠺᠣᠰᠲ᠋ᠶᠤᠢᠮ`
- `люстра` (_lyustra_) — `ᠯᠶᠤᠶᠢᠰᠲ᠋ᠷᠠ` → would be `ᠯᠶᠤᠢᠰᠲ᠋ᠷᠠ`
- `натурализм` (_naturalizm_) — `ᠨᠠᠲ᠋ᠦᠶᠢᠷᠠᠯᠢᠰᠮ` → would be `ᠨᠠᠲ᠋ᠦᠢᠷᠠᠯᠢᠰᠮ`
- `оппортунизм` (_opportunizm_) — `ᠣᠫᠫᠣᠷᠲ᠋ᠤᠶᠢᠨᠢᠰᠮ` → would be `ᠣᠫᠫᠣᠷᠲ᠋ᠤᠢᠨᠢᠰᠮ`
- `оппортунист` (_opportunist_) — `ᠣᠫᠫᠣᠷᠲ᠋ᠤᠶᠢᠨᠢᠰᠲ` → would be `ᠣᠫᠫᠣᠷᠲ᠋ᠤᠢᠨᠢᠰᠲ`
- `оупх` (_ouph_) — `ᠣᠦᠶᠢᠬ` → would be `ᠣᠦᠢᠬ`
- `парашют` (_parashyut_) — `ᠫᠠᠷᠠᠱᠶᠤᠶᠢᠲ` → would be `ᠫᠠᠷᠠᠱᠶᠤᠢᠲ`
- `перпендикуляр` (_pyerpyendikulyar_) — `ᠫᠧᠷᠫᠡᠨᠳᠢᠺᠦᠶᠢᠯᠢᠶᠠᠷ` → would be `ᠫᠧᠷᠫᠡᠨᠳᠢᠺᠦᠢᠯᠢᠶᠠᠷ`
- `прокурор` (_prokuror_) — `ᠫᠷᠣᠺᠤᠶᠢᠷᠣᠷ` → would be `ᠫᠷᠣᠺᠤᠢᠷᠣᠷ`
- `пропуск` (_propusk_) — `ᠫᠷᠣᠫᠤᠶᠢᠰᠺ` → would be `ᠫᠷᠣᠫᠤᠢᠰᠺ`
- `секунд` (_syekund_) — `ᠰᠧᠺᠦᠶᠢᠨᠳ᠋` → would be `ᠰᠧᠺᠦᠢᠨᠳ᠋`
- `секюритиз` (_syekyuritiz_) — `ᠰᠧᠺᠦᠶᠤᠶᠢᠷᠢᠲ᠋ᠢᠰ` → would be `ᠰᠧᠺᠦᠶᠤᠢᠷᠢᠲ᠋ᠢᠰ`
- `сэвсиилгэх` (_sevsiilgeh_) — `ᠰᠡᠪᠰᠡᠶᠢᠯᠭᠡᠬᠦ` → would be `ᠰᠡᠪᠰᠡᠢᠯᠭᠡᠬᠦ`
- `украин` (_ukrain_) — `ᠦᠺᠷᠠᠶᠢᠨ` → would be `ᠦᠺᠷᠠᠢᠨ`
- `устөрөгч` (_usturugch_) — `ᠤᠰᠤᠲᠥᠶᠢᠷᠦᠭᠴᠢ` → would be `ᠤᠰᠤᠲᠥᠢᠷᠦᠭᠴᠢ`
- `фактур` (_faktur_) — `ᠹᠠᠺᠲ᠋ᠦᠶᠢᠷ` → would be `ᠹᠠᠺᠲ᠋ᠦᠢᠷ`
- `факультет` (_fakulityet_) — `ᠹᠠᠺᠦᠶᠢᠯᠢᠲ᠋ᠧᠲ` → would be `ᠹᠠᠺᠦᠢᠯᠢᠲ᠋ᠧᠲ`
- `хатиар` (_hatiar_) — `ᠬᠠᠲᠠᠶᠢᠷ` → would be `ᠬᠠᠲᠠᠢᠷ`
- `хонхоилгох` (_honhoilgoh_) — `ᠬᠣᠩᠬᠣᠶᠢᠯᠭᠠᠬᠤ` → would be `ᠬᠣᠩᠬᠣᠢᠯᠭᠠᠬᠤ`
- `хэриглэх` (_herigleh_) — `ᠬᠡᠷᠡᠶᠢᠭᠯᠡᠬᠦ` → would be `ᠬᠡᠷᠡᠢᠭᠯᠡᠬᠦ`
- `шүүгээлэх` (_shuugeeleh_) — `ᠱᠦᠬᠦᠶᠢᠯᠡᠬᠦ` → would be `ᠱᠦᠬᠦᠢᠯᠡᠬᠦ`
- `эрээвэр` (_ereever_) — `ᠡᠶᠢᠶᠡᠪᠦᠷᠢ` → would be `ᠡᠢᠶᠡᠪᠦᠷᠢ`

## Suffix table needs human verification (86 rows, high priority)

Every row of [`suffixes.json`](suffixes.json) is `verified: false`, and none of the
three tiers is human-checked: 56 rows transcribed into Unicode by AI from the rule
tables in Nadmid 1990 (see [GRAMMAR.md](GRAMMAR.md) § Sources), 28 machine-imported
from Wiktionary, and 2 added by hand from Wiktionary evidence for G14/G15 — the
last of these have their own questions below. Худам бичгийн нөхцөлүүдийн Юникод
зурлагыг хүн нягтлаагүй байгаа — жижиг, хаалттай олонлог тул нэг дор хянаж
баталгаажуулахад хялбар. This is the highest-leverage review in the repo: a closed
set of 86 rows that the converter attaches to thousands of words.

### Nadmid sweep, 2026-07-28 — G3–G13 checked against the digital edition

Now that the rulebook's Cyrillic text extracts, every rule row was compared with what
Nadmid actually says. **Only his Cyrillic rule statements and romanizations are used**
— his монгол бичиг is a PUA font, so no traditional spelling below is verified, and
the sweep can confirm a rule's *conditions* but never its code points.

**Confirmed, no action:** G3 genitive (-ун/-үн, -у/-ү, -йин), G4 accusative (-и, -йи),
G6 ablative (-ача/-эчэ after anything), G7 instrumental (-бар/-бэр after vowel and й,
-ийар/-ийэр after other consonants), G8 comitative (-тай/-тэй after anything, -луга/
-лүгэ the alternative he says was preferred for the "together with" sense), G10
reflexive-possessive (-бан/-бэн after vowel and й, -ийан/-ийэн otherwise), and the
two main plurals. His plurals are explicitly **тусгай бичнэ**, which is our NNBSP
treatment (G1).

**Three disagreements, all needing a human:**

1. **G5 dative-locative — our form matches neither of his.** Nadmid p. 15 gives
   **-тур/-түр** (after hard дэвсгэр) and **-дур/-дүр** (after vowel and soft
   дэвсгэр), with the note that *"ярианы хэлний дагуу «–т, -д» гэж бичиж болдог"* —
   they may be written short, as -т/-д, following speech. Our rows are `ᠲᠤ`/`ᠲᠦ`
   (*tu/tü*) and `ᠳᠤ`/`ᠳᠦ` (*du/dü*): neither his long form nor his short one. They
   are cited to "Nadmid 1990 pp. 15-16", so either the citation or the rows are
   wrong. His hard-дэвсгэр list (б, г, эг, р, с, д) does match ours.

2. **G5 — a whole dative variant is missing.** *"Дээрхээс гадна өгөх оршихын тийн
   ялгалын «–а, -э» нөхцөл байдаг"*, used after words ending in **н** and **р**:
   танаа (танд), модноо (модонд), газраа (газарт), өдрөө (өдөрт). No such row exists.

3. **G9 — the -д plural is missing, and it is written joined.** *"нэр үгэнд **залгаж**
   бичих бөгөөд харин «-н, -й, -р, -л» гийгүүлэгчийг хасч залгамуй"* — attached to the
   noun, deleting a stem-final н/й/р/л: сурагчид, морьд, эзэд, ноход, нөхөд, түшмэд.
   He contrasts this explicitly with the тусгай plurals. The engine cannot express a
   joined suffix at all (the `joined` field was added and then removed with the
   privative alternation), so adding this means bringing that capability back.

**One flag downgraded:** the `-чууд`/`-чүүд` row below was suspected of being misread
from a low-resolution scan. The Cyrillic side is confirmed — Nadmid gives it for
human-related nouns, with эхчүүд, эмэгтэйчүүд, залуучууд, монголчууд, багачууд. Only
its traditional spelling remains unverified, like every other row.

**G14 corroborated from a second direction:** Nadmid has a **§ Үгүйсгэх сул үг**,
classing the negators as **сул үг** — the same category *Монгол бичгийн гарын авлага-I*
puts үгүй in. Its forms are PUA-only, so no code points, but two independent sources
now agree on the category, which is what decides written-apart.

Least certain rows, in order:

- `-чууд`/`-чүүд` → `ᠴᠤᠳ`/`ᠴᠦᠳ` (collective plural) — read from a low-resolution scan
  of Nadmid p. 15; the vowel length in the traditional form needs checking.
- `-ы`/`-ий` → `ᠤ`/`ᠦ` (genitive) — Nadmid p. 15 restricts these to н-final stems, but
  the engine can only express "consonant-final" so far; confirm the approximation
  does not misfire.
- The comitative `ᠯᠤᠭ᠎ᠠ`/`ᠯᠦᠭᠡ` (-луга/-лүгэ) was deliberately left OUT — its MVS
  spelling needs a code-point ruling in [ENCODING.md](ENCODING.md) before it can
  be added.

### Two rows sourced from Wiktionary, not Nadmid — both need a ruling

Added for GRAMMAR.md G14 and G15. Their traditional forms are cited from English
Wiktionary and corroborated inside this repo, but each carries one open question
that a dictionary entry cannot answer and a rule table could. Эдгээр хоёр мөрийг
хүн нягтлах шаардлагатай.

- **`-гүй` (privative) — the apart/joined split is settled; two words are not.**
  What looked like the lexicon and the rule contradicting each other turned out to
  be a conditioned alternation, now implemented as GRAMMAR.md G14: **ᠦᠭᠡᠢ written
  apart after a consonant-final traditional stem, ᠭᠦᠢ written joined after a
  vowel-final one.** A maintainer checked two online converters (2026-07-28) and
  both agreed — ааггүй apart, аальгүй joined — and the split matches 11 of the 13
  seed words whose stem we can find. The engine's аальгүй now equals the seed's own
  spelling code point for code point.

  Two seed words still join ᠭᠦᠢ to a **consonant**-final stem, and want a ruling:

  | Word | Seed spelling | Stem | Ends in |
  | --- | --- | --- | --- |
  | хичээнгүй | `ᠬᠢᠴᠢᠶᠡᠩᠭᠦᠢ` | ᠬᠢᠴᠢᠶᠡᠨ | ᠨ (consonant) |
  | төсөргүй | `ᠲᠥᠰᠥᠷᠭᠦᠢ` | ᠲᠥᠰᠥᠷ | ᠷ (consonant) |

  Both read as **lexicalized adjectives** rather than productive privatives —
  хичээнгүй is "diligent", not "without хичээн" — and хичээнгүй assimilates ᠨ → ᠩ
  before the ᠭ, which a written-apart unit could not cause. If that is right they
  are simply lexicon entries and G14 needs no change. Хүн уншиж баталгаажуулна уу.

  Also open: **гайгүй → `ᠭᠠᠢᠭᠤᠢ`** is the only masculine ᠭᠤᠢ against 28 invariant
  ᠭᠦᠢ (used after masculine stems 11 times and feminine 17). ᠭᠦᠢ is stored
  invariant on the grounds that a contraction of the invariant word *ügei* should
  be; if ᠭᠤᠢ is real, G14 needs a harmony pair and гайгүй is its evidence.

  **Now backed by a published rule, so this half is no longer open.** *Монгол
  бичгийн гарын авлага-I* (nccd.gov.mn), х. 31 lists үгүй among the **сул үг** —
  free words, explicitly separated from дагавар/нөхцөл — and says it follows the
  preceding word *"өмнөх үгийн эр, эм эгшгийг үл харгалзан"*. That settles both
  written-apart and no-harmony-pair, and groups it with the directive руу.

  Checked and unhelpful: **toli.gov.mn** covers Cyrillic orthography only and says
  so; **Nadmid 1990** is 45 pages of scan images with no text layer — sampled, no
  privative section found, though absence here is not evidence of absence.

  *Sources:* the handbook above; en.wiktionary `-гүй` ("aphaeresed from үгүй"),
  `үгүй` → ᠦᠭᠡᠢ (*ügei*); the wmk seed independently gives үгүй → ᠦᠭᠡᠢ as a
  standalone word; mongoltoli.mn via maintainer for the apart-after-vowel-stem
  check that killed the alternation.
- **`-х` → `ᠬᠢ` (substantive genitive).** Does ᠬᠢ have a harmony pair, i.e. a
  separate feminine form? It is stored as one invariant row because that is what
  the source shows, but the source is a dictionary entry, not a rule table, and
  every other suffix in G2's system has two variants.
  *Sources:* en.wiktionary `-х` etymology 3 ("converts a genitive to a substantive
  genitive"), Mongolian script ᠬᠢ; lexicon **манайх** → `ᠮᠠᠨ ᠤ ᠬᠢ` (Wiktionary tier),
  NNBSP-separated at code-point level.

Already questioned and ruled on: whether `ᠶᠢᠨ`/`ᠶᠢ`/`ᠢᠶᠠᠷ` reproduce the
Decision 001 postvocalic-й digraph. They do not — the glide ᠶ U+1836 is correct
in suffix-initial and intervocalic position; see ENCODING.md Decision 002
(pinned by code-point tests). Reviewers checking these rows should read that
decision first.

## Open encoding question: word-final ᠢ (U+1822) or ᠶ (U+1836)? — 1,372 candidates

**Not a decision. This needs a maintainer ruling in [ENCODING.md](ENCODING.md), and
until it has one nothing has been changed.**

Forms supplied from **mongoltoli.mn** (maintainer, 2026-07-28) spell the privative's
final letter as **ᠶ U+1836**, where every one of ours uses **ᠢ U+1822**:

| Word | mongoltoli.mn | final letter | ours |
| --- | --- | --- | --- |
| номгүй | `ᠨᠣᠮ ᠦᠭᠡᠶ` | U+1836 | `ᠦᠭᠡᠢ` U+1822 |
| усгүй | `ᠤᠰᠤ ᠦᠭᠡᠶ` | U+1836 | — |
| төсөргүй | `ᠲᠥᠰᠦᠷ ᠦᠭᠡᠶ` | U+1836 | — |
| хичээнгүй | `ᠬᠢᠴᠢᠶᠡᠩᠭᠦᠶ` | U+1836 | `ᠬᠢᠴᠢᠶᠡᠩᠭᠦᠢ` U+1822 |

Four for four, so it is a convention rather than a slip. **The scope is far wider
than one suffix:**

- **1,372 lexicon candidates** end in vowel + ᠢ (аатай `ᠠᠭᠠᠲᠠᠢ`, аанай `ᠠᠨᠠᠢ`, …).
  Exactly **1** ends in vowel + ᠶ.
- **8 suffix rows**, including the comitative `ᠲᠠᠢ`/`ᠲᠡᠢ` — which
  [ENCODING.md](ENCODING.md) Decision 002 states outright ends "in a single ᠢ, never
  ᠶᠢ", pinned by code-point tests.

So a ruling here revises Decisions 001 and 002 rather than sitting beside them.
Note the question is **narrower than Decision 001**: that one removed the *digraph*
ᠶᠢ (U+1836 U+1822) in medial position, citing UTN #57's [D] Devsger condition. This
is about which **single** letter spells a **word-final** postvocalic i — a position
Decision 001 never examined, so the two are not necessarily in conflict.

What a ruling needs, and what this repo cannot supply on its own:

1. What UTN #57 Table 4 lists for the **final** written form — under *i* (U+1822),
   under *y* (U+1836), or both.
2. Whether mongoltoli.mn's convention is the modern standard or one house style.
3. Whether it applies to every word-final postvocalic i (all 1,372) or only after
   certain vowels.

If adopted it is a mechanical sweep like Decision 001 — one script, one patch
release — but it must be decided at code-point level first. Хүн шийдэх ёстой.

### What Nadmid 1990 says — and why it also challenges Decision 001

A **digitally typeset** Nadmid (Acrobat Distiller, 2009, from `Durem.doc`) turns out
to have an extractable text layer, unlike the coo.mn scan. Its монгол бичиг is a
legacy Private-Use-Area font (~13,000 PUA characters) so **script code points are
still not usable**, but its Cyrillic rule text and its romanizations are, and §
*Хос эгшгийг тэмдэглэхүй* is directly on point.

**Solid, and independent of any encoding question** — the romanizations:

| Nadmid's structure | Examples he gives |
| --- | --- |
| ай = **айи**, ой = **ойи**, уй = **уйи**, үй = **үйи** | аймаг → **айимаг**, ойр → **ойира**, туйлах → **туйилаху**, хүйтэн → **хүйитэн**, түймэр → **түйимэр** |
| word-final: vowel + **й** | нохой → **нохай**, балай → **балай**, **үгүй → үгэй** |

He also classes **й as a дэвсгэр consonant** — one of the five soft codas, listed
beside н, л, м, ң — and devotes a paragraph to the two-long-teeth ambiguity itself
(*"энэ хоёр урт шүд юуг тэмдэглэсэн бэ гэдэг асуулт гардаг"*), which is the same
debate ENCODING.md Decision 001 records from Liang Hai.

**Suggestive, but NOT usable as a code-point ruling.** Where the digitizer happened
to type standard Unicode instead of PUA, the two rules differ:

| Rule | As extracted | Reading |
| --- | --- | --- |
| medial diphthong | `эгшиг + (ᠶ , й) гийгүүлэгч + (U+E01C , и) эгшиг` | vowel + **U+1836** + и |
| word-final | `эгшиг + (U+E01C, й) гийгүүлэгч` | vowel + **U+E01C** |
| soft coda list | `ᠨ - н, ᠯ - л, ᠮ - м, U+E01C - й, ᠩ - ң` | й is U+E01C, the others standard |

U+E01C is glossed as **и** in the first row and **й** in the other two, which reads
as "the letter ᠢ, spelling the vowel и and the coda й" — while the medial diphthong
gets a real **ᠶ U+1836**. If that holds, Nadmid's system is *medial* ᠶ + ᠢ but
*word-final* ᠢ alone.

⚠️ **Do not act on that paragraph.** The PDF mixes a Unicode font with a PUA font
inconsistently — four of five soft codas came out standard and the fifth did not —
so the stray ᠶ may be the 2009 digitizer's choice rather than the 1990 print, and
mapping PUA → Unicode is exactly the presentation-form-to-logical-letter inference
ground rule 3 forbids. It needs the font's mapping table, or a human with the book.

**If it does hold, the consequences run in both directions:**

- Word-final ᠢ would be *confirmed*, and mongoltoli.mn's ᠦᠭᠡᠶ would be the house
  style rather than the standard — the 1,372 candidates stay as they are.
- **Decision 001 would be contradicted**, because Nadmid's medial structure (айимаг,
  хүйитэн) is exactly the ᠶᠢ digraph that decision removed from 2,780 entries. That
  decision cites UTN #57's modern shaping model; Nadmid describes the traditional
  orthography. They may be answering different questions, or they may genuinely
  conflict — and per ground rule 4 a decision is reversible with evidence, so this
  belongs in front of a human either way.

*Source: Я. Надмид, Монгол бичгийн зөв бичих толь бичиг, Улсын хэвлэлийн газар,
1990 — digital edition, § Хос эгшгийг тэмдэглэхүй and § Дэвсгэр үсэг. Copyrighted:
restated with citation, never copied into this repo.*

### Two lexicon entries mongoltoli.mn contradicts

Separate from the letter question, and unblocked by it:

- **төсөргүй** is stored `ᠲᠥᠰᠥᠷᠭᠦᠢ` (joined); mongoltoli gives `ᠲᠥᠰᠦᠷ ᠦᠭᠡᠶ` (apart).
  The stem also differs in its second vowel — ours `ᠲᠥᠰᠥᠷ` (U+1825), theirs `ᠲᠥᠰᠦᠷ`
  (U+1826). Both are seed forms and both look wrong.
- **ааггүй** is stored `ᠠᠭᠠᠭᠦᠭᠡᠢ` (joined); two converters and the G14 rule agree it
  is written apart.

Under G14 the rule already produces the apart form for both; these entries override
it only because an exact lexicon match outranks decomposition. Correcting or
removing them is a data change for a human.

## Pattern flag: MVS + NIRUGU final vowel — Decision 003 candidate (1,113 entries)

Found 2026-07-27 while investigating батга. The wmk seed encodes the detached
final vowel two different ways:

| Pattern                | Count     | Code points                 | Renders as                                                              |
| ---------------------- | --------- | --------------------------- | ----------------------------------------------------------------------- |
| MVS + NIRUGU + vowel   | **1,113** | U+180E U+180A U+1820/U+1821 | stem-extender stroke + **regular connected final a**                    |
| MVS + vowel (standard) | 134       | U+180E U+1820/U+1821        | consonant takes its MVS form + **detached isolated-form a** (`Aa.isol`) |

Evidence that the first is a generator hack, not a spelling:

- The two patterns encode the _same phenomenon_ inconsistently within one dataset.
- U+180A NIRUGU never appears in the seed outside this combination (0 other uses).
- UTN #57 (v4, §2.3): nirugu "behaves exactly like ZWJ but is visible as a piece of
  stem stroke"; its documented use is patronymic abbreviations — not vowel separation.
  Inserting it after MVS _defeats_ MVS's purpose, which is precisely to produce the
  special detached final vowel (HarfBuzz + Noto v3.002 confirm: with nirugu the final
  a renders as an ordinary connected `A.fina`; without it, as the correct `Aa.isol`).

**Ruled and applied (2026-07-27):** maintainer approved; recorded as
[ENCODING.md](ENCODING.md) Decision 003 and applied by
`scripts/fix-mvs-nirugu.ts` (1,113 candidates rewritten, all still
`verified: false`). Kept here for the record; the per-word батга question below
remains open.

Separate, per-word question (NOT covered by the pattern fix): whether a given word
should carry the MVS final vowel at all. Example flagged:

- `батга` — a reference site lists two candidates for this word; its **first
  matches ours** (`ᠪᠠᠳᠬ᠎ᠠ` after Decision 003), and its second, `ᠪᠠᠲᠠᠭᠠ`
  (b-a-t-a-g-a, U+182A U+1820 U+1832 U+1820 U+182D U+1820), is absent from our
  lexicon. Not a correction case — the wmk import's known one-to-many collapse:
  a possible missing second candidate. Adding it needs a human PR that also
  supplies `sense` labels for both (the schema requires senses once
  candidates > 1), after checking whether the two forms are sense-scoped
  meanings or orthographic variants.

<!-- wiktionary-import:begin (auto-generated, do not edit between markers) -->

## Wiktionary import review queue (`scripts/import-wiktionary.ts`)

Extracted from English Wiktionary (CC BY-SA) via kaikki.org — see [SOURCES.md](SOURCES.md). Хүний хяналт шаардлагатай мөрүүд — туслах хүн бүрт баярлана.

### Source conflicts — prioritized review queue (310)

The bootstrap seed and Wiktionary disagree on these words. Each case is either a genuine homonym (keep both, write proper `sense` labels) or a wrong spelling (delete the bad candidate). Candidates marked _unlabeled_ need a human meaning label; do not trust either source blindly.

- **ал** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB#Mongolian)
  - `ᠠᠯᠠ` (_al_) — wmk-import — _unlabeled_
  - `ᠠᠯ` (_al_) — wiktionary — “red”
- **алдах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D0%B4%D0%B0%D1%85#Mongolian)
  - `ᠠᠯᠠᠳᠠᠬᠤ` (_aldah_) — wmk-import — _unlabeled_
  - `ᠠᠯᠳᠠᠬᠤ` (_aldaqu_) — wiktionary — “to lose (a thing, an ability, a quality...)”
- **алим** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D0%B8%D0%BC#Mongolian)
  - `ᠠᠯᠢᠮ᠎ᠠ` (_alim_) — wmk-import — _unlabeled_
  - `ᠠᠯᠢᠮ᠎᠎ᠠ` (_alim--a_) — wiktionary — “apple”
- **амрах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BC%D1%80%D0%B0%D1%85#Mongolian)
  - `ᠠᠮᠤᠷᠠᠬᠤ` (_amrah_) — wmk-import — _unlabeled_
  - `ᠠᠮᠠᠷᠠᠬᠤ` (_amaraqu_) — wiktionary — “to rest”
- **амьдрал** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BC%D1%8C%D0%B4%D1%80%D0%B0%D0%BB#Mongolian)
  - `ᠠᠮᠢᠳᠤᠷᠠᠯ` (_amidral_) — wmk-import — _unlabeled_
  - `ᠠᠮᠢᠳ᠋ᠤᠷᠠᠯ` (_amidural_) — wiktionary — “life”
- **англи** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8#Mongolian)
  - `ᠠᠩᠭᠯᠢ` (_angli_) — wmk-import — _unlabeled_
  - `ᠠᠩᠩᠯᠢ` (_angngli_) — wiktionary — “English”
- **аптек** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BF%D1%82%D0%B5%D0%BA#Mongolian)
  - `ᠠᠫᠲ᠋ᠧᠺ` (_aptyek_) — wmk-import — _unlabeled_
  - `ᠠᠫᠳᠡᠭ` (_apdeg_) — wiktionary — “drugstore, pharmacy, chemist's”
- **асуудал** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%81%D1%83%D1%83%D0%B4%D0%B0%D0%BB#Mongolian)
  - `ᠠᠰᠠᠭᠤᠳᠠᠯ` (_asuudal_) — wmk-import — _unlabeled_
  - `ᠠᠰᠠᠭᠣᠳᠠᠯ` (_asaɣodal_) — wiktionary — “question”
- **ачих** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%87%D0%B8%D1%85#Mongolian)
  - `ᠠᠴᠢᠬ᠎ᠠ` (_achih_) — wmk-import — _unlabeled_
  - `ᠠᠴᠢᠬᠤ` (_ačiqu_) — wiktionary — “to load, burden, pile up”
- **аялах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%8F%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠠᠶᠠᠯᠬᠤ` (_ayalah_) — wmk-import — _unlabeled_
  - `ᠠᠶᠠᠯᠠᠬᠤ` (_ayalaqu_) — wiktionary — “to travel”
- **баатар** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B0%D1%82%D0%B0%D1%80#Mongolian)
  - `ᠪᠠᠭᠠᠲᠤᠷ` (_baatar_) — wmk-import — _unlabeled_
  - `ᠪᠠᠭ᠋ᠠᠲᠤᠷ` (_baɣatur_) — wiktionary — “hero”
- **багалзуур** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B3%D0%B0%D0%BB%D0%B7%D1%83%D1%83%D1%80#Mongolian)
  - `ᠪᠠᠭᠠᠯᠵᠤᠷ` (_bagalzuur_) — wmk-import — _unlabeled_
  - `ᠪᠠᠭᠠᠯᠵᠠᠭᠤᠷ` (_baɣalǰaɣur_) — wiktionary — “throat, pharynx, gizzard”
- **байгуулалт** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B9%D0%B3%D1%83%D1%83%D0%BB%D0%B0%D0%BB%D1%82#Mongolian)
  - `ᠪᠠᠢᠭᠤᠯᠤᠯᠲᠠ` (_baiguulalt_) — wmk-import — _unlabeled_
  - `ᠪᠠᠶ᠋ᠢᠭᠤᠯᠤᠯᠲᠠ` (_bayiɣululta_) — wiktionary — “composition”
- **байлдаан** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B9%D0%BB%D0%B4%D0%B0%D0%B0%D0%BD#Mongolian)
  - `ᠪᠠᠢᠯᠳᠤᠭᠠᠨ` (_baildaan_) — wmk-import — _unlabeled_
  - `ᠪᠠᠶ᠋ᠢᠯᠳᠤᠭᠠᠨ` (_bayilduɣan_) — wiktionary — “battle”
- **банзал** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%BD%D0%B7%D0%B0%D0%BB#Mongolian)
  - `ᠪᠠᠩᠵᠠᠯ` (_banzal_) — wmk-import — _unlabeled_
  - `ᠪᠠᠨᠵᠠᠯ` (_banǰal_) — wiktionary — “skirt”
- **бараа** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%80%D0%B0%D0%B0#Mongolian)
  - `ᠪᠠᠷ᠎ᠠ` (_baraa_) — wmk-import — _unlabeled_
  - `ᠪᠠᠷᠠᠭ᠎ᠠ` (_baraɣ-a_) — wiktionary — “contour, outline, silhouette”
- **барамнас** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%80%D0%B0%D0%BC%D0%BD%D0%B0%D1%81#Mongolian)
  - `ᠪᠠᠷᠮᠠᠨᠤᠰ` (_baramnas_) — wmk-import — _unlabeled_
  - `ᠪᠡ᠊ᠷ᠊ᠮᠠᠨ᠋ᠣᠰ` (_be-r-manos_) — wiktionary — “plural of барамна (baramna)”
- **барга** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%80%D0%B3%D0%B0#Mongolian)
  - `ᠪᠠᠷᠭᠤ` (_barga_) — wmk-import — _unlabeled_
  - `ᠪᠠᠷᠭ᠋ᠤ` (_barɣu_) — wiktionary — “crude”
- **баяд** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%8F%D0%B4#Mongolian)
  - `ᠪᠠᠶᠠᠳ` (_bayad_) — wmk-import — _unlabeled_
  - `ᠪᠠᠶ᠋ᠠᠳ` (_bayad_) — wiktionary — “Bayats (Oirat-Mongolian tribe, vassal of the Dörbets)”
- **баялаг** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%8F%D0%BB%D0%B0%D0%B3#Mongolian)
  - `ᠪᠠᠶᠠᠯᠢᠭ` (_bayalag_) — wmk-import — _unlabeled_
  - `ᠪᠠᠶ᠋ᠠᠯᠢᠭ` (_bayaliɣ_) — wiktionary — “riches, wealth”
- **баярлалаа** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%8F%D1%80%D0%BB%D0%B0%D0%BB%D0%B0%D0%B0#Mongolian)
  - `ᠪᠠᠶᠠᠷᠯᠠᠯ᠎ᠠ` (_bayarlalaa_) — wmk-import — _unlabeled_
  - `ᠪᠠᠶᠠᠷᠯᠠᠯᠤᠭ᠎ᠠ` (_bayarlaluɣ-a_) — wiktionary — “thank you”
- **бензин** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B5%D0%BD%D0%B7%D0%B8%D0%BD#Mongolian)
  - `ᠪᠧᠨ᠋ᠽᠢᠨ` (_byenzin_) — wmk-import — _unlabeled_
  - `ᠪᠧᠨᠽᠢᠨ` (_bēnzin_) — wiktionary — “gasoline, petrol”
- **бетон** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B5%D1%82%D0%BE%D0%BD#Mongolian)
  - `ᠪᠧᠲ᠋ᠡᠨ` (_byeton_) — wmk-import — _unlabeled_
  - `ᠪᠧᠲ᠋ᠣᠨ` (_bēton_) — wiktionary — “concrete”
- **билет** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B8%D0%BB%D0%B5%D1%82#Mongolian)
  - `ᠪᠢᠯᠧᠲ` (_bilyet_) — wmk-import — _unlabeled_
  - `ᠪᠢᠯᠧᠲ᠋` (_bilēt_) — wiktionary — “ticket”
- **бодол** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%B4%D0%BE%D0%BB#Mongolian)
  - `ᠪᠣᠳᠣᠯ` (_bodol_) — wmk-import — _unlabeled_
  - `ᠪᠣᠳᠤᠯ` (_bodul_) — wiktionary — “thought, thinking, idea, intention, conception, opinion”
- **бодох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%B4%D0%BE%D1%85#Mongolian)
  - `ᠪᠣᠳᠣᠬᠤ` (_bodoh_) — wmk-import — _unlabeled_
  - `ᠪᠣᠳᠤᠬᠤ` (_boduqu_) — wiktionary — “to think”
- **больниц** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D1%86#Mongolian)
  - `ᠪᠣᠯᠢᠨᠢᠼ` (_bolinits_) — wmk-import — _unlabeled_
  - `ᠪᠣᠯᠢᠨᠢᠼᠠ` (_bolinica_) — wiktionary — “hospital”
- **боол** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BE%D0%BB#Mongolian)
  - `ᠪᠣᠭᠣᠯ` (_bool_) — wmk-import — _unlabeled_
  - `ᠪᠣᠭᠤᠯ` (_boɣul_) — wiktionary — “slave”
- **боолт** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BE%D0%BB%D1%82#Mongolian)
  - `ᠪᠣᠭᠣᠯᠲᠠ` (_boolt_) — wmk-import — _unlabeled_
  - `ᠪᠣᠭᠤᠯᠲᠠ` (_boɣulta_) — wiktionary — “bolt”
- **боорцог** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BE%D1%80%D1%86%D0%BE%D0%B3#Mongolian)
  - `ᠪᠣᠭᠣᠷᠰᠣᠭ` (_boortsog_) — wmk-import — _unlabeled_
  - `ᠪᠣᠭᠤᠷᠰᠤᠭ` (_boɣursuɣ_) — wiktionary — “doughnut, fritter (fried sweet piece of dough)”
- **боох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BE%D1%85#Mongolian)
  - `ᠪᠣᠭᠣᠬᠤ` (_booh_) — wmk-import — _unlabeled_
  - `ᠪᠣᠭᠤᠬᠤ` (_boɣuqu_) — wiktionary — “to bind, to bundle”
- **буга** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%B3%D0%B0#Mongolian)
  - `ᠪᠤᠭᠤ` (_buga_) — wmk-import — _unlabeled_
  - `ᠪᠣᠭᠣ` (_boɣo_) — wiktionary — “deer”
- **булан** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%BB%D0%B0%D0%BD#Mongolian)
  - `ᠪᠤᠯᠤᠨ` (_bulan_) — wmk-import — _unlabeled_
  - `ᠪᠤᠯᠤᠩ` (_bulung_) — wiktionary — “corner”
- **буудал** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D1%83%D0%B4%D0%B0%D0%BB#Mongolian)
  - `ᠪᠠᠭᠤᠳᠠᠯ` (_buudal_) — wmk-import — _unlabeled_
  - `ᠪᠠᠭᠣᠳᠠᠯ` (_baɣodal_) — wiktionary — “camp, landing, station, stay, stop, stage, landing stage, rocket stage”
- **бууз** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D1%83%D0%B7#Mongolian)
  - `ᠪᠤᠤᠵᠠ` (_buuz_) — wmk-import — _unlabeled_
  - `ᠪᠤᠤᠽ` (_buuz_) — wiktionary — “steamed meat dumpling”
  - `ᠪᠣᠣᠵᠠ` (_booǰa_) — wiktionary — “steamed meat dumpling”
- **бэлхүүс** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%8D%D0%BB%D1%85%D2%AF%D2%AF%D1%81#Mongolian)
  - `ᠪᠡᠯᠬᠡᠭᠦᠰᠦ` (_belhuus_) — wmk-import — _unlabeled_
  - `ᠪᠡᠯᠭᠡᠭᠦᠰᠦ` (_belgegüsü_) — wiktionary — “waist”
- **бүр** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D2%AF%D1%80#Mongolian)
  - `ᠪᠦᠷ` (_bur_) — wmk-import — _unlabeled_
  - `ᠪᠦᠷᠢ` (_büri_) — wiktionary — “each, every”
- **бүс** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D2%AF%D1%81#Mongolian)
  - `ᠪᠥᠰᠡ` (_bus_) — wmk-import — _unlabeled_
  - `ᠪᠦᠰᠡ` (_büse_) — wiktionary — “belt”
- **бөгж** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D0%B3%D0%B6#Mongolian)
  - `ᠪᠥᠭᠡᠵᠢ` (_bugj_) — wmk-import — _unlabeled_
  - `ᠪᠦᠭᠡᠵᠢ` (_bügeǰi_) — wiktionary — “ring”
- **бөднө** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D0%B4%D0%BD%D3%A9#Mongolian)
  - `ᠪᠥᠲᠥᠨ᠎ᠡ` (_budnu_) — wmk-import — _unlabeled_
  - `ᠪᠥᠳᠦᠨ᠎ᠡ` (_bödün-e_) — wiktionary — “quail”
- **бөмбөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D0%BC%D0%B1%D3%A9%D0%B3#Mongolian)
  - `ᠪᠥᠮᠪᠥᠭᠡ` (_bumbug_) — wmk-import — _unlabeled_
  - `ᠪᠥᠮᠪᠦᠭᠡ` (_bömbüge_) — wiktionary — “ball”
- **бөхөн** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D1%85%D3%A9%D0%BD#Mongolian)
  - `ᠪᠥᠬᠥᠨ` (_buhun_) — wmk-import — _unlabeled_
  - `ᠪᠥᠭᠦᠩ` (_bögüng_) — wiktionary — “saiga (antelope)”
- **бөөлжис** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D3%A9%D0%BB%D0%B6%D0%B8%D1%81#Mongolian)
  - `ᠪᠥᠭᠡᠯᠵᠢᠰᠦ` (_buuljis_) — wmk-import — _unlabeled_
  - `ᠪᠥᠭᠡᠯᠵᠢᠰᠣᠨ` (_bögelǰison_) — wiktionary — “vomit”
- **вандан** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B2%D0%B0%D0%BD%D0%B4%D0%B0%D0%BD#Mongolian)
  - `ᠪᠠᠨᠳᠠᠩ` (_vandan_) — wmk-import — _unlabeled_
  - `ᠸᠠᠩᠳᠠᠩ` (_wangdang_) — wiktionary — “bench (set)”
- **гадил** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D0%B4%D0%B8%D0%BB#Mongolian)
  - `ᠭᠠᠳᠢᠯ` (_gadil_) — wmk-import — _unlabeled_
  - `ᠭᠠᠳᠠᠯᠢ` (_ɣadali_) — wiktionary — “banana, plantain”
- **ган** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D0%BD#Mongolian)
  - `ᠭᠠᠨ` (_gan_) — wmk-import — _unlabeled_
  - `ᠭᠠᠩ` (_ɣang_) — wiktionary — “steel”
- **ганжин** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D0%BD%D0%B6%D0%B8%D0%BD#Mongolian)
  - `ᠭᠠᠨᠵᠢᠨ` (_ganjin_) — wmk-import — _unlabeled_
  - `ᠭᠠᠨᠵᠢᠩ` (_ɣanǰing_) — wiktionary — “rolling pin”
- **гоожих** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%BE%D0%BE%D0%B6%D0%B8%D1%85#Mongolian)
  - `ᠭᠣᠣᠵᠢᠬᠤ` (_goojih_) — wmk-import — _unlabeled_
  - `ᠭᠣᠭᠤᠵᠢᠬᠤ` (_ɣoguǰiqu_) — wiktionary — “to leak, pour out, drip, stream, sweat”
- **горхи** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%BE%D1%80%D1%85%D0%B8#Mongolian)
  - `ᠭᠣᠷᠭᠢ` (_gorhi_) — wmk-import — _unlabeled_
  - `ᠭᠣᠷᠤᠬ᠎ᠠ` (_ɣoruq-a_) — wiktionary — “a (small) river, brook”
- **гэлэнмаа** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D1%8D%D0%BB%D1%8D%D0%BD%D0%BC%D0%B0%D0%B0#Mongolian)
  - `ᠭᠡᠯᠡᠩᠮ᠎ᠠ` (_gelenmaa_) — wmk-import — _unlabeled_
  - `ᠭᠡᠯᠣᠩᠮ᠎ᠠ` (_gelongm-a_) — wiktionary — “nun, bhikkhuni”
- **гүүр** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D2%AF%D2%AF%D1%80#Mongolian)
  - `ᠭᠦᠦᠷᠡ` (_guur_) — wmk-import — _unlabeled_
  - `ᠭᠦᠭᠦᠷᠭᠡ` (_gügürge_) — wiktionary — “bridge”
- **дайх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B0%D0%B9%D1%85#Mongolian)
  - `ᠳᠠᠢᠬᠤ` (_daih_) — wmk-import — _unlabeled_
  - `ᠳᠠᠶ᠋ᠢᠬᠤ` (_dayiqu_) — wiktionary — “to haul off with a vehicle”
- **дарах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B0%D1%80%D0%B0%D1%85#Mongolian)
  - `ᠳᠠᠷᠠᠬᠤ` (_darah_) — wmk-import — _unlabeled_
  - `ᠳᠠᠷᠤᠬᠤ` (_daruqu_) — wiktionary — “to repress”
- **дийлэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B8%D0%B9%D0%BB%D1%8D%D1%85#Mongolian)
  - `ᠳᠡᠢᠯᠬᠦ` (_diileh_) — wmk-import — _unlabeled_
  - `ᠳᠡᠶ᠋ᠢᠯᠬᠦ` (_deyilkü_) — wiktionary — “to defeat, to win”
- **довтлох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D0%B2%D1%82%D0%BB%D0%BE%D1%85#Mongolian)
  - `ᠳᠣᠪᠲᠣᠯᠬᠤ` (_dovtloh_) — wmk-import — _unlabeled_
  - `ᠳᠣᠪᠲᠤᠯᠬᠤ` (_dobtulqu_) — wiktionary — “to gallop (to ride swiftly)”
- **домог** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D0%BC%D0%BE%D0%B3#Mongolian)
  - `ᠳᠣᠮᠣᠭ` (_domog_) — wmk-import — _unlabeled_
  - `ᠳᠣᠮᠤᠭ` (_domuɣ_) — wiktionary — “legend, myth, fable”
- **дорой** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D1%80%D0%BE%D0%B9#Mongolian)
  - `ᠳᠣᠷᠣᠢ` (_doroi_) — wmk-import — _unlabeled_
  - `ᠳᠣᠷᠤᠢ` (_dorui_) — wiktionary — “weak, feeble, lax, poor, underdeveloped”
- **доромжлол** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D1%80%D0%BE%D0%BC%D0%B6%D0%BB%D0%BE%D0%BB#Mongolian)
  - `ᠳᠣᠷᠣᠮᠵᠢᠯᠠᠯ` (_doromjlol_) — wmk-import — _unlabeled_
  - `ᠳᠣᠷᠤᠮᠵᠢᠯᠠᠯ` (_dorumǰilal_) — wiktionary — “humiliation, outrage, insult”
- **доромжлох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D1%80%D0%BE%D0%BC%D0%B6%D0%BB%D0%BE%D1%85#Mongolian)
  - `ᠳᠤᠷᠤᠮᠵᠢᠯᠠᠬᠤ` (_doromjloh_) — wmk-import — _unlabeled_
  - `ᠳᠣᠷᠤᠮᠵᠢᠯᠠᠬᠤ` (_dorumǰilaqu_) — wiktionary — “to insult, humiliate, belittle”
- **дотор** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%BE%D1%82%D0%BE%D1%80#Mongolian)
  - `ᠳᠣᠲᠣᠷ᠎ᠠ` (_dotor_) — wmk-import — _unlabeled_
  - `ᠳᠣᠲᠤᠷ᠎ᠠ` (_dotur-a_) — wiktionary — “in, inside”
- **дугуй** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%83%D0%B3%D1%83%D0%B9#Mongolian)
  - `ᠳᠤᠭᠤᠢ` (_dugui_) — wmk-import — _unlabeled_
  - `ᠳᠣᠭᠣᠢ` (_doɣoi_) — wiktionary — “circle”
- **дуулах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%83%D1%83%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠳᠠᠭᠤᠯᠠᠬᠤ` (_duulah_) — wmk-import — _unlabeled_
  - `ᠳᠤᠭᠤᠯᠠᠬᠤ` (_duɣulaqu_) — wiktionary — “to hear”
- **дэлхий** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%8D%D0%BB%D1%85%D0%B8%D0%B9#Mongolian)
  - `ᠳᠡᠯᠡᠬᠡᠢ` (_delhii_) — wmk-import — _unlabeled_
  - `ᠳᠡᠯᠡᠭᠡᠢ` (_delegei_) — wiktionary — “earth”
- **дэлэн** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%8D%D0%BB%D1%8D%D0%BD#Mongolian)
  - `ᠳᠡᠯᠡᠨ` (_delen_) — wmk-import — _unlabeled_
  - `ᠳᠡᠯᠡᠩ` (_deleng_) — wiktionary — “udder”
- **дэнлүү** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%8D%D0%BD%D0%BB%D2%AF%D2%AF#Mongolian)
  - `ᠳ᠋ᠧᠨᠯᠦ` (_denluu_) — wmk-import — _unlabeled_
  - `ᠳ᠋ᠧᠩᠯᠦ` (_dēnglü_) — wiktionary — “lantern”
- **дэнслэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%8D%D0%BD%D1%81%D0%BB%D1%8D%D1%85#Mongolian)
  - `ᠳᠡᠩᠰᠡᠯᠬᠦ` (_densleh_) — wmk-import — _unlabeled_
  - `ᠳᠡᠩᠰᠡᠯᠡᠬᠦ` (_dengselekü_) — wiktionary — “to weigh”
- **дөлгөөн** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D3%A9%D0%BB%D0%B3%D3%A9%D3%A9%D0%BD#Mongolian)
  - `ᠳᠥᠯᠥᠭᠡᠨ` (_dulguun_) — wmk-import — _unlabeled_
  - `ᠳᠥᠯᠦᠭᠡᠨ` (_dölügen_) — wiktionary — “calm, quiet, peaceful, gentle”
- **дөрвөл** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D3%A9%D1%80%D0%B2%D3%A9%D0%BB#Mongolian)
  - `ᠳᠥᠷᠪᠡᠯ` (_durvul_) — wmk-import — _unlabeled_
  - `ᠳᠥ᠋ᠷᠪᠡᠯ` (_dörbel_) — wiktionary — “(⁓ хөгжим) quartet”
- **дөрөө** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D3%A9%D1%80%D3%A9%D3%A9#Mongolian)
  - `ᠳᠥᠷᠥᠭᠡ` (_duruu_) — wmk-import — _unlabeled_
  - `ᠳᠥᠷᠦᠭᠡ` (_dörüge_) — wiktionary — “stirrup, pedal”
- **ерөнхий** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B5%D1%80%D3%A9%D0%BD%D1%85%D0%B8%D0%B9#Mongolian)
  - `ᠶᠡᠷᠦᠩᠬᠡᠢ` (_yerunhii_) — wmk-import — _unlabeled_
  - `ᠶᠡᠷᠦᠩᠬᠡᠶ` (_yerüngkey_) — wiktionary — “general”
- **еэвэн** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B5%D1%8D%D0%B2%D1%8D%D0%BD#Mongolian)
  - `ᠶᠧᠪᠡᠩ` (_yeven_) — wmk-import — _unlabeled_
  - `ᠶᠧᠪᠢᠩ` (_yēbing_) — wiktionary — “cookie (small, sweet, flat, circular, baked good which is either crisp or soft…”
- **живэр** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%B8%D0%B2%D1%8D%D1%80#Mongolian)
  - `ᠵᠢᠪᠡᠷ` (_jiver_) — wmk-import — _unlabeled_
  - `ᠵᠢᠪᠡᠷᠢ` (_ǰiberi_) — wiktionary — “moustache”
- **жимслэг** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%B8%D0%BC%D1%81%D0%BB%D1%8D%D0%B3#Mongolian)
  - `ᠵᠢᠮᠢᠰᠯᠡᠭ` (_jimsleg_) — wmk-import — _unlabeled_
  - `ᠵᠢᠮᠢᠰᠯᠢᠭ` (_ǰimislig_) — wiktionary — “fruit-bearing, abundant in fruit”
- **жолоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%BE%D0%BB%D0%BE%D0%BE#Mongolian)
  - `ᠵᠢᠯᠣᠭᠣ` (_joloo_) — wmk-import — _unlabeled_
  - `ᠵᠢᠯᠤᠭᠤ` (_ǰiluɣu_) — wiktionary — “rein”
- **жолооч** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%BE%D0%BB%D0%BE%D0%BE%D1%87#Mongolian)
  - `ᠵᠢᠯᠣᠭᠣᠴᠢ` (_jolooch_) — wmk-import — _unlabeled_
  - `ᠵᠢᠯᠤᠭᠤᠴᠢ` (_ǰiluɣuči_) — wiktionary — “driver”
- **жорлон** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%BE%D1%80%D0%BB%D0%BE%D0%BD#Mongolian)
  - `ᠵᠣᠷᠯᠣᠩ` (_jorlon_) — wmk-import — _unlabeled_
  - `ᠵᠣᠷᠯᠤᠩ` (_ǰorlung_) — wiktionary — “toilet, outhouse”
- **заарь** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%B0%D0%B0%D1%80%D1%8C#Mongolian)
  - `ᠵᠠᠭᠠᠷᠢ` (_zaari_) — wmk-import — _unlabeled_
  - `ᠵᠢᠭᠠᠷ` (_ǰiɣar_) — wiktionary — “musk (odour, secretion)”
- **зав** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%B0%D0%B2#Mongolian)
  - `ᠵᠠᠪᠠ` (_zav_) — wmk-import — _unlabeled_
  - `ᠵᠠᠪ` (_ǰab_) — wiktionary — “leisure, spare time, free time”
- **зайлсхийх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%B0%D0%B9%D0%BB%D1%81%D1%85%D0%B8%D0%B9%D1%85#Mongolian)
  - `ᠵᠠᠢᠯᠠᠰᠬᠢᠬᠤ` (_zailshiih_) — wmk-import — _unlabeled_
  - `ᠵᠠᠢᠯᠠᠰᠬᠢᠬᠦ` (_ǰayilaskiqü_) — wiktionary — “immediative aspect in -схийх (-sxiix) of зайлах (zajlax, “to go away, to…”
- **зогсох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%BE%D0%B3%D1%81%D0%BE%D1%85#Mongolian)
  - `ᠵᠣᠭᠰᠣᠬᠤ` (_zogsoh_) — wmk-import — _unlabeled_
  - `ᠵᠣᠭᠰᠤᠬᠤ` (_ǰoɣsuqu_) — wiktionary — “to stand”
- **зоос** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%BE%D0%BE%D1%81#Mongolian)
  - `ᠵᠣᠭᠣᠰ` (_zoos_) — wmk-import — _unlabeled_
  - `ᠵᠣᠭᠤᠰ` (_ǰoɣus_) — wiktionary — “coin”
- **зугтах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%83%D0%B3%D1%82%D0%B0%D1%85#Mongolian)
  - `ᠵᠢᠭᠤᠳᠠᠬᠤ` (_zugtah_) — wmk-import — _unlabeled_
  - `ᠵᠢᠭᠤᠲᠠᠬᠤ` (_ǰiɣutaqu_) — wiktionary — “to run away, flee”
- **зурах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%83%D1%80%D0%B0%D1%85#Mongolian)
  - `ᠵᠤᠷᠠᠬᠤ` (_zurah_) — wmk-import — _unlabeled_
  - `ᠵᠢᠷᠤᠬᠤ` (_ǰiruqu_) — wiktionary — “to draw (produce a picture)”
- **зэрэг** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%8D%D1%80%D1%8D%D0%B3#Mongolian)
  - `ᠵᠡᠷᠭᠡ` (_zereg_) — wmk-import — _unlabeled_
  - `ᠵᠠ᠊ᠷᠭᠡᠡ᠋` (_ǰa-rɣee_) — wiktionary — “grade, degree, rank”
- **зээр** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%8D%D1%8D%D1%80#Mongolian)
  - `ᠵᠡᠭᠡᠷ᠎ᠡ` (_zeer_) — wmk-import — _unlabeled_
  - `ᠵᠡᠭᠡᠷᠡ` (_ǰegere_) — wiktionary — “gazelle”
- **зүйл** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D0%B9%D0%BB#Mongolian)
  - `ᠵᠦᠢᠯ` (_zuil_) — wmk-import — _unlabeled_
  - `ᠵᠤᠢᠯ` (_ǰuil_) — wiktionary — “kind, sort, variety, type, class, item, article, thing”
- **зүйрлэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D0%B9%D1%80%D0%BB%D1%8D%D1%85#Mongolian)
  - `ᠵᠦᠢᠴᠢᠯᠡᠬᠦ` (_zuirleh_) — wmk-import — _unlabeled_
  - `ᠵᠦᠢᠷᠯᠡᠬᠦ` (_ǰüirlekü_) — wiktionary — “to compare, contrast”
- **зүрчид** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D1%80%D1%87%D0%B8%D0%B4#Mongolian)
  - `ᠵᠦᠷᠴᠢᠳ` (_zurchid_) — wmk-import — _unlabeled_
  - `ᠵᠦ᠋ᠷᠴᠢᠳ` (_ǰürčid_) — wiktionary — “Jurchens (people)”
- **зүү** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D2%AF#Mongolian)
  - `ᠵᠦ` (_zuu_) — wmk-import — _unlabeled_
  - `ᠵᠡᠭᠦᠦ` (_ǰegüü_) — wiktionary — “needle”
- **илтгэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B8%D0%BB%D1%82%D0%B3%D1%8D%D1%85#Mongolian)
  - `ᠢᠯᠡᠳᠭᠡᠬᠦ` (_iltgeh_) — wmk-import — _unlabeled_
  - `ᠢᠯᠡᠳᠬᠡᠬᠦ` (_iledkekü_) — wiktionary — “causative of илдэх (ildex)”
- **имрэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B8%D0%BC%D1%80%D1%8D%D1%85#Mongolian)
  - `ᠢᠮᠡᠷᠡᠬᠦ` (_imreh_) — wmk-import — _unlabeled_
  - `ᠢᠮᠡᠷᠬᠦ` (_imerkü_) — wiktionary — “to twirl between the fingers (hair, paper)”
- **календарь** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%B0%D0%BB%D0%B5%D0%BD%D0%B4%D0%B0%D1%80%D1%8C#Mongolian)
  - `ᠺᠠᠯᠧᠨᠳᠠᠷᠢ` (_kalyendari_) — wmk-import — _unlabeled_
  - `ᠻᠠᠯᠧᠨᠳᠠᠷᠢ` (_kalēndari_) — wiktionary — “calendar”
- **карт** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%B0%D1%80%D1%82#Mongolian)
  - `ᠺᠠᠷᠲ` (_kart_) — wmk-import — _unlabeled_
  - `ᠻᠠᠷᠲ᠋` (_kart_) — wiktionary — “card, map, chart”
- **компани** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8#Mongolian)
  - `ᠺᠣᠮᠫᠠᠨᠢ` (_kompani_) — wmk-import — _unlabeled_
  - `ᠻᠣᠮᠫᠠᠨᠢ` (_kompani_) — wiktionary — “company; firm”
- **консул** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB#Mongolian)
  - `ᠺᠣᠨᠰᠤᠶᠢᠯ` (_konsul_) — wmk-import — _unlabeled_
  - `ᠺᠣᠨᠰᠦ᠋ᠯ` (_konsül_) — wiktionary — “consul (official residing in major foreign towns to represent and protect the…”
- **контор** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%BE%D0%BD%D1%82%D0%BE%D1%80#Mongolian)
  - `ᠺᠣᠨᠲ᠋ᠣᠷ` (_kontor_) — wmk-import — _unlabeled_
  - `ᠻᠣᠨᠲ᠋ᠣᠷ` (_kontor_) — wiktionary — “office; bureau”
- **костюм** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%BE%D1%81%D1%82%D1%8E%D0%BC#Mongolian)
  - `ᠺᠣᠰᠲ᠋ᠶᠤᠶᠢᠮ` (_kostyum_) — wmk-import — _unlabeled_
  - `ᠻᠣᠰᠲ᠋ᠢᠶᠦᠮ` (_kostiyüm_) — wiktionary — “suit (suit of clothes, men’s suit or women’s suit)”
- **лонх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BB%D0%BE%D0%BD%D1%85#Mongolian)
  - `ᠯᠣᠩᠬᠣ` (_lonh_) — wmk-import — _unlabeled_
  - `ᠯᠣᠩᠬᠤ` (_longqu_) — wiktionary — “bottle”
- **лоозон** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BB%D0%BE%D0%BE%D0%B7%D0%BE%D0%BD#Mongolian)
  - `ᠯᠣᠽᠦ᠋ᠩ` (_loozon_) — wmk-import — _unlabeled_
  - `ᠯᠣᠽᠦᠩ` (_lozüng_) — wiktionary — “password”
- **мий** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B8%D0%B9#Mongolian)
  - `ᠮᠢ` (_mii_) — wmk-import — _unlabeled_
  - `ᠮᠢᠢ` (_mii_) — wiktionary — “cat”
- **миний** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B8%D0%BD%D0%B8%D0%B9#Mongolian)
  - `ᠮᠢᠨᠦ` (_minii_) — wmk-import — _unlabeled_
  - `ᠮᠢᠨᠤ` (_minu_) — wiktionary — “my”
- **минийх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B8%D0%BD%D0%B8%D0%B9%D1%85#Mongolian)
  - `ᠮᠢᠨᠦᠬᠢ` (_miniih_) — wmk-import — _unlabeled_
  - `ᠮᠢᠨᠤᠬᠢ` (_minuqi_) — wiktionary — “mine”
- **модоч** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%B4%D0%BE%D1%87#Mongolian)
  - `ᠮᠣᠳᠣᠴᠢ` (_modoch_) — wmk-import — _unlabeled_
  - `ᠮᠣᠳᠤᠴᠢ` (_moduči_) — wiktionary — “carpenter”
- **молтогчин** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BB%D1%82%D0%BE%D0%B3%D1%87%D0%B8%D0%BD#Mongolian)
  - `ᠮᠣᠯᠲᠣᠭᠴᠢᠨ` (_moltogchin_) — wmk-import — _unlabeled_
  - `ᠮᠣᠯᠲᠤᠭᠴᠢᠨ` (_moltuɣčin_) — wiktionary — “hare, rabbit”
- **мохоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D1%85%D0%BE%D0%BE#Mongolian)
  - `ᠮᠣᠬᠣᠭᠣ` (_mohoo_) — wmk-import — _unlabeled_
  - `ᠮᠣᠬᠤᠭᠠ` (_moquɣa_) — wiktionary — “blunt (not sharp)”
- **мохох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D1%85%D0%BE%D1%85#Mongolian)
  - `ᠮᠣᠬᠣᠬᠤ` (_mohoh_) — wmk-import — _unlabeled_
  - `ᠮᠣᠬᠤᠬᠤ` (_moququ_) — wiktionary — “to become blunt”
- **мушгирах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D1%83%D1%88%D0%B3%D0%B8%D1%80%D0%B0%D1%85#Mongolian)
  - `ᠮᠤᠰᠭᠢᠷᠠᠬᠤ` (_mushgirah_) — wmk-import — _unlabeled_
  - `ᠮᠤᠰᠬᠢᠷᠠᠬᠤ` (_musqiraqu_) — wiktionary — “to twist (become twisted)”
- **мэлхий** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D1%8D%D0%BB%D1%85%D0%B8%D0%B9#Mongolian)
  - `ᠮᠡᠯᠡᠬᠡᠢ` (_melhii_) — wmk-import — _unlabeled_
  - `ᠮᠡᠨᠡᠬᠡᠢ` (_menekei_) — wiktionary — “frog, toad”
- **мөргөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D1%80%D0%B3%D3%A9%D1%85#Mongolian)
  - `ᠮᠥᠷᠭᠥᠬᠦ` (_murguh_) — wmk-import — _unlabeled_
  - `ᠮᠥᠷᠭᠦᠬᠦ` (_mörgükü_) — wiktionary — “to butt, to bump (with horns, forehead, ...)”
- **мөрөвч** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D1%80%D3%A9%D0%B2%D1%87#Mongolian)
  - `ᠮᠥᠷᠥᠪᠴᠢ` (_muruvch_) — wmk-import — _unlabeled_
  - `ᠮᠥᠷᠦᠪᠴᠢ` (_mörübči_) — wiktionary — “suspenders (to hold up trousers)”
- **мөрөөдөл** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D1%80%D3%A9%D3%A9%D0%B4%D3%A9%D0%BB#Mongolian)
  - `ᠮᠥᠷᠥᠭᠡᠳᠦᠯ` (_muruudul_) — wmk-import — _unlabeled_
  - `ᠮᠥᠷᠦᠭᠡᠳᠦᠯ` (_mörügedül_) — wiktionary — “dream (aspiration)”
- **мөөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D3%A9%D0%B3#Mongolian)
  - `ᠮᠥᠭᠥ` (_muug_) — wmk-import — _unlabeled_
  - `ᠮᠥᠭᠦ` (_mögü_) — wiktionary — “mushroom, fungus”
- **найз** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D0%B9%D0%B7#Mongolian)
  - `ᠨᠠᠢᠵᠠ` (_naiz_) — wmk-import — _unlabeled_
  - `ᠨᠠᠶ᠋ᠢᠵᠠ` (_nayiǰa_) — wiktionary — “friend”
- **найруулах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D0%B9%D1%80%D1%83%D1%83%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠨᠠᠢᠷᠠᠭᠤᠯᠬᠤ` (_nairuulah_) — wmk-import — _unlabeled_
  - `ᠨᠠᠶ᠋ᠢᠷᠠᠭᠤᠯᠬᠤ` (_nayiraɣulqu_) — wiktionary — “causative of найрах (najrax)”
- **найтаах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D0%B9%D1%82%D0%B0%D0%B0%D1%85#Mongolian)
  - `ᠨᠠᠢᠲᠠᠭᠠᠬᠤ` (_naitaah_) — wmk-import — _unlabeled_
  - `ᠨᠠᠶ᠋ᠢᠲᠠᠭᠠᠬᠤ` (_nayitaɣaqu_) — wiktionary — “to sneeze”
- **нийтгэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B8%D0%B9%D1%82%D0%B3%D1%8D%D1%85#Mongolian)
  - `ᠨᠡᠢᠳᠬᠡᠬᠦ` (_niitgeh_) — wmk-import — _unlabeled_
  - `ᠨᠡᠶ᠋ᠢᠳᠬᠡᠬᠦ` (_neyidkekü_) — wiktionary — “to weave”
- **ногоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D0%B3%D0%BE%D0%BE#Mongolian)
  - `ᠨᠣᠭᠣᠭ᠎ᠠ` (_nogoo_) — wmk-import — _unlabeled_
  - `ᠨᠣᠭᠤᠭ᠎ᠠ` (_noɣuɣ-a_) — wiktionary — “herbs, grass, vegetables”
- **ногоон** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D0%B3%D0%BE%D0%BE%D0%BD#Mongolian)
  - `ᠨᠣᠭᠣᠭᠠᠨ` (_nogoon_) — wmk-import — _unlabeled_
  - `ᠨᠣᠭᠤᠭᠠᠨ` (_noɣuɣan_) — wiktionary — “green”
- **нөгөө** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D3%A9%D0%B3%D3%A9%D3%A9#Mongolian)
  - `ᠨᠥᠭᠥᠭᠡ` (_nuguu_) — wmk-import — _unlabeled_
  - `ᠨᠥᠭᠦᠭᠡ` (_nögüge_) — wiktionary — “that; that very one”
- **нөлөө** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D3%A9%D0%BB%D3%A9%D3%A9#Mongolian)
  - `ᠨᠥᠯᠥᠭᠡ` (_nuluu_) — wmk-import — _unlabeled_
  - `ᠨᠥᠯᠦᠭᠡ` (_nölüge_) — wiktionary — “influence”
- **нөхөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D3%A9%D1%85%D3%A9%D1%85#Mongolian)
  - `ᠨᠥᠬᠥᠬᠥ` (_nuhuh_) — wmk-import — _unlabeled_
  - `ᠨᠥᠬᠦᠬᠦ` (_nökükü_) — wiktionary — “to patch, act as a substitute, make up for, catch up with”
- **нөхөөс** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D3%A9%D1%85%D3%A9%D3%A9%D1%81#Mongolian)
  - `ᠨᠥᠬᠥᠭᠡᠰᠦ` (_nuhuus_) — wmk-import — _unlabeled_
  - `ᠨᠥᠬᠦᠭᠡᠰᠦ` (_nökügesü_) — wiktionary — “patch, substitute, piece”
- **огих** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B3%D0%B8%D1%85#Mongolian)
  - `ᠣᠬᠢᠬᠤ` (_ogih_) — wmk-import — _unlabeled_
  - `ᠣᠭᠢᠬᠤ` (_oɣiqu_) — wiktionary — “to retch, to burp”
- **оготно** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B3%D0%BE%D1%82%D0%BD%D0%BE#Mongolian)
  - `ᠣᠭᠣᠲᠣᠨ᠎ᠠ` (_ogotno_) — wmk-import — _unlabeled_
  - `ᠣᠭᠤᠲᠤᠨ᠎ᠠ` (_oɣutun-a_) — wiktionary — “field rat, mouse”
- **оготор** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B3%D0%BE%D1%82%D0%BE%D1%80#Mongolian)
  - `ᠣᠭᠣᠲᠣᠷ` (_ogotor_) — wmk-import — _unlabeled_
  - `ᠣᠭᠤᠲᠤᠷ` (_oɣutur_) — wiktionary — “short”
- **одоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B4%D0%BE%D0%BE#Mongolian)
  - `ᠣᠳᠣ` (_odoo_) — wmk-import — _unlabeled_
  - `ᠣᠳᠤ` (_odu_) — wiktionary — “now”
- **озох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B7%D0%BE%D1%85#Mongolian)
  - `ᠣᠵᠣᠬᠤ` (_ozoh_) — wmk-import — _unlabeled_
  - `ᠣᠵᠤᠬᠤ` (_oǰuqu_) — wiktionary — “to kiss”
- **ойлгох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B9%D0%BB%D0%B3%D0%BE%D1%85#Mongolian)
  - `ᠤᠢᠯᠠᠭᠠᠬᠤ` (_oilgoh_) — wmk-import — _unlabeled_
  - `ᠣᠶ᠋ᠢᠯᠠᠭᠠᠬᠤ` (_oyilaɣaqu_) — wiktionary — “to understand (someone, something)”
- **оймс** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B9%D0%BC%D1%81#Mongolian)
  - `ᠣᠢᠮᠣᠰᠤ` (_oims_) — wmk-import — _unlabeled_
  - `ᠣᠶ᠋ᠢᠮᠤᠰᠤ` (_oyimusu_) — wiktionary — “sock, stocking”
- **олох** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BB%D0%BE%D1%85#Mongolian)
  - `ᠤᠯᠬᠤ` (_oloh_) — wmk-import — _unlabeled_
  - `ᠣᠯᠬᠤ` (_olqu_) — wiktionary — “to find, to discover”
- **олс** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BB%D1%81#Mongolian)
  - `ᠣᠯᠣᠰᠣ` (_ols_) — wmk-import — _unlabeled_
  - `ᠣᠯᠤᠰᠤ` (_olusu_) — wiktionary — “hemp, rope, chain”
- **онол** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD%D0%BE%D0%BB#Mongolian)
  - `ᠣᠨᠣᠯ` (_onol_) — wmk-import — _unlabeled_
  - `ᠣᠨᠤᠯ` (_onul_) — wiktionary — “theory”
- **оноо** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD%D0%BE%D0%BE#Mongolian)
  - `ᠣᠨᠣᠭ᠎ᠠ` (_onoo_) — wmk-import — _unlabeled_
  - `ᠣᠨᠤᠭ᠎ᠠ` (_onuɣ-a_) — wiktionary — “hit (a successful shot)”
  - `ᠣᠨᠤᠭᠤ` (_onuɣu_) — wiktionary — “slit (on a garment)”
- **ор** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80#Mongolian)
  - `ᠣᠷᠣ` (_or_) — wmk-import — _unlabeled_
  - `ᠣᠷᠤ` (_oru_) — wiktionary — “bed”
- **орой** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D0%BE%D0%B9#Mongolian)
  - `ᠣᠷᠣᠢ` (_oroi_) — wmk-import — _unlabeled_
  - `ᠣᠷᠤᠢ` (_orui_) — wiktionary — “evening”
- **ором** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D0%BE%D0%BC#Mongolian)
  - `ᠣᠷᠣᠮ` (_orom_) — wmk-import — _unlabeled_
  - `ᠣᠷᠤᠮ` (_orum_) — wiktionary — “imprint”
- **орчуулах** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D1%87%D1%83%D1%83%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠤᠷᠴᠢᠭᠤᠯᠬᠤ` (_orchuulah_) — wmk-import — _unlabeled_
  - `ᠣᠷᠴᠢᠭᠤᠯᠬᠤ` (_orčiɣulqu_) — wiktionary — “to translate”
- **орших** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D1%88%D0%B8%D1%85#Mongolian)
  - `ᠤᠷᠤᠰᠢᠬᠤ` (_orshih_) — wmk-import — _unlabeled_
  - `ᠣᠷᠤᠰᠢᠬᠤ` (_orusiqu_) — wiktionary — “entity”
- **оёдол** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%91%D0%B4%D0%BE%D0%BB#Mongolian)
  - `ᠣᠶᠣᠳᠠᠯ` (_oyodol_) — wmk-import — _unlabeled_
  - `ᠣᠶᠤᠳᠠᠯ` (_oyudal_) — wiktionary — “sewing, stitchery”
- **парк** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BF%D0%B0%D1%80%D0%BA#Mongolian)
  - `ᠫᠠᠷᠺ` (_park_) — wmk-import — _unlabeled_
  - `ᠫᠠᠷᠻ` (_park_) — wiktionary — “park”
- **парламент** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BF%D0%B0%D1%80%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%D1%82#Mongolian)
  - `ᠫᠠᠷᠯᠠᠮᠧᠨᠲ` (_parlamyent_) — wmk-import — _unlabeled_
  - `ᠫᠠᠷᠯᠠᠮᠧᠨᠲ᠋` (_parlamēnt_) — wiktionary — “parliament”
- **паспорт** — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BF%D0%B0%D1%81%D0%BF%D0%BE%D1%80%D1%82#Mongolian)
  - `ᠫᠠᠰᠫᠣᠷᠲ` (_pasport_) — wmk-import — _unlabeled_
  - `ᠫᠠᠰᠫᠣᠷᠲ᠋` (_pasport_) — wiktionary — “ID card”
- **саатал** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D0%B0%D1%82%D0%B0%D0%BB#Mongolian)
  - `ᠰᠠᠭᠠᠲᠠᠯ᠎ᠠ` (_saatal_) — wmk-import — _unlabeled_
  - `ᠰᠠᠭᠠᠲᠠᠯ` (_saɣatal_) — wiktionary — “jam”
- **сампин** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D0%BC%D0%BF%D0%B8%D0%BD#Mongolian)
  - `ᠰᠤᠸᠠᠮᠫᠠᠨ` (_sampin_) — wmk-import — _unlabeled_
  - `ᠰᠤᠸᠠᠨᠫᠠᠨ` (_suwanpan_) — wiktionary — “abacus”
- **сонгогч** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D0%BD%D0%B3%D0%BE%D0%B3%D1%87#Mongolian)
  - `ᠰᠣᠩᠭᠣᠭᠴᠢ` (_songogch_) — wmk-import — _unlabeled_
  - `ᠰᠣᠩᠭᠤᠭᠴᠢ` (_songɣuɣči_) — wiktionary — “voter; elector; chooser”
- **сонгох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D0%BD%D0%B3%D0%BE%D1%85#Mongolian)
  - `ᠰᠤᠩᠭᠤᠬᠤ` (_songoh_) — wmk-import — _unlabeled_
  - `ᠰᠣᠩᠭᠤᠬᠤ` (_songɣuqu_) — wiktionary — “to choose”
- **сонгууль** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D0%BD%D0%B3%D1%83%D1%83%D0%BB%D1%8C#Mongolian)
  - `ᠰᠣᠩᠭᠣᠭᠤᠯᠢ` (_songuuli_) — wmk-import — _unlabeled_
  - `ᠰᠣᠩᠭᠤᠭᠤᠯᠢ` (_songɣuɣuli_) — wiktionary — “election”
- **сонсох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D0%BD%D1%81%D0%BE%D1%85#Mongolian)
  - `ᠰᠤᠨᠤᠰᠬᠤ` (_sonsoh_) — wmk-import — _unlabeled_
  - `ᠰᠣᠨᠤᠰᠬᠤ` (_sonusqu_) — wiktionary — “to hear”
- **соруул** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D1%80%D1%83%D1%83%D0%BB#Mongolian)
  - `ᠰᠣᠷᠣᠭᠤᠯ` (_soruul_) — wmk-import — _unlabeled_
  - `ᠰᠣᠷᠤᠭᠤᠯ` (_soruɣul_) — wiktionary — “drinking straw”
- **социализм** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D0%B7%D0%BC#Mongolian)
  - `ᠰᠣᠴᠢᠶᠠᠯᠢᠮ` (_sotsializm_) — wmk-import — _unlabeled_
  - `ᠰᠣᠼᠢᠶᠠᠯᠢᠰᠮ` (_sociyalism_) — wiktionary — “socialism”
- **соёо** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D1%91%D0%BE#Mongolian)
  - `ᠰᠣᠶᠣᠭ᠎ᠠ` (_soyo_) — wmk-import — _unlabeled_
  - `ᠰᠣᠶᠤᠭ᠎ᠠ` (_soyuɣ-a_) — wiktionary — “tusk”
- **станц** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D1%82%D0%B0%D0%BD%D1%86#Mongolian)
  - `ᠰᠲ᠋ᠠᠨᠼ` (_stants_) — wmk-import — _unlabeled_
  - `ᠰᠲ᠋ᠠᠨᠼᠢ` (_stanci_) — wiktionary — “station”
- **сэлэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D1%8D%D0%BB%D1%8D%D1%85#Mongolian)
  - `ᠰᠡᠯᠡᠬᠦ` (_seleh_) — wmk-import — _unlabeled_
  - `ᠰᠡᠯᠢᠬᠦ` (_selikü_) — wiktionary — “to swim (of animals, humans)”
- **сүнс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D2%AF%D0%BD%D1%81#Mongolian)
  - `ᠰᠦᠨᠡᠰᠦ` (_suns_) — wmk-import — _unlabeled_
  - `ᠰᠦ᠋ᠨ᠋ᠡᠰᠦ` (_sünesü_) — wiktionary — “soul”
- **сүү** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D2%AF%D2%AF#Mongolian)
  - `ᠰᠦ᠋` (_suu_) — wmk-import — _unlabeled_
  - `ᠰᠦᠨ` (_sün_) — wiktionary — “milk”
- **сөгдөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D3%A9%D0%B3%D0%B4%D3%A9%D1%85#Mongolian)
  - `ᠰᠥᠭᠥᠳᠬᠦ` (_sugduh_) — wmk-import — _unlabeled_
  - `ᠰᠥᠭᠦᠳᠬᠦ` (_sögüdkü_) — wiktionary — “to kneel”
- **такси** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%BA%D1%81%D0%B8#Mongolian)
  - `ᠲᠠᠺᠰᠢ` (_taksi_) — wmk-import — _unlabeled_
  - `ᠲ᠋ᠠᠻᠰᠢ` (_taksi_) — wiktionary — “taxi; cab”
- **там** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%BC#Mongolian)
  - `ᠲᠠᠮ` (_tam_) — wmk-import — _unlabeled_
  - `ᠲᠠᠮᠤ` (_tamu_) — wiktionary — “hell”
- **тамах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%BC%D0%B0%D1%85#Mongolian)
  - `ᠲᠠᠮᠠᠬᠤ` (_tamah_) — wmk-import — _unlabeled_
  - `ᠲᠠᠮᠤᠬᠤ` (_tamuqu_) — wiktionary — “alternative form of томох (tomox, “to spin (rope)”)”
- **телефон** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD#Mongolian)
  - `ᠲᠧᠯᠧᠹᠣᠨ` (_tyelyefon_) — wmk-import — _unlabeled_
  - `ᠲ᠋ᠧᠯᠧᠹᠣᠨ` (_tēlēfon_) — wiktionary — “telephone”
- **технологи** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8#Mongolian)
  - `ᠲᠧᠭᠨᠣᠯᠣᠭᠢ` (_tyehnologi_) — wmk-import — _unlabeled_
  - `ᠲᠧᠻᠨᠣᠯᠣᠬᠢ` (_tēknoloqi_) — wiktionary — “technology”
- **тив** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B8%D0%B2#Mongolian)
  - `ᠲᠢᠪ` (_tiv_) — wmk-import — _unlabeled_
  - `ᠲᠢᠢᠪ` (_tiib_) — wiktionary — “continent”
- **тогоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B3%D0%BE%D0%BE#Mongolian)
  - `ᠲᠣᠭᠣᠭ᠎ᠠ` (_togoo_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠭ᠎ᠠ` (_toɣuɣ-a_) — wiktionary — “pot, saucepan”
- **тогооч** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B3%D0%BE%D0%BE%D1%87#Mongolian)
  - `ᠲᠣᠭᠣᠭᠠᠴᠢ` (_togooch_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠭᠠᠴᠢ` (_toɣuɣači_) — wiktionary — “cook; chef”
- **тогоруу** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B3%D0%BE%D1%80%D1%83%D1%83#Mongolian)
  - `ᠲᠣᠭᠣᠷᠤᠤ` (_togoruu_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠷᠤᠤ` (_toɣuruu_) — wiktionary — “crane”
- **тогос** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B3%D0%BE%D1%81#Mongolian)
  - `ᠲᠣᠭᠣᠰ` (_togos_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠰ` (_toɣus_) — wiktionary — “peacock”
- **тойрох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B9%D1%80%D0%BE%D1%85#Mongolian)
  - `ᠲᠤᠭᠤᠷᠢᠬᠤ` (_toiroh_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠷᠢᠬᠤ` (_toɣuriqu_) — wiktionary — “to circle (to go around)”
- **тойруу** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%B9%D1%80%D1%83%D1%83#Mongolian)
  - `ᠲᠣᠭᠣᠷᠢᠭᠤ` (_toiruu_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠷᠢᠭᠤ` (_toɣuriɣu_) — wiktionary — “roundabout, indirect (road)”
- **толгой** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BB%D0%B3%D0%BE%D0%B9#Mongolian)
  - `ᠲᠣᠯᠣᠭᠠᠢ` (_tolgoi_) — wmk-import — _unlabeled_
  - `ᠲᠣᠯᠤᠭᠠᠢ` (_toluɣai_) — wiktionary — “head”
- **том** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BC#Mongolian)
  - `ᠲᠣᠮᠣ` (_tom_) — wmk-import — _unlabeled_
  - `ᠲᠣᠮᠤ` (_tomu_) — wiktionary — “big”
- **томох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BC%D0%BE%D1%85#Mongolian)
  - `ᠲᠣᠮᠣᠬᠤ` (_tomoh_) — wmk-import — _unlabeled_
  - `ᠲᠠᠮᠤᠬᠤ` (_tamuqu_) — wiktionary — “to twist, to splice (a rope)”
- **томсох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BC%D1%81%D0%BE%D1%85#Mongolian)
  - `ᠲᠣᠮᠣᠰᠬᠤ` (_tomsoh_) — wmk-import — _unlabeled_
  - `ᠲᠣᠮᠤᠰᠬᠤ` (_tomusqu_) — wiktionary — “to grow bigger”
- **тоос** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BE%D1%81#Mongolian)
  - `ᠲᠣᠭᠣᠰᠣ` (_toos_) — wmk-import — _unlabeled_
  - `ᠲᠣᠭᠤᠰᠤ` (_toɣusu_) — wiktionary — “dust”
- **тор** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D1%80#Mongolian)
  - `ᠲᠣᠷ` (_tor_) — wmk-import — _unlabeled_
  - `ᠲᠣᠣᠷ` (_toor_) — wiktionary — “net”
- **торгох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D1%80%D0%B3%D0%BE%D1%85#Mongolian)
  - `ᠲᠣᠷᠭᠣᠬᠤ` (_torgoh_) — wmk-import — _unlabeled_
  - `ᠲᠣᠷᠭᠠᠬᠤ` (_torɣaqu_) — wiktionary — “causative voice in -гох (-gox) of торох (torox, “to get stuck”)”
- **тос** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D1%81#Mongolian)
  - `ᠲᠣᠰ` (_tos_) — wmk-import — _unlabeled_
  - `ᠲᠣᠰᠤ` (_tosu_) — wiktionary — “fat, grease, oil, butter”
- **тоть** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D1%82%D1%8C#Mongolian)
  - `ᠲᠣᠳᠢ` (_toti_) — wmk-import — _unlabeled_
  - `ᠲᠣᠳ᠋ᠢ` (_todi_) — wiktionary — “parrot”
- **тохой** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D1%85%D0%BE%D0%B9#Mongolian)
  - `ᠲᠣᠬᠣᠢ` (_tohoi_) — wmk-import — _unlabeled_
  - `ᠲᠣᠬᠤᠢ` (_toqui_) — wiktionary — “elbow”
- **трамвай** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%80%D0%B0%D0%BC%D0%B2%D0%B0%D0%B9#Mongolian)
  - `ᠲᠷᠠᠮᠸᠠᠢ` (_tramvai_) — wmk-import — _unlabeled_
  - `ᠲ᠋ᠷᠠᠮᠸᠠᠢ` (_tramwai_) — wiktionary — “tram, tramway”
- **тус** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D1%81#Mongolian)
  - `ᠲᠤᠰ` (_tus_) — wmk-import — _unlabeled_
  - `ᠲᠤᠰᠠ` (_tusa_) — wiktionary — “avail, boost, help, helping, adjuvancy, aid, benefit, helping hand, succour”
- **тусах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D1%81%D0%B0%D1%85#Mongolian)
  - `ᠲᠤᠰᠤᠬᠤ` (_tusah_) — wmk-import — _unlabeled_
  - `ᠲᠤᠰᠬᠤ` (_tusqu_) — wiktionary — “to hit upon, strike, be hit”
- **туслах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D1%81%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠲᠤᠰᠯᠠᠬᠤ` (_tuslah_) — wmk-import — _unlabeled_
  - `ᠲᠤᠰᠠᠯᠠᠬᠤ` (_tusalaqu_) — wiktionary — “to help, assist, succour”
- **тэвнэ** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%B2%D0%BD%D1%8D#Mongolian)
  - `ᠲᠡᠪᠡᠨᠡ` (_tevne_) — wmk-import — _unlabeled_
  - `ᠲᠡᠪᠡᠨ᠎ᠡ` (_teben-e_) — wiktionary — “a large needle for sewing leather or felt”
- **тэг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%B3#Mongolian)
  - `ᠲᠡᠭ` (_teg_) — wmk-import — _unlabeled_
  - `ᠲᠡᠭᠡ` (_tege_) — wiktionary — “zero”
- **тэд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%B4#Mongolian)
  - `ᠲᠡᠳᠡ` (_ted_) — wmk-import — _unlabeled_
  - `ᠲᠡᠳ᠋ᠡ` (_tede_) — wiktionary — “they”
- **түлхэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D2%AF%D0%BB%D1%85%D1%8D%D1%85#Mongolian)
  - `ᠲᠦᠯᠬᠦᠬᠦ` (_tulheh_) — wmk-import — _unlabeled_
  - `ᠲᠦᠯᠬᠢᠬᠦ` (_tülkikü_) — wiktionary — “to push”
- **төлөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D0%BB%D3%A9%D1%85#Mongolian)
  - `ᠤᠯᠭᠤᠬᠤ` (_tuluh_) — wmk-import — _unlabeled_
  - `ᠲᠥᠯᠦᠬᠦ` (_tölükü_) — wiktionary — “to pay”
- **төлөөлөгч** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D0%BB%D3%A9%D3%A9%D0%BB%D3%A9%D0%B3%D1%87#Mongolian)
  - `ᠲᠥᠯᠥᠭᠡᠯᠡᠭᠴᠢ` (_tuluulugch_) — wmk-import — _unlabeled_
  - `ᠲᠥᠯᠦᠭᠡᠯᠡᠭᠴᠢ` (_tölügelegči_) — wiktionary — “representative; agent”
- **төмс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D0%BC%D1%81#Mongolian)
  - `ᠲᠥᠮᠥᠰᠥ` (_tums_) — wmk-import — _unlabeled_
  - `ᠲᠥᠮᠦᠰᠦ` (_tömüsü_) — wiktionary — “potato”
- **төр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D1%80#Mongolian)
  - `ᠲᠥᠷᠥ` (_tur_) — wmk-import — _unlabeled_
  - `ᠲᠥ᠋ᠷᠦ` (_törü_) — wiktionary — “rule, order”
- **төрх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D1%80%D1%85#Mongolian)
  - `ᠲᠥᠷᠬᠥ` (_turh_) — wmk-import — _unlabeled_
  - `ᠲᠥᠷᠬᠦ` (_törkü_) — wiktionary — “form, figure, character, personality”
- **төсөвлөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D1%81%D3%A9%D0%B2%D0%BB%D3%A9%D1%85#Mongolian)
  - `ᠲᠥᠰᠥᠪᠯᠡᠬᠦ` (_tusuvluh_) — wmk-import — _unlabeled_
  - `ᠲᠥᠰᠦᠪᠯᠡᠬᠦ` (_tösüblekü_) — wiktionary — “to budget”
- **угаах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D0%B3%D0%B0%D0%B0%D1%85#Mongolian)
  - `ᠤᠬᠢᠶᠠᠬᠤ` (_ugaah_) — wmk-import — _unlabeled_
  - `ᠤᠭᠠᠬᠤ` (_uɣaqu_) — wiktionary — “to wash”
- **уд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D0%B4#Mongolian)
  - `ᠤᠳᠤ` (_ud_) — wmk-import — _unlabeled_
  - `ᠤᠳᠠ` (_uda_) — wiktionary — “willow”
- **хавцал** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B2%D1%86%D0%B0%D0%BB#Mongolian)
  - `ᠬᠠᠪᠴᠢᠯ` (_havtsal_) — wmk-import — _unlabeled_
  - `ᠬᠠᠪᠴᠠᠯ` (_qabčal_) — wiktionary — “gorge, ravine”
- **хайлмаг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B9%D0%BB%D0%BC%D0%B0%D0%B3#Mongolian)
  - `ᠬᠠᠢᠯᠤᠮᠠᠭ` (_hailmag_) — wmk-import — _unlabeled_
  - `ᠬᠠᠶ᠋ᠢᠯᠤᠮᠠᠭ` (_qayilumaɣ_) — wiktionary — “molten”
- **хайрлах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B9%D1%80%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠬᠠᠢᠷᠠᠯᠠᠬᠤ` (_hairlah_) — wmk-import — _unlabeled_
  - `ᠬᠠᠶ᠋ᠢᠷᠠᠯᠠᠬᠤ` (_qayiralaqu_) — wiktionary — “to love”
- **хайч** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B9%D1%87#Mongolian)
  - `ᠬᠠᠢᠴᠢ` (_haich_) — wmk-import — _unlabeled_
  - `ᠬᠠᠶ᠋ᠢᠴᠢ` (_qayiči_) — wiktionary — “scissors”
- **хайчлах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B9%D1%87%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠬᠠᠢᠴᠢᠯᠠᠬᠤ` (_haichlah_) — wmk-import — _unlabeled_
  - `ᠬᠠᠶ᠋ᠢᠴᠢᠯᠠᠬᠤ` (_qayičilaqu_) — wiktionary — “to cut with scissors”
- **халдах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%BB%D0%B4%D0%B0%D1%85#Mongolian)
  - `ᠬᠠᠯᠠᠳᠠᠬᠤ` (_haldah_) — wmk-import — _unlabeled_
  - `ᠬᠠᠯᠳᠠᠬᠤ` (_qaldaqu_) — wiktionary — “to near”
- **хамар** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%BC%D0%B0%D1%80#Mongolian)
  - `ᠬᠠᠮᠠᠷ` (_hamar_) — wmk-import — _unlabeled_
  - `ᠬᠠᠪᠠᠷ` (_qabar_) — wiktionary — “nose”
- **хариулах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%80%D0%B8%D1%83%D0%BB%D0%B0%D1%85#Mongolian)
  - `ᠬᠠᠷᠢᠭᠤᠯᠬᠤ` (_hariulah_) — wmk-import — _unlabeled_
  - `ᠬᠠᠷᠢᠭᠤᠯᠠᠬᠤ` (_qarigulaqu_) — wiktionary — “to answer, to reciprocate”
- **хатмал** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%82%D0%BC%D0%B0%D0%BB#Mongolian)
  - `ᠬᠠᠳᠠᠮᠠᠯ` (_hatmal_) — wmk-import — _unlabeled_
  - `ᠬᠠᠲᠠᠮᠠᠯ` (_qatamal_) — wiktionary — “dried, dry”
- **хачиг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%87%D0%B8%D0%B3#Mongolian)
  - `ᠬᠠᠴᠢᠭ` (_hachig_) — wmk-import — _unlabeled_
  - `ᠬᠠᠴᠢᠬ` (_qačiq_) — wiktionary — “tick (bug)”
- **хаяг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%8F%D0%B3#Mongolian)
  - `ᠬᠠᠶᠠᠭ` (_hayag_) — wmk-import — _unlabeled_
  - `ᠬᠠᠶᠢᠭ` (_qayiɣ_) — wiktionary — “address”
- **хийлч** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B8%D0%B9%D0%BB%D1%87#Mongolian)
  - `ᠬᠢᠯᠴᠡ` (_hiilch_) — wmk-import — _unlabeled_
  - `ᠬᠢᠭᠢᠯᠢᠴᠢ` (_kigiliči_) — wiktionary — “violinist”
- **хирс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B8%D1%80%D1%81#Mongolian)
  - `ᠬᠢᠷᠡᠰ` (_hirs_) — wmk-import — _unlabeled_
  - `ᠬᠡᠷᠢᠰ` (_keris_) — wiktionary — “rhinoceros”
- **хойд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%B9%D0%B4#Mongolian)
  - `ᠬᠣᠢᠳ` (_hoid_) — wmk-import — _unlabeled_
  - `ᠬᠣᠢᠳᠤ` (_qoyidu_) — wiktionary — “northward”
- **хойтон** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%B9%D1%82%D0%BE%D0%BD#Mongolian)
  - `ᠬᠣᠢᠲᠤᠨ` (_hoiton_) — wmk-import — _unlabeled_
  - `ᠬᠣᠢᠲᠣᠨ` (_qoyiton_) — wiktionary — “next year”
- **холбоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BB%D0%B1%D0%BE%D0%BE#Mongolian)
  - `ᠬᠣᠯᠪᠣᠭ᠎ᠠ` (_holboo_) — wmk-import — _unlabeled_
  - `ᠬᠣᠯᠪᠤᠭ᠎ᠠ` (_qolbuɣ-a_) — wiktionary — “connection, link”
- **холбоос** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BB%D0%B1%D0%BE%D0%BE%D1%81#Mongolian)
  - `ᠬᠣᠯᠪᠣᠭᠠᠰᠤ` (_holboos_) — wmk-import — _unlabeled_
  - `ᠬᠣᠯᠪᠤᠭᠠᠰᠤ` (_qolbuɣasu_) — wiktionary — “conjugation”
- **холилдох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BB%D0%B8%D0%BB%D0%B4%D0%BE%D1%85#Mongolian)
  - `ᠬᠤᠯᠢᠯᠳᠤᠭᠤᠯᠬᠤ` (_holildoh_) — wmk-import — _unlabeled_
  - `ᠬᠣᠯᠢᠯᠳᠤᠬᠤ` (_qolilduqu_) — wiktionary — “to mix, blend, be mixed”
- **холих** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BB%D0%B8%D1%85#Mongolian)
  - `ᠬᠤᠯᠢᠬᠤ` (_holih_) — wmk-import — _unlabeled_
  - `ᠬᠣᠯᠢᠬᠤ` (_qoliqu_) — wiktionary — “to mix, shuffle, stir, adulterate”
- **хоног** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BD%D0%BE%D0%B3#Mongolian)
  - `ᠬᠣᠨᠣᠭ` (_honog_) — wmk-import — _unlabeled_
  - `ᠬᠣᠨᠤᠭ` (_qonuɣ_) — wiktionary — “day”
- **хонох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BD%D0%BE%D1%85#Mongolian)
  - `ᠬᠤᠨᠤᠬᠤ` (_honoh_) — wmk-import — _unlabeled_
  - `ᠬᠣᠨᠤᠬᠤ` (_qonuqu_) — wiktionary — “To stay the night”
- **хооронд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D0%BE%D1%80%D0%BE%D0%BD%D0%B4#Mongolian)
  - `ᠬᠣᠭᠣᠷᠣᠨᠳᠣ` (_hoorond_) — wmk-import — _unlabeled_
  - `ᠬᠣᠭᠤᠷᠤᠨᠳᠤ` (_qoɣurundu_) — wiktionary — “between”
- **хор** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%80#Mongolian)
  - `ᠬᠣᠣᠷ` (_hor_) — wmk-import — _unlabeled_
  - `ᠬᠣᠣᠷ᠎ᠠ` (_qoor-a_) — wiktionary — “poison”
- **хорсох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%80%D1%81%D0%BE%D1%85#Mongolian)
  - `ᠬᠤᠷᠤᠰᠬᠤ` (_horsoh_) — wmk-import — _unlabeled_
  - `ᠬᠣᠷᠤᠰᠬᠤ` (_qorusqu_) — wiktionary — “to burn, to sting”
- **хорхой** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%80%D1%85%D0%BE%D0%B9#Mongolian)
  - `ᠬᠣᠷᠣᠬᠠᠢ` (_horhoi_) — wmk-import — _unlabeled_
  - `ᠬᠣᠷᠤᠬᠠᠢ` (_qoruqai_) — wiktionary — “maggot, insect, bug”
- **хотон** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%82%D0%BE%D0%BD#Mongolian)
  - `ᠬᠣᠲᠠᠨ` (_hoton_) — wmk-import — _unlabeled_
  - `ᠬᠣᠲᠤᠩ` (_qotung_) — wiktionary — “Muslim peoples”
- **хоцрогдол** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%86%D1%80%D0%BE%D0%B3%D0%B4%D0%BE%D0%BB#Mongolian)
  - `ᠬᠣᠴᠣᠷᠤᠭᠳᠠᠯ` (_hotsrogdol_) — wmk-import — _unlabeled_
  - `ᠬᠣᠴᠤᠷᠤᠭᠳᠠᠯ` (_qočuruɣdal_) — wiktionary — “arrearage, hangover”
- **хуасан** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%B0%D1%81%D0%B0%D0%BD#Mongolian)
  - `ᠬᠤᠸᠠᠱᠧᠩ` (_huasan_) — wmk-import — _unlabeled_
  - `ᠬᠤᠸᠠᠰᠠᠩ` (_quwasang_) — wiktionary — “peanut”
- **хув** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%B2#Mongolian)
  - `ᠬᠤᠪ` (_huv_) — wmk-import — _unlabeled_
  - `ᠬᠤᠪᠠ` (_quba_) — wiktionary — “amber”
- **хуванцар** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%B2%D0%B0%D0%BD%D1%86%D0%B0%D1%80#Mongolian)
  - `ᠬᠤᠪᠠᠨᠴᠠᠷ` (_huvantsar_) — wmk-import — _unlabeled_
  - `ᠬᠤᠪᠠᠨᠴᠢᠷ` (_qubančir_) — wiktionary — “plastic”
- **худалдах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%B4%D0%B0%D0%BB%D0%B4%D0%B0%D1%85#Mongolian)
  - `ᠬᠤᠳᠠᠯᠳᠤᠭᠠᠴᠢᠯᠠᠬᠤ` (_hudaldah_) — wmk-import — _unlabeled_
  - `ᠬᠤᠳᠠᠯᠳᠤᠬᠤ` (_qudalduqu_) — wiktionary — “to trade”
- **хулгах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%BB%D0%B3%D0%B0%D1%85#Mongolian)
  - `ᠬᠤᠯᠭᠠᠬᠤ` (_hulgah_) — wmk-import — _unlabeled_
  - `ᠬᠤᠯᠤᠭᠠᠬᠤ` (_qulugaqu_) — wiktionary — “to steal; to rob”
- **хулхи** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D0%BB%D1%85%D0%B8#Mongolian)
  - `ᠬᠤᠯᠬᠢ` (_hulhi_) — wmk-import — _unlabeled_
  - `ᠬᠤᠯᠢᠬᠢ` (_quliqi_) — wiktionary — “earwax”
- **хуруу** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D1%80%D1%83%D1%83#Mongolian)
  - `ᠬᠤᠷᠤᠤ` (_huruu_) — wmk-import — _unlabeled_
  - `ᠬᠤᠷᠤᠭᠤ` (_quruɣu_) — wiktionary — “finger”
- **хутгалдах** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D1%82%D0%B3%D0%B0%D0%BB%D0%B4%D0%B0%D1%85#Mongolian)
  - `ᠬᠤᠳᠭᠤᠯᠳᠤᠬᠤ` (_hutgaldah_) — wmk-import — _unlabeled_
  - `ᠬᠤᠳᠬᠤᠯᠳᠤᠬᠤ` (_qudkulduqu_) — wiktionary — “to mix, mingle, scramble”
- **хуурга** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D1%83%D1%80%D0%B3%D0%B0#Mongolian)
  - `ᠬᠤᠤᠷᠭ᠎ᠠ` (_huurga_) — wmk-import — _unlabeled_
  - `ᠬᠠᠭᠤᠷᠭ᠎ᠠ` (_qagurɣ-a_) — wiktionary — “stew, huurga (dish prepared by frying or simmering)”
- **хэрэм** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%8D%D1%80%D1%8D%D0%BC#Mongolian)
  - `ᠬᠡᠷᠡᠮ` (_herem_) — wmk-import — _unlabeled_
  - `ᠬᠡᠷᠡᠮᠦ` (_keremü_) — wiktionary — “squirrel”
- **хүдэр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D0%B4%D1%8D%D1%80#Mongolian)
  - `ᠬᠥᠳᠡᠷᠢ` (_huder_) — wmk-import — _unlabeled_
  - `ᠬᠦᠳᠡᠷᠢ` (_küderi_) — wiktionary — “musk deer”
- **хүзүү** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D0%B7%D2%AF%D2%AF#Mongolian)
  - `ᠬᠥᠵᠦᠭᠦᠦ` (_huzuu_) — wmk-import — _unlabeled_
  - `ᠬᠦᠵᠦᠭᠦᠦ` (_küǰügüü_) — wiktionary — “neck (of a person, of a bottle...)”
- **хүрд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%80%D0%B4#Mongolian)
  - `ᠬᠦᠷᠳ᠋` (_hurd_) — wmk-import — _unlabeled_
  - `ᠬᠦᠷᠳᠦ` (_kürdü_) — wiktionary — “wheel”
- **хүртэл** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%80%D1%82%D1%8D%D0%BB#Mongolian)
  - `ᠬᠦᠷᠲᠡᠯ᠎ᠡ` (_hurtel_) — wmk-import — _unlabeled_
  - `ᠬᠦᠷᠲᠡᠯ` (_kürtel_) — wiktionary — “until”
- **хүрэм** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%80%D1%8D%D0%BC#Mongolian)
  - `ᠬᠦᠷᠮ᠎ᠡ` (_hurem_) — wmk-import — _unlabeled_
  - `ᡴᡥᡠᡵᡝᠮ` — wiktionary — “jacket”
- **хүрэн** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%80%D1%8D%D0%BD#Mongolian)
  - `ᠬᠦᠷᠢᠨ` (_huren_) — wmk-import — _unlabeled_
  - `ᠬᠦᠷᠡᠩ` (_küreng_) — wiktionary — “brown, chestnut”
- **хүрээ** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%80%D1%8D%D1%8D#Mongolian)
  - `ᠬᠦᠷ᠎ᠡ` (_huree_) — wmk-import — _unlabeled_
  - `ᠬᠦᠷᠢᠶ᠎ᠡ` (_küriy-e_) — wiktionary — “enclosure”
- **хүчил** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D1%87%D0%B8%D0%BB#Mongolian)
  - `ᠬᠦᠴᠦᠯᠡ` (_huchil_) — wmk-import — _unlabeled_
  - `ᠬᠦᠴᠢᠯ` (_küčil_) — wiktionary — “acid”
- **хөвүүн** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%B2%D2%AF%D2%AF%D0%BD#Mongolian)
  - `ᠬᠥᠪᠡᠭᠦᠨ` (_huvuun_) — wmk-import — _unlabeled_
  - `ᠬᠥ᠋ᠪᠡᠭᠦᠨ` (_köbegün_) — wiktionary — “child”
- **хөвөн** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%B2%D3%A9%D0%BD#Mongolian)
  - `ᠬᠥᠪᠥᠨ` (_huvun_) — wmk-import — _unlabeled_
  - `ᠬᠥᠪᠦᠩ` (_köbüng_) — wiktionary — “cotton”
- **хөгжим** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%B3%D0%B6%D0%B8%D0%BC#Mongolian)
  - `ᠬᠥᠭᠵᠢᠮ᠎ᠡ` (_hugjim_) — wmk-import — _unlabeled_
  - `ᠬᠥᠭᠵᠢᠮ` (_kögǰim_) — wiktionary — “music”
- **хөзөр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%B7%D3%A9%D1%80#Mongolian)
  - `ᠬᠥᠵᠥᠷ` (_huzur_) — wmk-import — _unlabeled_
  - `ᠬᠥᠵᠦᠷ` (_köǰür_) — wiktionary — “playing card”
- **хөлрөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BB%D1%80%D3%A9%D1%85#Mongolian)
  - `ᠬᠥᠯᠥᠷᠡᠬᠦ` (_hulruh_) — wmk-import — _unlabeled_
  - `ᠬᠥᠯᠦᠷᠡᠬᠦ` (_kölürekü_) — wiktionary — “to sweat, chafe, perspire”
- **хөлс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BB%D1%81#Mongolian)
  - `ᠬᠥᠯᠰᠡ` (_huls_) — wmk-import — _unlabeled_
  - `ᠬᠥᠯᠦᠰᠦ` (_kölüsü_) — wiktionary — “perspiration”
- **хөлөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BB%D3%A9%D0%B3#Mongolian)
  - `ᠬᠥᠯᠥᠭ` (_hulug_) — wmk-import — _unlabeled_
  - `ᠬᠥᠯᠭᠡ` (_kölge_) — wiktionary — “ship; vessel”
- **хөмрөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BC%D1%80%D3%A9%D1%85#Mongolian)
  - `ᠬᠥᠮᠥᠷᠢᠬᠦ` (_humruh_) — wmk-import — _unlabeled_
  - `ᠬᠥᠮᠦᠷᠢᠬᠦ` (_kömürikü_) — wiktionary — “to turn over”
- **хөнөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BD%D3%A9%D0%B3#Mongolian)
  - `ᠬᠥᠨᠥᠭ` (_hunug_) — wmk-import — _unlabeled_
  - `ᠬᠥᠨᠦᠭ` (_könüg_) — wiktionary — “bucket”
- **хөрс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%80%D1%81#Mongolian)
  - `ᠬᠥᠷᠦᠰ` (_hurs_) — wmk-import — _unlabeled_
  - `ᠬᠥᠷᠦᠰᠦ` (_körüsü_) — wiktionary — “dirt, turf”
- **хөрөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%80%D3%A9%D0%B3#Mongolian)
  - `ᠬᠥᠷᠥᠭ` (_hurug_) — wmk-import — _unlabeled_
  - `ᠬᠥᠷᠦᠭ` (_körüg_) — wiktionary — “portrait”
- **хөтөлбөр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%82%D3%A9%D0%BB%D0%B1%D3%A9%D1%80#Mongolian)
  - `ᠬᠥᠲᠥᠯᠪᠦᠷᠢ` (_hutulbur_) — wmk-import — _unlabeled_
  - `ᠬᠥᠲᠦᠯᠪᠦᠷᠢ` (_kötülbüri_) — wiktionary — “program (set of structured activities)”
- **хөхүүр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%85%D2%AF%D2%AF%D1%80#Mongolian)
  - `ᠬᠥᠬᠥᠥᠷ` (_huhuur_) — wmk-import — _unlabeled_
  - `ᠬᠥᠬᠦᠦᠷ` (_köküür_) — wiktionary — “a leather bag for holding liquid (usually used for fermenting dairy products)…”
- **хөших** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%88%D0%B8%D1%85#Mongolian)
  - `ᠬᠥᠰᠢᠬᠦ` (_hushih_) — wmk-import — _unlabeled_
  - `ᠬᠥ᠊ᠰ᠊ᠢ᠊ᠬᠥ` (_kö-s-i-kö_) — wiktionary — “to become stiff”
- **хөөрөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D3%A9%D1%80%D3%A9%D0%B3#Mongolian)
  - `ᠬᠥᠭᠡᠷᠭᠡ` (_huurug_) — wmk-import — _unlabeled_
  - `ᠭᠦᠭᠦᠷᠭᠡ` (_gügürge_) — wiktionary — “bridge”
- **хөөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D3%A9%D1%85#Mongolian)
  - `ᠬᠥᠭᠡᠬᠦ` (_huuh_) — wmk-import — _unlabeled_
  - `ᠬᠥᠭᠡᠭᠡᠬᠦ` (_kögegekü_) — wiktionary — “to swell”
- **царцаа** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%B0%D1%80%D1%86%D0%B0%D0%B0#Mongolian)
  - `ᠴᠠᠷᠴᠠᠭ᠎ᠠ` (_tsartsaa_) — wmk-import — _unlabeled_
  - `ᠴᠠᠷᠴᠠ` (_čarča_) — wiktionary — “grasshopper”
- **цирк** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%B8%D1%80%D0%BA#Mongolian)
  - `ᠼᠢᠷᠺ` (_tsirk_) — wmk-import — _unlabeled_
  - `ᠼᠢᠷᠻ` (_cirk_) — wiktionary — “circus”
- **цомог** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%BE%D0%BC%D0%BE%D0%B3#Mongolian)
  - `ᠴᠣᠮᠣᠭ` (_tsomog_) — wmk-import — _unlabeled_
  - `ᠴᠣᠮᠤᠭ` (_čomuɣ_) — wiktionary — “album”
- **цох** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%BE%D1%85#Mongolian)
  - `ᠴᠣᠬᠣ` (_tsoh_) — wmk-import — _unlabeled_
  - `ᠴᠣᠬᠤ` (_čoqu_) — wiktionary — “beetle”
- **цэнхэр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D1%8D%D0%BD%D1%85%D1%8D%D1%80#Mongolian)
  - `ᠴᠡᠩᠬᠡᠷ` (_tsenher_) — wmk-import — _unlabeled_
  - `ᠴᠠᠩᠭᠡ᠊ᠷ` (_čangɣe-r_) — wiktionary — “light blue”
- **цэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D1%8D%D1%85#Mongolian)
  - `ᠴᠡᠬᠡ` (_tseh_) — wmk-import — _unlabeled_
  - `ᠴᠠᠭᠡᠡ᠋` (_čaɣee_) — wiktionary — “straight (not curved or sideways)”
- **цөм** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D3%A9%D0%BC#Mongolian)
  - `ᠴᠥᠮ` (_tsum_) — wmk-import — _unlabeled_
  - `ᠴᠥᠮᠡ` (_čöme_) — wiktionary — “nucleus; kernel; core”
- **цөцгий** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D3%A9%D1%86%D0%B3%D0%B8%D0%B9#Mongolian)
  - `ᠴᠥᠴᠥᠭᠡᠢ` (_tsutsgii_) — wmk-import — _unlabeled_
  - `ᠴᠥᠴᠦᠭᠡᠢ` (_čöčügei_) — wiktionary — “cream (from raw or boiled milk)”
- **чек** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%87%D0%B5%D0%BA#Mongolian)
  - `ᠴᠧᠺ` (_chyek_) — wmk-import — _unlabeled_
  - `ᠴᠧᠻ` (_čēk_) — wiktionary — “check/cheque”
- **чинийх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%87%D0%B8%D0%BD%D0%B8%D0%B9%D1%85#Mongolian)
  - `ᠴᠢᠨᠤᠬᠢ` (_chiniih_) — wmk-import — _unlabeled_
  - `ᠴᠢᠨ᠋ᠤᠬᠢ` (_činuqi_) — wiktionary — “yours”
- **чирэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%87%D0%B8%D1%80%D1%8D%D1%85#Mongolian)
  - `ᠴᠢᠷᠦᠬᠦ` (_chireh_) — wmk-import — _unlabeled_
  - `ᠴᠢᠷᠬᠦ` (_čirkü_) — wiktionary — “to drag”
- **шавьж** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%B0%D0%B2%D1%8C%D0%B6#Mongolian)
  - `ᠰᠢᠪᠠᠵᠢ` (_shavij_) — wmk-import — _unlabeled_
  - `ᠰᠢᠪᠡᠵᠢ` (_sibeǰi_) — wiktionary — “insect, bug”
- **шал** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%B0%D0%BB#Mongolian)
  - `ᠱᠠᠯ` (_shal_) — wmk-import — _unlabeled_
  - `ᠱᠠᠯᠠ` (_šala_) — wiktionary — “floor (bottom part of a room)”
- **шил** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%B8%D0%BB#Mongolian)
  - `ᠰᠢᠯᠢ` (_shil_) — wmk-import — _unlabeled_
  - `ᠰᠢᠯ` (_sil_) — wiktionary — “glass”
- **шинэс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%B8%D0%BD%D1%8D%D1%81#Mongolian)
  - `ᠰᠢᠨᠡᠰ` (_shines_) — wmk-import — _unlabeled_
  - `ᠰᠢᠨᠠᠰᠣ` (_sinaso_) — wiktionary — “larch (Larix)”
- **шодой** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D0%B4%D0%BE%D0%B9#Mongolian)
  - `ᠱᠣᠳᠣᠢ` (_shodoi_) — wmk-import — _unlabeled_
  - `ᠱᠣᠳᠤᠢ` (_šodui_) — wiktionary — “penis”
- **шонхор** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D0%BD%D1%85%D0%BE%D1%80#Mongolian)
  - `ᠱᠣᠩᠬᠣᠷ` (_shonhor_) — wmk-import — _unlabeled_
  - `ᠱᠣᠩᠬᠤᠷ` (_šongqur_) — wiktionary — “falcon”
- **шоо** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D0%BE#Mongolian)
  - `ᠱᠣᠣ` (_shoo_) — wmk-import — _unlabeled_
  - `ᠱᠣ` (_šo_) — wiktionary — “die, dice”
- **шорон** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D1%80%D0%BE%D0%BD#Mongolian)
  - `ᠱᠣᠷᠣᠩ` (_shoron_) — wmk-import — _unlabeled_
  - `ᠱᠣᠷᠤᠩ` (_šorung_) — wiktionary — “prison; jail, gaol”
- **шороо** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D1%80%D0%BE%D0%BE#Mongolian)
  - `ᠰᠢᠷᠣᠢ` (_shoroo_) — wmk-import — _unlabeled_
  - `ᠰᠢᠷᠤᠢ` (_sirui_) — wiktionary — “soil”
- **шохой** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%BE%D1%85%D0%BE%D0%B9#Mongolian)
  - `ᠱᠣᠬᠣᠢ` (_shohoi_) — wmk-import — _unlabeled_
  - `ᠴᠣᠬᠤ` (_čoqu_) — wiktionary — “lime”
- **шүүр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D2%AF%D2%AF%D1%80#Mongolian)
  - `ᠰᠢᠭᠦᠷ` (_shuur_) — wmk-import — _unlabeled_
  - `ᠱᠦᠭᠦᠷ` (_šügür_) — wiktionary — “broom”
- **шүүрдэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D2%AF%D2%AF%D1%80%D0%B4%D1%8D%D1%85#Mongolian)
  - `ᠱᠤᠤᠷᠳᠠᠬᠤ` (_shuurdeh_) — wmk-import — _unlabeled_
  - `ᠱᠦᠭᠦᠷᠳᠡᠬᠦ` (_šügürdekü_) — wiktionary — “to sweep (to clean using a broom or brush)”
- **шөл** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D3%A9%D0%BB#Mongolian)
  - `ᠱᠥᠯᠥ` (_shul_) — wmk-import — _unlabeled_
  - `ᠱᠥᠯᠦ` (_šölü_) — wiktionary — “soup”
- **эгэх** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%B3%D1%8D%D1%85#Mongolian)
  - `ᠡᠭᠡᠬᠦ` (_egeh_) — wmk-import — _unlabeled_
  - `ᠡᠭᠡᠬᠥ` (_egekö_) — wiktionary — “to return”
- **эдгээр** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%B4%D0%B3%D1%8D%D1%8D%D1%80#Mongolian)
  - `ᠡᠳᠡᠭᠡᠷ` (_edgeer_) — wmk-import — _unlabeled_
  - `ᠡᠳ᠋ᠡᠭᠡᠷ` (_edeger_) — wiktionary — “these”
- **энд** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%BD%D0%B4#Mongolian)
  - `ᠡᠨᠳᠡ` (_end_) — wmk-import — _unlabeled_
  - `ᠡᠨᠳ᠋ᠡ` (_ende_) — wiktionary — “here, herein, herewith, hereinto, there, therein”
- **яаж** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8F%D0%B0%D0%B6#Mongolian)
  - `ᠶᠠᠵ` (_yaj_) — wmk-import — _unlabeled_
  - `ᠶᠠᠭᠠᠭᠢᠵᠤ` (_yaɣaɣiǰu_) — wiktionary — “how”
- **янгир** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8F%D0%BD%D0%B3%D0%B8%D1%80#Mongolian)
  - `ᠶᠠᠩᠭᠢᠷ` (_yangir_) — wmk-import — _unlabeled_
  - `ᠶᠡᠩᢉᠢᠷ` — wiktionary — “mountain goat”
- **яндан** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8F%D0%BD%D0%B4%D0%B0%D0%BD#Mongolian)
  - `ᠶᠠᠨᠳᠠᠨ` (_yandan_) — wmk-import — _unlabeled_
  - `ᠶᠠᠩᠳᠤᠩ` (_yangdung_) — wiktionary — “chimney, whistle, horn”
- **ёл** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%91%D0%BB#Mongolian)
  - `ᠶᠣᠯᠣ` (_yol_) — wmk-import — _unlabeled_
  - `ᠶᠣᠯᠤ` (_yolu_) — wiktionary — “lammergeier, lammergeyer”
- **ёс** — [Wiktionary](https://en.wiktionary.org/wiki/%D1%91%D1%81#Mongolian)
  - `ᠶᠣᠰᠣ` (_yos_) — wmk-import — _unlabeled_
  - `ᠶᠣᠰᠤ` (_yosu_) — wiktionary — “customs, traditions, etiquette, legislation, habit, formality”
- **үлээх** — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D0%BB%D1%8D%D1%8D%D1%85#Mongolian)
  - `ᠦᠯᠡᠭᠡᠬᠦ` (_uleeh_) — wmk-import — _unlabeled_
  - `ᠦᠯᠢᠶᠡᠬᠦ` (_üliyekü_) — wiktionary — “to blow (of persons, wind)”
- **үтрээ** — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D1%82%D1%80%D1%8D%D1%8D#Mongolian)
  - `ᠦᠲᠦᠷᠢᠶ᠎ᠡ` (_utree_) — wmk-import — _unlabeled_
  - `ᠦᠲᠦᠷᠦᠭᠡ` (_ütürüge_) — wiktionary — “vagina”
- **үүр** — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D2%AF%D1%80#Mongolian)
  - `ᠦᠦᠷ` (_uur_) — wmk-import — _unlabeled_
  - `ᠡᠭᠦᠷ` (_egür_) — wiktionary — “nest”
- **үүргэвч** — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D2%AF%D1%80%D0%B3%D1%8D%D0%B2%D1%87#Mongolian)
  - `ᠡᠭᠦᠷᠭᠡᠪᠡᠴᠦ` (_uurgevch_) — wmk-import — _unlabeled_
  - `ᠡᠭᠦᠷᠭᠡᠪᠴᠢ` (_egürgebči_) — wiktionary — “backpack”
- **өвөөлж** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%B2%D3%A9%D3%A9%D0%BB%D0%B6#Mongolian)
  - `ᠥᠪᠥᠭᠡᠯᠵᠢ` (_uvuulj_) — wmk-import — _unlabeled_
  - `ᠡᠣ᠊᠊ᠢ᠊ᠪᠤᠭᠡ᠊ᠯ᠊ᠵ᠊ᠢ` (_eo--i-buɣe-l-ǰ-i_) — wiktionary — “hoopoe”
- **өглөө** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%B3%D0%BB%D3%A9%D3%A9#Mongolian)
  - `ᠥᠷᠯᠥᠭᠡ` (_ugluu_) — wmk-import — _unlabeled_
  - `ᠥᠷᠯᠦᠭᠡ` (_örlüge_) — wiktionary — “morning”
- **өд** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%B4#Mongolian)
  - `ᠥᠳᠥ` (_ud_) — wmk-import — _unlabeled_
  - `ᠥᠳᠦ` (_ödü_) — wiktionary — “feather”
- **өлгөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BB%D0%B3%D3%A9%D1%85#Mongolian)
  - `ᠡᠯᠭᠥᠬᠦ` (_ulguh_) — wmk-import — _unlabeled_
  - `ᠥᠯᠢᠭᠡᠬᠦ` (_öligekü_) — wiktionary — “to hang, to suspend”
- **өлсгөлөн** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BB%D1%81%D0%B3%D3%A9%D0%BB%D3%A9%D0%BD#Mongolian)
  - `ᠥᠯᠥᠰᠬᠦᠯᠡᠩ` (_ulsgulun_) — wmk-import — _unlabeled_
  - `ᠥᠯᠦᠰᠬᠦᠯᠡᠩ` (_ölüsküleng_) — wiktionary — “hunger”
- **өлсөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BB%D1%81%D3%A9%D1%85#Mongolian)
  - `ᠥᠯᠥᠰᠬᠦ` (_ulsuh_) — wmk-import — _unlabeled_
  - `ᠥᠯᠦᠰᠬᠦ` (_ölüskü_) — wiktionary — “to be hungry”
- **өлөн** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BB%D3%A9%D0%BD#Mongolian)
  - `ᠥᠯᠥᠨ` (_ulun_) — wmk-import — _unlabeled_
  - `ᠥᠯᠦᠨ` (_ölün_) — wiktionary — “hungry”
- **өмд** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BC%D0%B4#Mongolian)
  - `ᠥᠮᠥᠳᠥ` (_umd_) — wmk-import — _unlabeled_
  - `ᠥᠮᠦᠳᠦ` (_ömüdü_) — wiktionary — “breeches, pantaloon, pants, slacks, trousers”
- **өмсөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BC%D1%81%D3%A9%D1%85#Mongolian)
  - `ᠡᠮᠥᠰᠬᠦ` (_umsuh_) — wmk-import — _unlabeled_
  - `ᠡᠮᠦᠰᠬᠦ` (_emüskü_) — wiktionary — “to wear, put on (clothes).”
- **өнцөг** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BD%D1%86%D3%A9%D0%B3#Mongolian)
  - `ᠥᠨᠴᠥᠭ` (_untsug_) — wmk-import — _unlabeled_
  - `ᠥᠨᠴᠦᠭ` (_önčüg_) — wiktionary — “angle”
- **өнчин** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BD%D1%87%D0%B8%D0%BD#Mongolian)
  - `ᠥᠨᠥᠴᠢᠨ` (_unchin_) — wmk-import — _unlabeled_
  - `ᠥᠨᠦᠴᠢᠨ` (_önüčin_) — wiktionary — “orphan (a person or an animal whose parents have died or are otherwise…”
- **өр** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%80#Mongolian)
  - `ᠥᠷᠥ` (_ur_) — wmk-import — _unlabeled_
  - `ᠥᠷᠢ` (_öri_) — wiktionary — “debt”
- **өргөдөл** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%80%D0%B3%D3%A9%D0%B4%D3%A9%D0%BB#Mongolian)
  - `ᠡᠷᠭᠦᠳᠡᠯ` (_urgudul_) — wmk-import — _unlabeled_
  - `ᠡᠷᠭᠤᠳᠡᠯ` (_erɣudel_) — wiktionary — “application, request, claim, petition”
- **өрөм** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%80%D3%A9%D0%BC#Mongolian)
  - `ᠥᠷᠥᠮ᠎ᠡ` (_urum_) — wmk-import — _unlabeled_
  - `ᠥᠷᠦᠮ᠎ᠡ` (_örüm-e_) — wiktionary — “clotted cream (from boiled milk)”
  - `ᠥᠷᠦᠮ` (_örüm_) — wiktionary — “drill”
- **өрөө** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%80%D3%A9%D3%A9#Mongolian)
  - `ᠥᠷᠥᠭᠡ` (_uruu_) — wmk-import — _unlabeled_
  - `ᠥᠷᠦᠭᠡ` (_örüge_) — wiktionary — “room”
  - `ᠡᠷᠦᠭᠡ` (_erüge_) — wiktionary — “room”
- **өт** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%82#Mongolian)
  - `ᠥᠲᠥ` (_ut_) — wmk-import — _unlabeled_
  - `ᠥᠲᠦ` (_ötü_) — wiktionary — “worm, maggot”
- **өчигдөр** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%87%D0%B8%D0%B3%D0%B4%D3%A9%D1%80#Mongolian)
  - `ᠥᠴᠥᠭᠡᠳᠦᠷ` (_uchigdur_) — wmk-import — _unlabeled_
  - `ᠥᠴᠦᠭᠡᠳᠦᠷ` (_öčügedür_) — wiktionary — “yesterday”
- **өчүүхэн** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D1%87%D2%AF%D2%AF%D1%85%D1%8D%D0%BD#Mongolian)
  - `ᠥᠴᠥᠬᠡᠨ` (_uchuuhen_) — wmk-import — _unlabeled_
  - `ᠥᠴᠦᠬᠡᠨ` (_öčüken_) — wiktionary — “tiny, little”
- **өөрчлөх** — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D3%A9%D1%80%D1%87%D0%BB%D3%A9%D1%85#Mongolian)
  - `ᠥᠪᠡᠷᠡᠴᠢᠯᠡᠬᠦ` (_uurchluh_) — wmk-import — _unlabeled_
  - `ᠥᠭᠡᠷᠡᠴᠢᠯᠡᠬᠦ` (_ögerečilekü_) — wiktionary — “to alter, to transform”

### Forms that could not be imported automatically (33)

Each needs a human decision (the stated reason says why the machine refused):

- `-вч` — Wiktionary gives `ᠪᠴᠢ` — no English gloss to use as the required sense label — [Wiktionary](https://en.wiktionary.org/wiki/-%D0%B2%D1%87#Mongolian)
- `-лаг` — Wiktionary gives `ᠯᠢᠭ` — no English gloss to use as the required sense label — [Wiktionary](https://en.wiktionary.org/wiki/-%D0%BB%D0%B0%D0%B3#Mongolian)
- `-хай` — Wiktionary gives `ᠬᠠᠶ` — no English gloss to use as the required sense label — [Wiktionary](https://en.wiktionary.org/wiki/-%D1%85%D0%B0%D0%B9#Mongolian)
- `-цах` — Wiktionary gives `ᠴᠠᠬᠤ` — no English gloss to use as the required sense label — [Wiktionary](https://en.wiktionary.org/wiki/-%D1%86%D0%B0%D1%85#Mongolian)
- `авд` — Wiktionary gives `ᠠᠪᠠ ᠳᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B2%D0%B4#Mongolian)
- `аймгийн` — Wiktionary gives `ᠠᠶ᠋ᠢᠮᠠᠭ ᠤᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B9%D0%BC%D0%B3%D0%B8%D0%B9%D0%BD#Mongolian)
- `анхны` — Wiktionary gives `ᠠᠩᠬᠠᠨ ᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BD%D1%85%D0%BD%D1%8B#Mongolian)
- `африкаанс` — Wiktionary gives `ᠠᠹᠷᠢᠺᠠ ᠪᠠᠨᠨᠰ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%84%D1%80%D0%B8%D0%BA%D0%B0%D0%B0%D0%BD%D1%81#Mongolian)
- `булгийн` — Wiktionary gives `ᠪᠤᠯᠠᠭ ᠤᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%BB%D0%B3%D0%B8%D0%B9%D0%BD#Mongolian)
- `дэлхийн` — Wiktionary gives `ᠳᠡᠯᠡᠬᠡᠢ ᠢᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D1%8D%D0%BB%D1%85%D0%B8%D0%B9%D0%BD#Mongolian)
- `заримдаа` — Wiktionary gives `ᠵᠠᠷᠢᠮ ᠳᠠᠭᠠᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%B0%D1%80%D0%B8%D0%BC%D0%B4%D0%B0%D0%B0#Mongolian)
- `зоригоор` — Wiktionary gives `ᠵᠣᠷᠢᠭ ᠢᠶᠠᠷ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D0%BE%D1%80%D0%B8%D0%B3%D0%BE%D0%BE%D1%80#Mongolian)
- `кинотеатр` — Wiktionary gives `ᠻᠢᠨᠣ ᠲᠢᠶᠠᠲ᠋ᠷ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BA%D0%B8%D0%BD%D0%BE%D1%82%D0%B5%D0%B0%D1%82%D1%80#Mongolian)
- `манайх` — Wiktionary gives `ᠮᠠᠨ ᠤ ᠬᠢ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D0%BD%D0%B0%D0%B9%D1%85#Mongolian)
- `монголчуудаас` — Wiktionary gives `ᠮᠣᠩᠭᠣᠯᠴᠤᠳ ᠠᠴᠠ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%87%D1%83%D1%83%D0%B4%D0%B0%D0%B0%D1%81#Mongolian)
- `монголчуудад` — Wiktionary gives `ᠮᠣᠩᠭᠣᠯᠴᠤᠳ ᠳ᠋ᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%87%D1%83%D1%83%D0%B4%D0%B0%D0%B4#Mongolian)
- `монголчуудтай` — Wiktionary gives `ᠮᠣᠩᠭᠣᠯᠴᠤᠳ ᠲᠠᠢ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%87%D1%83%D1%83%D0%B4%D1%82%D0%B0%D0%B9#Mongolian)
- `монголчуудыг` — Wiktionary gives `ᠮᠣᠩᠭᠣᠯᠴᠤᠳ ᠢ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%87%D1%83%D1%83%D0%B4%D1%8B%D0%B3#Mongolian)
- `монголчуудын` — Wiktionary gives `ᠮᠣᠩᠭᠣᠯᠴᠤᠳ ᠤᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%87%D1%83%D1%83%D0%B4%D1%8B%D0%BD#Mongolian)
- `онд` — Wiktionary gives `ᠣᠨ ᠳᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD%D0%B4#Mongolian)
- `оны` — Wiktionary gives `ᠣᠨ ᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD%D1%8B#Mongolian)
- `сарын` — Wiktionary gives `ᠰᠠᠷ᠎ᠠ ᠶᠢᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D1%80%D1%8B%D0%BD#Mongolian)
- `таны` — Wiktionary gives `ᠲᠠᠨ ᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%BD%D1%8B#Mongolian)
- `тухайд` — Wiktionary gives `ᠲᠤᠬᠠᠢ ᠳᠤ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D1%85%D0%B0%D0%B9%D0%B4#Mongolian)
- `тэдний` — Wiktionary gives `ᠲᠡᠳᠡᠨ ᠦ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%B4%D0%BD%D0%B8%D0%B9#Mongolian)
- `түүний` — Wiktionary gives `ᠲᠡᠭᠦᠨ ᠦ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D2%AF%D2%AF%D0%BD%D0%B8%D0%B9#Mongolian)
- `түүнийх` — Wiktionary gives `ᠲᠡᠭᠦᠨ ᠦ ᠬᠢ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D2%AF%D2%AF%D0%BD%D0%B8%D0%B9%D1%85#Mongolian)
- `төстэй` — Wiktionary gives `ᠲᠥᠰ ᠲᠡᠢ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D3%A9%D1%81%D1%82%D1%8D%D0%B9#Mongolian)
- `хөлбөмбөг` — Wiktionary gives `ᠬᠥᠯ ᠪᠥᠮᠪᠦᠭᠡ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%BB%D0%B1%D3%A9%D0%BC%D0%B1%D3%A9%D0%B3#Mongolian)
- `эмээ` — Wiktionary gives `ᠡᠮ᠎ᠡ ᠪᠡᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%BC%D1%8D%D1%8D#Mongolian)
- `энгийн` — Wiktionary gives `ᠡᠩ ᠤᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%BD%D0%B3%D0%B8%D0%B9%D0%BD#Mongolian)
- `үгийн` — Wiktionary gives `ᠦᠭᠡ ᠢᠨ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D0%B3%D0%B8%D0%B9%D0%BD#Mongolian)
- `үүний` — Wiktionary gives `ᠡᠭᠦᠨ ᠦ` — contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D2%AF%D0%BD%D0%B8%D0%B9#Mongolian)

### Proper names queued for names.json (90)

`names.json` is the 100%-human-verified tier, so nothing is auto-imported. These Wiktionary name entries are suggestions for reviewers:

- **Австрали** — `ᠠᠦ᠋ᠰᠲ᠋ᠷᠠᠯᠢᠶ᠎ᠠ` — “Australia (a country consisting of a main island, the island of Tasmania and…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%B2%D1%81%D1%82%D1%80%D0%B0%D0%BB%D0%B8#Mongolian)
- **Австри** — `ᠠᠦ᠋ᠰᠲ᠋ᠷᠢ` — “Austria (a country in Central Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%B2%D1%81%D1%82%D1%80%D0%B8#Mongolian)
- **Албани** — `ᠠᠯᠪᠠᠨ᠋ᠢ` — “Albania (a country in Southeastern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%BB%D0%B1%D0%B0%D0%BD%D0%B8#Mongolian)
- **Алжир** — `ᠠᠯᠵᠢᠷ` — “Algeria (a country in North Africa)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%BB%D0%B6%D0%B8%D1%80#Mongolian)
- **Алтай** — `ᠠᠯᠲᠠᠢ` — “Altai (a city, the administrative center of Govi-Altai Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%BB%D1%82%D0%B0%D0%B9#Mongolian)
- **Андорра** — `ᠠᠨᠳᠣᠷᠷᠠ` — “Andorra (a microstate in Southern Europe, between Spain and France)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D0%BD%D0%B4%D0%BE%D1%80%D1%80%D0%B0#Mongolian)
- **Арвайхээр** — `ᠠᠷᠪᠠᠢᠬᠡᠭᠡᠷ` — “Arvaikheer (a city, the administrative center of Övörkhangai Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D1%80%D0%B2%D0%B0%D0%B9%D1%85%D1%8D%D1%8D%D1%80#Mongolian)
- **Аргентин** — `ᠠᠷᠭᠧᠨ᠋ᠲ᠋ᠢᠨ` — “Argentina (a country in South America)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D1%80%D0%B3%D0%B5%D0%BD%D1%82%D0%B8%D0%BD#Mongolian)
- **Армен** — `ᠠᠷᠮᠧᠨ` — “Armenia (a country in the South Caucasus region of Asia, sometimes considered…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D1%80%D0%BC%D0%B5%D0%BD#Mongolian)
- **Афганистан** — `ᠠᠹᠭᠠᠨᠢᠰᠲ᠋ᠠᠨ` — “Afghanistan (a landlocked country between Central Asia and South Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%90%D1%84%D0%B3%D0%B0%D0%BD%D0%B8%D1%81%D1%82%D0%B0%D0%BD#Mongolian)
- **Бельги** — `ᠪᠧᠯᠭᠢ` — “Belgium (a country in Western Europe that has borders with the Netherlands,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%91%D0%B5%D0%BB%D1%8C%D0%B3%D0%B8#Mongolian)
- **Бразил** — `ᠪᠷᠠᠽᠢᠯ` — “Brazil (a large Portuguese-speaking country in South America)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%91%D1%80%D0%B0%D0%B7%D0%B8%D0%BB#Mongolian)
- **Булган** — `ᠪᠤᠯᠠᠭᠠᠨ` — “Bulgan (a city, administrative center, and province of Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%91%D1%83%D0%BB%D0%B3%D0%B0%D0%BD#Mongolian)
- **Бутан** — `ᠪᠤᠲᠤᠩ` — “Bhutan (a country in South Asia, in the Himalayas)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%91%D1%83%D1%82%D0%B0%D0%BD#Mongolian)
- **Бэлгүдэй** — `ᠪᠡᠯᠭᠦᠲᠡᠢ` — “Belgutei, a male given name” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%91%D1%8D%D0%BB%D0%B3%D2%AF%D0%B4%D1%8D%D0%B9#Mongolian)
- **Говь** — `ᠭᠣᠪᠢ` — “Gobi Desert (a desert in northern China and southern Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%93%D0%BE%D0%B2%D1%8C#Mongolian)
- **Голланд** — `ᠾᠣᠯᠯᠠᠨᠳ᠋` — “Holland (a historical province of the Netherlands)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%93%D0%BE%D0%BB%D0%BB%D0%B0%D0%BD%D0%B4#Mongolian)
- **Грек** — `ᠭᠷᠧᠻ` — “Greece (a country in Southeastern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%93%D1%80%D0%B5%D0%BA#Mongolian)
- **Гуулин** — `ᠭᠠᠤᠯᠢᠨ` — “a settlement in Govi-Altai Province” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%93%D1%83%D1%83%D0%BB%D0%B8%D0%BD#Mongolian)
- **Гүрж** — `ᠭᠦᠷᠵᠢ` — “Georgia (a transcontinental country in the Caucasus region of Europe and Asia,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%93%D2%AF%D1%80%D0%B6#Mongolian)
- **Дани** — `ᠳ᠋ᠠᠨ᠋ᠢ` — “Denmark (a country in Northern Europe; official name: Данийн Хаант Улс (Daniin…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%94%D0%B0%D0%BD%D0%B8#Mongolian)
- **Дархан** — `ᠳᠠᠷᠬᠠᠨ` — “Darkhan (a city, the administrative center of Darkhan-Uul Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%94%D0%B0%D1%80%D1%85%D0%B0%D0%BD#Mongolian)
- **Евровидение** — `ᠶᠧᠦᠷᠣᠸᠢᠳᠧᠨᠢᠶᠧ` — “Eurovision” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%95%D0%B2%D1%80%D0%BE%D0%B2%D0%B8%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5#Mongolian)
- **Египет** — `ᠶᠧᠭᠢᠫᠧᠲ᠋` — “Egypt (a country in North Africa and West Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%95%D0%B3%D0%B8%D0%BF%D0%B5%D1%82#Mongolian)
- **Желон** — `ᠵᠧᠯᠥᠨ` — “Geelong (a city in Victoria, Australia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%96%D0%B5%D0%BB%D0%BE%D0%BD#Mongolian)
- **Женев** — `ᠵᠧᠨᠧᠸ` — “Geneva (a city in Switzerland)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%96%D0%B5%D0%BD%D0%B5%D0%B2#Mongolian)
- **Зуунмод** — `ᠵᠠᠭᠤᠨᠮᠣᠳᠤ` — “Zuunmod (a city, the administrative center of Töv Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%97%D1%83%D1%83%D0%BD%D0%BC%D0%BE%D0%B4#Mongolian)
- **Зүүнгар** — `ᠵᠦ᠋ᠩᠭ᠋ᠠᠷ` · `ᠵᠡᠭᠦᠨᠭᠠᠷ` — “Dzungaria (a region in Inner Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%97%D2%AF%D2%AF%D0%BD%D0%B3%D0%B0%D1%80#Mongolian)
- **Зүүнхараа** — `ᠵᠡᠭᠦᠨ ᠢᠶᠠᠷ ᠢᠶᠠᠨ` · ⚠ `ᠵᠡᠭᠦᠨ ᠢᠶᠠᠷ ᠢᠶᠠᠨ` (contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md) — “Züünkharaa (a city in Selenge Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%97%D2%AF%D2%AF%D0%BD%D1%85%D0%B0%D1%80%D0%B0%D0%B0#Mongolian)
- **Израиль** — `ᠢᠰᠷᠠᠶᠢᠯ` — “Israel (a country in Western Asia in the Middle East, at the eastern shore of…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D0%B7%D1%80%D0%B0%D0%B8%D0%BB%D1%8C#Mongolian)
- **Израйль** — `ᠢᠰᠷᠠᠢᠯ` — “alternative form of Израиль (Izrailʹ): Israel (a country in Western Asia in…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D0%B7%D1%80%D0%B0%D0%B9%D0%BB%D1%8C#Mongolian)
- **Индонез** — `ᠢᠨᠳ᠋ᠣᠨᠧᠽ` — “Indonesia (a country and archipelago in maritime Southeast Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D0%BD%D0%B4%D0%BE%D0%BD%D0%B5%D0%B7#Mongolian)
- **Ирак** — `ᠢᠷᠠᠺ` — “Iraq (a country in West Asia in the Middle East)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D1%80%D0%B0%D0%BA#Mongolian)
- **Иран** — `ᠢᠷᠠᠨ` — “Iran (a country in West Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D1%80%D0%B0%D0%BD#Mongolian)
- **Испани** — `ᠢᠰᠫᠠᠨ᠋ᠢ` — “Spain (a country in Southern Europe, including most of the Iberian peninsula)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%98%D1%81%D0%BF%D0%B0%D0%BD%D0%B8#Mongolian)
- **Камбож** — `ᠺᠠᠮᠪᠤᠵᠠ` — “Cambodia (a country in Southeast Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9A%D0%B0%D0%BC%D0%B1%D0%BE%D0%B6#Mongolian)
- **Канад** — `ᠻᠠᠨᠠᠳ` — “Canada (a country in North America)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9A%D0%B0%D0%BD%D0%B0%D0%B4#Mongolian)
- **Киргиз** — `ᠺᠢᠷᠭᠢᠽ` — “Kyrgyzstan (a country in Central Asia, bordering on Kazakhstan, Uzbekistan,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9A%D0%B8%D1%80%D0%B3%D0%B8%D0%B7#Mongolian)
- **Лаос** — `ᠯᠠᠣᠰ` — “Laos (a country in Southeast Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9B%D0%B0%D0%BE%D1%81#Mongolian)
- **Латви** — `ᠯᠠᠲ᠋ᠸᠢ` — “Latvia (a country in northeastern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9B%D0%B0%D1%82%D0%B2%D0%B8#Mongolian)
- **Малайз** — `ᠮᠠᠯᠠᠶ᠋ᠢᠽ` — “Malaysia (a country in Southeast Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B0%D0%BB%D0%B0%D0%B9%D0%B7#Mongolian)
- **Мандалговь** — `ᠮᠠᠨᠳᠠᠯᠭᠣᠪᠢ` — “Mandalgovi (a city, the administrative center of Dundgovi Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B0%D0%BD%D0%B4%D0%B0%D0%BB%D0%B3%D0%BE%D0%B2%D1%8C#Mongolian)
- **Манж** — `ᠮᠠᠨᠵᠤ` (_manǰu_) — “Manchuria (a geographic region of China)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B0%D0%BD%D0%B6#Mongolian)
- **Манжуур** — `ᠮᠠᠨᠵᠤᠤᠷ` — “Manchuria (a region of northeastern China comprising the three provinces of…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B0%D0%BD%D0%B6%D1%83%D1%83%D1%80#Mongolian)
- **Мексик** — `ᠮᠧᠻᠰᠢᠻᠣ` — “Mexico (a country in North America)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B5%D0%BA%D1%81%D0%B8%D0%BA#Mongolian)
- **Мисир** — `ᠮᠢᠰᠢᠷ᠋` — “Egypt (a country in North Africa and West Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%B8%D1%81%D0%B8%D1%80#Mongolian)
- **Москва** — `ᠮᠣᠰᠻᠸᠠ` — “Moscow (a federal city, the capital of Russia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0#Mongolian)
- **Мөрөн** — `ᠮᠥᠷᠡᠨ` — “Mörön (a city, the administrative center of Khövsgöl Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9C%D3%A9%D1%80%D3%A9%D0%BD#Mongolian)
- **Налайх** — `ᠨᠠᠯᠠᠢᠬᠤ` — “Nalaikh (a district of Ulaanbaatar, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9D%D0%B0%D0%BB%D0%B0%D0%B9%D1%85#Mongolian)
- **Непал** — `ᠨᠧᠫᠠᠯ` — “Nepal (a country in South Asia, located between China and India)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9D%D0%B5%D0%BF%D0%B0%D0%BB#Mongolian)
- **Нидерланд** — `ᠨᠢᠳ᠋ᠧᠷᠯᠠᠨᠳ᠋` — “Netherlands (the main constituent country of the Kingdom of the Netherlands,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9D%D0%B8%D0%B4%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B4#Mongolian)
- **Охайо** — `ᠣᠾᠠᠶᠣ` — “Ohio (a state of the United States)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9E%D1%85%D0%B0%D0%B9%D0%BE#Mongolian)
- **Пакистан** — `ᠫᠠᠺᠢᠰᠲ᠋ᠠᠨ` — “Pakistan (a country in South Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9F%D0%B0%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD#Mongolian)
- **Перс** — `ᠫᠧᠷᠰ` — “Persia” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9F%D0%B5%D1%80%D1%81#Mongolian)
- **Португал** — `ᠫᠣᠷᠲ᠋ᠦᠭᠠᠯ` — “Portugal (a country in Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%9F%D0%BE%D1%80%D1%82%D1%83%D0%B3%D0%B0%D0%BB#Mongolian)
- **Ром** — `ᠷᠣᠮᠠ` — “Rome (a major city, the capital of Italy and the Italian region of Lazio,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A0%D0%BE%D0%BC#Mongolian)
- **Сайншанд** — `ᠰᠠᠢᠨᠱᠠᠩᠳᠠ` — “Sainshand (a city, the administrative center of Dornogovi Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D0%B0%D0%B9%D0%BD%D1%88%D0%B0%D0%BD%D0%B4#Mongolian)
- **Сахалин** — `ᠰᠠᠬᠠᠯᠢᠨ` — “Sakhalin” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D0%B0%D1%85%D0%B0%D0%BB%D0%B8%D0%BD#Mongolian)
- **Сибирь** — `ᠰᠢᠪᠢᠷᠢ` — “Siberia (the region of Russia in Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D0%B8%D0%B1%D0%B8%D1%80%D1%8C#Mongolian)
- **Сири** — `ᠰᠢᠷᠢ` — “Syria (a country in West Asia in the Middle East)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D0%B8%D1%80%D0%B8#Mongolian)
- **Словени** — `ᠰᠯᠤᠸᠧᠨ᠋ᠢ` — “Slovenia (a country on the Balkan Peninsula in Central Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D0%BB%D0%BE%D0%B2%D0%B5%D0%BD%D0%B8#Mongolian)
- **Сүхбаатар** — `ᠰᠦᠬᠡᠪᠠᠭᠠᠲᠤᠷ` — “a male given name” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A1%D2%AF%D1%85%D0%B1%D0%B0%D0%B0%D1%82%D0%B0%D1%80#Mongolian)
- **Тегеран** — `ᠲ᠋ᠧᠾᠷᠠᠨ` — “alternative form of Техран (Texran, “Tehran”)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A2%D0%B5%D0%B3%D0%B5%D1%80%D0%B0%D0%BD#Mongolian)
- **Техран** — `ᠲ᠋ᠧᠾᠷᠠᠨ` — “Tehran (the capital and largest city of Iran)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A2%D0%B5%D1%85%D1%80%D0%B0%D0%BD#Mongolian)
- **Тулуй** — `ᠲᠥᠯᠦᠢ` — “Tolui (fourth son of Genghis Khan)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A2%D1%83%D0%BB%D1%83%D0%B9#Mongolian)
- **Украйн** — `ᠤᠻᠷᠠᠢᠨ` — “Ukraine (a country in Eastern Europe, bordering on the north shore of the…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A3%D0%BA%D1%80%D0%B0%D0%B9%D0%BD#Mongolian)
- **Улаангом** — `ᠤᠯᠠᠭᠠᠩᠭ᠋ᠣᠮ` — “Ulaangom (a city, the administrative center of Uvs Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A3%D0%BB%D0%B0%D0%B0%D0%BD%D0%B3%D0%BE%D0%BC#Mongolian)
- **Улаанцав** — `ᠤᠯᠠᠭᠠᠨᠴᠠᠪ` — “Ulanqab (a city in the Inner Mongolia autonomous region, China)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A3%D0%BB%D0%B0%D0%B0%D0%BD%D1%86%D0%B0%D0%B2#Mongolian)
- **Улиастай** — `ᠤᠯᠢᠶᠠᠰᠤᠲᠠᠢ` — “Uliastai (a city, the administrative center of Zavkhan Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A3%D0%BB%D0%B8%D0%B0%D1%81%D1%82%D0%B0%D0%B9#Mongolian)
- **Унгар** — `ᠦᠨᠭᠠᠷ` — “Hungary (a country in Central Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A3%D0%BD%D0%B3%D0%B0%D1%80#Mongolian)
- **Финланд** — `ᠹᠢᠨᠯᠠᠨᠳ᠋` — “Finland (a country in Northern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A4%D0%B8%D0%BD%D0%BB%D0%B0%D0%BD%D0%B4#Mongolian)
- **Финлянд** — `ᠹᠢᠨᠯᠠᠨᠳ᠋` — “Finland (a country in Northern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A4%D0%B8%D0%BD%D0%BB%D1%8F%D0%BD%D0%B4#Mongolian)
- **Хархорин** — `ᠬᠠᠷᠠᠬᠣᠷᠢᠨ` — “Kharkhorin (a city in Övörkhangai Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D0%B0%D1%80%D1%85%D0%BE%D1%80%D0%B8%D0%BD#Mongolian)
- **Хасаг** — `ᠬᠠᠰᠠᠭ` — “Kazakhstan (a country in Central Asia and Eastern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D0%B0%D1%81%D0%B0%D0%B3#Mongolian)
- **Хиргис** — `ᠬᠢᠷᠭᠢᠰ` — “Kyrgyzstan (a country in Central Asia, bordering on Kazakhstan, Uzbekistan,…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D0%B8%D1%80%D0%B3%D0%B8%D1%81#Mongolian)
- **Хорват** — `ᠾᠣᠷᠸᠠᠲ` — “Croatia (a country on the Balkan Peninsula in Southeastern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D0%BE%D1%80%D0%B2%D0%B0%D1%82#Mongolian)
- **Христос** — `ᠾᠷᠢᠰᠲ᠋ᠦᠰ` — “Christ” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D1%80%D0%B8%D1%81%D1%82%D0%BE%D1%81#Mongolian)
- **Хуацай** — `ᠬᠤᠸᠠᠴᠠᠢ` — “A Khori-Buryat clan” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D1%83%D0%B0%D1%86%D0%B0%D0%B9#Mongolian)
- **Хөхнуур** — ⚠ `ᠬᠥᠬᠡ ᠨᠠᠭᠤᠷ` (contains a plain space (U+0020) — written-apart units need the NNBSP policy in data/ENCODING.md) — “Qinghai (a province in northwestern China)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A5%D3%A9%D1%85%D0%BD%D1%83%D1%83%D1%80#Mongolian)
- **Цэцэрлэг** — `ᠴᠡᠴᠡᠷᠯᠢᠭ` — “Tsetserleg (a city, the administrative center of Arkhangai Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A6%D1%8D%D1%86%D1%8D%D1%80%D0%BB%D1%8D%D0%B3#Mongolian)
- **Чех** — `ᠴᠧᠬᠣ᠋` — “Czechia (a country in Central Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A7%D0%B5%D1%85#Mongolian)
- **Чойбалсан** — `ᠴᠣᠢᠪᠠᠯᠰᠠᠩ` — “a male given name” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A7%D0%BE%D0%B9%D0%B1%D0%B0%D0%BB%D1%81%D0%B0%D0%BD#Mongolian)
- **Чойр** — `ᠴᠣᠢᠷ` — “Choir (a city, the administrative center of Govisümber Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A7%D0%BE%D0%B9%D1%80#Mongolian)
- **Швед** — `ᠱᠸᠧᠳ᠋` — “Sweden (a country in Scandinavia in Northern Europe)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A8%D0%B2%D0%B5%D0%B4#Mongolian)
- **Швейцари** — `ᠱᠸᠢᠼᠠᠷᠢ` — “nonstandard form of Швейцар (Švejcar, “Switzerland”)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A8%D0%B2%D0%B5%D0%B9%D1%86%D0%B0%D1%80%D0%B8#Mongolian)
- **Шивэр** — `ᠱᠢᠪᠧᠷ` — “Siberia (the region of Russia in Asia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A8%D0%B8%D0%B2%D1%8D%D1%80#Mongolian)
- **Шиньжян** — `ᠰᠢᠨᠵᠢᠶᠠᠩ` — “Xinjiang (a Uyghur autonomous region of China, located in the sparsely…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%A8%D0%B8%D0%BD%D1%8C%D0%B6%D1%8F%D0%BD#Mongolian)
- **Эстон** — `ᠧᠰᠲ᠋ᠣᠨ` — “Estonia (a country in northeastern Europe, on the southeastern coast of the…” — [Wiktionary](https://en.wiktionary.org/wiki/%D0%AD%D1%81%D1%82%D0%BE%D0%BD#Mongolian)
- **Өлгий** — `ᠥᠯᠦᠭᠡᠢ` — “Ölgii (a city, the administrative center of Bayan-Ölgii Aimag, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A8%D0%BB%D0%B3%D0%B8%D0%B9#Mongolian)
- **Өндөрхаан** — `ᠥᠨᠳᠦᠷᠬᠠᠨ` — “Öndörkhaan (a city, the administrative center of Khentii Province, Mongolia)” — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A8%D0%BD%D0%B4%D3%A9%D1%80%D1%85%D0%B0%D0%B0%D0%BD#Mongolian)

### Classical Mongolian etymology suggestions (158 words, NOT imported)

These words have no Mongolian spelling on their Wiktionary headword line, but their etymology cites a Classical Mongolian form. Because монгол бичиг largely preserves classical orthography, the etymon is _usually_ the correct spelling — but not always (it may cover a different sense or predate modern script convention), so it is only a hint for reviewers, never imported. “= lexicon” / “≠ lexicon” compares code points against the current candidate(s).

- **аав** — etymology cites `ᠠᠪᠤ` (_abu_) — “dad” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B0%D0%B2#Mongolian)
- **авах** — etymology cites `ᠠᠪᠬᠤ` (_abqu_) — “to take, to grab, to seize” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B2%D0%B0%D1%85#Mongolian)
- **авга** — etymology cites `ᠠᠪᠠᠭ᠎ᠠ` (_abaɣ-a_) — “synonym of авга ах (avga ax, “paternal uncle”)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B2%D0%B3%D0%B0#Mongolian)
- **агаар** — etymology cites `ᠠᠭᠤᠷ` (_aɣur_) — “air” — ≠ lexicon: `ᠠᠭᠠᠷ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B3%D0%B0%D0%B0%D1%80#Mongolian)
- **агшин** — etymology cites `ᠭᠱᠠᠨ` (_ɣšan_) — “moment; instant” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B3%D1%88%D0%B8%D0%BD#Mongolian)
- **аймаг** — etymology cites `ᠠᠢᠮᠠᠭ` (_ayimaɣ, “tribe”_) — “tribe” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%B9%D0%BC%D0%B0%D0%B3#Mongolian)
- **алба** — etymology cites `ᠠᠯᠪᠠ` (_alba, “public affair”_) — “service, work, duty, job” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D0%B1%D0%B0#Mongolian)
- **албан** — etymology cites `ᠠᠯᠪᠠᠨ` (_alban, “public affair”_) — “ministerial, official” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D0%B1%D0%B0%D0%BD#Mongolian)
- **алт** — etymology cites `ᠠᠯᠲᠠ` (_alta_) — “gold” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D1%82#Mongolian)
- **алтан** — etymology cites `ᠠᠯᠲᠠᠨ` (_altan, “gold, golden”_) — “oblique of алт (alt, “gold”)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BB%D1%82%D0%B0%D0%BD#Mongolian)
- **амь** — etymology cites `ᠠᠮᠢ` (_ami, “breath; life”_) — “breath” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BC%D1%8C#Mongolian)
- **амьтан** — etymology cites `ᠠᠮᠢᠲᠠᠨ` (_amitan, “creature”_) — “creature” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D0%BC%D1%8C%D1%82%D0%B0%D0%BD#Mongolian)
- **ард** — etymology cites `ᠠᠷᠠᠳ` (_arad_) — “people; folk” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%80%D0%B4#Mongolian)
- **архи** — etymology cites `ᠠᠷᠢᠬᠢ` (_ariqi_) — “liquor” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%80%D1%85%D0%B8#Mongolian)
- **ах** — etymology cites `ᠠᠬ᠎ᠠ` (_aq-a_) — “older brother” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%85#Mongolian)
- **ахуй** — etymology cites `ᠠᠬᠤᠢ` (_aqui_) — “being, existence” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B0%D1%85%D1%83%D0%B9#Mongolian)
- **багш** — etymology cites `ᠪᠠᠭᠰᠢ` (_baɣsi, “scholar”_) — “teacher” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B3%D1%88#Mongolian)
- **байх** — etymology cites `ᠪᠠᠶ᠋ᠢᠬᠤ` (_bayiqu_) — “to be, have, appear, exist, keep, hold” — ≠ lexicon: `ᠪᠠᠢᠬᠤ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%B9%D1%85#Mongolian)
- **банди** — etymology cites `ᠪᠠᠨᠳᠢ` (_bandi_) — “disciple of a lama” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D0%BD%D0%B4%D0%B8#Mongolian)
- **бас** — etymology cites `ᠪᠠᠰᠠ` (_basa_) — “also, and, either, else, likewise, too, yet” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%81#Mongolian)
- **баян** — etymology cites `ᠪᠠᠶᠠᠨ` (_bayan_) — “rich, luxuriant, abundant, opulent, splendid, affluent, wealthy, prosperous” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%8F%D0%BD#Mongolian)
- **баярлах** — etymology cites `ᠪᠠᠶ᠋ᠠᠷᠯᠠᠬᠤ` (_bayarlaqu_) — “to be glad, happy” — ≠ lexicon: `ᠪᠠᠶᠠᠷᠯᠠᠬᠤ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B0%D1%8F%D1%80%D0%BB%D0%B0%D1%85#Mongolian)
- **би** — etymology cites `ᠪᠢ` (_bi_) — “The first-person singular pronoun, I” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B8#Mongolian)
- **бие** — etymology cites `ᠪᠡᠶ᠎ᠡ` (_bey-e_) — “body, physique, stature, figure, torso” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B8%D0%B5#Mongolian)
- **битгий** — etymology cites `ᠪᠢᠲᠡᠬᠡᠢ` (_bitekei_) — “Forms the negative of the imperative, prescriptive, precative, and concessive…” — ≠ lexicon: `ᠪᠢᠲᠡᠭᠡᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%B8%D1%82%D0%B3%D0%B8%D0%B9#Mongolian)
- **болд** — etymology cites `ᠪᠣᠯᠣᠳ` (_bolod, “steel”_) — “steel” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BB%D0%B4#Mongolian)
- **болох** — etymology cites `ᠪᠣᠯᠬᠤ` (_bolqu, “to become”_) — “to become” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BB%D0%BE%D1%85#Mongolian)
- **бомбо** — etymology cites `ᠪᠣᠮᠪᠤ` (_bombu_) — “a Taoist priest” — ≠ lexicon: `ᠪᠣᠮᠪᠣ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D0%BE%D0%BC%D0%B1%D0%BE#Mongolian)
- **будах** — etymology cites `ᠪᠤᠳᠤᠬᠤ` (_buduqu_) — “to paint” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%B4%D0%B0%D1%85#Mongolian)
- **будда** — etymology cites `ᠪᠤᠳ᠋ᠳ᠋ᠾᠠ` (_buddha_) — “buddha” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%B4%D0%B4%D0%B0#Mongolian)
- **буй** — etymology cites `ᠪᠤᠢ` (_bui_) — “The copula-existential used as a present participle.” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D0%B9#Mongolian)
- **буу** — etymology cites `ᠪᠤᠤ` (_buu, “musket”_) — “firearm” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D1%83#Mongolian)
- **буян** — etymology cites `ᠪᠤᠶ᠋ᠠᠨ` (_buyan_) — “virtue; goodness; moral excellence; merit” — ≠ lexicon: `ᠪᠤᠶᠠᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%83%D1%8F%D0%BD#Mongolian)
- **бэрх** — etymology cites `ᠪᠡᠷᠬᠡ` (_berke_) — “hard, arduous, severe” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%8D%D1%80%D1%85#Mongolian)
- **бямба** — etymology cites `ᠪᠢᠮᠪᠠ` (_bimba_) — “Saturday” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D1%8F%D0%BC%D0%B1%D0%B0#Mongolian)
- **бөгс** — etymology cites `ᠪᠥᠭᠰᠡ` (_bögse_) — “buttocks” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B1%D3%A9%D0%B3%D1%81#Mongolian)
- **ван** — etymology cites `ᠸᠠᠩ` (_wang_) — “king, prince” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B2%D0%B0%D0%BD#Mongolian)
- **газар** — etymology cites `ᠭᠠᠵᠠᠷ` (_ɣaǰar_) — “earth, ground, land” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D0%B7%D0%B0%D1%80#Mongolian)
- **гал** — etymology cites `ᠭᠠᠯ` (_ɣal_) — “fire” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D0%BB#Mongolian)
- **гарах** — etymology cites `ᠭᠠᠷᠬᠤ` (_ɣarqu, “to go out”_) — “to go out” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%B0%D1%80%D0%B0%D1%85#Mongolian)
- **гол** — etymology cites `ᠭᠣᠤᠯ` (_ɣoul_) — “centre, middle; core” — ≠ lexicon: `ᠭᠣᠣᠯ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D0%BE%D0%BB#Mongolian)
- **гэр** — etymology cites `ᠭᠡᠷ` (_ger_) — “yurt, ger” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D1%8D%D1%80#Mongolian)
- **гэх** — etymology cites `ᠬᠡᠮᠡᠬᠦ` (_kemekü_) — “to say, speak, call” — ≠ lexicon: `ᠭᠡᠬᠦ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D1%8D%D1%85#Mongolian)
- **гүнж** — etymology cites `ᠭᠦ᠋ᠩᠵᠦ` (_güngǰü_) — “princess (daughter of the emperor)” — ≠ lexicon: `ᠭᠦᠨᠵᠡ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D2%AF%D0%BD%D0%B6#Mongolian)
- **гүнжид** — etymology cites `ᠭᠦᠨᠵᠢᠳ` (_günǰid_) — “sesame” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B3%D2%AF%D0%BD%D0%B6%D0%B8%D0%B4#Mongolian)
- **давс** — etymology cites `ᠳᠠᠪᠤᠰᠤ` (_dabusu_) — “salt” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B0%D0%B2%D1%81#Mongolian)
- **дайн** — etymology cites `ᠳᠠᠶ᠋ᠢᠨ` (_dayin_) — “war” — ≠ lexicon: `ᠳᠠᠢᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B0%D0%B9%D0%BD#Mongolian)
- **дарс** — etymology cites `ᠳᠠᠷᠠᠰᠤ` (_darasu, “rice wine”_) — “rice wine” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D0%B0%D1%80%D1%81#Mongolian)
- **дөрөв** — etymology cites `ᠳᠥ᠋ᠷᠪᠡᠨ` (_dörbe_) — “four” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B4%D3%A9%D1%80%D3%A9%D0%B2#Mongolian)
- **живаа** — etymology cites `ᠵᠢᠸ᠎ᠠ` (_ǰiē-a, “ten million”_) — “ten million, crore” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B6%D0%B8%D0%B2%D0%B0%D0%B0#Mongolian)
- **зуу** — etymology cites `ᠵᠠᠭᠤᠨ` (_ǰaɣun_) — “one hundred” — ≠ lexicon: `ᠵᠤᠤ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%83%D1%83#Mongolian)
- **зэс** — etymology cites `ᠵᠡᠰ᠋` (_ǰes_) — “copper” — ≠ lexicon: `ᠵᠡᠰ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D1%8D%D1%81#Mongolian)
- **зүүн** — etymology cites `ᠵᠡᠭᠦᠨ` (_ǰegün /⁠ǰüün⁠/, “left”_) — “left” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D2%AF%D0%BD#Mongolian)
- **зүүнгар** — etymology cites `ᠵᠡᠭᠦᠨ ᠭᠠᠷ` — “the Dzungars (Oirat tribe)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B7%D2%AF%D2%AF%D0%BD%D0%B3%D0%B0%D1%80#Mongolian)
- **иргэн** — etymology cites `ᠢᠷᠭᠡᠨ` (_irgen_) — “citizen” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%B8%D1%80%D0%B3%D1%8D%D0%BD#Mongolian)
- **лам** — etymology cites `ᠯᠠᠮ᠎ᠠ` (_lam-a_) — “lama” — ≠ lexicon: `ᠯᠠᠮᠠ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BB%D0%B0%D0%BC#Mongolian)
- **луу** — etymology cites `ᠯᠤᠤ` (_luu_) — “a dragon” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BB%D1%83%D1%83#Mongolian)
- **маань** — etymology cites `ᠮᠠᠨᠤ` (_manu, “our”_) — “Marks the first-person plural possession.” — ≠ lexicon: `ᠮᠠᠨᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D0%B0%D0%BD%D1%8C#Mongolian)
- **манай** — etymology cites `ᠮᠠᠨ ᠤ` (_man-u_) — “genitive of бид (bid, “we”, first-person plural pronoun), our” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D0%BD%D0%B0%D0%B9#Mongolian)
- **манж** — etymology cites `ᠮᠠᠨᠵᠤ` (_manǰu_) — “Manchu (people or person)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B0%D0%BD%D0%B6#Mongolian)
- **минь** — etymology cites `ᠮᠢᠨᠤ` (_minu, “my”_) — “Marks the first-person singular possession.” — ≠ lexicon: `ᠮᠢᠨᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%B8%D0%BD%D1%8C#Mongolian)
- **мод** — etymology cites `ᠮᠣᠳᠤ` (_modu_) — “tree (large woody plant)” — ≠ lexicon: `ᠮᠣᠳᠣ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%B4#Mongolian)
- **монгол** — etymology cites `ᠮᠣᠩᠭᠣᠯ` (_mongɣol_) — “a Mongol, a Mongolian (person)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB#Mongolian)
- **морь** — etymology cites `ᠮᠣᠷᠢ` (_mori_) — “horse” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D0%BE%D1%80%D1%8C#Mongolian)
- **муж** — etymology cites `ᠮᠤᠵᠢ` (_muǰi_) — “province (administrative division)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D1%83%D0%B6#Mongolian)
- **мэт** — etymology cites `ᠮᠡᠲᠦ` (_metü_) — “as, like” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D1%8D%D1%82#Mongolian)
- **мянга** — etymology cites `ᠮᠢᠩᠭ᠎ᠠ` (_mingɣ-a_) — “thousand” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D1%8F%D0%BD%D0%B3%D0%B0#Mongolian)
- **мөндөр** — etymology cites `ᠮᠥᠨᠳᠦᠷ` (_möndür_) — “hail” — ≠ lexicon: `ᠮᠥᠨᠳᠥᠷ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D0%BD%D0%B4%D3%A9%D1%80#Mongolian)
- **мөрөн** — etymology cites `ᠮᠥᠷᠡᠨ` (_mören, “big river”_) — “a big river flowing into a big lake or a sea” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BC%D3%A9%D1%80%D3%A9%D0%BD#Mongolian)
- **нарс** — etymology cites `ᠨᠠᠷᠠᠰᠤ` (_narasu_) — “deal, soft pine plank” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D1%80%D1%81#Mongolian)
- **нас** — etymology cites `ᠨᠠᠰᠤ` (_nasu_) — “age, time, year, life, lifetime” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D1%81#Mongolian)
- **ная** — etymology cites `ᠨᠠᠶ᠋ᠠ` (_naya, “eighty”_) — “eighty” — ≠ lexicon: `ᠨᠠᠶᠠ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B0%D1%8F#Mongolian)
- **нисэх** — etymology cites `ᠨᠢᠰᠬᠦ` (_niskü_) — “to fly” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%B8%D1%81%D1%8D%D1%85#Mongolian)
- **ном** — etymology cites `ᠨᠣᠮ` (_nom_) — “book” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D0%BC#Mongolian)
- **номхон** — etymology cites `ᠨᠣᠮᠤᠬᠠᠨ` (_nomuqan, “tame; mild”_) — “quiet” — ≠ lexicon: `ᠨᠣᠮᠣᠬᠠᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D0%BC%D1%85%D0%BE%D0%BD#Mongolian)
- **норов** — etymology cites `ᠨᠣᠷᠪᠤ` (_norbu, “gem, jewel”_) — “gem, jewel” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D1%80%D0%BE%D0%B2#Mongolian)
- **нохой** — etymology cites `ᠨᠣᠬᠠᠢ` (_noqai_) — “dog” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D1%85%D0%BE%D0%B9#Mongolian)
- **ноён** — etymology cites `ᠨᠣᠶ᠋ᠠᠨ` (_noyan_) — “officer, official” — ≠ lexicon: `ᠨᠣᠶᠠᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D0%BE%D1%91%D0%BD#Mongolian)
- **нутаг** — etymology cites `ᠨᠤᠲᠤᠭ` (_nutuɣ_) — “homeland, birthplace, hometown, country” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D1%83%D1%82%D0%B0%D0%B3#Mongolian)
- **нь** — etymology cites `ᠨᠢ` (_ni_) — “Third-person possessive particle” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D1%8C#Mongolian)
- **нэг** — etymology cites `ᠨᠢᠭᠡ` (_nige_) — “one” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D1%8D%D0%B3#Mongolian)
- **нэр** — etymology cites `ᠨᠡᠷ᠎ᠡ` (_ner-e_) — “name” — ≠ lexicon: `ᠨᠡᠷᠡ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D1%8D%D1%80#Mongolian)
- **нөхөр** — etymology cites `ᠨᠥᠬᠦᠷ` (_nökür_) — “companion” — ≠ lexicon: `ᠨᠥᠬᠥᠷ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BD%D3%A9%D1%85%D3%A9%D1%80#Mongolian)
- **овог** — etymology cites `ᠣᠪᠤᠭ` (_obuɣ_) — “clan” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B2%D0%BE%D0%B3#Mongolian)
- **од** — etymology cites `ᠣᠳᠤᠨ` (_odun_) — “star” — ≠ lexicon: `ᠣᠳᠣ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B4#Mongolian)
- **ойрад** — etymology cites `ᠣᠢᠷᠠᠳ` (_oyirad_) — “the Oirats (Mongolic people)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%B9%D1%80%D0%B0%D0%B4#Mongolian)
- **олон** — etymology cites `ᠣᠯᠠᠨ` (_olan_) — “many, much” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BB%D0%BE%D0%BD#Mongolian)
- **он** — etymology cites `ᠣᠨ` (_on, “year”_) — “year” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD#Mongolian)
- **онгоц** — etymology cites `ᠣᠩᠭᠣᠴᠠᠰ` (_ongɣočas_) — “trough (container for watering or feeding animals)” — ≠ lexicon: `ᠣᠩᠭᠣᠴᠠ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D0%BD%D0%B3%D0%BE%D1%86#Mongolian)
- **орд** — etymology cites `ᠣᠷᠳᠣ` (_ordo_) — “palace; mansion” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D0%B4#Mongolian)
- **орос** — etymology cites `ᠣᠷᠤᠰ᠋` (_orus_) — “the Russians (people)” — ≠ lexicon: `ᠣᠷᠣᠰ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D0%BE%D1%81#Mongolian)
- **орох** — etymology cites `ᠣᠷᠣᠬᠤ` (_oroqu_) — “to enter, to go in” — ≠ lexicon: `ᠤᠷᠤᠬᠤ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D0%BE%D1%85#Mongolian)
- **оршвой** — etymology cites `ᠣᠷᠣᠰᠢᠪᠠᠢ` (_orosibai_) — “archaic ambivalent terminative of орших (oršix)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BE%D1%80%D1%88%D0%B2%D0%BE%D0%B9#Mongolian)
- **пүрэв** — etymology cites `ᠹᠦᠷᠪᠦ` (_phürbü_) — “Thursday” — ≠ lexicon: `ᠫᠦᠷᠪᠦ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D0%BF%D2%AF%D1%80%D1%8D%D0%B2#Mongolian)
- **сайд** — etymology cites `ᠰᠠᠢᠳ` (_sayid, “minister”_) — “minister, secretary” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D0%B9%D0%B4#Mongolian)
- **сайхан** — etymology cites `ᠰᠠᠶ᠋ᠢᠬᠠᠨ` (_sayiqan_) — “beautiful, nice, handsome, pretty, fine” — ≠ lexicon: `ᠰᠠᠢᠬᠠᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D0%B9%D1%85%D0%B0%D0%BD#Mongolian)
- **сартуул** — etymology cites `ᠰᠠᠷᠲᠠᠭᠤᠯ` (_sartaɣul_) — “A subgroup of the Khalkha people, who lives in Western Mongolia” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D1%80%D1%82%D1%83%D1%83%D0%BB#Mongolian)
- **сая** — etymology cites `ᠰᠠᠶ᠎ᠠ` (_say-a, “million”_) — “million” — ≠ lexicon: `ᠰᠠᠶ᠋ᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%B0%D1%8F#Mongolian)
- **солонго** — etymology cites `ᠰᠣᠯᠤᠩᠭ᠎ᠠ` (_solungɣ-a_) — “rainbow” — ≠ lexicon: `ᠰᠣᠯᠣᠩᠭ᠎ᠠ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D0%BB%D0%BE%D0%BD%D0%B3%D0%BE#Mongolian)
- **соёл** — etymology cites `ᠰᠣᠶ᠋ᠣᠯ` (_soyol, “civilisation, the act of civilising”_) — “culture” — ≠ lexicon: `ᠰᠤᠶᠤᠯ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D0%BE%D1%91%D0%BB#Mongolian)
- **сум** — etymology cites `ᠰᠤᠮᠤ` (_sumu_) — “arrow, projectile, bullet” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D1%83%D0%BC#Mongolian)
- **сургууль** — etymology cites `ᠰᠤᠷᠭᠠᠭᠤᠯᠢ` (_surɣaɣuli, “a school”_) — “a school” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D1%83%D1%80%D0%B3%D1%83%D1%83%D0%BB%D1%8C#Mongolian)
- **сэтгэл** — etymology cites `ᠰᠡᠳᠬᠢᠯ` (_sedkil_) — “mind, spirit, heart (seat of emotion)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%81%D1%8D%D1%82%D0%B3%D1%8D%D0%BB#Mongolian)
- **тав** — etymology cites `ᠲᠠᠪᠤ` (_tabu_) — “five” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%B2#Mongolian)
- **тавь** — etymology cites `ᠲᠠᠪᠢᠨ` (_tabi_) — “fifty” — ≠ lexicon: `ᠲᠠᠪᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%B2%D1%8C#Mongolian)
- **тайга** — etymology cites `ᠲᠠᠢᠭ᠎ᠠ` (_taiɣ-a_) — “primeval forest” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D0%B9%D0%B3%D0%B0#Mongolian)
- **тахиа** — etymology cites `ᠲᠠᠬᠢᠶ᠎ᠠ` (_taqiy-a_) — “chicken (domestic fowl of any age)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%B0%D1%85%D0%B8%D0%B0#Mongolian)
- **толь** — etymology cites `ᠲᠣᠯᠢ` (_toli_) — “mirror” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BB%D1%8C#Mongolian)
- **тоосго** — etymology cites `ᠲᠣᠭᠣᠰᠬ᠎ᠠ` (_toɣosq-a_) — “brick” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D0%BE%D0%BE%D1%81%D0%B3%D0%BE#Mongolian)
- **туг** — etymology cites `ᠲᠤᠭ` (_tuɣ_) — “yak-tail banner” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D0%B3#Mongolian)
- **туулай** — etymology cites `ᠲᠠᠤᠯᠠᠢ` (_taulai_) — “rabbit, hare” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%83%D1%83%D0%BB%D0%B0%D0%B9#Mongolian)
- **тэнгис** — etymology cites `ᠲᠡᠩᠭᠢᠰ᠋` (_tenggis, “a lake”_) — “a sea” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%BD%D0%B3%D0%B8%D1%81#Mongolian)
- **тэнд** — etymology cites `ᠲᠡᠨᠳᠡ` (_tende_) — “there” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D0%BD%D0%B4#Mongolian)
- **тэрэг** — etymology cites `ᠲᠡᠷᠭᠡ` (_terge_) — “cart” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D1%8D%D1%80%D1%8D%D0%B3#Mongolian)
- **түмэд** — etymology cites `ᠲᠦᠮᠡᠳ` (_tümed_) — “Tumed (Mongolian tribe)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D1%82%D2%AF%D0%BC%D1%8D%D0%B4#Mongolian)
- **угсаа** — etymology cites `ᠤᠭᠰᠠᠭ᠎ᠠ` (_uɣsaɣ-a, “royal family”_) — “ancestry, origin, descent” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D0%B3%D1%81%D0%B0%D0%B0#Mongolian)
- **улс** — etymology cites `ᠤᠯᠤᠰ᠋` (_ulus_) — “state, country, nation, polity, commonwealth” — ≠ lexicon: `ᠤᠯᠤᠰ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D0%BB%D1%81#Mongolian)
- **ус** — etymology cites `ᠤᠰᠤ` (_usu_) — “water” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D1%81#Mongolian)
- **уул** — etymology cites `ᠠᠭᠤᠯᠠ` (_aɣula_) — “mountain” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%83%D1%83%D0%BB#Mongolian)
- **хаан** — etymology cites `ᠬᠠᠭᠠᠨ` (_qaɣan_) — “royal or imperial khan; king; monarch ; sovereign ; emperor” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%B0%D0%BD#Mongolian)
- **хамаг** — etymology cites `ᠬᠠᠮᠤᠭ` (_qamuɣ_) — “all” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D0%BC%D0%B0%D0%B3#Mongolian)
- **хас** — etymology cites `ᠬᠠᠰ᠋` (_qas_) — “alternative form of хаш (xaš, “jade”)” — ≠ lexicon: `ᠬᠠᠰ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%81#Mongolian)
- **хасаг** — etymology cites `ᠬᠠᠰᠠᠭ` (_qasaɣ, “a Kazakh; a Cossack”_) — “a Kazakh, a Kazak (person)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%81%D0%B0%D0%B3#Mongolian)
- **хаш** — etymology cites `ᠬᠠᠰ᠋` (_qas_) — “jade” — ≠ lexicon: `ᠬᠠᠰ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%B0%D1%88#Mongolian)
- **хошууч** — etymology cites `ᠬᠣᠰᠢᠭᠤᠴᠢ` (_qosiɣuči_) — “A noble title given to the commander of a хошуу (xošuu). Abolished during the…” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%88%D1%83%D1%83%D1%87#Mongolian)
- **хоёр** — etymology cites `ᠬᠣᠶ᠋ᠠᠷ` (_qoyar_) — “two” — ≠ lexicon: `ᠬᠣᠶᠠᠷ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D0%BE%D1%91%D1%80#Mongolian)
- **хурма** — etymology cites `ᠬᠤᠷᠮ᠎ᠠ` (_qurm-a_) — “persimmon (fruit)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%83%D1%80%D0%BC%D0%B0#Mongolian)
- **хэл** — etymology cites `ᠬᠡᠯᠡ` (_kele_) — “tongue” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%8D%D0%BB#Mongolian)
- **хязгаар** — etymology cites `ᠬᠢᠵᠠᠭᠠᠷ` (_qiǰaɣar_) — “edge, rim” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%8F%D0%B7%D0%B3%D0%B0%D0%B0%D1%80#Mongolian)
- **хятад** — etymology cites `ᠬᠢᠲᠠᠳ` (_qitad, “Chinese; China”_) — “Han Chinese (people or person)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D1%8F%D1%82%D0%B0%D0%B4#Mongolian)
- **хүмүүн** — etymology cites `ᠬᠦᠮᠦᠨ` (_kümün_) — “alternative form of хүн (xün)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D0%BC%D2%AF%D2%AF%D0%BD#Mongolian)
- **хүмүүс** — etymology cites `ᠬᠦᠮᠦᠰ` (_kümüs_) — “nominative plural of хүн (xün)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D0%BC%D2%AF%D2%AF%D1%81#Mongolian)
- **хүн** — etymology cites `ᠬᠦᠮᠦᠨ` (_kümün_) — “person, man” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D2%AF%D0%BD#Mongolian)
- **хөвгүүн** — etymology cites `ᠬᠥ᠋ᠪᠡᠭᠦᠨ` (_köbegün_) — “child” — ≠ lexicon: `ᠬᠥᠪᠡᠭᠦᠨ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D0%B2%D0%B3%D2%AF%D2%AF%D0%BD#Mongolian)
- **хөх** — etymology cites `ᠬᠥᠬᠡ` (_köke_) — “dark blue” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%85#Mongolian)
- **хөх** — etymology cites `ᠬᠥᠬᠦ` (_kökü_) — “breast (of a woman)” — ≠ lexicon: `ᠬᠥᠬᠡ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%85#Mongolian)
- **хөхөх** — etymology cites `ᠬᠥᠬᠦᠬᠦ` (_kökükü_) — “to suckle” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%85%D3%A9%D1%85%D3%A9%D1%85#Mongolian)
- **цаг** — etymology cites `ᠴᠠᠭ` (_čaɣ_) — “time” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%B0%D0%B3#Mongolian)
- **цай** — etymology cites `ᠴᠠᠢ` (_čai_) — “tea” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%B0%D0%B9#Mongolian)
- **царай** — etymology cites `ᠴᠢᠷᠠᠢ` (_čirai_) — “face” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%86%D0%B0%D1%80%D0%B0%D0%B9#Mongolian)
- **чоно** — etymology cites `ᠴᠢᠨᠤ᠎ᠠ` (_činu-a_) — “wolf” — ≠ lexicon: `ᠴᠢᠨᠣ᠎ᠠ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%87%D0%BE%D0%BD%D0%BE#Mongolian)
- **шар** — etymology cites `ᠰᠢᠷ᠎ᠠ` (_sir-a_) — “yellow” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D0%B0%D1%80#Mongolian)
- **шүлэг** — etymology cites `ᠰᠢᠯᠦᠭ` (_silüg_) — “poem” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D2%AF%D0%BB%D1%8D%D0%B3#Mongolian)
- **шөнө** — etymology cites `ᠰᠥᠨᠢ` (_söni, “night”_) — “night” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%88%D3%A9%D0%BD%D3%A9#Mongolian)
- **эзлэх** — etymology cites `ᠡᠵᠡᠯᠡᠬᠦ` (_eǰelekü_) — “to occupy” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%B7%D0%BB%D1%8D%D1%85#Mongolian)
- **эзэн** — etymology cites `ᠡᠵᠡᠨ` (_eǰen_) — “master, lord” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%B7%D1%8D%D0%BD#Mongolian)
- **элч** — etymology cites `ᠡᠯᠴᠢ` (_elči_) — “messenger; envoy” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%BB%D1%87#Mongolian)
- **энэ** — etymology cites `ᠡᠨᠡ` (_ene, “this”_) — “this” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D0%BD%D1%8D#Mongolian)
- **эрдэнэ** — etymology cites `ᠡᠷᠳᠡᠨᠢ` (_ärdäni_) — “treasure” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D1%80%D0%B4%D1%8D%D0%BD%D1%8D#Mongolian)
- **эрхүүд** — etymology cites `ᠡᠷᠬᠡᠭᠦᠳ` (_erkegüd, “a Christian”, singulative_) — “a Christian (person)” — not in lexicon yet — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8D%D1%80%D1%85%D2%AF%D2%AF%D0%B4#Mongolian)
- **явдал** — etymology cites `ᠶ᠋ᠠᠪᠤᠳᠠᠯ` (_yabudal_) — “act, action, doings” — ≠ lexicon: `ᠶᠠᠪᠤᠳᠠᠯ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8F%D0%B2%D0%B4%D0%B0%D0%BB#Mongolian)
- **яс** — etymology cites `ᠶ᠋ᠠᠰᠤ` (_yasu_) — “bone” — ≠ lexicon: `ᠶᠠᠰᠤ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%8F%D1%81#Mongolian)
- **ёстой** — etymology cites `ᠶ᠋ᠣᠰᠤᠲᠠᠢ` (_yosutai, ornative_) — “proper” — ≠ lexicon: `ᠶᠣᠰᠣᠲᠠᠢ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D1%91%D1%81%D1%82%D0%BE%D0%B9#Mongolian)
- **үл** — etymology cites `ᠦᠯᠦ` (_ülü_) — “not (forming the negative of a verb)” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D0%BB#Mongolian)
- **үлүү** — etymology cites `ᠦᠯᠦ` (_ülü_) — “not (forming the negative of a verb)” — ≠ lexicon: `ᠦᠯᠡᠭᠦᠦ` (wmk-import) — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D0%BB%D2%AF%D2%AF#Mongolian)
- **үнэн** — etymology cites `ᠦᠨᠡᠨ` (_ünen, “truth”_) — “truth” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D0%BD%D1%8D%D0%BD#Mongolian)
- **үүд** — etymology cites `ᠡᠭᠦᠳᠡ` (_egüde_) — “door, gate” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D2%AF%D2%AF%D0%B4#Mongolian)
- **өдөр** — etymology cites `ᠡᠳᠦᠷ` (_edür_) — “day, date, daytime” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%B4%D3%A9%D1%80#Mongolian)
- **өнгө** — etymology cites `ᠥᠩᠭᠡ` (_öngge_) — “color” — = lexicon (code points identical) — [Wiktionary](https://en.wiktionary.org/wiki/%D3%A9%D0%BD%D0%B3%D3%A9#Mongolian)

### Suffixes

Wiktionary-sourced rows in [suffixes.json](suffixes.json) (`"source": "wiktionary"`) are unverified and carry no `attach`/`gender` conditions, so the suffix engine applies them unconditionally — reviewers should add conditions from the Nadmid 1990 rulebook (see GRAMMAR.md) and verify or remove each row.

<!-- wiktionary-import:end -->

<!-- community-signals:begin (auto-generated, do not edit between markers) -->

## Community signals (`scripts/aggregate-signals.ts`)

Reports filed from the converter, through 2026-07-28. A signal is not verification: it says where to look, and every change below is a human decision. Counts are distinct browser sessions — the mailbox drops a repeat from the same browser, so two sessions means two people said the same thing. To dismiss a report, delete its object from [stats/reports.json](stats/reports.json); if the signal is real it will be filed again.

### Spellings reported wrong (0)

Nothing open. 🎉

### Meanings reported missing (0)

Nothing open. 🎉

### Words the lexicon does not know (0)

Nothing open. 🎉

<!-- community-signals:end -->
