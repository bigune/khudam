"use client";

import type { Candidate } from "khudam";
import { useEffect, useRef, useState } from "react";
import {
  displaySense,
  needsSenseBranch,
  proposalKindFor,
  recordFlag,
  recordProposal,
  type FlagKind,
  type ProposalText,
} from "../lib/signals";
import { ProposalForm } from "./proposal-form";

const ISSUES_URL = "https://github.com/bigune/khudam/issues";
const DATA_LICENSE_URL =
  "https://github.com/bigune/khudam/blob/main/data/LICENSE";

/**
 * Which door the contributor came through. Each starts the dialog at a
 * different point, and `unknown_word` is the one where nothing is wrong —
 * the lexicon simply does not know the word, so there is no flag to file.
 */
export type ReportDoor = "flag" | "missing_sense" | "unknown_word";

export interface ReportTarget {
  door: ReportDoor;
  /** The Cyrillic word as it appeared in the input. */
  input: string;
  /** The candidate under discussion; for `unknown_word`, the guess we showed. */
  candidate: Candidate;
}

const TITLES: Record<ReportDoor, string> = {
  flag: "Алдаа мэдэгдэх",
  missing_sense: "Дутуу салаа утга нэмэх",
  unknown_word: "Зөв зурлага санал болгох",
};

type Stage = "ask" | "flagging" | "propose" | "sending" | "done" | "error";

/**
 * Reports a problem with a candidate, and — optionally — what the right
 * answer is.
 *
 * For candidates with no meaning label (most of the lexicon, since the
 * machine-imported seed layer has none) the dialog first asks whether the
 * spelling is wrong or the wanted meaning is missing. The two answers resolve
 * to different data operations — replace the form vs. add a candidate beside
 * it — and only the contributor can tell them apart.
 *
 * The flag is recorded as soon as that question is answered, before the
 * proposal step is offered. Recognising that a spelling is wrong is the
 * common case and producing the right one is the rare one; a contributor who
 * stops at the second step must not also lose the first.
 */
export function ReportDialog({
  target,
  onClose,
}: {
  target: ReportTarget | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [stage, setStage] = useState<Stage>("ask");
  const [kind, setKind] = useState<FlagKind | null>(null);
  const [sendFailed, setSendFailed] = useState(false);
  /** The target whose flag was already filed, so a re-run of the effect — or
   *  React's development double-invoke — cannot file it twice. */
  const filedFor = useRef<ReportTarget | null>(null);

  async function flag(t: ReportTarget, chosen: FlagKind) {
    setKind(chosen);
    setStage("flagging");
    const ok = await recordFlag(
      {
        cyrillic: t.input,
        traditional: t.candidate.traditional,
        sense: t.candidate.sense,
      },
      chosen,
    );
    setStage(ok ? "propose" : "error");
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!target) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    setSendFailed(false);
    setKind(target.door === "missing_sense" ? "missing_sense" : null);
    // An unknown word is not an error report: there is nothing to flag, only
    // a spelling to offer.
    setStage(target.door === "unknown_word" ? "propose" : "ask");
    // Clicking "the meaning I wanted is missing" *is* the answer to the
    // branching question, so it is banked on arrival instead of asked again.
    if (target.door === "missing_sense" && filedFor.current !== target) {
      filedFor.current = target;
      void flag(target, "missing_sense");
    }
  }, [target]);

  async function propose(text: ProposalText) {
    if (!target) return;
    setSendFailed(false);
    setStage("sending");
    const ok = await recordProposal(
      {
        cyrillic: target.input,
        // A word the lexicon does not know has no candidate to anchor to. The
        // fallback string we displayed is not data — and it is recomputable
        // from the word anyway, so storing it would add nothing.
        ...(target.door === "unknown_word"
          ? {}
          : {
              traditional: target.candidate.traditional,
              sense: target.candidate.sense,
            }),
      },
      proposalKindFor(target.candidate, kind ?? "correction"),
      text,
    );
    if (ok) {
      setStage("done");
    } else {
      // Back to the form with its text intact: nobody should have to retype a
      // spelling because the network blinked.
      setStage("propose");
      setSendFailed(true);
    }
  }

  const sense = target ? displaySense(target.candidate) : undefined;
  const branching = target ? needsSenseBranch(target.candidate) : false;
  const proposing = stage === "propose" || stage === "sending";
  /** Whether a flag row is already in the mailbox for this report. When it is,
   *  everything below the receipt is optional — the unknown-word door has
   *  nothing banked, so there its form is the point rather than an extra. */
  const filed = kind !== null;

  return (
    <dialog
      ref={ref}
      className="report-dialog"
      onClose={onClose}
      aria-labelledby="report-title"
    >
      {target && (
        <div className="report-body">
          {/* Sticky, so the way out stays reachable once the form makes the
              dialog taller than a phone screen. */}
          <div className="report-head">
            <h2 id="report-title">{TITLES[target.door]}</h2>
            <button
              type="button"
              className="report-x"
              aria-label="Хаах"
              onClick={() => ref.current?.close()}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="report-target">
            <span className="report-word">{target.input}</span>
            <span className="report-trad mongolian" lang="mn-Mong">
              {target.candidate.traditional}
            </span>
            <span className="report-meta">
              {target.candidate.latin && (
                <span className="latin">{target.candidate.latin}</span>
              )}
              {sense && <span className="sense">{sense}</span>}
            </span>
          </div>

          {stage === "ask" && branching && (
            <>
              <p className="report-question">
                Энэ үгийн <strong>зурлага буруу</strong> байна уу, эсвэл та{" "}
                <strong>өөр салаа утгыг</strong> нь хайж байна уу?
              </p>
              <div className="choices">
                <button
                  className="choice"
                  onClick={() => flag(target, "correction")}
                >
                  <span className="choice-title">
                    Зурлага нь буруу байна
                  </span>
                  <span className="choice-hint">
                    Энэ үгийг ямар ч утгаар нь ингэж бичдэггүй
                  </span>
                </button>
                <button
                  className="choice"
                  onClick={() => flag(target, "missing_sense")}
                >
                  <span className="choice-title">
                    Өөр салаа утгыг нь хайж байна
                  </span>
                  <span className="choice-hint">
                    Энэ зурлага зөв ч миний хайж буй утга жагсаалтад алга
                  </span>
                </button>
              </div>
            </>
          )}

          {stage === "ask" && !branching && (
            <>
              <p className="report-question">
                {sense ? (
                  <>
                    «<strong>{sense}</strong>» гэсэн утгаар энэ зурлага буруу
                    байна уу?
                  </>
                ) : (
                  <>Энэ зурлага буруу байна уу?</>
                )}
              </p>
              <div className="choices">
                <button
                  className="choice"
                  onClick={() => flag(target, "correction")}
                >
                  <span className="choice-title">Тийм, буруу байна</span>
                </button>
              </div>
            </>
          )}

          {stage === "flagging" && (
            <p className="report-status">Илгээж байна…</p>
          )}

          {proposing && (
            <>
              {/* Two things happen in this dialog and they must not blur
                  together: what has already been sent, and what is optional.
                  The receipt closes the first, the rule below opens the
                  second — and only the rule, because a caption saying
                  "optional" over an optional form is a line nobody reads. */}
              {filed && (
                <p className="report-receipt">
                  <span className="report-receipt-mark" aria-hidden="true">
                    ✓
                  </span>
                  Энэ үгэнд салаа утга дутуу байгаа мэдэгдлийг хүлээн авлаа.
                  Доорх талбарууд нь заавал биш бөгөөд мэддэг хэсгээ л бөглөж
                  илгээхэд болно.
                </p>
              )}
              <div className={filed ? "report-optional" : undefined}>
                {sendFailed && (
                  <p className="report-status report-status-error">
                    Уучлаарай, илгээж чадсангүй. Дахин оролдоно уу.
                  </p>
                )}
                <ProposalForm
                  // Fresh fields per candidate: text typed about one word must
                  // never carry over into a report about another.
                  key={`${target.door} ${target.input} ${target.candidate.traditional}`}
                  kind={proposalKindFor(target.candidate, kind ?? "correction")}
                  word={target.input}
                  busy={stage === "sending"}
                  focusOnMount={!filed}
                  onSubmit={propose}
                />
              </div>
            </>
          )}

          {stage === "done" && (
            <p className="report-receipt">
              <span className="report-receipt-mark" aria-hidden="true">
                ✓
              </span>
              Баярлалаа — саналыг тань хүлээн авлаа.
            </p>
          )}

          {stage === "error" && (
            <p className="report-status report-status-error">
              Уучлаарай, илгээж чадсангүй. Дараа дахин оролдох, эсвэл{" "}
              <a href={ISSUES_URL} target="_blank" rel="noreferrer">
                GitHub дээр мэдэгдэнэ үү
              </a>
              .
            </p>
          )}

          {/* The one line in this dialog that is not repeated below on the
              page, and the only one that has to be here: the contributor
              grants this licence by pressing the button above it. */}
          <p className="report-consent">
            Хувь нэмэр{" "}
            <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>{" "}
            лицензтэй
          </p>
        </div>
      )}
    </dialog>
  );
}
