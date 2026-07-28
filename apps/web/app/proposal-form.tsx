"use client";

import { useState } from "react";
import {
  checkProposal,
  cleanSense,
  MAX_PROPOSAL_LENGTH,
  MAX_SENSE_LENGTH,
  type ProposalKind,
  type ProposalProblem,
  type ProposalText,
} from "../lib/signals";

/**
 * One widget, three doors: a wrong spelling to correct, a meaning that is
 * missing, or a word the lexicon does not know at all. The three differ only
 * in what they ask for, so they share one component — and one set of rules
 * about what may be sent.
 *
 * Typing anything is optional everywhere it appears. Most people who can tell
 * that a spelling is wrong cannot produce the right one, and requiring input
 * would throw that majority away; the caller has already banked their signal
 * before this form is shown.
 */

const PROBLEM_MESSAGES: Record<ProposalProblem, string> = {
  empty: "Монгол бичгээр бичих эсвэл хуулж буулгана уу.",
  too_long: `Хэт урт байна — хамгийн ихдээ ${MAX_PROPOSAL_LENGTH} тэмдэгт.`,
  cyrillic:
    "Кирилл үсэг орсон байна. Энэ талбарт зөвхөн монгол бичгээр (жишээ нь ᠠᠭᠤᠯᠠ) бичнэ үү.",
  not_mongolian:
    "Монгол бичгийн үсэг биш тэмдэгт орсон байна. Зөвхөн монгол бичгээр бичнэ үү.",
};

const NOTHING_TYPED =
  "Утга эсвэл түүний зурлага талбаруудын ядаж нэгийг бөглөнө үү.";

function promptFor(kind: ProposalKind, word: string) {
  if (kind === "missing_sense")
    return (
      <>
        «<strong>{word}</strong>» үгийн ямар утгыг хайсан бэ? Хэрэв та зурлагыг
        нь мэддэг бол хувь нэмрээ оруулаарай.
      </>
    );
  if (kind === "new_word")
    return (
      <>
        «<strong>{word}</strong>» толь бичигт байхгүй байна. Зөв зурлагыг нь та
        мэдэх үү?
      </>
    );
  return (
    <>
      «<strong>{word}</strong>» үгийн зөв зурлагыг мэдэх үү?
    </>
  );
}

export function ProposalForm({
  kind,
  word,
  busy,
  focusOnMount,
  onSubmit,
}: {
  kind: ProposalKind;
  /** The Cyrillic word under discussion, shown in the prompt. */
  word: string;
  busy: boolean;
  /**
   * Whether to put the cursor in the first field straight away. True only
   * where typing is the point of the dialog — after a flag has been filed the
   * receipt above is the thing to read, and on a phone an autofocused field
   * would scroll it away behind the keyboard.
   */
  focusOnMount: boolean;
  onSubmit: (proposal: ProposalText) => void;
}) {
  const [traditional, setTraditional] = useState("");
  const [sense, setSense] = useState("");
  const [error, setError] = useState<string | null>(null);

  const asksSense = kind === "missing_sense";
  const typed = traditional.trim().length > 0;
  const checked = typed ? checkProposal(traditional) : null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanedSense = asksSense ? cleanSense(sense) : undefined;
    if (!typed) {
      // A meaning on its own is a real contribution: it tells a reviewer which
      // sense the entry is missing, even when nobody typed a spelling for it.
      if (cleanedSense) {
        setError(null);
        onSubmit({ sense: cleanedSense });
        return;
      }
      setError(asksSense ? NOTHING_TYPED : PROBLEM_MESSAGES.empty);
      return;
    }
    if (!checked!.ok) {
      setError(PROBLEM_MESSAGES[checked!.problem]);
      return;
    }
    setError(null);
    onSubmit({ traditional: checked!.value, sense: cleanedSense });
  }

  return (
    <form className="proposal" onSubmit={submit}>
      <p className="proposal-prompt">{promptFor(kind, word)}</p>

      {asksSense && (
        <label className="proposal-field">
          <span className="proposal-label">Утга (кирилл эсвэл англиар)</span>
          <input
            className="proposal-input"
            value={sense}
            onChange={(e) => {
              setSense(e.target.value);
              setError(null);
            }}
            placeholder="жишээ нь: уул, mountain"
            maxLength={MAX_SENSE_LENGTH}
            autoComplete="off"
            autoFocus={focusOnMount}
            disabled={busy}
          />
        </label>
      )}

      <label className="proposal-field">
        <span className="proposal-label">
          {asksSense
            ? "Тухайн утгын зурлага (монгол бичгээр)"
            : "Зурлага (монгол бичгээр)"}
        </span>
        <input
          className="proposal-input mongolian"
          lang="mn-Mong"
          value={traditional}
          onChange={(e) => {
            setTraditional(e.target.value);
            setError(null);
          }}
          placeholder="ᠠᠭᠤᠯᠠ"
          autoComplete="off"
          autoFocus={focusOnMount && !asksSense}
          spellCheck={false}
          disabled={busy}
        />
      </label>

      {/* Mongolian reads top-to-bottom, and an input can only show it lying on
          its side. The preview is the only place a contributor can actually
          check what they pasted before sending it. */}
      {checked?.ok && (
        <div className="proposal-preview-row">
          <span className="proposal-label">Илгээх зурлага</span>
          <span className="proposal-preview mongolian" lang="mn-Mong">
            {checked.value}
          </span>
        </div>
      )}

      <p className="proposal-hint">
        Монгол бичгийн гар байхгүй бол өөр эх сурвалжаас хуулж буулгаж болно.
        Зурлага зөв эсэхийг хүн хянаж байж үгсийн санд нэмдэг.
      </p>

      {error && <p className="proposal-error">{error}</p>}

      <div className="proposal-actions">
        <button className="proposal-submit" type="submit" disabled={busy}>
          {busy ? "Илгээж байна…" : "Илгээх"}
        </button>
      </div>
    </form>
  );
}
