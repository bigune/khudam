"use client";

import { convertText, LEXICON_ENTRY_COUNT } from "khudam";
import type { Candidate, Token } from "khudam";
import { useMemo, useState } from "react";

const SAMPLES = ["монгол бичиг", "сайн байна уу", "уул ус"];

const REPO_URL = "https://github.com/bigune/khudam";
const NPM_URL = "https://www.npmjs.com/package/khudam";
const ISSUES_URL = `${REPO_URL}/issues`;
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const SOURCES_URL = `${REPO_URL}/blob/main/data/SOURCES.md`;
const DATA_LICENSE_URL = `${REPO_URL}/blob/main/data/LICENSE`;

function badgeOf(c: Candidate): { className: string; label: string } {
  if (c.source === "fallback")
    return { className: "badge fallback", label: "галиг · таамаг" };
  if (c.source === "suffix-rule")
    return { className: "badge unverified", label: "үндэс + нөхцөл · баталгаажаагүй" };
  if (c.verified)
    return { className: "badge verified", label: "баталгаажсан ✓" };
  return { className: "badge unverified", label: "баталгаажаагүй" };
}

export default function Home() {
  const [text, setText] = useState("");
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState(false);

  const tokens = useMemo(() => convertText(text), [text]);

  function update(next: string) {
    setText(next);
    setPicks({});
    setCopied(false);
  }

  function pick(tokenIndex: number, candidateIndex: number) {
    setPicks((p) => ({ ...p, [tokenIndex]: candidateIndex }));
    setCopied(false);
  }

  const chosen = (t: Token, i: number): Candidate | undefined =>
    t.candidates[picks[i] ?? 0];

  const wordTokens = tokens
    .map((t, i) => ({ token: t, index: i }))
    .filter(({ token }) => token.candidates.length > 0);
  const hasWords = wordTokens.length > 0;
  const hasFallback = wordTokens.some(({ token }) => token.fallback);
  const hasAmbiguous = wordTokens.some(
    ({ token }) => token.candidates.length > 1,
  );

  const output = tokens
    .map((t, i) =>
      t.candidates.length > 0 ? chosen(t, i)!.traditional : t.input,
    )
    .join("");

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
  }

  return (
    <main>
      <header>
        <h1>Худам</h1>
        <p className="subtitle">
          Нээлттэй монгол бичиг хөрвүүлэгч ·{" "}
          <span lang="en">
            open-source Cyrillic → Traditional Mongolian Script converter
          </span>
        </p>
        <p className="stats">
          Үгсийн санд {LEXICON_ENTRY_COUNT.toLocaleString("mn-MN")} үг ·{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            хамтдаа сайжруулъя
          </a>
        </p>
      </header>

      <section className="io">
        <label className="field">
          <span className="field-label">Кирилл</span>
          <textarea
            value={text}
            onChange={(e) => update(e.target.value)}
            placeholder="Кирилл үгээ энд бичнэ үү…"
            rows={4}
            autoFocus
            spellCheck={false}
          />
        </label>

        {!hasWords && (
          <p className="samples">
            Жишээ:{" "}
            {SAMPLES.map((s) => (
              <button key={s} className="sample" onClick={() => update(s)}>
                {s}
              </button>
            ))}
          </p>
        )}

        {hasWords && (
          <div className="field">
            <span className="field-label">
              Монгол бичиг
              <button className="copy" onClick={copy}>
                {copied ? "Хуулагдлаа ✓" : "Хуулах"}
              </button>
            </span>
            <div className="vertical mongolian" lang="mn-Mong">
              {tokens.map((t, i) => {
                if (t.candidates.length === 0)
                  return <span key={i}>{t.input}</span>;
                const c = chosen(t, i)!;
                const cls = t.fallback
                  ? "word fallback"
                  : t.candidates.length > 1
                    ? "word ambiguous"
                    : "word";
                return (
                  <span key={i} className={cls} title={t.input}>
                    {c.traditional}
                  </span>
                );
              })}
            </div>
            {(hasFallback || hasAmbiguous) && (
              <p className="note">
                {hasAmbiguous &&
                  "Доогуур зураастай үг олон хувилбартай — доороос сонгоно уу. "}
                {hasFallback &&
                  "Шар үг толь бичигт байхгүй тул галиглаж бичив — алдаатай байж болно."}
              </p>
            )}
          </div>
        )}
      </section>

      {hasWords && (
        <section className="words">
          <span className="field-label">Үг тус бүрийн тайлбарууд</span>
          <div className="words-scroll-wrap">
            <div className="words-scroll">
              {wordTokens.map(({ token, index }) => (
                <div className="word-card" key={index}>
                  <span className="word-input">{token.input}</span>
                  <div className="chips">
                    {token.candidates.map((c, ci) => {
                      const badge = badgeOf(c);
                      const isPicked = (picks[index] ?? 0) === ci;
                      return (
                        <button
                          key={ci}
                          className={isPicked ? "chip picked" : "chip"}
                          onClick={() => pick(index, ci)}
                        >
                          <span className="chip-trad mongolian" lang="mn-Mong">
                            {c.traditional}
                          </span>
                          <span className="chip-meta">
                            {c.latin && (
                              <span className="latin">{c.latin}</span>
                            )}
                            {c.sense && (
                              <span className="sense">{c.sense}</span>
                            )}
                            <span className={badge.className}>
                              {badge.label}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="note">
            «Баталгаажаагүй» гэдэг нь машин импортын түвшний өгөгдөл — хүн
            хянаагүй тул алдаатай байж болно. Алдаа олбол{" "}
            <a href={ISSUES_URL} target="_blank" rel="noreferrer">
              GitHub дээр мэдээллээрэй
            </a>
            .
          </p>
        </section>
      )}

      <section className="info">
        <h2>Төслийн тухай</h2>
        <p>
          Худам бол кирилл → монгол бичгийн нээлттэй эхийн хөрвүүлэгч юм.
          Зорилго нь цахим монгол бичгийн үнэгүй, нээлттэй, стандарт Юникодод
          суурилсан нэгдсэн сан бий болгох: хамтдаа сайжруулж, баталгаажуулах
          хэрэглэгчийн хөтөч дээр ажилладаг хөрвүүлэгч.
        </p>
        <p className="en" lang="en">
          Khudam is an open-source Cyrillic ⇆ Mongol bichig lexicon and
          converter. The goal: a free, open, standard-Unicode home for digital
          traditional Mongolian — a community-verified dictionary and a fully
          client-side engine.
        </p>
      </section>

      <section className="info">
        <h2>Өгөгдлийн чанар</h2>
        <p>
          Одоогийн үгсийн сангийн дийлэнх нь машинаар үүсгэгдсэн, хүн хараахан
          хянаагүй суурь өгөгдөл тул <strong>баталгаажаагүй</strong>. Хүн хянаж
          баталгаажуулсан хэлбэрийг ✓ тэмдгээр ялгана. Алдааг олон нийтийн хувь
          нэмрээр аажмаар засаж, баталгаажуулж байна.
        </p>
        <p className="en" lang="en">
          Most of the lexicon today is machine-generated seed data no human has
          reviewed yet, so it is unverified. Human-checked spellings are marked
          ✓. We correct and verify it gradually through community contributions.
        </p>
        <p>
          <a href={SOURCES_URL} target="_blank" rel="noreferrer">
            Өгөгдлийн эх сурвалж →
          </a>
        </p>
      </section>

      <section className="info">
        <h2>Хувь нэмэр</h2>
        <p>
          Алдаа мэдэгдэх, эсвэл шинэ үг, нэр нэмэхийг хүсвэл GitHub дээр засвар
          оруулаарай — програмчлал мэдэхгүй байсан ч болно. Хөгжүүлэгч нар
          khudam package-ийг npm-ээс суулгаж болно.
        </p>
        <p className="en" lang="en">
          Found an error, or want to add a word or name? Contribute on GitHub —
          no coding needed. Developers can install the khudam package from npm.
        </p>
        <p className="links-row">
          <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">
            Хувь нэмрээ оруулах заавар
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={NPM_URL} target="_blank" rel="noreferrer">
            npm
          </a>
        </p>
      </section>

      <footer>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={NPM_URL} target="_blank" rel="noreferrer">
          npm
        </a>
        <a href={SOURCES_URL} target="_blank" rel="noreferrer">
          Эх сурвалж
        </a>
        <span>
          Код MIT ·{" "}
          <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
            Өгөгдөл CC BY-SA 4.0
          </a>
        </span>
      </footer>
    </main>
  );
}
