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
  context       text not null check (context in ('converter', 'queue')),

  -- selection : implicit "this is the candidate I meant" (copy/export)
  -- flag      : explicit "something is wrong here"
  -- proposal  : a typed traditional form (Phase A2)
  -- verdict   : queue yes/no answer (Phase B)
  signal_type   text not null check (signal_type in
                  ('selection', 'flag', 'proposal', 'verdict')),

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
  proposal_kind text check (proposal_kind in
                  ('correction', 'missing_sense', 'new_word')),
  proposal_traditional text,
  proposal_sense       text,

  -- Queue answer (Phase B).
  verdict       boolean,
  question_id   text,

  -- Trusted reviewer stamp (Phase C); null means anonymous.
  reviewer_id   uuid,

  -- Random per-browser UUID. Dedup and rate-capping only -- not an account,
  -- not PII, never resolved to a person.
  session_id    uuid not null,

  -- Length caps. Generous enough for real words, tight enough that the
  -- mailbox cannot be used as free storage.
  constraint signals_cyrillic_len    check (char_length(cyrillic) between 1 and 64),
  constraint signals_traditional_len check (char_length(traditional) <= 128),
  constraint signals_sense_len       check (char_length(sense) <= 200),
  constraint signals_proposal_traditional_len
                                     check (char_length(proposal_traditional) <= 128),
  constraint signals_proposal_sense_len
                                     check (char_length(proposal_sense) <= 200),
  constraint signals_question_id_len check (char_length(question_id) <= 64),

  -- Code-point validation, mirroring the client-side check in
  -- apps/web/lib/signals.ts and the validator in scripts/validate.ts.
  -- Correctness of a traditional spelling cannot be judged visually or
  -- mechanically, but garbage can be rejected by code point: the Mongolian
  -- block U+1800-U+18AF (which already contains FVS1-3 and MVS) plus NNBSP
  -- U+202F, which joins a suffix to its stem.
  --
  -- Deliberately written with Postgres U&'' Unicode-escape literals rather
  -- than the characters themselves. Two reasons: a literal range inside a
  -- bracket expression is documented as collation-dependent, and NNBSP is
  -- invisible -- a maintainer pasting this file through an editor that
  -- normalizes whitespace would silently break every suffix candidate.
  -- Escapes keep the whole file pure ASCII.
  --
  -- Cyrillic: a-ya (U+0430-U+044F) plus yo (U+0451), u (U+04AF), o (U+04E9).
  constraint signals_cyrillic_charset check (
    cyrillic ~ U&'^[\0430-\044F\0451\04AF\04E9]+$'
  ),
  constraint signals_traditional_charset check (
    traditional is null or
    traditional ~ U&'^[\1800-\18AF\202F]+$'
  ),
  constraint signals_proposal_traditional_charset check (
    proposal_traditional is null or
    proposal_traditional ~ U&'^[\1800-\18AF\202F]+$'
  )
);

comment on table public.signals is
  'Disposable community-signal mailbox. Drained weekly into a PR; git is the database of record.';

-- The export job pulls by watermark and deletes what it took.
create index if not exists signals_created_at_idx
  on public.signals (created_at);

-- Supports the per-session rate-limit trigger below.
create index if not exists signals_session_recent_idx
  on public.signals (session_id, created_at);

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
