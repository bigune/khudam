"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  recordProposal,
  recordVerdict,
  signalsEnabled,
  type ProposalText,
} from "../../lib/signals";
import { ProposalForm } from "../proposal-form";

/**
 * The verification queue: one question at a time, answered by people who read
 * монгол бичиг.
 *
 * Every question has the same shape, and it is the weakest one that still
 * helps — *is this a written form of this word, for any meaning?* Yes/no
 * answers to that compose into everything else: two candidates both answered
 * yes are homonyms and both belong, one yes and one no names the spelling to
 * delete. Asking "which of these is right?" would force a choice where the
 * honest answer is often "both".
 *
 * An answer is not verification. It is a count a reviewer reads beside the
 * candidate; `verified: true` is still one human and one merged pull request.
 */

const QUEUE_URL = "/queue.json";
const REPO_URL = "https://github.com/bigune/khudam";
const DATA_LICENSE_URL = `${REPO_URL}/blob/main/data/LICENSE`;
const ANSWERED_KEY = "khudam.answered";

/** Questions per sitting. Nobody owes the lexicon more than a few minutes, and
 *  a queue that never says "that's enough" is one people leave rather than
 *  finish. Continuing is one button. */
const BATCH = 10;

/** How many answered ids to remember. Enough to never repeat a question in
 *  practice; bounded so localStorage cannot grow without limit. */
const ANSWERED_MEMORY = 5000;

interface Alternative {
  traditional: string;
  latin?: string;
  sense?: string;
  verified: boolean;
}

interface Question {
  id: string;
  cyrillic: string;
  traditional: string;
  latin?: string;
  sense?: string;
  source: string;
  corroborated?: boolean;
  reason: "flagged" | "conflict" | "traffic";
  alternatives?: Alternative[];
}

interface Queue {
  pool: number;
  questions: Question[];
}

function readAnswered(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(ANSWERED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function rememberAnswered(ids: Set<string>): void {
  try {
    window.localStorage.setItem(
      ANSWERED_KEY,
      JSON.stringify([...ids].slice(-ANSWERED_MEMORY)),
    );
  } catch {
    // Private modes throw on write. Losing the memory only means a question
    // may be asked twice, which is not worth failing an answer over.
  }
}

/** Why this candidate is being asked about — said plainly, because it changes
 *  how much weight the reader should give their own uncertainty. */
const REASON_NOTE: Record<Question["reason"], string> = {
  flagged: "Үүнийг хэн нэгэн буруу гэж мэдэгдсэн.",
  conflict:
    "Хоёр өөр эх сурвалж энэ үгийг өөр өөрөөр бичсэн — хоёулаа зөв ч байж болно.",
  traffic: "Энэ хувилбарыг олон хүн сонгосон ч хүн хараахан хянаагүй байна.",
};

export default function QueuePage() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [failed, setFailed] = useState(false);
  const [at, setAt] = useState(0);
  const [answeredThisVisit, setAnsweredThisVisit] = useState(0);
  const [batchDone, setBatchDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [proposing, setProposing] = useState(false);
  const answered = useRef<Set<string>>(new Set());

  useEffect(() => {
    answered.current = readAnswered();
    let cancelled = false;
    fetch(QUEUE_URL)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((data: Queue) => {
        if (cancelled) return;
        // Questions this browser has already answered are dropped here rather
        // than at the source: the file is one static artifact served to
        // everyone, and who answered what is nobody's business but the
        // browser's.
        setQueue({
          pool: data.pool,
          questions: data.questions.filter((q) => !answered.current.has(q.id)),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const question = queue?.questions[at];

  function advance(): void {
    setProposing(false);
    setSendFailed(false);
    setAt((i) => i + 1);
  }

  async function answer(verdict: boolean): Promise<void> {
    if (!question || busy) return;
    setBusy(true);
    setSendFailed(false);
    const ok = await recordVerdict(
      {
        cyrillic: question.cyrillic,
        traditional: question.traditional,
        sense: question.sense,
      },
      verdict,
      question.id,
    );
    setBusy(false);
    if (!ok) {
      setSendFailed(true);
      return;
    }
    answered.current.add(question.id);
    rememberAnswered(answered.current);
    const count = answeredThisVisit + 1;
    setAnsweredThisVisit(count);
    // "No" is the answer worth following up: someone who can tell a spelling is
    // wrong sometimes knows the right one, and this is the moment to ask.
    if (verdict) {
      if (count % BATCH === 0) setBatchDone(true);
      advance();
    } else {
      setProposing(true);
    }
  }

  async function propose(text: ProposalText): Promise<void> {
    if (!question) return;
    setBusy(true);
    setSendFailed(false);
    const ok = await recordProposal(
      {
        cyrillic: question.cyrillic,
        traditional: question.traditional,
        sense: question.sense,
      },
      "correction",
      text,
      "queue",
    );
    setBusy(false);
    if (!ok) {
      setSendFailed(true);
      return;
    }
    if (answeredThisVisit % BATCH === 0) setBatchDone(true);
    advance();
  }

  return (
    <main>
      <header>
        <h1>Хянах дараалал</h1>
        <p className="subtitle">
          Монгол бичиг уншдаг хүн бүрийн нэг минут хэрэгтэй
        </p>
        <p className="en" lang="en">
          Help verify the lexicon, one spelling at a time
        </p>
        <p className="stats">
          <Link href="/">← Хөрвүүлэгч рүү буцах</Link>
        </p>
      </header>

      {!signalsEnabled && (
        <section className="info">
          <p>
            Хариулт хүлээн авах тохиргоо энэ хувилбар дээр идэвхгүй байна.
            Асуултуудыг үзэж болох ч хариулт хадгалагдахгүй.
          </p>
        </section>
      )}

      {failed && (
        <section className="info">
          <p>
            Дарааллыг ачаалж чадсангүй. Сүлжээгээ шалгаад хуудсыг дахин ачаална
            уу.
          </p>
        </section>
      )}

      {queue && !question && (
        <section className="info">
          <h2>Одоохондоо энэ л байна</h2>
          <p>
            {answeredThisVisit > 0
              ? `Баярлалаа — та ${answeredThisVisit} асуултад хариуллаа. `
              : ""}
            Энэ хөтчөөр хариулах асуулт үлдсэнгүй. Дараалал долоо хоног тутам
            шинэчлэгддэг тул дараа дахин ирээрэй.
          </p>
          <p className="links-row">
            <Link href="/">Хөрвүүлэгч</Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </section>
      )}

      {question && batchDone && (
        <section className="info">
          <h2>Баярлалаа</h2>
          <p>
            Та энэ удаад {answeredThisVisit} асуултад хариуллаа. Хариулт бүр
            хянагчид хаана харахыг зааж өгдөг — баталгаажуулах эцсийн шийдвэрийг
            хүн гаргана.
          </p>
          <div className="choices">
            <button className="choice" onClick={() => setBatchDone(false)}>
              <span className="choice-title">Үргэлжлүүлэх</span>
              <span className="choice-hint">Дахин {BATCH} асуулт</span>
            </button>
          </div>
        </section>
      )}

      {question && !batchDone && (
        <section className="queue">
          {/* Naming the specimen rather than the step. "Асуулт" left the reader
              to work out which of the spellings on screen was the one being
              asked about — and the alternatives below it made that a real
              question. */}
          <span className="field-label">
            Хянаж буй зурлага
            <span className="queue-progress">
              {(answeredThisVisit % BATCH) + 1} / {BATCH}
            </span>
          </span>

          <div className="queue-card">
            <span className="queue-word">{question.cyrillic}</span>
            <span className="queue-trad mongolian" lang="mn-Mong">
              {question.traditional}
            </span>
            <span className="queue-meta">
              {question.latin && (
                <span className="latin">{question.latin}</span>
              )}
              {question.sense && (
                <span className="sense">{question.sense}</span>
              )}
              <span className="badge unverified">
                {question.corroborated
                  ? "хоёр эх сурвалж таарсан"
                  : "баталгаажаагүй"}
              </span>
            </span>
          </div>

          {/* Context sits with the specimen, above the rule — never between the
              question and its answers. Down there it read as a second thing to
              judge, and "ингэж" ("like this") stopped having one referent. */}
          {question.alternatives && question.alternatives.length > 0 && (
            <div className="queue-alts">
              <span className="field-label">
                Энэ үгийн бусад хувилбар — зөвхөн харьцуулахад
              </span>
              <div className="queue-alt-row">
                {question.alternatives.map((alt) => (
                  <span className="queue-alt" key={alt.traditional}>
                    <span className="queue-alt-trad mongolian" lang="mn-Mong">
                      {alt.traditional}
                    </span>
                    {alt.sense && <span className="sense">{alt.sense}</span>}
                    {alt.verified && (
                      <span className="badge verified">баталгаажсан ✓</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="queue-ask">
            <p className="queue-question">
              Дээрх «<strong>{question.cyrillic}</strong>» үгийн зурлагыг монгол
              бичгээр <strong>ямар нэг утгаар нь</strong> ингэж бичдэг үү?
            </p>
            <p className="queue-reason">{REASON_NOTE[question.reason]}</p>

            {sendFailed && (
              <p className="report-status report-status-error">
                Уучлаарай, хариултыг илгээж чадсангүй. Дахин оролдоно уу.
              </p>
            )}

            {!proposing && (
              <div className="choices">
                <button
                  className="choice"
                  disabled={busy}
                  onClick={() => answer(true)}
                >
                  <span className="choice-title">Тийм, ингэж бичдэг</span>
                </button>
                <button
                  className="choice"
                  disabled={busy}
                  onClick={() => answer(false)}
                >
                  <span className="choice-title">Үгүй, ингэж бичдэггүй</span>
                </button>
                {/* No hint under this one: three answers to one question should
                    be three buttons of the same height, and "I don't know" needs
                    no explaining. */}
                <button className="choice" disabled={busy} onClick={advance}>
                  <span className="choice-title">Мэдэхгүй</span>
                </button>
              </div>
            )}

            {proposing && (
              <div className="report-optional">
                <p className="report-receipt">
                  <span className="report-receipt-mark" aria-hidden="true">
                    ✓
                  </span>
                  Хариултыг тань хүлээн авлаа. Зөв зурлагыг нь мэддэг бол доор
                  бичиж болно — заавал биш.
                </p>
                <ProposalForm
                  key={question.id}
                  kind="correction"
                  word={question.cyrillic}
                  busy={busy}
                  focusOnMount={false}
                  onSubmit={propose}
                />
                <div className="choices">
                  <button className="choice" disabled={busy} onClick={advance}>
                    <span className="choice-title">Алгасах</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="report-consent">
            Хувь нэмэр{" "}
            <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>{" "}
            лицензтэй
          </p>
        </section>
      )}

      <section className="info">
        <h2>Энэ юу вэ?</h2>
        <p>
          Үгсийн сангийн дийлэнх нь машинаар үүсгэгдсэн, хүн хараахан хянаагүй
          суурь өгөгдөл. Энд асуух асуулт нэг л төрөл: тухайн үгийг{" "}
          <strong>ямар нэг утгаар нь</strong> ингэж бичдэг эсэх. Иймд нэг үг
          хоёр өөр зурлагатай байж болно — хоёулаа зөв бол хоёуланг нь үлдээнэ.
        </p>
        <p className="en" lang="en">
          Every question asks the same thing: is this a written form of this
          word, for any meaning? Two spellings of one word can both be right —
          answers accumulate as counts a human reviewer reads, and only a merged
          pull request ever marks anything verified.
        </p>
        {queue && (
          <p className="stats">
            Хянуулахаар хүлээгдэж буй {queue.pool.toLocaleString("mn-MN")}{" "}
            зурлагаас {queue.questions.length.toLocaleString("mn-MN")}-г энэ
            удаад санал болгож байна.
          </p>
        )}
      </section>
    </main>
  );
}
