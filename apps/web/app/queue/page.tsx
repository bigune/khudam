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
  const pool = useRef<Question[]>([]);

  function takeSet(remaining: Question[]): void {
    setSet(remaining.slice(0, SET_SIZE));
    setAnswers({});
    setAt(0);
    setSendFailed(false);
  }

  useEffect(() => {
    answered.current = new Set(readJson<string[]>(ANSWERED_KEY, []));
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
        const remaining = data.questions.filter(
          (q) => !answered.current.has(q.id),
        );
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
    for (const q of set) answered.current.add(q.id);
    writeJson(ANSWERED_KEY, [...answered.current].slice(-ANSWERED_MEMORY));
    writeJson(DRAFT_KEY, { ids: [], answers: {} });
    setSent((n) => n + sendable.length);
    pool.current = pool.current.filter((q) => !answered.current.has(q.id));
    setQueue((q) => (q ? { ...q, questions: pool.current } : q));
    takeSet(pool.current);
  }

  function skipSet(): void {
    // Walking away from a set costs nothing: its questions stay unanswered and
    // come round again in a later one.
    writeJson(DRAFT_KEY, { ids: [], answers: {} });
    const rest = pool.current.filter((q) => !set.includes(q));
    pool.current = rest;
    takeSet(rest);
  }

  return (
    <main>
      <header>
        <h1>Хянагдахаар хүлээгдэж буй үгс</h1>
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
            Жагсаалтыг ачаалж чадсангүй. Сүлжээгээ шалгаад хуудсыг дахин ачаална
            уу.
          </p>
        </section>
      )}

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
          <span className="field-label">
            Хянаж буй зурлага
            <span className="queue-progress">
              {at + 1} / {set.length}
            </span>
          </span>

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

            <div className="queue-nav">
              <button
                className="queue-step"
                disabled={at === 0}
                onClick={() => setAt((i) => i - 1)}
              >
                ← Өмнөх
              </button>
              <span className="queue-count">{answeredCount} хариулсан</span>
              <button
                className="queue-step"
                onClick={() => setAt((i) => i + 1)}
              >
                Дараах →
              </button>
            </div>
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
            хөтчид санал болгож байна.
          </p>
        )}
      </section>
    </main>
  );
}
