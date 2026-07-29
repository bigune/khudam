"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  recordQueueAnswers,
  signalsEnabled,
  type ProposalText,
  type QueueAnswer,
} from "../../lib/signals";
import { ProposalForm } from "../proposal-form";
import { ReviewerBadge } from "../reviewer-badge";
import { SiteFooter } from "../site-footer";
import { ThemeToggle } from "../theme-toggle";

/**
 * The verification queue: one spelling at a time, answered by people who read
 * монгол бичиг.
 *
 * Every question has the same shape, and it is the weakest one that still
 * helps — *is this a written form of this word, for any meaning?* Yes/no
 * answers to that compose into everything else: two candidates both answered
 * yes are homonyms and both belong, one yes and one no names the spelling to
 * delete. Asking "which of these is right?" would force a choice where the
 * honest answer is often "both".
 *
 * Answers are held in a local draft and stay editable until the set is sent.
 * That is the difference between a form and an interrogation: a misclick on
 * question two is fixable from question seven, and closing the tab loses
 * nothing — the draft stays on the device until it is sent or skipped.
 *
 * An answer is not verification. It is a count a reviewer reads beside the
 * candidate; `verified: true` is still one human and one merged pull request.
 */

const QUEUE_URL = "/queue.json";
const REPO_URL = "https://github.com/bigune/khudam";
const DATA_LICENSE_URL = `${REPO_URL}/blob/main/data/LICENSE`;
const ANSWERED_KEY = "khudam.answered";
const DRAFT_KEY = "khudam.queue-draft";
const SKIPPED_KEY = "khudam.queue-skipped";

/** Questions per set. Nobody owes the lexicon more than a few minutes, and a
 *  queue that never says "that is enough" is one people leave rather than
 *  finish. Continuing is one button. */
const SET_SIZE = 10;

/** How many answered ids to remember. Enough never to repeat a question in
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

/** `verdict: null` is "I don't know" — a question visited and left alone. It is
 *  never sent: silence is not evidence. */
interface Answer {
  verdict: boolean | null;
  proposal?: ProposalText;
}

type Answers = Record<string, Answer>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private modes throw on write. The cost is a question asked twice, or a
    // draft that does not survive a reload — never a failed answer.
  }
}

/** Why this candidate is being asked about, said plainly: it changes how much
 *  weight a reader should give their own uncertainty. */
function reasonNote(question: Question): string {
  if (question.reason === "flagged")
    return "Үүнийг хэн нэгэн буруу гэж мэдэгдсэн.";
  if (question.reason === "traffic")
    return "Энэ хувилбарыг олон хүн сонгосон ч хүн хараахан хянаагүй байна.";
  // Wording follows the count rather than assuming two: entries with three and
  // four recorded spellings already exist, and more sources are planned.
  return (question.alternatives?.length ?? 0) > 1
    ? "Энэ үгийн хэд хэдэн өөр зурлага бүртгэгдсэн — нэгээс олон нь зөв байж болно."
    : "Хоёр өөр эх сурвалж энэ үгийг өөр өөрөөр бичсэн — хоёулаа зөв ч байж болно.";
}

function AlternativeCard({ alt }: { alt: Alternative }) {
  return (
    <span className="queue-alt">
      <span className="queue-alt-trad mongolian" lang="mn-Mong">
        {alt.traditional}
      </span>
      {alt.sense && <span className="sense">{alt.sense}</span>}
      {alt.verified && <span className="badge verified">баталгаажсан ✓</span>}
    </span>
  );
}

export default function QueuePage() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [failed, setFailed] = useState(false);
  const [set, setSet] = useState<Question[]>([]);
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [sent, setSent] = useState(0);
  const answered = useRef<Set<string>>(new Set());
  const skipped = useRef<Set<string>>(new Set());
  const pool = useRef<Question[]>([]);

  function takeSet(remaining: Question[]): void {
    setSet(remaining.slice(0, SET_SIZE));
    setAnswers({});
    setAt(0);
    setSendFailed(false);
  }

  useEffect(() => {
    answered.current = new Set(readJson<string[]>(ANSWERED_KEY, []));
    skipped.current = new Set(readJson<string[]>(SKIPPED_KEY, []));
    let cancelled = false;
    fetch(QUEUE_URL)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((data: Queue) => {
        if (cancelled) return;
        // Questions this browser has already sent are dropped here rather than
        // at the source: the file is one static artifact served to everyone,
        // and who answered what is nobody's business but the browser's.
        const unanswered = data.questions.filter(
          (q) => !answered.current.has(q.id),
        );
        // Sets this browser skipped sit at the back, so a fresh visit opens on
        // questions it has not offered before. They are not discarded: once
        // everything else is done they come round again.
        const remaining = [
          ...unanswered.filter((q) => !skipped.current.has(q.id)),
          ...unanswered.filter((q) => skipped.current.has(q.id)),
        ];
        pool.current = remaining;
        setQueue({ pool: data.pool, questions: remaining });

        // An unsent draft resumes as it was left, in its original order —
        // otherwise stopping mid-set would quietly discard the work.
        const draft = readJson<{ ids: string[]; answers: Answers }>(DRAFT_KEY, {
          ids: [],
          answers: {},
        });
        const byId = new Map(remaining.map((q) => [q.id, q]));
        const resumed = draft.ids
          .map((id) => byId.get(id))
          .filter((q): q is Question => !!q);
        if (resumed.length > 0) {
          setSet(resumed);
          setAnswers(draft.answers);
          setAt(0);
        } else {
          takeSet(remaining);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The draft is written on every change, so "stop" needs no button: closing
  // the tab is stopping, and coming back is continuing.
  useEffect(() => {
    if (set.length > 0)
      writeJson(DRAFT_KEY, { ids: set.map((q) => q.id), answers });
  }, [set, answers]);

  const question = set[at];
  const reviewing = set.length > 0 && at >= set.length;
  const answeredCount = set.filter(
    (q) => answers[q.id]?.verdict != null,
  ).length;
  const sendable: QueueAnswer[] = set
    .filter((q) => answers[q.id]?.verdict != null)
    .map((q) => ({
      anchor: {
        cyrillic: q.cyrillic,
        traditional: q.traditional,
        sense: q.sense,
      },
      questionId: q.id,
      verdict: answers[q.id]!.verdict as boolean,
      proposal: answers[q.id]!.proposal,
    }));

  function answer(id: string, verdict: boolean | null): void {
    // Clicking the answer you already gave takes it back. Every other way out
    // of a wrong click asks you to choose something else instead, which is not
    // the same thing — "I should not have answered this" is its own answer, and
    // an unanswered question stays in the queue for someone else.
    if (answers[id]?.verdict === verdict) {
      setAnswers((a) => {
        const { [id]: _cleared, ...rest } = a;
        return rest;
      });
      return;
    }
    setAnswers((a) => ({ ...a, [id]: { ...a[id], verdict } }));
    // Yes and don't-know are finished thoughts, so they move on. No opens the
    // spelling field, which it would be pointless to scroll past.
    if (verdict !== false) setAt((i) => i + 1);
  }

  function saveProposal(id: string, proposal: ProposalText): void {
    setAnswers((a) => ({ ...a, [id]: { ...a[id]!, proposal } }));
    setAt((i) => i + 1);
  }

  async function send(): Promise<void> {
    setBusy(true);
    setSendFailed(false);
    const ok = await recordQueueAnswers(sendable);
    setBusy(false);
    if (!ok) {
      setSendFailed(true);
      return;
    }
    // Only what was actually answered is remembered as done — including "I
    // don't know", which is a judgement and not worth asking the same person
    // twice. A question passed over without an answer stays in the queue: it
    // was never put to anyone, and hiding it forever would quietly shrink the
    // pool every time someone paged through a set.
    const done = set
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => q.id);
    for (const id of done) answered.current.add(id);
    writeJson(ANSWERED_KEY, [...answered.current].slice(-ANSWERED_MEMORY));
    writeJson(DRAFT_KEY, { ids: [], answers: {} });
    writeJson(
      SKIPPED_KEY,
      [...skipped.current].filter((id) => !answered.current.has(id)),
    );
    setSent((n) => n + sendable.length);
    pool.current = pool.current.filter((q) => !answered.current.has(q.id));
    setQueue((q) => (q ? { ...q, questions: pool.current } : q));
    takeSet(pool.current);
  }

  function skipSet(): void {
    // A skipped set goes to the back of the queue rather than out of it. In
    // memory alone this was invisible: the order is deterministic, so the next
    // visit served the same ten again, and a set you did not want became the
    // set you always got.
    writeJson(DRAFT_KEY, { ids: [], answers: {} });
    for (const q of set) skipped.current.add(q.id);
    writeJson(SKIPPED_KEY, [...skipped.current]);
    const rest = [...pool.current.filter((q) => !set.includes(q)), ...set];
    pool.current = rest;
    takeSet(rest);
  }

  return (
    <main>
      <header>
        <div className="header-bar">
          <h1>Хянагдахаар хүлээгдэж буй үгс</h1>
          <ThemeToggle />
        </div>
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

      <ReviewerBadge />

      {!signalsEnabled && (
        <section className="notice notice-warn">
          <p>
            Хариулт хүлээн авах тохиргоо энэ хувилбар дээр идэвхгүй байна.
            Асуултуудыг үзэж болох ч хариулт хадгалагдахгүй.
          </p>
        </section>
      )}

      {failed && (
        <section className="notice notice-error">
          <p>
            Жагсаалтыг ачаалж чадсангүй. Сүлжээгээ шалгаад хуудсыг дахин ачаална
            уу.
          </p>
        </section>
      )}

      {/* Between mount and the fetch resolving the page had nothing at all
          here, which on a slow connection reads as broken. One quiet line;
          the queue is not a place for a spinner. */}
      {!queue && !failed && <p className="note">Ачаалж байна…</p>}

      {queue && set.length === 0 && (
        <section className="info">
          <h2>Одоохондоо энэ л байна</h2>
          <p>
            {sent > 0 ? `Баярлалаа — та ${sent} хариулт илгээлээ. ` : ""}
            Энэ хөтчөөр хариулах үг үлдсэнгүй. Жагсаалт долоо хоног тутам
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

      {question && (
        <section className="queue">
          {/* Navigation lives at the top, where it does not move. Below the
              specimen its position depended on how long the word was and
              whether a spelling field was open, so moving quickly through a
              set meant re-finding the same two buttons on every question. */}
          <div className="queue-nav">
            <button
              className="queue-step"
              disabled={at === 0}
              onClick={() => setAt((i) => i - 1)}
            >
              ← Өмнөх
            </button>
            <span className="queue-progress">
              {at + 1} / {set.length}
              {answeredCount > 0 && ` · ${answeredCount} хариулсан`}
            </span>
            <button className="queue-step" onClick={() => setAt((i) => i + 1)}>
              Дараах →
            </button>
          </div>

          <span className="field-label">Хянаж буй зурлага</span>

          {/* Side by side while there is exactly one other spelling — the
              comparison IS the question in that case, and it is by far the
              common one (375 of the 384 entries with more than one candidate).
              Three or more stack below instead: at that width the vertical
              script becomes unreadable, and "both" stops being the shape of
              the answer anyway. */}
          <div
            className={
              question.alternatives?.length === 1 ? "queue-compare" : undefined
            }
          >
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

            {question.alternatives?.length === 1 && (
              <div className="queue-aside">
                <span className="field-label">Бусад</span>
                <AlternativeCard alt={question.alternatives[0]!} />
              </div>
            )}
          </div>

          {(question.alternatives?.length ?? 0) > 1 && (
            <div className="queue-alts">
              <span className="field-label">
                Энэ үгийн бусад хувилбар — зөвхөн харьцуулахад
              </span>
              <div className="queue-alt-row">
                {question.alternatives!.map((alt) => (
                  <AlternativeCard alt={alt} key={alt.traditional} />
                ))}
              </div>
            </div>
          )}

          <div className="queue-ask">
            <p className="queue-question">
              Дээрх «<strong>{question.cyrillic}</strong>» үгийн зурлагыг монгол
              бичгээр <strong>ямар нэг утгаар нь</strong> ингэж бичдэг үү?
            </p>
            <p className="queue-reason">{reasonNote(question)}</p>

            <div className="choices">
              {(
                [
                  [true, "Тийм, ингэж бичдэг"],
                  [false, "Үгүй, ингэж бичдэггүй"],
                  [null, "Мэдэхгүй"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={label}
                  className={
                    answers[question.id]?.verdict === value
                      ? "choice chosen"
                      : "choice"
                  }
                  onClick={() => answer(question.id, value)}
                >
                  <span className="choice-title">{label}</span>
                </button>
              ))}
            </div>

            {answers[question.id]?.verdict === false && (
              <div className="report-optional">
                <ProposalForm
                  key={question.id}
                  kind="correction"
                  word={question.cyrillic}
                  busy={false}
                  focusOnMount={false}
                  initial={answers[question.id]?.proposal}
                  submitLabel="Хадгалаад цааш"
                  onSubmit={(text) => saveProposal(question.id, text)}
                />
              </div>
            )}
          </div>

          <p className="report-consent">
            Хариултууд илгээх хүртэл зөвхөн энэ төхөөрөмж дээр хадгалагдана.
            Хувь нэмэр{" "}
            <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>{" "}
            лицензтэй
          </p>
        </section>
      )}

      {reviewing && (
        <section className="queue">
          <span className="field-label">Илгээхийн өмнө</span>
          <ol className="queue-review">
            {set.map((q, i) => {
              const verdict = answers[q.id]?.verdict;
              const state =
                verdict === true ? "yes" : verdict === false ? "no" : "none";
              return (
                <li key={q.id}>
                  <button className="queue-review-row" onClick={() => setAt(i)}>
                    <span className="queue-review-word">{q.cyrillic}</span>
                    <span
                      className="queue-review-trad mongolian"
                      lang="mn-Mong"
                    >
                      {q.traditional}
                    </span>
                    <span className={`queue-review-answer ${state}`}>
                      {verdict === true
                        ? "Тийм"
                        : verdict === false
                          ? "Үгүй"
                          : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {sendFailed && (
            <p className="report-status report-status-error">
              Уучлаарай, илгээж чадсангүй. Хариултууд тань хэвээр байгаа — дахин
              оролдоно уу.
            </p>
          )}

          <div className="choices">
            <button
              className="proposal-submit"
              disabled={busy || answeredCount === 0}
              onClick={send}
            >
              {busy
                ? "Илгээж байна…"
                : answeredCount === 0
                  ? "Хариулсан зүйл алга"
                  : `${answeredCount} хариулт илгээх`}
            </button>
            <button className="choice" disabled={busy} onClick={() => setAt(0)}>
              <span className="choice-title">← Буцаж хянах</span>
            </button>
            <button className="choice" disabled={busy} onClick={skipSet}>
              <span className="choice-title">
                Эдгээрийг алгасаад дараагийн {SET_SIZE}
              </span>
              <span className="choice-hint">Хариултууд илгээгдэхгүй</span>
            </button>
          </div>
        </section>
      )}

      <section className="info">
        <h2>Энэ юу вэ?</h2>
        <p>
          Үгсийн сангийн дийлэнх нь машинаар үүсгэгдсэн, хүн хараахан хянаагүй
          суурь өгөгдөл. Энд асуух асуулт нэг л төрөл: тухайн үгийг{" "}
          <strong>ямар нэг утгаар нь</strong> ингэж бичдэг эсэх.
        </p>
        {/* The old one-liner ("if both are right we keep both") assumed the
            reader already knew why a word would have two right spellings.
            Without the example it reads as a rule with no reason — and the
            reason is the whole point of the page: nobody has to choose. */}
        {/* The example is named, not shown: монгол бичиг is written downwards,
            and a word dropped into a horizontal sentence renders on its side —
            a specimen nobody can read is worse than none. The reader meets the
            actual spellings in the questions, where they stand upright. */}
        <p>
          Нэг үг хоёр өөр зөв зурлагатай байж болно: «уул» гэдэг үгийг уулын
          утгаар нэг янзаар, «уул нь» гэсэн утгаар өөрөөр бичдэг. Тиймээс нэгийг
          нь сонгох шаардлагагүй — аль алинд нь «Тийм» гэж хариулж болох ба бид
          хоёуланг нь үгсийн санд үлдээнэ.
        </p>
        <p className="en" lang="en">
          Every question asks the same thing: is this a written form of this
          word, for any meaning? Two spellings of one word can both be right —
          answers accumulate as counts a human reviewer reads, and only a merged
          pull request ever marks anything verified.
        </p>
        {/* Three different numbers used to be blurred into one sentence: how
            many spellings are waiting overall, how many this browser still has
            to answer, and how many are put in front of you at once. */}
        {queue && (
          <p className="stats">
            Нийт {queue.pool.toLocaleString("mn-MN")} зурлага хянагдахаар
            хүлээгдэж байна. Танд{" "}
            {queue.questions.length.toLocaleString("mn-MN")} нь үлдсэн бөгөөд{" "}
            {SET_SIZE}-аар нь санал болгоно.
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
