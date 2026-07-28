"use client";

import { convertText, LEXICON_ENTRY_COUNT } from "khudam";
import type { Candidate, Token } from "khudam";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  displaySense,
  isLexiconCandidate,
  recordSelections,
  signalsEnabled,
} from "../lib/signals";
import { ReportDialog, type ReportTarget } from "./report-dialog";

const SAMPLES = ["монгол бичиг", "сайн байна уу", "уул ус"];

const REPO_URL = "https://github.com/bigune/khudam";
// The parent site links here as one of its tools; this is the link back.
// rel="noopener" rather than the "noreferrer" the other footer links carry —
// it is our own site, and the referrer is what lets suray.mn see the traffic
// came from the converter.
const SURAY_URL = "https://suray.mn";
const NPM_URL = "https://www.npmjs.com/package/khudam";
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const SOURCES_URL = `${REPO_URL}/blob/main/data/SOURCES.md`;
const DATA_LICENSE_URL = `${REPO_URL}/blob/main/data/LICENSE`;

function badgeOf(c: Candidate): { className: string; label: string } {
  if (c.source === "fallback")
    return { className: "badge fallback", label: "галиг · таамаг" };
  if (c.source === "suffix-rule")
    return c.verified
      ? {
          className: "badge verified",
          label: "үндэс + нөхцөл · баталгаажсан ✓",
        }
      : {
          className: "badge unverified",
          label: "үндэс + нөхцөл · баталгаажаагүй",
        };
  if (c.verified)
    return { className: "badge verified", label: "баталгаажсан ✓" };
  return { className: "badge unverified", label: "баталгаажаагүй" };
}

export default function Home() {
  const [text, setText] = useState("");
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [report, setReport] = useState<ReportTarget | null>(null);

  const tokens = useMemo(() => convertText(text), [text]);

  function update(next: string) {
    setText(next);
    setPicks({});
    setCopied(false);
    setCopyFailed(false);
  }

  function pick(tokenIndex: number, candidateIndex: number) {
    setPicks((p) => ({ ...p, [tokenIndex]: candidateIndex }));
    setCopied(false);
    setCopyFailed(false);
  }

  const chosen = (t: Token, i: number): Candidate | undefined =>
    t.candidates[picks[i] ?? 0];

  const wordTokens = tokens
    .map((t, i) => ({ token: t, index: i }))
    .filter(({ token }) => token.candidates.length > 0);
  const hasWords = wordTokens.length > 0;

  // Word cards grouped one row per sentence, so long text stacks vertically
  // instead of one endless horizontal scroll.
  const SENTENCE_END_RE = /[.!?…;\n]/;
  const sentences: { token: Token; index: number }[][] = [];
  {
    let current: { token: Token; index: number }[] = [];
    tokens.forEach((t, i) => {
      if (t.candidates.length > 0) current.push({ token: t, index: i });
      else if (SENTENCE_END_RE.test(t.input) && current.length > 0) {
        sentences.push(current);
        current = [];
      }
    });
    if (current.length > 0) sentences.push(current);
  }
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
    // Recorded before the clipboard call, and never gated on it: pressing the
    // button is the commitment, and the Clipboard API is the flaky part —
    // absent entirely outside a secure context, and able to reject on
    // permissions or focus. A failed copy must not also cost us the signal.
    // `copied` is reset by any edit or pick, so copying the same output twice
    // does not count twice.
    if (!copied) {
      recordSelections(
        wordTokens.map(({ token, index }) => ({
          input: token.input,
          candidate: chosen(token, index)!,
        })),
      );
    }
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      // Nothing was copied — say so instead of leaving a dead button.
      setCopyFailed(true);
    }
  }

  return (
    <main>
      <header>
        <h1>Худам</h1>
        <p className="subtitle">Нээлттэй монгол бичиг хөрвүүлэгч</p>
        <p className="en" lang="en">
          open-source Cyrillic → Traditional Mongolian Script converter
        </p>
        {/* The queue's only way in used to be a sentence buried in the
            contribute section, which is a page-length scroll from here — so in
            practice nobody found it who did not already know it existed. It
            belongs beside the invitation that is already in the header. */}
        <p className="stats">
          Үгсийн санд {LEXICON_ENTRY_COUNT.toLocaleString("mn-MN")} үг ·{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            хамтдаа сайжруулъя
          </a>
          {signalsEnabled && (
            <>
              {" · "}
              <Link href="/queue">хянах дараалал</Link>
            </>
          )}
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
                {copyFailed
                  ? "Хуулж чадсангүй — гараар сонгоно уу"
                  : copied
                    ? "Хуулагдлаа ✓"
                    : "Хуулах"}
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
                  "Шар үг толь бичигт байхгүй тул дүрмийн дагуу галиглаж бичив — алдаатай байж болно."}
              </p>
            )}
          </div>
        )}
      </section>

      {hasWords && (
        <section className="words">
          <span className="field-label">Үг тус бүрийн тайлбарууд</span>
          {sentences.map((sentence, si) => (
            <div className="words-scroll-wrap" key={si}>
              <div className="words-scroll">
                {sentences.length > 1 && (
                  <span className="sentence-num">{si + 1}</span>
                )}
                {sentence.map(({ token, index }) => (
                  <div className="word-card" key={index}>
                    <span className="word-input">{token.input}</span>
                    <div className="chips">
                      {token.candidates.map((c, ci) => {
                        const badge = badgeOf(c);
                        const isPicked = (picks[index] ?? 0) === ci;
                        return (
                          <div className="chip-wrap" key={ci}>
                            <button
                              className={isPicked ? "chip picked" : "chip"}
                              onClick={() => pick(index, ci)}
                            >
                              <span
                                className="chip-trad mongolian"
                                lang="mn-Mong"
                              >
                                {c.traditional}
                              </span>
                              <span className="chip-meta">
                                {c.latin && (
                                  <span className="latin">{c.latin}</span>
                                )}
                                {displaySense(c) && (
                                  <span className="sense">
                                    {displaySense(c)}
                                  </span>
                                )}
                                <span className={badge.className}>
                                  {badge.label}
                                </span>
                              </span>
                            </button>
                            {signalsEnabled &&
                              // A fallback candidate is a guess we already
                              // labelled as one, so "is this wrong?" is the
                              // wrong question — the useful one is whether the
                              // reader knows the real spelling.
                              (c.source === "fallback" ? (
                                <button
                                  className="card-action"
                                  aria-label={`${token.input} — зөв зурлагыг нь санал болгох`}
                                  onClick={() =>
                                    setReport({
                                      door: "unknown_word",
                                      input: token.input,
                                      candidate: c,
                                    })
                                  }
                                >
                                  ✎ зөв зурлага
                                </button>
                              ) : (
                                <button
                                  className="card-action"
                                  aria-label={`${token.input} — энэ хувилбарын алдааг мэдэгдэх`}
                                  onClick={() =>
                                    setReport({
                                      door: "flag",
                                      input: token.input,
                                      candidate: c,
                                    })
                                  }
                                >
                                  ⚑ алдаа
                                </button>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                    {/* The completeness door: a meaning missing from the entry
                      is invisible in a candidate list, so it needs its own
                      affordance. It sits below a rule because its scope is the
                      whole word, not the candidate above it — but it is the
                      same kind of button, so it looks like one. Only offered
                      where there is a lexicon entry to add a sense to; composed
                      and fallback candidates are machine output with one
                      meaning each. */}
                    {signalsEnabled &&
                      token.candidates.some(isLexiconCandidate) && (
                        <div className="word-card-foot">
                          <button
                            className="card-action"
                            aria-label={`${token.input} — хайсан салаа утга минь жагсаалтад алга`}
                            onClick={() => {
                              const picked = chosen(token, index)!;
                              setReport({
                                door: "missing_sense",
                                input: token.input,
                                candidate: isLexiconCandidate(picked)
                                  ? picked
                                  : token.candidates.find(isLexiconCandidate)!,
                              });
                            }}
                          >
                            ⊕ салаа утга
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* No caption here: what «баталгаажаагүй» means and which button
              does what are both explained in the sections directly below,
              and saying it twice on one screen only crowded the cards. */}
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
        {signalsEnabled && (
          <>
            <p>
              Хуулах товч дарахад салаа утгатай үгийн аль хувилбарыг сонгосон
              тань хадгалагдаж үлддэг. Үүнийг бид зөвхөн хувилбаруудыг
              эрэмбэлэх, ямар үгийг эхэлж хянахаа шийдвэрлэхэд ашигладаг ба таны
              ямар нэг хувийн мэдээллийг цуглуулдаггүй.
            </p>
            <p className="en" lang="en">
              Copying anonymously records which variant you chose. It is used
              only to order candidates and to decide what to review first — no
              accounts, no personal data.
            </p>
          </>
        )}
        <p>
          <a href={SOURCES_URL} target="_blank" rel="noreferrer">
            Өгөгдлийн эх сурвалж →
          </a>
        </p>
      </section>

      <section className="info">
        <h2>Хувь нэмэр</h2>
        {signalsEnabled && (
          <>
            {/* The queue is the one door that asks for nothing but a minute:
                no word to look up, no error to have noticed. It goes first
                because it is the only place a reader who simply knows the
                script can help without having come here with a problem. */}
            <p>
              Монгол бичиг уншдаг бол{" "}
              <Link href="/queue">хянах дараалалд</Link> нэг минут зарж, хэдэн
              зурлагыг зөв эсэхийг хэлж өгөөрэй. Хариулт бүр аль үгийг эхэлж
              хянахыг зааж өгдөг.
            </p>
            <p className="en" lang="en">
              If you read монгол бичиг, the verification queue takes a minute
              and needs no error to have gone wrong first.
            </p>
            <p>
              Үг тус бүрийн тайлбар хэсгээс буруу зурлагыг «⚑», дутуу салаа
              утгыг «⊕», толь бичигт байхгүй үгийн зөв зурлагыг «✎» товчоор тус
              тус шууд мэдэгдэх, илгээх боломжтой. Ирүүлсэн санал бүрийг хүн
              хянаж, зөвшөөрсний дараа нээлттэй үгсийн санд{" "}
              <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
                CC BY-SA 4.0
              </a>{" "}
              лицензтэйгээр нэмдэг.
            </p>
            <p className="en" lang="en">
              You can contribute straight from the converter — report a wrong
              spelling, a missing meaning, or the real spelling of a word we do
              not know. Every submission is reviewed by a human before it
              reaches the lexicon, and is licensed CC BY-SA 4.0.
            </p>
          </>
        )}
        <p>
          Алдаа мэдэгдэх, эсвэл шинэ үг, нэр нэмэхийг хүсвэл GitHub дээр мөн
          засвар оруулах боломжтой — програмчлал мэдэхгүй байсан ч болно.
          Хөгжүүлэгч нар khudam package-ийг npm-ээс суулгаарай.
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
        {signalsEnabled && <Link href="/queue">Хянах дараалал</Link>}
        <a href={SURAY_URL} target="_blank" rel="noopener">
          Үндсэн вебсайт
        </a>
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

      <ReportDialog target={report} onClose={() => setReport(null)} />
    </main>
  );
}
