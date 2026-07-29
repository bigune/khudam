/**
 * What a trusted reviewer decided, on its way to the mailbox.
 *
 * The expert review page is where a spelling is actually judged — and it
 * replaces this project's weakest link. Traditional script cannot
 * be judged in a diff (several distinct letters share identical glyphs, and a
 * diff renders nothing), so the maintainer merging a weekly pull request was
 * being asked for a judgement they are not equipped to make. This moves that
 * judgement to someone who reads the script, in a page that renders it.
 *
 * What the page can and cannot do is the whole design:
 *
 * - It **inserts rows**. That is all. It cannot open a pull request, cannot
 *   touch the repository, and holds no credential that could — the anon key it
 *   carries may insert into two tables and do nothing else.
 * - A stamp is worth **nothing** until `aggregate-signals.ts` hashes it against
 *   `data/reviewers.json` in git. This module attaches the grant the browser
 *   holds; whether that grant is real is not a question a browser can answer,
 *   and this one does not pretend to.
 * - A decision therefore reaches the lexicon only as a line in a diff that a
 *   human merges. The page proposes; git remains the database.
 */
import { normalizeWord } from "khudam";
import {
  GRANT_RE,
  getReviewerId,
  isTraditionalForm,
  postRows,
  signalsEnabled,
} from "./signals";

/**
 * What a reviewer concluded about one spelling.
 *
 * `verify`   — a stored candidate, and it is right. The row that becomes
 *              `verified: true`.
 * `reject`   — a stored candidate, and it is not a written form of this word
 *              for any meaning.
 * `accept_proposal` — a spelling somebody proposed that the lexicon does not
 *              hold, and it should be added.
 */
export type DecisionAction = "verify" | "reject" | "accept_proposal";

/** One row of the `decisions` table. */
export interface DecisionRow {
  cyrillic: string;
  /** Always the spelling being judged — never an anchor to something else. */
  traditional: string;
  action: DecisionAction;
  /** A meaning label, on an accepted proposal only. See `senseFor`. */
  sense?: string;
  reviewer_id: string;
}

/** A decision as the page holds it in its draft, before sending. */
export interface Decision {
  cyrillic: string;
  traditional: string;
  action: DecisionAction;
  sense?: string;
}

/**
 * Whether the page can send at all: signals configured, and a grant held.
 *
 * The grant check is honesty, not security — the database cannot tell a real
 * grant from an invented one, and the hash check in the repository is the only
 * thing that decides. What it prevents is somebody spending an evening judging
 * spellings that will be discarded without anyone telling them.
 */
export function canDecide(): boolean {
  const grant = getReviewerId();
  return signalsEnabled && grant !== null && GRANT_RE.test(grant);
}

/**
 * Builds one row, or nothing if it could not be sent honestly.
 *
 * Every rejection here is a rejection the database would make anyway, at the
 * cost of taking the whole batch down with it: PostgREST rejects an insert as
 * one statement, so a single malformed row would discard a session's worth of
 * judgements. Checking at the door turns that into one row quietly dropped.
 */
export function buildDecisionRow(
  decision: Decision,
  reviewerId: string,
): DecisionRow | undefined {
  if (!GRANT_RE.test(reviewerId)) return undefined;
  if (!isTraditionalForm(decision.traditional)) return undefined;
  const cyrillic = normalizeWord(decision.cyrillic);
  if (cyrillic.length === 0) return undefined;
  const row: DecisionRow = {
    cyrillic,
    traditional: decision.traditional,
    action: decision.action,
    reviewer_id: reviewerId,
  };
  // `decisions_sense_shape` allows a label on an accepted proposal and nowhere
  // else. Dropping it here rather than sending it keeps the constraint a
  // description of the design instead of a thing the client trips over.
  const sense = decision.action === "accept_proposal" ? cleanLabel(decision.sense) : undefined;
  if (sense !== undefined) row.sense = sense;
  return row;
}

/** The meaning label as the column will accept it: trimmed, single-spaced, no
 *  control characters, capped. Mirrors `decisions_sense_clean` and
 *  `decisions_sense_len`, and the same treatment `cleanSense` gives a
 *  contributor's label — a reviewer pastes too. */
export function cleanLabel(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const value = Array.from(
    raw.normalize("NFC").replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/gu, " "),
  )
    .slice(0, 200)
    .join("")
    .trim();
  return value.length > 0 ? value : undefined;
}

/**
 * Sends a whole review session as one insert.
 *
 * One request rather than one per row, for the same reason the queue sends a
 * set: a half-sent session would leave the reviewer unable to tell which half
 * to judge again, and judging is the expensive part. Repeats are fine and
 * deliberate — the transcriber takes the newest row per reviewer and spelling,
 * so sending again after changing your mind is how you change your mind.
 */
export async function recordDecisions(decisions: Decision[]): Promise<boolean> {
  const reviewerId = getReviewerId();
  if (reviewerId === null || decisions.length === 0) return false;
  const rows = decisions
    .map((d) => buildDecisionRow(d, reviewerId))
    .filter((r): r is DecisionRow => r !== undefined);
  return postRows("decisions", rows);
}
