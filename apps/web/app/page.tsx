"use client";

import { convertText, LEXICON_ENTRY_COUNT } from "khudam";
import type { Candidate, Token } from "khudam";
import { useMemo, useState } from "react";

const SAMPLES = ["монгол бичиг", "сайн байна уу", "уул ус"];

const REPO_URL = "https://github.com/bigune/khudam";

function badgeOf(c: Candidate): { className: string; label: string } {
  if (c.source === "fallback") return { className: "badge fallback", label: "галиг · таамаг" };
  if (c.verified) return { className: "badge verified", label: "баталгаажсан ✓" };
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
  const hasAmbiguous = wordTokens.some(({ token }) => token.candidates.length > 1);

  const output = tokens
    .map((t, i) => (t.candidates.length > 0 ? chosen(t, i)!.traditional : t.input))
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
          <span lang="en">open-source Cyrillic → Mongol bichig converter</span>
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
                if (t.candidates.length === 0) return <span key={i}>{t.input}</span>;
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
                {hasAmbiguous && "Доогуур зураастай үг олон хувилбартай — доороос сонгоно уу. "}
                {hasFallback &&
                  "Шар үг толь бичигт алга тул дүрмээр галигласан — алдаатай байж болно."}
              </p>
            )}
          </div>
        )}
      </section>

      {hasWords && (
        <section className="words">
          {wordTokens.map(({ token, index }) => (
            <div className="word-row" key={index}>
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
                        {c.latin && <span className="latin">{c.latin}</span>}
                        {c.sense && <span className="sense">{c.sense}</span>}
                        <span className={badge.className}>{badge.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="note">
            «Баталгаажаагүй» гэдэг нь машин импортын түвшний өгөгдөл — хүн хянаагүй тул алдаатай
            байж болно. Алдаа олбол{" "}
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
              GitHub дээр мэдээлээрэй
            </a>
            .
          </p>
        </section>
      )}

      <footer>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://www.npmjs.com/package/khudam" target="_blank" rel="noreferrer">
          npm
        </a>
        <span>Код MIT · Өгөгдөл CC BY-SA 4.0</span>
      </footer>
    </main>
  );
}
