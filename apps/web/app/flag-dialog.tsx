"use client";

import type { Candidate } from "khudam";
import { useEffect, useRef, useState } from "react";
import { displaySense, needsSenseBranch, recordFlag, type FlagKind } from "../lib/signals";

const ISSUES_URL = "https://github.com/bigune/khudam/issues";
const DATA_LICENSE_URL = "https://github.com/bigune/khudam/blob/main/data/LICENSE";

export interface FlagTarget {
  /** The Cyrillic word as it appeared in the input. */
  input: string;
  candidate: Candidate;
}

type Stage = "ask" | "sending" | "done" | "error";

/**
 * Reports a wrong candidate.
 *
 * For candidates with no meaning label — which is most of the lexicon, since
 * the machine-imported seed layer has none — the dialog first asks whether
 * the spelling is wrong or the wanted meaning is missing. The two answers
 * resolve to different data operations (replace the form vs. add a candidate
 * beside it), and only the contributor can tell them apart.
 */
export function FlagDialog({
  target,
  onClose,
}: {
  target: FlagTarget | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [stage, setStage] = useState<Stage>("ask");
  const [kind, setKind] = useState<FlagKind | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (target) {
      setStage("ask");
      setKind(null);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [target]);

  async function submit(chosen: FlagKind) {
    if (!target) return;
    setKind(chosen);
    setStage("sending");
    const ok = await recordFlag(
      {
        cyrillic: target.input,
        traditional: target.candidate.traditional,
        sense: target.candidate.sense,
      },
      chosen,
    );
    setStage(ok ? "done" : "error");
  }

  const sense = target ? displaySense(target.candidate) : undefined;
  const branching = target ? needsSenseBranch(target.candidate) : false;

  return (
    <dialog ref={ref} className="flag-dialog" onClose={onClose} aria-labelledby="flag-title">
      {target && (
        <div className="flag-body">
          <h2 id="flag-title">Алдаа мэдэгдэх</h2>

          <div className="flag-target">
            <span className="flag-word">{target.input}</span>
            <span className="flag-trad mongolian" lang="mn-Mong">
              {target.candidate.traditional}
            </span>
            <span className="flag-meta">
              {target.candidate.latin && <span className="latin">{target.candidate.latin}</span>}
              {sense && <span className="sense">{sense}</span>}
            </span>
          </div>

          {stage === "ask" && branching && (
            <>
              <p className="flag-question">
                Энэ үгийн <strong>бичлэг буруу</strong> байна уу, эсвэл та{" "}
                <strong>өөр утгыг</strong> нь хайж байна уу?
              </p>
              <div className="flag-choices">
                <button className="flag-choice" onClick={() => submit("correction")}>
                  <span className="flag-choice-title">Бичлэг нь буруу</span>
                  <span className="flag-choice-hint">
                    Энэ үгийг ямар ч утгаар нь ингэж бичдэггүй
                  </span>
                </button>
                <button className="flag-choice" onClick={() => submit("missing_sense")}>
                  <span className="flag-choice-title">Өөр утгыг нь хайж байна</span>
                  <span className="flag-choice-hint">
                    Энэ бичлэг зөв ч миний хайж буй утга жагсаалтад алга
                  </span>
                </button>
              </div>
            </>
          )}

          {stage === "ask" && !branching && (
            <>
              <p className="flag-question">
                {sense ? (
                  <>
                    «<strong>{sense}</strong>» гэсэн утгаар энэ бичлэг буруу байна уу?
                  </>
                ) : (
                  <>Энэ бичлэг буруу байна уу?</>
                )}
              </p>
              <div className="flag-choices">
                <button className="flag-choice" onClick={() => submit("correction")}>
                  <span className="flag-choice-title">Тийм, буруу байна</span>
                  <span className="flag-choice-hint">Хянагчийн жагсаалтад нэмэгдэнэ</span>
                </button>
              </div>
            </>
          )}

          {stage === "sending" && <p className="flag-status">Илгээж байна…</p>}

          {stage === "done" && (
            <p className="flag-status">
              Баярлалаа — мэдэгдлийг тань хүлээн авлаа. Ирүүлсэн мэдэгдлүүдийг долоо
              хоног бүр эмхэтгэж, хүн хянаж байж үгсийн санд өөрчлөлт ордог.
              {kind === "missing_sense" &&
                " Дутуу утгыг өөрөө санал болгох боломж удахгүй нэмэгдэнэ."}
            </p>
          )}

          {stage === "error" && (
            <p className="flag-status flag-status-error">
              Уучлаарай, илгээж чадсангүй. Дараа дахин оролдох, эсвэл{" "}
              <a href={ISSUES_URL} target="_blank" rel="noreferrer">
                GitHub дээр мэдэгдэнэ үү
              </a>
              .
            </p>
          )}

          <p className="flag-consent">
            Нэргүй илгээгдэнэ · бүртгэл шаардахгүй · хувь нэмэр{" "}
            <a href={DATA_LICENSE_URL} target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>{" "}
            лицензтэй
          </p>

          <form method="dialog" className="flag-close-row">
            <button className="flag-close">{stage === "done" ? "Хаах" : "Болих"}</button>
          </form>
        </div>
      )}
    </dialog>
  );
}
