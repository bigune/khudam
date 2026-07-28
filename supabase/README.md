# Supabase — community signal mailbox

Maintainer runbook (English only; this is infrastructure, not contributor
documentation). For the design this implements, see the contribution-pipeline
plan; for the data rules it must never break, see `CLAUDE.md`.

## What this is, and what it is not

Git is the database of record. This Supabase project is a **disposable
mailbox**: the converter writes anonymous signals into one table, a weekly job
drains it into a pull request, and a human merging that PR is the only thing
that ever changes the lexicon.

Losing this project entirely loses at most one week of signals and **no
canonical data**. Treat it accordingly — do not add anything here that would
be painful to lose, and never let it become a source of truth.

Signals are not verification. Nothing written here may set `verified: true`.

## Setup

1. **Create the project.** Free tier is sufficient. Region: pick the one
   closest to Mongolia the plan allows — inserts are fire-and-forget, so
   latency is not critical, but there is no reason to be far away.

2. **Apply the schema.** Paste `supabase/schema.sql` into the project's SQL
   editor and run it, or:

   ```sh
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```

   The script is idempotent — re-running it after an edit is safe, and is how
   schema changes reach a project that already exists. Constraints are dropped
   and re-added by name rather than declared inline, precisely so that a
   re-run applies them instead of skipping past an existing table. A re-run
   that fails on a constraint is telling you the truth: rows already in the
   table violate the rule you just tightened.

3. **Collect the keys** from Project Settings → API:
   - Project URL and the **anon** key are public by design (see below).
   - The **service_role** key bypasses RLS. It belongs only in GitHub Actions
     secrets, never in `apps/web`, never in the repo.

4. **Configure the site.** In the Vercel project for `apps/web`, set:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

   These are inlined at build time, so **a redeploy is required** after
   changing them. Until they are set, the converter simply does not show its
   reporting affordances — it behaves exactly as it did before the pipeline
   existed. That is the intended state for local development and for forks.

5. **Verify.** Open the site, convert a word, use the ⚑ button on a candidate,
   and confirm a row appears in the `signals` table. Then type a spelling into
   the proposal step and confirm a second row arrives with `signal_type =
   'proposal'` — the flag is filed as soon as the question is answered, so a
   contributor who stops before proposing still leaves a signal.

## Removing duplicates

One session saying the same thing twice says it once. The
`signals_session_content_uniq` index enforces that, and the converter asks for
`resolution=ignore-duplicates`, so a repeat report is dropped silently rather
than refused — the contributor is told it was filed, which is true: it was, the
first time.

The scope is one browser, not one signal. Two different sessions filing the
identical proposal stay two rows, because that agreement is the corroboration
signal the weekly PR ranks highest.

Applying the schema to a project that already collected duplicates **fails on
this index**, which is the file telling the truth: it cannot enforce a rule the
existing rows break. Run this once first, then re-apply the schema. It keeps
the earliest row of each identical group and deletes the rest — `partition by`
treats nulls as equal, which is what the index's `nulls not distinct` means:

```sql
delete from public.signals
 where id in (
   select id from (
     select id, row_number() over (
              partition by session_id, signal_type, cyrillic, traditional, sense,
                           proposal_kind, proposal_traditional, proposal_sense,
                           question_id, verdict
              order by created_at, id) as n
       from public.signals) ranked
    where ranked.n > 1);
```

## Why publishing the anon key is safe

RLS is on and the anon role has exactly one policy: `insert`. With no select
policy, the anon key cannot read a single row back — not its own, not anyone
else's — and it cannot update or delete. The worst an attacker with the key
can do is what any visitor can do: file signals that a human then reads.

**Verifying that, without being misled.** A `DELETE` or `PATCH` sent with the
anon key returns **`204 No Content`** — which looks alarming, but is not a
failure of RLS. PostgREST reports a successful *request*; RLS filtered the
target rows out, so it modified nothing. `204` alone therefore proves nothing
either way. Ask for the affected-row count:

```sh
curl -X DELETE "$URL/rest/v1/signals?cyrillic=eq.test" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact" -i | grep -i content-range
```

`content-range: */0` is the answer you want: zero rows affected. Anything
non-zero means a write policy was added by mistake. Reads are less subtle —
`GET` simply returns `[]`.

Backstops, in order: the `check` constraints (code points, lengths, enums,
and the rule that a proposal must actually propose something), the per-session
insert caps in the `signals_rate_limit` trigger — 500 signals an hour, but
only 50 of them free-text proposals, since text is what a reviewer has to read
— and human review of the weekly PR, which is the real firewall. If organized spam ever
appears, add Cloudflare Turnstile verified in an Edge Function — the
siteverify call needs a secret, so a purely client-side check cannot work.
Do not build that before it is needed.

## Free-tier pause

Free-tier projects pause after roughly 7 days without activity, and the export
cadence is weekly — exactly on the edge. Two mitigations, both required:

- A mid-week keepalive workflow that calls the `keepalive()` function. It
  returns `now()` rather than writing a row, so the ping cannot pollute real
  data.
- A health check at the start of the export job that **fails the workflow
  loudly** if the project is unreachable. A paused project must never look
  like a quiet week; silently dropping contributions is the one failure mode
  that would cost real community trust.

Neither job exists yet — they land with the weekly pipeline (Phase B).

## Draining the mailbox

Not built yet (Phase B). The shape it must have, so the table is designed for
it:

1. Capture a timestamp watermark, select all rows with
   `created_at <= watermark`, and attach the raw JSONL as a workflow artifact
   (90-day retention — this is the audit trail).
2. Only then delete rows within the watermark. Aggregation dedupes by row
   `id`, so a crash between upload and delete cannot double-process.
3. Aggregate into a triaged PR; run `bun run validate` before opening it, so
   broken output never reaches a reviewer.

Until that exists, export manually while volume is small.
