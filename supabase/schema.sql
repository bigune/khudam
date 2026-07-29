-- Khudam community signal mailbox.
--
-- Git is the database of record. This table is a DISPOSABLE MAILBOX: the
-- weekly export job drains it into a pull request and deletes what it took,
-- so losing this project loses at most a week of signals and never canonical
-- data. Nothing here is authoritative; nothing here sets `verified: true`.
--
-- Apply to a fresh Supabase project with:
--   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
-- or by pasting into the project's SQL editor. The script is idempotent.
--
-- See supabase/README.md for the full setup and hand-off checklist.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- One table for every signal type, discriminated by `signal_type`; columns
-- that do not apply to a given type stay null. A single table keeps the
-- export job to one query and one delete.
--
-- Every row is anchored to a candidate by CONTENT, not array position: the
-- (cyrillic, traditional) pair. Two candidates of one entry never share a
-- traditional form, so the pair is unique without `sense` -- and unlike
-- `sense` it does not churn when a reviewer relabels a candidate. `sense` is
-- carried on the row as display/audit context only, never as part of the key.
create table if not exists public.signals (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Which surface produced the signal. 'queue' is Phase B.
  context       text not null,

  -- selection : implicit "this is the candidate I meant" (copy/export)
  -- flag      : explicit "something is wrong here"
  -- proposal  : a spelling or meaning the contributor typed
  -- verdict   : queue yes/no answer (Phase B)
  signal_type   text not null,

  -- Candidate anchor. `cyrillic` is NFC, lowercase, as normalized by the
  -- engine; for a composed suffix candidate it is the full inflected surface
  -- form and `traditional` is the composed string (NNBSP included).
  cyrillic      text not null,
  traditional   text,
  sense         text,

  -- For proposals: what kind of change is being proposed. Also set on `flag`
  -- rows, where it records which branch of the wrong-spelling vs
  -- different-meaning question the contributor chose -- that answer is the
  -- whole point of asking, and it needs no column of its own.
  proposal_kind text,

  -- What a contributor typed. `proposal_traditional` is a spelling they say
  -- is right; `proposal_sense` is a meaning they say is missing. Neither is
  -- data -- both are things for a reviewer to check. They are independent:
  -- someone may know the meaning that is missing without knowing how it is
  -- written, and that is still a useful thing to be told.
  proposal_traditional text,
  proposal_sense       text,

  -- Queue answer (Phase B).
  verdict       boolean,
  question_id   text,

  -- Trusted reviewer stamp; null means anonymous, which is nearly every row.
  --
  -- The value is a grant the maintainer handed to one person in a link. This
  -- database holds no roster and cannot tell a real grant from an invented
  -- one -- deliberately: the roster lives in git as SHA-256 hashes
  -- (data/reviewers.json), so a stamp is only worth anything after the weekly
  -- job matches it, and a revoked grant stops counting the moment its line is
  -- deleted from the repository. An unmatched stamp is simply an anonymous
  -- row, and the weekly pull request reports how many arrived.
  reviewer_id   uuid,

  -- Random per-browser UUID. Dedup and rate-capping only -- not an account,
  -- not PII, never resolved to a person.
  session_id    uuid not null
);

comment on table public.signals is
  'Disposable community-signal mailbox. Drained weekly into a PR; git is the database of record.';

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

-- Kept out of the create table above so that re-running this file actually
-- re-applies them. `create table if not exists` is a no-op once the table
-- exists, which would silently skip every constraint added or tightened after
-- the first apply -- exactly the sort of quiet drift that is only discovered
-- by a weekly export choking on data the schema was supposed to reject.
-- Dropping by name and re-adding converges a fresh project and a live one to
-- the same state, and existing rows that violate a new rule fail loudly here.
--
-- The names match what Postgres generates for an inline column check, so a
-- project created from an earlier version of this file is picked up cleanly.

-- Enumerations.
alter table public.signals drop constraint if exists signals_context_check;
alter table public.signals add  constraint signals_context_check
  check (context in ('converter', 'queue'));

alter table public.signals drop constraint if exists signals_signal_type_check;
alter table public.signals add  constraint signals_signal_type_check
  check (signal_type in ('selection', 'flag', 'proposal', 'verdict'));

alter table public.signals drop constraint if exists signals_proposal_kind_check;
alter table public.signals add  constraint signals_proposal_kind_check
  check (proposal_kind in ('correction', 'missing_sense', 'new_word'));

-- Length caps. Generous enough for real words, tight enough that the mailbox
-- cannot be used as free storage.
alter table public.signals drop constraint if exists signals_cyrillic_len;
alter table public.signals add  constraint signals_cyrillic_len
  check (char_length(cyrillic) between 1 and 64);

alter table public.signals drop constraint if exists signals_traditional_len;
alter table public.signals add  constraint signals_traditional_len
  check (char_length(traditional) <= 128);

alter table public.signals drop constraint if exists signals_sense_len;
alter table public.signals add  constraint signals_sense_len
  check (char_length(sense) <= 200);

alter table public.signals drop constraint if exists signals_proposal_traditional_len;
alter table public.signals add  constraint signals_proposal_traditional_len
  check (char_length(proposal_traditional) <= 128);

alter table public.signals drop constraint if exists signals_proposal_sense_len;
alter table public.signals add  constraint signals_proposal_sense_len
  check (char_length(proposal_sense) <= 200);

alter table public.signals drop constraint if exists signals_question_id_len;
alter table public.signals add  constraint signals_question_id_len
  check (char_length(question_id) <= 64);

-- Code-point validation, mirroring the client-side checks in
-- apps/web/lib/signals.ts and the validator in scripts/validate.ts.
-- Correctness of a traditional spelling cannot be judged visually or
-- mechanically -- that is the reviewer's job -- but garbage can be rejected by
-- code point: the Mongolian block U+1800-U+18AF (which already contains
-- FVS1-3 and MVS) plus NNBSP U+202F, which joins a suffix to its stem.
--
-- Deliberately written with Postgres U&'' Unicode-escape literals rather than
-- the characters themselves. Two reasons: a literal range inside a bracket
-- expression is documented as collation-dependent, and NNBSP is invisible --
-- a maintainer pasting this file through an editor that normalizes whitespace
-- would silently break every suffix candidate. Escapes keep the file ASCII.
--
-- Cyrillic: a-ya (U+0430-U+044F) plus yo (U+0451), u (U+04AF), o (U+04E9).
alter table public.signals drop constraint if exists signals_cyrillic_charset;
alter table public.signals add  constraint signals_cyrillic_charset
  check (cyrillic ~ U&'^[\0430-\044F\0451\04AF\04E9]+$');

alter table public.signals drop constraint if exists signals_traditional_charset;
alter table public.signals add  constraint signals_traditional_charset
  check (traditional is null or traditional ~ U&'^[\1800-\18AF\202F]+$');

alter table public.signals drop constraint if exists signals_proposal_traditional_charset;
alter table public.signals add  constraint signals_proposal_traditional_charset
  check (proposal_traditional is null or
         proposal_traditional ~ U&'^[\1800-\18AF\202F]+$');

-- A meaning label is free text in whichever script the contributor thinks in
-- -- Mongolian or English, both readable by a reviewer -- so it cannot be
-- restricted by charset. What it can be is non-blank and free of control
-- characters, which only ever arrive from a paste. [[:cntrl:]] is preferred
-- over a U&'' range here for the collation reason above: a named class is not
-- collation-dependent, a range of code points is.
alter table public.signals drop constraint if exists signals_proposal_sense_clean;
alter table public.signals add  constraint signals_proposal_sense_clean
  check (proposal_sense is null or
         (btrim(proposal_sense) <> '' and proposal_sense !~ '[[:cntrl:]]'));

-- A proposal has to propose something. Either half is enough on its own:
-- "the meaning X is missing" is worth filing even by someone who does not know
-- how X is written.
alter table public.signals drop constraint if exists signals_proposal_shape;
alter table public.signals add  constraint signals_proposal_shape
  check (signal_type <> 'proposal' or
         (proposal_kind is not null and
          (proposal_traditional is not null or proposal_sense is not null)));

-- The export job reads the mailbox oldest-first and deletes what it took.
create index if not exists signals_created_at_idx
  on public.signals (created_at);

-- Supports the per-session rate-limit trigger below.
create index if not exists signals_session_recent_idx
  on public.signals (session_id, created_at);

-- ---------------------------------------------------------------------------
-- Deduplication
-- ---------------------------------------------------------------------------

-- One person saying the same thing twice has said it once. Copying the same
-- text again, reloading and re-flagging the same candidate, re-sending an
-- identical proposal -- each files a row indistinguishable from one already in
-- the mailbox, and a reviewer learns nothing from reading it a second time.
--
-- Scoped to session_id deliberately. Two DIFFERENT sessions filing the
-- identical proposal is the corroboration signal the weekly PR ranks highest,
-- and collapsing that would destroy the one thing anonymous signals are good
-- for. The rule is "not twice from the same browser", never "not twice".
--
-- NULLS NOT DISTINCT (Postgres 15+) is what makes this work at all: every
-- column but the first three is null for some signal type, and by default
-- Postgres treats each null as unique -- so a plain unique index over these
-- columns would collapse almost nothing. Every column that carries meaning is
-- in the key, so only a genuinely identical row is dropped; `verdict` and
-- `question_id` are included so a Phase B answer to a different question, or a
-- changed mind about the same one, still counts as something new to read.
--
-- `reviewer_id` is in the key for a narrow but costly case: somebody who
-- answers a question, then opens their reviewer link and answers it again. The
-- second row is the attestation and the first is an anonymous vote, and without
-- this column the trusted one would be dropped as a duplicate of the vote.
--
-- Enforced by the trigger below rather than by the client. PostgREST's upsert
-- (`on_conflict` + `Prefer: resolution=ignore-duplicates`) looks like the
-- obvious way to ask for this, and it is a trap here: the upsert path needs
-- more than an INSERT policy, so with an insert-only anon role EVERY insert
-- comes back 42501 "new row violates row-level security policy" -- including
-- the ones that are not duplicates at all. Loosening RLS to satisfy it would
-- trade the property that makes publishing the anon key safe for a nicety.
--
-- This index is therefore the floor, not the mechanism: nothing should ever
-- reach it, and if something does, the insert fails loudly instead of quietly
-- storing the same opinion twice.
--
-- Dedup reaches back only to the last drain, not forever: the weekly export
-- empties the table, so the same person reporting the same thing next month
-- files it again -- correctly, since by then the earlier row is in a merged PR.
--
-- Applying this to a project that already holds duplicates fails, loudly and
-- correctly. See supabase/README.md § Removing duplicates for the one-time
-- cleanup query to run first.
drop index if exists public.signals_session_content_uniq;
create unique index signals_session_content_uniq
  on public.signals (session_id, signal_type, cyrillic, traditional, sense,
                     proposal_kind, proposal_traditional, proposal_sense,
                     question_id, verdict, reviewer_id)
  nulls not distinct;

-- The mechanism: skip a duplicate row instead of rejecting it.
--
-- A BEFORE INSERT trigger returning NULL drops that ONE row and lets the rest
-- of the statement proceed. That matters because the converter sends a copy's
-- selections as a single array: with the unique index alone, one word repeated
-- from an earlier copy would fail the whole batch and take the new words with
-- it. Here the repeat is skipped and its neighbours are stored.
--
-- Runs before signals_rate_limit_trg -- triggers fire in name order, and
-- "dedup" sorts before "rate_limit" -- so a skipped row costs nothing against
-- the caps. That ordering is load-bearing; renaming either trigger changes it.
--
-- SECURITY DEFINER so it can read rows the anon role cannot select.
create or replace function public.signals_dedup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- `is not distinct from` treats null as a value, matching the index's
  -- NULLS NOT DISTINCT. Plain `=` would be null for every unused column and
  -- the row would never match anything.
  if exists (
    select 1 from public.signals s
     where s.session_id           =              new.session_id
       and s.signal_type          =              new.signal_type
       and s.cyrillic             =              new.cyrillic
       and s.traditional          is not distinct from new.traditional
       and s.sense                is not distinct from new.sense
       and s.proposal_kind        is not distinct from new.proposal_kind
       and s.proposal_traditional is not distinct from new.proposal_traditional
       and s.proposal_sense       is not distinct from new.proposal_sense
       and s.question_id          is not distinct from new.question_id
       and s.verdict              is not distinct from new.verdict
       and s.reviewer_id          is not distinct from new.reviewer_id
  ) then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists signals_dedup_trg on public.signals;
create trigger signals_dedup_trg
  before insert on public.signals
  for each row execute function public.signals_dedup();

-- ---------------------------------------------------------------------------
-- Rate limiting
-- ---------------------------------------------------------------------------

-- `session_id` is client-supplied, so this is a speed bump, not a wall: it
-- stops a stuck loop or a bored visitor from filling the mailbox, and human
-- review of the weekly PR remains the real firewall. If organized spam ever
-- appears, add Cloudflare Turnstile verified in an Edge Function -- do not
-- build that before it is needed.
--
-- SECURITY DEFINER so the check can count rows the anonymous role is not
-- allowed to select.
create or replace function public.signals_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
begin
  select count(*) into recent
    from public.signals
   where session_id = new.session_id
     and created_at > now() - interval '1 hour';

  if recent >= 500 then
    raise exception 'khudam: signal rate limit reached for this session'
      using errcode = 'check_violation';
  end if;

  -- Free text gets a much tighter cap than clicks. Selections and flags are
  -- bounded by how fast a person can convert and read; a proposal carries
  -- text a reviewer has to read, so it is the expensive row and the one worth
  -- flooding. Fifty an hour is far more than any real contributor produces
  -- and far less than a script would.
  if new.signal_type = 'proposal' then
    select count(*) into recent
      from public.signals
     where session_id = new.session_id
       and signal_type = 'proposal'
       and created_at > now() - interval '1 hour';

    if recent >= 50 then
      raise exception 'khudam: proposal rate limit reached for this session'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists signals_rate_limit_trg on public.signals;
create trigger signals_rate_limit_trg
  before insert on public.signals
  for each row execute function public.signals_rate_limit();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

-- Anonymous visitors may INSERT and nothing else. With RLS on and no select
-- policy, the anon key cannot read a single row back -- so the anon key
-- published in apps/web leaks nothing, and one contributor can neither see
-- nor alter another's submissions. The weekly export job authenticates with
-- the service_role key, which bypasses RLS.
alter table public.signals enable row level security;

drop policy if exists "anon inserts signals" on public.signals;
create policy "anon inserts signals"
  on public.signals
  for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------------
-- Keepalive
-- ---------------------------------------------------------------------------

-- Supabase free-tier projects pause after ~7 days of inactivity, and the
-- export cadence is weekly -- exactly on the edge. The mid-week keepalive
-- workflow calls this instead of writing a row, so the ping cannot pollute
-- real data.
create or replace function public.keepalive()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  select now();
$$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon;
-- Explicit rather than inherited: the keepalive workflow authenticates with
-- the service_role key (the one secret the export job already needs), and
-- whether that role would reach this function through Supabase's default
-- privileges is not something a schema file should leave to chance.
grant execute on function public.keepalive() to service_role;
