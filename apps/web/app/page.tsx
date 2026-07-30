"use client";

import { convertText, LEXICON_ENTRY_COUNT, normalizeWord } from "khudam";
import type { Candidate, Token } from "khudam";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  displaySense,
  isLexiconCandidate,
  recordSelections,
  recordSupport,
  signalsEnabled,
} from "../lib/signals";
import { ReportDialog, type ReportTarget } from "./report-dialog";
import { ReviewerBadge } from "./reviewer-badge";
import { SiteFooter } from "./site-footer";

const SAMPLES = ["монгол бичиг", "сайн байна уу", "уул ус"];

const REPO_URL = "https://github.com/bigune/khudam";
const NPM_URL = "https://www.npmjs.com/package/khudam";
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const SOURCES_URL = `${REPO_URL}/blob/main/data/SOURCES.md`;
const DATA_LICENSE_URL = `${REPO_URL}/blob/main/data/LICENSE`;

/**
 * The stamps in a chip's corner, and what they mean.
 *
 * Two things are being said at once, so a chip can carry two marks: where the
 * spelling came from — a rule built it (+), a machine guessed it (≈), or the
 * lexicon holds it (nothing to say) — and whether a human has read it (✓ or ?).
 *
 * Every candidate with a verification state wears one, and that is deliberate.
 * A green ✓ alone, on one chip of several a reader is being asked to choose
 * between, reads as «take this one» rather than as «somebody checked this one»;
 * beside a neutral ○ it goes back to being one value of a property. The pair is
 * the checkbox metaphor, which is a fair thing to borrow here as long as it
 * cannot be mistaken for the chip's own state: choosing a candidate is said by
 * a full accent border, a different channel from a glyph in the corner, and the
 * corner is where + and ≈ live too — so it reads as the status area it is.
 *
 * None of this costs the card a line: the marks are in the corner, out of the
 * column the specimen and its caption share. The pill they replaced spent a row
 * of every card saying «баталгаажаагүй», which is what 28,510 of the 28,511
 * recorded spellings are.
 *
 * `long` is the tooltip and the accessible name; `short` is for the key beside
 * the section label. Neither a tooltip nor a hover exists on a thumb, which is
 * why that key names whichever marks the reader's own text produced.
 */
interface Mark {
  glyph: string;
  className: string;
  short: string;
  long: string;
}

const MARK_VERIFIED: Mark = {
  glyph: "✓",
  className: "mark verified",
  short: "баталгаажсан",
  long: "баталгаажсан — монгол бичиг уншдаг хүн хянаж, зөв гэж баталсан",
};

const MARK_UNVERIFIED: Mark = {
  glyph: "○",
  className: "mark unverified",
  short: "баталгаажаагүй",
  long: "баталгаажаагүй — машинаар орсон, хүн хараахан хянаагүй",
};

/** «Approximately this», rather than a warning triangle: the amber already says
 *  be careful, and what the mark has left to say is what kind of thing this is —
 *  a spelling arrived at by rule, close to the word but not attested as it. */
const MARK_FALLBACK: Mark = {
  glyph: "≈",
  className: "mark fallback",
  short: "галиг · таамаг",
  long: "галиг · таамаг — толь бичигт байхгүй тул дүрмээр галигласан, алдаатай байж болно",
};

/** Neutral rather than amber: a composed form is not a guess about how the word
 *  is written, it is a stem this lexicon has plus a suffix rule with citations
 *  behind it. What the mark says is that no single entry spells this — which is
 *  the one thing about a chip that no colour could carry. */
const MARK_COMPOSED: Mark = {
  glyph: "+",
  className: "mark composed",
  short: "нөхцөлтэй",
  long: "үндэс + нөхцөл — үндсэн үгэнд нөхцөлийг дүрмээр залгав",
};

function marksOf(c: Candidate): Mark[] {
  // A guess is in no entry, so there is nothing for a human to have checked
  // yet: ≈ already says nobody wrote this down. Everything else has a
  // verification state, including a composed form — whose ✓ or ? is its stem's.
  if (c.source === "fallback") return [MARK_FALLBACK];
  const marks: Mark[] = [];
  if (c.source === "suffix-rule") marks.push(MARK_COMPOSED);
  marks.push(c.verified ? MARK_VERIFIED : MARK_UNVERIFIED);
  return marks;
}

/** How far a support vote has got. Keyed by candidate rather than by position,
 *  so a word that appears twice in one text shows as answered in both places —
 *  it is one opinion about one spelling, and the mailbox would drop the
 *  second row as a duplicate anyway. */
type SupportState = "sending" | "sent" | "failed";

function supportKey(input: string, traditional: string): string {
  // The same visible separator the signal rows use: neither half can contain a
  // pipe, and an invisible one would make this file read as binary to git.
  return `${normalizeWord(input)}|${traditional}`;
}

/**
 * The affirming half of the pair under a chip.
 *
 * Deliberately says nothing about what the vote is worth. To a stranger it is
 * ordering and corroboration; to a browser holding a reviewer grant it is an
 * attestation — and that browser is already told so, once, by the badge at the
 * top of the page. Repeating it on every candidate would be both noise and a
 * promise this button cannot keep: whether a stamp counts is decided in the
 * repository, by a hash check this page cannot run.
 */
function SupportButton({
  state,
  word,
  onClick,
}: {
  state: SupportState | undefined;
  word: string;
  onClick: () => void;
}) {
  const label =
    state === "sent"
      ? "✓ баярлалаа"
      : state === "failed"
        ? "↻ дахин"
        : "✓ зөв";
  return (
    <button
      className="card-action"
      // "sending" is disabled to stop a double-send, but keeps the resting
      // label: swapping in "илгээж байна…" for the ~200 ms this takes reads as
      // a flicker rather than as feedback.
      disabled={state === "sending" || state === "sent"}
      aria-label={
        state === "failed"
          ? `${word} — илгээж чадсангүй, дахин оролдох`
          : `${word} — энэ зурлагыг зөв гэж мэдэгдэх`
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [report, setReport] = useState<ReportTarget | null>(null);
  const [support, setSupport] = useState<Record<string, SupportState>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tokens = useMemo(() => convertText(text), [text]);

  function update(next: string) {
    setText(next);
    setPicks({});
    setCopied(false);
    setCopyFailed(false);
  }

  /** Emptying the field is the start of typing the next thing, so the caret
   *  goes back where it was — clearing and then having to click the box again
   *  is two actions for one intention. */
  function clear() {
    update("");
    inputRef.current?.focus();
  }

  function pick(tokenIndex: number, candidateIndex: number) {
    setPicks((p) => ({ ...p, [tokenIndex]: candidateIndex }));
    setCopied(false);
    setCopyFailed(false);
  }

  /**
   * "This spelling is right", from someone who happened to be converting.
   *
   * The cheap half of the pair below the chip, and cheap on purpose: saying a
   * spelling is right is the commonest true thing a reader of монгол бичиг can
   * tell us, and the old UI had no way to say it — only ⚑, which asks them to
   * have found something wrong first. A dialog here would cost the click that
   * makes it worth having.
   */
  async function affirm(input: string, candidate: Candidate) {
    const key = supportKey(input, candidate.traditional);
    setSupport((s) => ({ ...s, [key]: "sending" }));
    const ok = await recordSupport({
      cyrillic: input,
      traditional: candidate.traditional,
      sense: candidate.sense,
    });
    setSupport((s) => ({ ...s, [key]: ok ? "sent" : "failed" }));
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
  // Which corner marks this reader's own text actually produced. The key names
  // only those, so it stays one line for an ordinary conversion and never
  // teaches a symbol that is not on the screen.
  const keyMarks = [
    MARK_UNVERIFIED,
    MARK_VERIFIED,
    MARK_FALLBACK,
    MARK_COMPOSED,
  ].filter((m) =>
    wordTokens.some(({ token }) =>
      token.candidates.some((c) => marksOf(c).includes(m)),
    ),
  );

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
        {/* The site header above says whose page this is, so the title says
            what the page does — and what it does is the project's own name for
            itself, which used to sit beneath a headline repeating the brand. */}
        <h1>Нээлттэй монгол бичиг хөрвүүлэгч</h1>
        <p className="en" lang="en">
          open-source Cyrillic → Traditional Mongolian Script converter
        </p>
        {/* "Let's improve it together" points at the queue, not at GitHub.
            This line is read by people who came to convert a word, and for
            them the queue is the only door that needs neither an account nor
            an error to have gone wrong first. Anyone who wants the repository
            finds it in the footer and in the contribute section below — that
            audience is good at finding repositories. */}
        <p className="stats">
          Үгсийн санд {LEXICON_ENTRY_COUNT.toLocaleString("mn-MN")} үг ·{" "}
          {signalsEnabled ? (
            <Link href="/queue">хамтдаа сайжруулъя</Link>
          ) : (
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              хамтдаа сайжруулъя
            </a>
          )}
        </p>
      </header>

      <ReviewerBadge />

      <section className="io">
        {/* A div with a bound label rather than a wrapping <label>: the label
            row carries a button now, and a button inside a label is a click
            two elements both want. */}
        <div className="field">
          <span className="field-label">
            <label htmlFor="cyrillic">Кирилл</label>
            {/* Only once there is something to clear — an always-present button
                that does nothing is furniture. It takes the same place as the
                copy button on the output below: the field's own utility, at the
                right end of the field's own label. */}
            {text !== "" && (
              <button className="field-action" onClick={clear}>
                Цэвэрлэх
              </button>
            )}
          </span>
          <textarea
            id="cyrillic"
            ref={inputRef}
            value={text}
            onChange={(e) => update(e.target.value)}
            placeholder="Кирилл үгээ энд бичнэ үү…"
            rows={4}
            autoFocus
            spellCheck={false}
          />
        </div>

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
              <button className="field-action" onClick={copy}>
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
          {/* The key rides in the label row rather than taking a line of its
              own. A caption was cut from here once for saying what the sections
              below already said; this earns its place by being the only words a
              corner mark has on a touchscreen. */}
          <span className="field-label">
            Үг тус бүрийн тайлбарууд
            <span className="words-key">
              {keyMarks.map((m) => (
                <span className="words-key-item" key={m.glyph}>
                  <span className={m.className} aria-hidden="true">
                    {m.glyph}
                  </span>{" "}
                  {m.short}
                </span>
              ))}
            </span>
          </span>
          {sentences.map((sentence, si) => (
            <div className="words-row" key={si}>
              {sentences.length > 1 && (
                <span className="sentence-num">{si + 1}</span>
              )}
              <div className="words-cards">
                {sentence.map(({ token, index }) => (
                  <div
                    className="word-card"
                    key={index}
                    // How many grid columns this card's candidates need on a
                    // wide screen; ignored by the phone's scroller, where the
                    // card is sized by its contents. Three is the cap — see
                    // the grid rule in globals.css.
                    style={
                      {
                        "--span": Math.min(token.candidates.length, 3),
                      } as React.CSSProperties
                    }
                  >
                    <span className="word-input">{token.input}</span>
                    <div className="chips">
                      {token.candidates.map((c, ci) => {
                        const marks = marksOf(c);
                        const isPicked = (picks[index] ?? 0) === ci;
                        return (
                          <div className="chip-wrap" key={ci}>
                            <button
                              className={isPicked ? "chip picked" : "chip"}
                              onClick={() => pick(index, ci)}
                            >
                              {/* In the corner, so the specimen and its caption
                                  keep the whole column. The words live in the
                                  accessible name, which is also what a screen
                                  reader reads out as part of this button. */}
                              {marks.length > 0 && (
                                <span className="chip-marks">
                                  {marks.map((m) => (
                                    <span
                                      key={m.glyph}
                                      className={m.className}
                                      role="img"
                                      aria-label={m.long}
                                      title={m.long}
                                    >
                                      {m.glyph}
                                    </span>
                                  ))}
                                </span>
                              )}
                              <span
                                className="chip-trad mongolian"
                                lang="mn-Mong"
                              >
                                {c.traditional}
                              </span>
                              {(c.latin || displaySense(c)) && (
                                <span className="chip-meta">
                                  {c.latin && (
                                    <span className="latin">{c.latin}</span>
                                  )}
                                  {displaySense(c) && (
                                    <span className="sense">
                                      {displaySense(c)}
                                    </span>
                                  )}
                                </span>
                              )}
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
                                /* Right and wrong are two answers to one
                                   question, so they sit on one line rather
                                   than stacking as if they were separate
                                   doors. The pair is only offered on stored
                                   candidates: a composed suffix form lives in
                                   no shard, so a vote about it has nothing to
                                   accumulate against and would be discarded
                                   in silence. */
                                <div className="chip-actions">
                                  {isLexiconCandidate(c) && (
                                    <SupportButton
                                      state={
                                        support[
                                          supportKey(token.input, c.traditional)
                                        ]
                                      }
                                      word={token.input}
                                      onClick={() => affirm(token.input, c)}
                                    />
                                  )}
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
                                </div>
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
          хянаагүй суурь өгөгдөл тул <strong>баталгаажаагүй</strong>. Алдааг
          олон нийтийн хувь нэмрээр аажмаар засаж, баталгаажуулж байна.
        </p>
        {/* The marks as they actually appear in a chip's corner, meanings
            beside them, the commonest first. */}
        <ul className="legend">
          <li>
            <span className="mark unverified" aria-hidden="true">
              ○
            </span>
            <span className="legend-what">
              <strong>баталгаажаагүй</strong> — машинаар орсон, хүн хараахан
              хянаагүй
            </span>
          </li>
          <li>
            <span className="mark verified" aria-hidden="true">
              ✓
            </span>
            <span className="legend-what">
              <strong>баталгаажсан</strong> — монгол бичиг уншдаг хүн хянаж, зөв
              гэж баталсан
            </span>
          </li>
          <li>
            <span className="mark fallback" aria-hidden="true">
              ≈
            </span>
            <span className="legend-what">
              <strong>галиг · таамаг</strong> — толь бичигт байхгүй тул дүрмээр
              галигласан, алдаатай байж болно
            </span>
          </li>
          <li>
            <span className="mark composed" aria-hidden="true">
              +
            </span>
            <span className="legend-what">
              <strong>үндэс + нөхцөл</strong> — үндсэн үгэнд нөхцөлийг дүрмээр
              залгасан
            </span>
          </li>
        </ul>
        <p className="en" lang="en">
          Most of the lexicon today is machine-generated seed data no human has
          reviewed yet, so it is unverified. We correct and verify it gradually
          through community contributions.
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
              <Link href="/queue">хянагдахаар хүлээгдэж буй үгсээс</Link> хэдэн
              зурлагыг нь зөв эсэхийг хэлж өгөөрэй. Хариулт бүр аль үгийг эхэлж
              хянахыг зааж өгдөг.
            </p>
            <p className="en" lang="en">
              If you read монгол бичиг, the verification queue takes a minute
              and needs no error to have gone wrong first.
            </p>
            {/* «✓ зөв» goes first because it is the cheapest true thing a
                reader of монгол бичиг can tell us and the one the section
                forgot to mention — the three buttons it did list all ask the
                reader to have found something wrong first. */}
            <p>
              Үг тус бүрийн тайлбар хэсгээс зөв зурлагыг «✓», буруу зурлагыг
              «⚑», дутуу салаа утгыг «⊕», толь бичигт байхгүй үгийн зурлагыг «✎»
              товчоор тус тус шууд мэдэгдэх, илгээх боломжтой. Ирүүлсэн санал
              бүрийг хүн хянаж, зөвшөөрсний дараа нээлттэй үгсийн санд{" "}
              <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
                CC BY-SA 4.0
              </a>{" "}
              лицензтэйгээр нэмдэг.
            </p>
            <p className="en" lang="en">
              You can contribute straight from the converter — confirm a
              spelling is right, report a wrong one, name a missing meaning, or
              give the real spelling of a word we do not know. Every submission
              is reviewed by a human before it reaches the lexicon, and is
              licensed CC BY-SA 4.0.
            </p>
          </>
        )}
        {/* The links these sentences point at live in the prose itself; the
            row of bare links that used to follow said the same thing again a
            centimetre above the footer that now says it for every page. */}
        <p>
          Алдаа мэдэгдэх, эсвэл шинэ үг, нэр нэмэхийг хүсвэл{" "}
          <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">
            GitHub дээр
          </a>{" "}
          мөн засвар оруулах боломжтой — програмчлал мэдэхгүй байсан ч болно.
          Хөгжүүлэгч нар khudam package-ийг{" "}
          <a href={NPM_URL} target="_blank" rel="noreferrer">
            npm-ээс
          </a>{" "}
          суулгаарай.
        </p>
        <p className="en" lang="en">
          Found an error, or want to add a word or name? Contribute on GitHub —
          no coding needed. Developers can install the khudam package from npm.
        </p>
      </section>

      <SiteFooter />

      <ReportDialog target={report} onClose={() => setReport(null)} />
    </main>
  );
}
