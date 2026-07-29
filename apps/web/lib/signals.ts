/**
 * Community signal collection (contribution pipeline, Phase A1–A2).
 *
 * Signals are hints for human reviewers, never data. They land in a
 * disposable Supabase mailbox (see supabase/schema.sql), get drained into a
 * weekly pull request, and only a human merging that PR can change the
 * lexicon. Nothing here ever sets `verified: true`.
 *
 * Written against the PostgREST endpoint with plain fetch instead of
 * @supabase/supabase-js: the only operation is an anonymous insert, so the
 * client library would add ~40 kB to a static page for one HTTP POST.
 */
import { normalizeWord } from "khudam";
import type { Candidate } from "khudam";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether signal collection is configured. When it is not — local dev, forks,
 * CI, and any deploy before the Supabase project exists — the converter
 * behaves exactly as it did before this feature: the UI hides its reporting
 * affordances rather than offering a button that quietly does nothing.
 */
export const signalsEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Placeholder `sense` written by the Wiktionary import for candidates whose
 * meaning no human has labelled yet (342 of them today). It reads like a
 * sense but carries no meaning, so the UI must treat it as sense-less.
 */
export const UNLABELED_SENSE = "unlabeled";

/**
 * How many words one copy action may report. A bulk paste is a weak
 * "which sense did I mean?" signal — most of its candidates are defaults the
 * user never looked at — and an uncapped copy could file hundreds of rows in
 * one click. The cap keeps the head of the text, so very long pastes are
 * represented by their first words rather than not at all.
 */
export const MAX_SELECTIONS_PER_COPY = 40;

/**
 * Caps mirroring the `signals_proposal_traditional_len` and
 * `signals_proposal_sense_len` constraints. Checking them here turns a
 * rejected insert into a sentence the contributor can act on.
 */
export const MAX_PROPOSAL_LENGTH = 128;
export const MAX_SENSE_LENGTH = 200;

const SESSION_STORAGE_KEY = "khudam.session";
const REVIEWER_STORAGE_KEY = "khudam.reviewer";

/**
 * NNBSP U+202F, which joins a written-apart suffix to its stem. Built from its
 * code point rather than typed: an invisible character in source is one stray
 * edit away from silently breaking every composed form, and no reviewer would
 * see it happen.
 */
const NNBSP = String.fromCodePoint(0x202f);

export type SignalType = "selection" | "flag" | "proposal" | "verdict";

/** Which branch of the flag question the contributor chose. */
export type FlagKind = "correction" | "missing_sense";

/** What a proposal asks a reviewer to do with the lexicon. */
export type ProposalKind = FlagKind | "new_word";

/** A candidate identified by content, as stored on a signal row. */
export interface CandidateAnchor {
  cyrillic: string;
  traditional: string;
  sense?: string;
}

/**
 * What a proposal is about. `traditional` is absent for a word the lexicon
 * does not know at all — there is no candidate to anchor to, only the word.
 */
export interface ProposalAnchor {
  cyrillic: string;
  traditional?: string;
  sense?: string;
}

/** The contributor's typed proposal. Both parts are optional on their own;
 *  a proposal with neither says nothing and is never sent. */
export interface ProposalText {
  /** Validated traditional form — see `checkProposal`. */
  traditional?: string;
  /** Cleaned meaning label — see `cleanSense`. */
  sense?: string;
}

/** Which surface a signal came from. The converter is where someone met a
 *  candidate by accident; the queue is where they came to answer questions. */
export type SignalContext = "converter" | "queue";

/** One row of the `signals` table; unused columns are simply absent. */
export interface SignalRow {
  context: SignalContext;
  signal_type: SignalType;
  cyrillic: string;
  traditional?: string;
  sense?: string;
  proposal_kind?: ProposalKind;
  proposal_traditional?: string;
  proposal_sense?: string;
  verdict?: boolean;
  question_id?: string;
  /** The trusted-reviewer grant this browser holds, if any. See `claimGrant`. */
  reviewer_id?: string;
  session_id: string;
}

/**
 * Code-point check mirroring the DB CHECK constraint and scripts/validate.ts:
 * the Mongolian block U+1800–U+18AF (which contains FVS1–3 and MVS) plus
 * NNBSP U+202F, which joins a written-apart suffix to its stem.
 *
 * Written as numeric comparisons rather than a regex literal on purpose —
 * NNBSP is invisible in source, and a stray edit to a character class would
 * be impossible to spot in review.
 */
export function isTraditionalForm(text: string): boolean {
  if (text.length === 0) return false;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const ok = (cp >= 0x1800 && cp <= 0x18af) || cp === 0x202f;
    if (!ok) return false;
  }
  return true;
}

/**
 * The meaning label to show a reader, or undefined when there is none.
 *
 * Strips the `unlabeled` placeholder, including from the " + "-joined labels
 * the suffix engine composes ("unlabeled + genitive"). A placeholder is not a
 * meaning: showing it as one tells a Mongolian-speaking reader nothing and
 * makes the flag question below incoherent.
 */
export function displaySense(candidate: Candidate): string | undefined {
  if (!candidate.sense) return undefined;
  const parts = candidate.sense
    .split(" + ")
    .filter((part) => part !== UNLABELED_SENSE);
  return parts.length > 0 ? parts.join(" + ") : undefined;
}

/**
 * Whether flagging this candidate has to ask the wrong-spelling vs
 * different-meaning question first.
 *
 * The seed layer carries no `sense` labels, so "this is wrong" is ambiguous:
 * the spelling may be wrong, or it may be a correct spelling of a meaning the
 * user did not want. Only the contributor can tell those apart, and only at
 * the moment of flagging — so for sense-less candidates we ask.
 *
 * Composed (suffix-rule) and fallback candidates are excluded: each has
 * exactly one machine-assigned meaning, so "different meaning" is not a
 * choice the user has.
 */
export function needsSenseBranch(candidate: Candidate): boolean {
  if (candidate.source === "suffix-rule" || candidate.source === "fallback")
    return false;
  return displaySense(candidate) === undefined;
}

/**
 * Whether this candidate came from the lexicon rather than being composed or
 * transliterated at runtime. Only a lexicon candidate has an entry a missing
 * meaning could be added beside.
 */
export function isLexiconCandidate(candidate: Candidate): boolean {
  return candidate.source !== "suffix-rule" && candidate.source !== "fallback";
}

/**
 * Which data operation a typed proposal about this candidate asks for.
 *
 * A composed suffix candidate exists in no shard, so there is nothing to
 * replace: per data/GRAMMAR.md § Fixing a wrong composition, the repair for a
 * word the rule gets wrong is a full lexicon entry for the inflected form,
 * which outranks the composition by engine design. That is a new-word
 * proposal, and the weekly PR needs no special case for it. (The other repair
 * path — the rule itself is wrong — is not a per-word judgement a contributor
 * can make; it falls out of aggregation, where many words flagged with the
 * same suffix variant indict the suffixes.json row.)
 */
export function proposalKindFor(
  candidate: Candidate,
  flagKind: FlagKind,
): ProposalKind {
  if (flagKind === "missing_sense") return "missing_sense";
  return isLexiconCandidate(candidate) ? "correction" : "new_word";
}

/** Why a typed proposal cannot be sent, in the order the checks run. */
export type ProposalProblem =
  "empty" | "too_long" | "cyrillic" | "not_mongolian";

export type ProposalCheck =
  { ok: true; value: string } | { ok: false; problem: ProposalProblem };

/**
 * Validation at the door: what the contributor typed, cleaned up, or the
 * reason it cannot be sent.
 *
 * Whether a spelling is *correct* cannot be judged mechanically — that is the
 * reviewer's job, and this check must never pretend otherwise. What it can do
 * is keep the mailbox free of text that is not монгол бичиг at all, and tell
 * the contributor why in a sentence rather than through a failed insert.
 *
 * Two things are repaired rather than rejected, because both come from
 * pasting — which is how an expert with their own dictionary or IME will
 * contribute, and neither is the contributor's mistake:
 *
 * - Whitespace runs collapse to NNBSP. A proposal is one word, so the only
 *   space inside it is the joiner binding a written-apart suffix to its stem,
 *   and no ordinary keyboard produces U+202F. (JS `\s` covers NNBSP itself and
 *   NBSP; it deliberately does not cover MVS U+180E, a shaping control rather
 *   than a space.) The database rejects an ordinary space outright, so without
 *   this a correct suffix proposal would be turned away over an invisible
 *   character.
 * - Zero-width and directional marks are dropped. They carry no orthographic
 *   meaning — traditional Mongolian expresses that with FVS and MVS, both of
 *   which live inside the block and are kept — but they ride along invisibly
 *   in text copied out of documents and web pages.
 */
export function checkProposal(raw: string): ProposalCheck {
  const value = raw
    .normalize("NFC")
    .trim()
    .replace(/\s+/gu, NNBSP)
    .replace(/[\p{Cc}\p{Cf}]/gu, (ch) => {
      const cp = ch.codePointAt(0)!;
      return cp >= 0x1800 && cp <= 0x18af ? ch : "";
    })
    // Dropping a leading zero-width character can expose a joiner at the edge,
    // where it means nothing. `trim` removes NNBSP, which is a space to
    // Unicode even though it joins here.
    .trim();
  if (value.length === 0) return { ok: false, problem: "empty" };
  if (Array.from(value).length > MAX_PROPOSAL_LENGTH)
    return { ok: false, problem: "too_long" };
  // Cyrillic gets its own answer: this is a Cyrillic-input site, so typing
  // Cyrillic into the монгол бичиг field is the mistake to expect, and
  // "unexpected character" would be a useless thing to say about it.
  if (/\p{Script=Cyrillic}/u.test(value))
    return { ok: false, problem: "cyrillic" };
  if (!isTraditionalForm(value)) return { ok: false, problem: "not_mongolian" };
  return { ok: true, value };
}

/**
 * A meaning label as it should be stored, or undefined if nothing was typed.
 *
 * Free text in any script — the label is for a human reviewer, who reads
 * Mongolian and English. Control and format characters are stripped rather
 * than rejected: they arrive from pastes, never from typing, so they are not
 * a mistake worth stopping a contributor over.
 */
export function cleanSense(raw: string): string | undefined {
  const value = Array.from(
    raw
      .normalize("NFC")
      .replace(/[\p{Cc}\p{Cf}]/gu, " ")
      .replace(/\s+/gu, " "),
  )
    .slice(0, MAX_SENSE_LENGTH)
    .join("")
    .trim();
  return value.length > 0 ? value : undefined;
}

/**
 * The random per-browser id used for dedup and rate-capping. Not an account
 * and not PII: it is never resolved to a person and never leaves this table.
 * Returns null when there is no storage to keep it in (SSR, private modes
 * that throw), in which case nothing is recorded.
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Trusted reviewer grants (contribution pipeline, Phase C)

/**
 * A grant, as `crypto.randomUUID()` prints it.
 *
 * Checked before anything is stored or sent, and that check is load-bearing
 * rather than tidy: `reviewer_id` is a `uuid` column, so one malformed value
 * makes Postgres reject the whole insert — including, for a queue set, nine
 * good answers filed alongside it.
 */
export const GRANT_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The grant inside a link, or null.
 *
 * It travels in the URL **fragment** — `…/queue#r=<uuid>` — and never in a
 * query string. A fragment is not sent to the server, so it cannot reach an
 * access log, a `Referer` header, or the analytics this site loads on every
 * page; `?r=` would be all three, and a secret written down in three places by
 * being clicked once is not a secret.
 */
export function grantInFragment(fragment: string): string | null {
  const value = fragment.replace(/^#/u, "").match(/(?:^|&)r=([^&]+)/u)?.[1];
  if (value === undefined) return null;
  const grant = decodeURIComponent(value).trim().toLowerCase();
  return GRANT_RE.test(grant) ? grant : null;
}

/**
 * Take the grant out of the address bar and keep it on the device.
 *
 * Clearing the fragment afterwards is part of the design, not tidiness: the
 * link stays valid forever and identifies one person, so leaving it in the URL
 * would put it into every screenshot, every shared link and every browser
 * history that follows. `replaceState` also means the back button cannot walk
 * back into it.
 *
 * Returns the grant now in force, so a page can render its badge without a
 * second read.
 */
export function claimGrant(): string | null {
  if (typeof window === "undefined") return null;
  const fromLink = grantInFragment(window.location.hash);
  if (fromLink !== null) {
    try {
      window.localStorage.setItem(REVIEWER_STORAGE_KEY, fromLink);
    } catch {
      // Private modes throw. The grant still works for this page load; it just
      // has to be opened again next time.
    }
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return fromLink;
  }
  return getReviewerId();
}

/** The grant this browser holds, or null for an ordinary anonymous visitor. */
export function getReviewerId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(REVIEWER_STORAGE_KEY);
    return stored !== null && GRANT_RE.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Hand the grant back — a shared computer, a borrowed phone, a reviewer who
 *  wants to answer as an ordinary visitor. Signals already sent stay sent. */
export function clearReviewer(): void {
  try {
    window.localStorage.removeItem(REVIEWER_STORAGE_KEY);
  } catch {
    // Nothing was stored, so nothing needs removing.
  }
}

/**
 * Stamp a batch with the grant in force.
 *
 * Applied to every signal type rather than to queue answers alone: a trusted
 * reviewer flagging a spelling in the converter is telling us the same quality
 * of thing they would tell us in the queue, and the weekly pull request should
 * be able to say so.
 */
export function stampReviewer(
  rows: SignalRow[],
  reviewerId: string | null,
): SignalRow[] {
  if (reviewerId === null || !GRANT_RE.test(reviewerId)) return rows;
  return rows.map((row) => ({ ...row, reviewer_id: reviewerId }));
}

/**
 * Builds the rows for one copy action: the candidate the user ended up with
 * for each converted word.
 *
 * Deduplicated by the (cyrillic, traditional) anchor, so a word repeated
 * through a sentence counts once per copy rather than inflating its own
 * frequency. Rows whose anchor would fail the DB constraints are dropped
 * here instead of failing the whole insert.
 */
export function buildSelectionRows(
  chosen: { input: string; candidate: Candidate }[],
  sessionId: string,
): SignalRow[] {
  const rows: SignalRow[] = [];
  const seen = new Set<string>();
  for (const { input, candidate } of chosen) {
    if (rows.length >= MAX_SELECTIONS_PER_COPY) break;
    const cyrillic = normalizeWord(input);
    if (!isTraditionalForm(candidate.traditional)) continue;
    // A visible separator, and one that cannot occur in either half:
    // `cyrillic` is Cyrillic letters and `traditional` is the Mongolian
    // block plus NNBSP. An invisible one here made this whole file read
    // as binary to git — no diff, no blame, no review.
    const key = `${cyrillic}|${candidate.traditional}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      context: "converter",
      signal_type: "selection",
      cyrillic,
      traditional: candidate.traditional,
      ...(candidate.sense ? { sense: candidate.sense } : {}),
      session_id: sessionId,
    });
  }
  return rows;
}

/**
 * Builds one flag row. `kind` carries the contributor's answer to the
 * branching question — `correction` means the spelling is wrong, and
 * `missing_sense` means the spelling is fine but the meaning they wanted is
 * not listed. Those resolve to different data operations (replace vs. add),
 * which is exactly why the question is asked.
 */
export function buildFlagRow(
  anchor: CandidateAnchor,
  kind: FlagKind,
  sessionId: string,
): SignalRow {
  return {
    context: "converter",
    signal_type: "flag",
    cyrillic: normalizeWord(anchor.cyrillic),
    traditional: anchor.traditional,
    ...(anchor.sense ? { sense: anchor.sense } : {}),
    proposal_kind: kind,
    session_id: sessionId,
  };
}

/**
 * Builds one proposal row: a traditional form and/or a meaning label the
 * contributor typed.
 *
 * `sense` and `proposal_sense` are different things and both belong on the
 * row: the first is the label the candidate already carries (audit context —
 * what the contributor was looking at), the second is the meaning they say is
 * missing. A proposal never edits data; it gives a reviewer something
 * specific to check.
 */
export function buildProposalRow(
  anchor: ProposalAnchor,
  kind: ProposalKind,
  proposal: ProposalText,
  sessionId: string,
  context: SignalContext = "converter",
): SignalRow {
  return {
    context,
    signal_type: "proposal",
    cyrillic: normalizeWord(anchor.cyrillic),
    ...(anchor.traditional ? { traditional: anchor.traditional } : {}),
    ...(anchor.sense ? { sense: anchor.sense } : {}),
    proposal_kind: kind,
    ...(proposal.traditional
      ? { proposal_traditional: proposal.traditional }
      : {}),
    ...(proposal.sense ? { proposal_sense: proposal.sense } : {}),
    session_id: sessionId,
  };
}

/**
 * A plain insert, and it must stay one.
 *
 * Deduplication lives in the database (`signals_dedup` in supabase/schema.sql),
 * where a BEFORE INSERT trigger silently skips a row this session has already
 * filed. Asking PostgREST for it instead — `on_conflict=<columns>` with
 * `Prefer: resolution=ignore-duplicates` — reads like the obvious way to do the
 * same thing and breaks everything: the upsert path needs more than an INSERT
 * policy, and the anon role has exactly one, so every insert comes back
 * `42501 new row violates row-level security policy`, duplicate or not. It
 * looks like a policy bug rather than a client bug, which is what made it
 * expensive. Do not reintroduce it.
 */
async function insert(rows: SignalRow[]): Promise<boolean> {
  if (!signalsEnabled || rows.length === 0) return false;
  // Stamped here rather than in the row builders, so that every path into the
  // mailbox carries the grant and none of them has to remember to.
  const stamped = stampReviewer(rows, getReviewerId());
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/signals`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        // Nothing is read back — the anon role has no select policy anyway.
        Prefer: "return=minimal",
      },
      body: JSON.stringify(stamped),
      // Survives the user navigating away right after copying.
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Records which candidate the user copied, for every converted word.
 * Fire-and-forget: frequency data is never worth delaying or breaking a copy.
 */
export function recordSelections(
  chosen: { input: string; candidate: Candidate }[],
): void {
  if (!signalsEnabled) return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  void insert(buildSelectionRows(chosen, sessionId));
}

/**
 * Records a flag. Awaited, unlike selections, because the contributor is
 * waiting on an answer and deserves an honest one.
 */
export async function recordFlag(
  anchor: CandidateAnchor,
  kind: FlagKind,
): Promise<boolean> {
  const sessionId = getSessionId();
  if (!sessionId) return false;
  return insert([buildFlagRow(anchor, kind, sessionId)]);
}

/**
 * Records a typed proposal. Awaited: the contributor spent real effort here
 * and is owed a real answer.
 *
 * Re-checks the traditional form even though the widget checked it already —
 * an invalid one would be rejected by the DB constraint anyway, and failing
 * quietly here beats a 400 the contributor reads as "my correction was
 * refused". A proposal with nothing in it is not sent at all.
 */
export async function recordProposal(
  anchor: ProposalAnchor,
  kind: ProposalKind,
  proposal: ProposalText,
  context: SignalContext = "converter",
): Promise<boolean> {
  if (!proposal.traditional && !proposal.sense) return false;
  if (proposal.traditional && !isTraditionalForm(proposal.traditional))
    return false;
  const sessionId = getSessionId();
  if (!sessionId) return false;
  return insert([buildProposalRow(anchor, kind, proposal, sessionId, context)]);
}

/**
 * Builds one queue answer: yes or no to "is this a written form of this word?"
 *
 * The anchor is carried in full rather than left to `question_id` alone. A
 * question is a thing the page showed and may stop showing; the candidate it
 * was about is data, and aggregation has to find it weeks later without
 * needing the queue file that produced it. `question_id` records which
 * question was shown, never which candidate was meant.
 */
export function buildVerdictRow(
  anchor: CandidateAnchor,
  verdict: boolean,
  questionId: string,
  sessionId: string,
): SignalRow {
  return {
    context: "queue",
    signal_type: "verdict",
    cyrillic: normalizeWord(anchor.cyrillic),
    traditional: anchor.traditional,
    ...(anchor.sense ? { sense: anchor.sense } : {}),
    verdict,
    question_id: questionId,
    session_id: sessionId,
  };
}

/** One answered question, as the queue page holds it in its draft. */
export interface QueueAnswer {
  anchor: CandidateAnchor;
  questionId: string;
  verdict: boolean;
  /** Optionally, the spelling they say is right — offered after a “no”. */
  proposal?: ProposalText;
}

/**
 * Sends a whole set of queue answers as one insert.
 *
 * A set rather than a row at a time, because the queue lets people change
 * their mind: answers live in a local draft and stay editable until this runs.
 * Sending is the moment an answer becomes a claim, and doing it in one request
 * means a set is filed completely or not at all — a half-sent set would leave
 * the contributor unable to tell which half to answer again.
 *
 * A verdict is not verification. Answers accumulate as counts a reviewer reads
 * beside the candidate; `verified: true` is still one human, one pull request.
 */
export async function recordQueueAnswers(
  answers: QueueAnswer[],
): Promise<boolean> {
  const sessionId = getSessionId();
  if (!sessionId || answers.length === 0) return false;
  const rows: SignalRow[] = [];
  for (const { anchor, questionId, verdict, proposal } of answers) {
    rows.push(buildVerdictRow(anchor, verdict, questionId, sessionId));
    // A proposal belongs beside a “no”, and only if something was typed —
    // the same guards `recordProposal` applies, in batch form.
    if (verdict || !proposal) continue;
    if (!proposal.traditional && !proposal.sense) continue;
    if (proposal.traditional && !isTraditionalForm(proposal.traditional))
      continue;
    rows.push(
      buildProposalRow(anchor, "correction", proposal, sessionId, "queue"),
    );
  }
  return insert(rows);
}
