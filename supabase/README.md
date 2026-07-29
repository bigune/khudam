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

One session saying the same thing twice says it once. A BEFORE INSERT trigger
(`signals_dedup`) skips a row this session has already filed, and
`signals_session_content_uniq` is the floor beneath it — nothing should reach
the index, and an insert that does fails loudly rather than storing the same
opinion twice.

The scope is one browser, not one signal. Two different sessions filing the
identical proposal stay two rows, because that agreement is the corroboration
signal the weekly PR ranks highest.

**Do not move this to PostgREST's upsert.** `on_conflict=<columns>` with
`Prefer: resolution=ignore-duplicates` is the obvious-looking way to ask for
the same behaviour and it breaks all collection: the upsert path needs more
than an INSERT policy, so with an insert-only anon role *every* insert returns

```json
{"code":"42501","message":"new row violates row-level security policy for table \"signals\""}
```

— duplicates and first-time reports alike. It was shipped once and reads like a
policy bug rather than a client bug, which is what made it expensive to find.
A one-line probe tells the two apart: send a deliberately invalid row (e.g.
`"cyrillic":"test123"`) with the anon key and nothing else. `23514` means RLS
let it through and a CHECK caught it, which is healthy. `42501` means the
request never got past the policy.

The trigger also handles what a unique index cannot: the converter sends one
copy's selections as a single array, so a repeated word would fail the whole
batch and take the new words with it. The trigger drops that row and stores its
neighbours.

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

Both are in place: `.github/workflows/keepalive.yml` (Thursdays) and the
health check at the top of `scripts/export-signals.ts`.

## Draining the mailbox

`.github/workflows/signals.yml` runs every Monday. Under **Settings → Secrets
and variables → Actions**, as *repository* secrets (not environment secrets —
the job declares no environment and cannot see those):

| Secret | Used by | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | both workflows | `NEXT_PUBLIC_SUPABASE_URL` is accepted instead — same public value, the name Vercel already uses |
| `SUPABASE_ANON_KEY` | keepalive | `NEXT_PUBLIC_SUPABASE_ANON_KEY` accepted instead. A ping needs no privilege, so it uses the public key |
| `SUPABASE_SERVICE_ROLE_KEY` | the weekly drain | Not interchangeable: reading and deleting rows is exactly what RLS forbids the anon key |

Also tick **Settings → Actions → General → Allow GitHub Actions to create and
approve pull requests**. Leave *Workflow permissions* on the restricted
default — `signals.yml` grants itself `contents: write` and
`pull-requests: write`, which the checkbox is the one thing a workflow file
cannot grant itself. Without it the branch is pushed and `gh pr create` fails:
nothing is lost, but nobody is told.

The order of the steps is the design, not an accident:

1. **Health check, then read.** Unreachable fails the run; empty does not.
2. **Archive `signals.jsonl` as a workflow artifact** (90 days — the audit
   trail). Everything after this can be redone from that one file.
3. **Aggregate** into `data/stats/`, `data/REVIEW.md`, and — in the single
   unambiguous case described below — a new lexicon entry.
4. **Validate**, so broken output never reaches a reviewer.
5. **Open one pull request.** Merging it is the review.
6. **Delete, last.** Every step above can fail and be re-run next week against
   a mailbox that still holds its rows. Deletion is by explicit row id, so
   signals filed *while the job was running* are untouched and become next
   week's mail.

Only one signals pull request is open at a time. If last week's is still
waiting, the job says so in its summary and stands down without draining —
leaving the mail in the mailbox is the safe state, and the open pull request is
already the reminder.

Re-running is safe. `data/stats/reports.json` carries a `through` watermark and
the aggregator ignores anything at or before it, so a re-run — or a week whose
delete failed and re-exported the same rows — counts nothing twice.

### Draining by hand

```sh
export SUPABASE_URL=https://<project-ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service_role key>

bun run signals:export signals.jsonl              # read, never deletes
bun run signals:aggregate signals.jsonl           # writes data/, review it
bun run validate
bun run signals:export --delete signals.jsonl     # only once the rest is committed
```

### What the aggregator may decide by itself

It never edits or removes an existing candidate — "this spelling is wrong" and
"this is a correct spelling of a meaning I did not want" arrive through the same
button, and only a human tells them apart.

It adds a lexicon entry in exactly one case: a word with **no entry at all**,
one proposed spelling, typed identically by **two independent sessions**.
Nothing existing is touched, no `sense` is invented, and the result is an
ordinary `verified: false` community candidate that a reviewer can delete in
one line. Everything else is written up in `data/REVIEW.md` § Community signals
for a human to decide.

It writes `verified: true` in one case, and it is not deciding anything when it
does: two **different trusted reviewers** answered yes about the spelling and
none answered no, so the flip is staged into the weekly pull request's diff with
their labels printed beside it, and the maintainer merges it. See § Trusted
reviewer grants.

Reports close themselves: the aggregator re-reads the lexicon each run and
drops a report whose flagged form is gone or whose proposed form is now a
candidate. To dismiss one you disagree with, delete its object from
`data/stats/reports.json` — if the signal is real it will be filed again.

### Queue answers

The verification queue at `/queue` files `verdict` rows: yes or no to *is this
a written form of this word, for any meaning?* They are tallied per candidate
into `data/stats/reports.json` and rendered in the weekly pull request as
`N ✓ / M ✗`. Two spellings of one word can both be answered yes — that is a
homonym, not a contradiction.

A tally is evidence, not a verdict of ours. Nothing in this pipeline sets
`verified: true`; a tally is a number to read while you check the spelling
yourself. Tallies do not age out — a count of what people said is not a task
anyone forgot to do — and stop being carried once the candidate is verified or
the form is gone.

The questions themselves are compiled from `data/` on every site build
(`bun run build:queue` → `apps/web/public/queue.json`, gitignored). Nothing to
schedule and nothing to commit: merging the weekly pull request deploys the
site, and the deploy rebuilds the queue from the data as merged.

## Trusted reviewer grants

A grant turns one person's answers into attestations. It is the only path by
which a script writes `verified: true`, so the mechanism is deliberately small
and its secrets are deliberately outside this database.

**Issuing.** `bun run reviewer:add` mints a UUID, appends its SHA-256 hash and
the next opaque label (`r1`, `r2`, …) to `data/reviewers.json`, and prints one
link:

```
https://khudam.suray.mn/queue#r=<uuid>
```

It is printed once and stored nowhere. Send it privately to one person, commit
the roster, and keep your own note of who that label is — that note must never
be committed. Losing the link before it arrives costs nothing: delete the
stranded line and issue another.

**Why a fragment and not `?r=`.** A URL fragment is never sent to a server, so
the grant cannot land in an access log, a `Referer` header, or the analytics the
site loads on every page. The page reads it on load, stores it in
`localStorage`, and clears it from the address bar so it stays out of
screenshots, shared links and browser history.

**Why the roster is in git, not here.** Git is the database of record and this
project is disposable; a roster that lived only in the mailbox would be lost
with it. Hashes are safe to publish — a grant is 122 bits of randomness, so a
hash cannot be walked back to it — and keeping them in the repo means the weekly
job reads the roster it merged. This database therefore cannot tell a real grant
from an invented one, and does not try: an unmatched stamp is counted as an
anonymous row, and the pull request reports how many arrived. A handful usually
means a revoked link still sitting in somebody's browser.

**Revoking.** Delete the object from `data/reviewers.json`. It stops counting
from the next run, *including answers it already gave* — attestations are stored
by label and matched against the roster on every aggregation, never baked in.
That is what makes a leaked link recoverable.

**The quorum.** Two different labels answering yes, none answering no, and the
flip is staged. One trusted no vetoes it however many yeses there are, and opens
a "trusted reviewers disagree" section that no amount of time closes. One
reviewer answering from two browsers is still one label, which is why the quorum
counts labels rather than sessions.
