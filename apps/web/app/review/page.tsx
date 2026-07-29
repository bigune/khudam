"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { breakDown, spellOut } from "../../lib/codepoints";
import {
  canDecide,
  cleanLabel,
  recordDecisions,
  type Decision,
  type DecisionAction,
} from "../../lib/decisions";
import { claimGrant, signalsEnabled } from "../../lib/signals";
import { SiteFooter } from "../site-footer";
import { ThemeToggle } from "../theme-toggle";

/**
 * The expert review page.
 *
 * One person who reads монгол бичиг, deciding what a maintainer who does not
 * cannot decide from a diff. Everything below follows from two facts:
 *
 * **A rendered spelling is not enough.** Several distinct letters share
 * identical glyphs, so a wrong encoding can display as a right word — which
 * means a reviewer shown only the script could confirm a mistake in perfect
 * good faith, and nothing downstream would catch it. Every row therefore
 * carries its code-point breakdown, and that is not an advanced option.
 *
 * **This page cannot change anything.** Pressing send files rows into a
 * mailbox. A weekly job hashes each stamp against the roster in git,
 * transcribes what survives into a diff, and a human merges it. The page
 * proposes; git remains the database. Nothing here holds a credential that
 * could do otherwise, and that is why it can be a static file.
 */

const BUNDLE_URL = "/review-bundle.json";
const REPO = "bigune/khudam";
const REPO_URL = `https://github.com/${REPO}`;
/** Open pull requests, unauthenticated. GitHub allows 60 of these an hour per
 *  IP and sends `Access-Control-Allow-Origin: *`, so a static page may ask. */
const PULLS_URL = `https://api.github.com/repos/${REPO}/pulls?state=open&per_page=100`;
/** The branch prefix every drain of the mailbox pushes to. Shared with the
 *  guard in .github/workflows/signals.yml, deliberately: two ways of naming
 *  the same thing is two ways for them to drift. */
const REVIEW_BRANCH_PREFIX = "signals/";
const DRAFT_KEY = "khudam.review-draft";

interface Sibling {
  traditional: string;
  latin?: string;
  sense?: string;
  verified: boolean;
}

interface Item {
  id: string;
  cyrillic: string;
  traditional: string;
  latin?: string;
  sense?: string;
  source?: string;
  corroborated?: boolean;
  verified?: boolean;
  yes?: number;
  no?: number;
  attested?: string[];
  disputed?: string[];
  trusted?: string[];
  sessions?: number;
  traffic?: number;
  siblings?: Sibling[];
  senseRequired?: boolean;
  proposedSense?: string;
}

interface Group {
  pool: number;
  items: Item[];
}

interface Bundle {
  verifications: Group;
  wrong: Group;
  proposals: Group;
}

/** What the reviewer answered about one row, and any label they typed. */
interface Answer {
  verdict: boolean;
  sense?: string;
}

type Answers = Record<string, Answer>;

/** Which lock state the page is in. `unknown` is not `open`: it means the
 *  check itself failed, which must not read as permission. */
type Lock = "checking" | "open" | "locked" | "unknown";

type Sending = "idle" | "sending" | "sent" | "failed";

/**
 * The three groups, in the order they are worth a reviewer's attention.
 *
 * Verifications first because they are the cheapest true thing to say and the
 * only group that directly produces `verified: true`. Wrong reports next
 * because a rejection is somebody already having done the hard part. Proposals
 * last because they are the slowest to judge — a spelling nobody has stored,
 * with only a stranger's word for it.
 */
const GROUPS = [
  {
    key: "verifications" as const,
    title: "Баталгаажуулах",
    en: "Verify",
    blurb:
      "Хүн хараахан хянаагүй зурлагууд. Хэрэглэгчид эдгээрийн талаар хариулт өгсөн " +
      "боловч тэр нь баталгаа биш — таны «Тийм» л баталгаа болно.",
    yes: "Тийм, ингэж бичдэг",
    no: "Үгүй, ингэж бичдэггүй",
    action: (verdict: boolean): DecisionAction => (verdict ? "verify" : "reject"),
  },
  {
    key: "wrong" as const,
    title: "Буруу гэж мэдэгдсэн",
    en: "Reported wrong",
    blurb:
      "Хэн нэгэн эдгээр зурлагыг буруу гэсэн. Мэдэгдэл нь өөрөө нотолгоо биш: " +
      "буруу байж ч болно, эсвэл тухайн хүний хайж байсан салаа утга нь өөр байсан ч байж болно.",
    yes: "Зөв байна, мэдэгдэл буруу",
    no: "Тийм, буруу зурлага байна",
    action: (verdict: boolean): DecisionAction => (verdict ? "verify" : "reject"),
  },
  {
    key: "proposals" as const,
    title: "Санал болгосон зурлага",
    en: "Proposed spellings",
    blurb:
      "Хэн нэгний бичиж илгээсэн, үгсийн санд одоогоор байхгүй зурлагууд. " +
      "«Тийм» гэвэл шинэ хувилбар болж нэмэгдэнэ.",
    yes: "Тийм, ингэж бичдэг — нэмье",
    no: "Үгүй, ингэж бичдэггүй",
    action: (verdict: boolean): DecisionAction =>
      verdict ? "accept_proposal" : "reject",
  },
];

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
    // Private modes throw on write. The cost is a draft that does not survive
    // a reload — never a failed decision.
  }
}

/**
 * The spelling, and beneath it the letters it is actually made of.
 *
 * The single most important component on this page. A reviewer who trusts the
 * rendered form alone will eventually verify a wrong encoding — ᠣ/ᠤ and ᠥ/ᠦ
 * are separate letters that a font draws the same — so the breakdown is not
 * beside the specimen as a detail. It is the other half of it.
 */
function Spelling({ traditional }: { traditional: string }) {
  const glyphs = breakDown(traditional);
  return (
    <div className="spell">
      <span className="spell-script mongolian" lang="mn-Mong">
        {traditional}
      </span>
      {/* One line for a screen reader, columns for eyes. Without this the
          breakdown reads aloud as an unpunctuated stream of hex. */}
      <span className="sr-only">{spellOut(traditional)}</span>
      {/* Names and code points, never the letters themselves. A Mongolian
          letter on its own renders in its isolated form, which is a different
          shape from the one it takes inside the word above — a row of isolated
          glyphs would look like an answer to "which shape is which" and be the
          wrong one. Reading order carries the mapping instead: the word runs
          top to bottom, this runs left to right. */}
      <span className="spell-points" aria-hidden="true">
        {glyphs.map((g, i) => (
          <span
            className={g.invisible ? "point invisible" : "point"}
            key={`${g.code}-${i}`}
          >
            <span className="point-name">{g.name ?? "?"}</span>
            <span className="point-code">{g.code}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

/** What is already known about this spelling, in the order a reviewer would
 *  ask: who else answered, how many, how often the word is converted. */
function Evidence({ item }: { item: Item }) {
  const bits: string[] = [];
  if (item.yes !== undefined && (item.yes > 0 || (item.no ?? 0) > 0)) {
    bits.push(`${item.yes} ✓ / ${item.no ?? 0} ✗`);
  }
  if (item.sessions !== undefined) {
    bits.push(`${item.sessions} хүн мэдэгдсэн`);
  }
  if (item.traffic !== undefined) {
    bits.push(`${item.traffic}× хуулсан`);
  }
  const others = [
    ...(item.attested ?? []).map((l) => `${l} ✓`),
    ...(item.disputed ?? []).map((l) => `${l} ✗`),
    ...(item.trusted ?? []).map((l) => `${l} ⚑`),
  ];
  if (bits.length === 0 && others.length === 0) return null;
  return (
    <p className="review-evidence">
      {bits.join(" · ")}
      {others.length > 0 && (
        <>
          {bits.length > 0 && " · "}
          {/* Named because it changes the weight of your own uncertainty:
              another reader of the script has been here. Labels are opaque on
              purpose — the repository records that people agreed, never who. */}
          <span className="review-labels">
            өөр хянагч: {others.join(", ")}
          </span>
        </>
      )}
    </p>
  );
}

export default function ReviewPage() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [failed, setFailed] = useState(false);
  const [trusted, setTrusted] = useState<boolean | null>(null);
  const [lock, setLock] = useState<Lock>("checking");
  const [answers, setAnswers] = useState<Answers>({});
  const [sending, setSending] = useState<Sending>("idle");
  const [sentCount, setSentCount] = useState(0);
  const items = useRef<Map<string, { item: Item; groupIndex: number }>>(new Map());

  useEffect(() => {
    // Claiming happens here as well as on the other pages: a reviewer link may
    // point straight at this page, and it is the one they will actually use.
    setTrusted(claimGrant() !== null && canDecide());
    setAnswers(readJson<Answers>(DRAFT_KEY, {}));

    let cancelled = false;
    fetch(BUNDLE_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Bundle) => {
        if (cancelled) return;
        const index = new Map<string, { item: Item; groupIndex: number }>();
        GROUPS.forEach((group, groupIndex) => {
          for (const item of data[group.key].items) index.set(item.id, { item, groupIndex });
        });
        items.current = index;
        setBundle(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    // The soft lock. Decisions judged against a bundle that a pending merge is
    // about to move would be transcribed onto data that has already changed,
    // so the page stands down while one is open rather than storing any state
    // of its own. A pull request closed without merging releases it by itself.
    fetch(PULLS_URL, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((pulls: { head?: { ref?: string } }[]) => {
        if (cancelled) return;
        const open = pulls.some((p) => p.head?.ref?.startsWith(REVIEW_BRANCH_PREFIX));
        setLock(open ? "locked" : "open");
      })
      // Fails open, and says so. A page locked because GitHub was unreachable
      // would cost a reviewer their session for nothing, and the transcriber
      // already has to survive a decision about data that moved — it skips a
      // candidate that is already verified or gone.
      .catch(() => {
        if (!cancelled) setLock("unknown");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Written on every change, so "stop" needs no button: closing the tab is
  // stopping and coming back is continuing.
  useEffect(() => {
    if (bundle !== null) writeJson(DRAFT_KEY, answers);
  }, [answers, bundle]);

  function answer(id: string, verdict: boolean): void {
    setSending("idle");
    setAnswers((a) => {
      // Clicking the answer you already gave takes it back. Every other way out
      // of a wrong click asks you to choose something else instead, which is
      // not the same thing — "I should not have answered this" is its own
      // answer, and an unanswered row is one nobody has claimed to have read.
      if (a[id]?.verdict === verdict) {
        const { [id]: _cleared, ...rest } = a;
        return rest;
      }
      return { ...a, [id]: { ...a[id], verdict } };
    });
  }

  function label(id: string, sense: string): void {
    setAnswers((a) => ({ ...a, [id]: { ...a[id]!, sense } }));
  }

  /** Answers that can be sent as they stand. An accepted proposal that needs a
   *  meaning label and has none is held back rather than sent to fail: the
   *  entry schema would reject it, and a reviewer whose judgement vanished
   *  into a validation error learns nothing. */
  const ready: Decision[] = [];
  const incomplete: Item[] = [];
  for (const [id, given] of Object.entries(answers)) {
    const found = items.current.get(id);
    if (found === undefined) continue;
    const { item, groupIndex } = found;
    const action = GROUPS[groupIndex]!.action(given.verdict);
    // The label that will be sent: what the reviewer typed, or the
    // contributor's suggestion the field was visibly prefilled with. The
    // fallback is load-bearing — the input shows `proposedSense` before
    // anything is typed, so a reviewer who accepts and leaves the filled
    // field alone has approved that text, and holding the acceptance back
    // over a "missing" label would contradict what the page shows. It
    // applies only where the field was actually on screen (`senseRequired`);
    // a suggestion the reviewer never saw is not one they approved.
    const sense =
      action === "accept_proposal"
        ? (cleanLabel(given.sense) ?? (item.senseRequired ? cleanLabel(item.proposedSense) : undefined))
        : undefined;
    if (action === "accept_proposal" && item.senseRequired && sense === undefined) {
      incomplete.push(item);
      continue;
    }
    ready.push({
      cyrillic: item.cyrillic,
      traditional: item.traditional,
      action,
      ...(sense !== undefined ? { sense } : {}),
    });
  }

  async function send(): Promise<void> {
    setSending("sending");
    const ok = await recordDecisions(ready);
    if (!ok) {
      setSending("failed");
      return;
    }
    setSentCount(ready.length);
    setSending("sent");
    // The draft is cleared, but the bundle is not reloaded: it is a static file
    // that will not change until the next deploy, so re-rendering the same rows
    // as unanswered would invite the reviewer to judge them a second time.
    setAnswers({});
  }

  const anyItems = bundle !== null &&
    GROUPS.some((g) => bundle[g.key].items.length > 0);
  const held = bundle === null
    ? 0
    : GROUPS.reduce((n, g) => n + bundle[g.key].pool - bundle[g.key].items.length, 0);

  return (
    <main>
      <header>
        <div className="header-bar">
          <h1>Хянагчийн хуудас</h1>
          <ThemeToggle />
        </div>
        <p className="subtitle">Зурлага бүрийг үсэг үсгээр нь харуулав</p>
        <p className="en" lang="en">
          Trusted-reviewer decisions, every spelling shown letter by letter
        </p>
        <p className="stats">
          <Link href="/">← Хөрвүүлэгч рүү буцах</Link>
        </p>
      </header>

      {trusted === false && (
        <section className="info">
          <h2>Энэ хөтөч дээр хянагчийн эрх алга</h2>
          <p>
            Энэ хуудсыг үзэж болох ч, эндээс илгээсэн шийдвэр{" "}
            <strong>тооцогдохгүй</strong>: итгэмжлэгдсэн хянагчийн холбоос энэ
            төхөөрөмж дээр хадгалагдаагүй байна. Монгол бичгийг сайн уншдаг бол{" "}
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">
              GitHub дээр issue нээж
            </a>{" "}
            холбоос хүсээрэй.
          </p>
          <p>
            Тэр хүртэл{" "}
            <Link href="/queue">хянагдахаар хүлээгдэж буй үгсэд</Link> хариулж
            болно — тэнд нэргүй хариулт ч тооцогддог.
          </p>
        </section>
      )}

      {!signalsEnabled && (
        <section className="info">
          <p>
            Хариулт хүлээн авах тохиргоо энэ хувилбар дээр идэвхгүй байна.
            Жагсаалтыг үзэж болох ч шийдвэр хадгалагдахгүй.
          </p>
        </section>
      )}

      {lock === "locked" && (
        <section className="info">
          <h2>Өмнөх шийдвэрүүд хүлээгдэж байна</h2>
          <p>
            Нэгтгэгдээгүй pull request нээлттэй байна. Энэ жагсаалт түүнийг
            нэгтгэсний дараа шинэчлэгдэх тул одоо шийдвэр гаргах нь хуучирсан
            өгөгдөл дээр ажиллана гэсэн үг.{" "}
            <a href={`${REPO_URL}/pulls`} target="_blank" rel="noreferrer">
              Нээлттэй хүсэлтүүдийг харах →
            </a>
          </p>
        </section>
      )}

      {lock === "unknown" && (
        <section className="info">
          <p>
            GitHub-тай холбогдож чадсангүй тул нээлттэй pull request байгаа
            эсэхийг шалгаж чадаагүй. Үргэлжлүүлж болно — давхардсан шийдвэрийг
            нэгтгэх үед алгасдаг.
          </p>
        </section>
      )}

      {failed && (
        <section className="info">
          <p>
            Жагсаалтыг ачаалж чадсангүй. Сүлжээгээ шалгаад хуудсыг дахин
            ачаална уу.
          </p>
        </section>
      )}

      {sending === "sent" && (
        <section className="info">
          <h2>Илгээгдлээ</h2>
          <p>
            {sentCount} шийдвэрийг хүлээн авлаа. Дараагийн алхам нь{" "}
            <a href={`${REPO_URL}/actions/workflows/signals.yml`} target="_blank" rel="noreferrer">
              signals ажлыг ажиллуулах
            </a>{" "}
            — тэр нь холбоос бүрийг шалгаад, үлдсэн шийдвэрийг нэг pull request
            болгон гаргана. Эцсийн шийдвэрийг хүн нэгтгэж баталгаажуулна.
          </p>
        </section>
      )}

      {bundle !== null && !anyItems && sending !== "sent" && (
        <section className="info">
          <h2>Одоохондоо энэ л байна</h2>
          <p>
            Хянах зүйл алга. Жагсаалт долоо хоног тутмын нэгтгэлийн дараа
            шинэчлэгддэг.
          </p>
        </section>
      )}

      {bundle !== null &&
        lock !== "locked" &&
        GROUPS.map((group) => {
          const { items: rows, pool } = bundle[group.key];
          if (rows.length === 0) return null;
          return (
            <section className="review-group" key={group.key}>
              <h2>
                {group.title} <span className="review-count">{pool}</span>
              </h2>
              <p className="en" lang="en">
                {group.en}
              </p>
              <p className="review-blurb">{group.blurb}</p>

              <ol className="review-list">
                {rows.map((item) => {
                  const given = answers[item.id]?.verdict;
                  const needsLabel =
                    given === true &&
                    group.action(true) === "accept_proposal" &&
                    item.senseRequired;
                  return (
                    <li className="review-row" key={item.id}>
                      <div className="review-head">
                        <span className="review-word">{item.cyrillic}</span>
                        <span className="review-meta">
                          {item.latin && <span className="latin">{item.latin}</span>}
                          {item.sense && <span className="sense">{item.sense}</span>}
                          {item.source && (
                            <span className="badge unverified">{item.source}</span>
                          )}
                          {item.corroborated && (
                            <span className="badge unverified">
                              хоёр эх сурвалж таарсан
                            </span>
                          )}
                          {item.verified && (
                            <span className="badge verified">баталгаажсан ✓</span>
                          )}
                        </span>
                      </div>

                      <Spelling traditional={item.traditional} />
                      <Evidence item={item} />

                      {item.siblings && (
                        <div className="review-siblings">
                          <span className="field-label">
                            Энэ үгийн бусад хувилбар — зөвхөн харьцуулахад
                          </span>
                          {item.siblings.map((s) => (
                            <div className="review-sibling" key={s.traditional}>
                              <Spelling traditional={s.traditional} />
                              <span className="review-meta">
                                {s.latin && <span className="latin">{s.latin}</span>}
                                {s.sense && <span className="sense">{s.sense}</span>}
                                {s.verified && (
                                  <span className="badge verified">баталгаажсан ✓</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="choices">
                        {([true, false] as const).map((verdict) => (
                          <button
                            key={String(verdict)}
                            className={given === verdict ? "choice chosen" : "choice"}
                            onClick={() => answer(item.id, verdict)}
                          >
                            <span className="choice-title">
                              {verdict ? group.yes : group.no}
                            </span>
                          </button>
                        ))}
                      </div>

                      {needsLabel && (
                        <label className="field review-sense">
                          <span className="proposal-label">
                            Салаа утгын товч тайлбар — энэ үг нэгээс олон
                            хувилбартай болох тул заавал шаардлагатай
                          </span>
                          <input
                            className="proposal-input"
                            value={answers[item.id]?.sense ?? item.proposedSense ?? ""}
                            onChange={(e) => label(item.id, e.target.value)}
                            placeholder="жишээ нь: уул, ус"
                            maxLength={200}
                          />
                        </label>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

      {bundle !== null && anyItems && lock !== "locked" && (
        <section className="review-send">
          {incomplete.length > 0 && (
            <p className="report-status report-status-error">
              {incomplete.length} санал салаа утгын тайлбар хүлээж байна —
              түүнгүйгээр үгсийн санд бичигдэх боломжгүй тул илгээхгүй.
            </p>
          )}
          {sending === "failed" && (
            <p className="report-status report-status-error">
              Уучлаарай, илгээж чадсангүй. Шийдвэрүүд тань хэвээр байна — дахин
              оролдоно уу.
            </p>
          )}
          <button
            className="proposal-submit"
            disabled={sending === "sending" || ready.length === 0 || trusted !== true}
            onClick={send}
          >
            {sending === "sending"
              ? "Илгээж байна…"
              : ready.length === 0
                ? "Шийдвэрлэсэн зүйл алга"
                : `${ready.length} шийдвэр илгээх`}
          </button>
          {held > 0 && (
            <p className="review-held">
              Өөр {held} зурлага дараагийн шинэчлэлд орохоор хүлээж байна.
            </p>
          )}
        </section>
      )}

      <section className="info">
        <h2>Энэ хуудас юу хийдэг вэ?</h2>
        <p>
          Зурлага бүрийг монгол бичгээр нь болон{" "}
          <strong>үсэг тус бүрийн Юникод кодоор</strong> нь зэрэг харуулна. Энэ
          нь чимэг биш: монгол бичигт хэд хэдэн өөр үсэг яг ижил дүрстэй байдаг
          тул зөвхөн харагдах байдлаар нь зөв эсэхийг нь тогтоох боломжгүй.
        </p>
        <p>
          Илгээсэн шийдвэр шууд үгсийн санд ордоггүй. Тэдгээр нь долоо хоног
          тутмын ажилд орж, хянагчийн холбоос бүр репозитор дахь жагсаалттай
          тулгагдан шалгагдаж, эцэст нь нэг pull request болж хүн нэгтгэнэ.
        </p>
        <p className="en" lang="en">
          Every spelling is shown as script and as code points, because several
          distinct Mongolian letters share identical glyphs — appearance alone
          cannot tell a right encoding from a wrong one. Decisions sent from
          here are not data: a weekly job checks each stamp against the roster
          in git and transcribes what survives into one pull request, which a
          human merges.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
