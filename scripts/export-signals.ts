/**
 * Drain the community signal mailbox into a JSONL file, and delete exactly
 * what was drained. Run with: bun run signals:export
 *
 * Usage:
 *   bun scripts/export-signals.ts <out.jsonl>            # read (never deletes)
 *   bun scripts/export-signals.ts --delete <out.jsonl>   # delete what it read
 *
 * Environment (see supabase/README.md):
 *   SUPABASE_URL                — project URL, public
 *   SUPABASE_SERVICE_ROLE_KEY   — bypasses RLS; GitHub Actions secret only,
 *                                 never in apps/web, never in the repo
 *
 * The two modes are separate commands so the raw dump can be uploaded as a
 * workflow artifact — the 90-day audit trail — BEFORE anything is deleted.
 * Nothing here interprets a signal or touches data/: that is
 * scripts/aggregate-signals.ts, and the reviewer merging its PR.
 *
 * Deletion is by explicit id, not by timestamp. A watermark would be simpler,
 * but it silently owns every row that arrives while the export is running, and
 * dropping a contribution nobody can see us drop is the one failure this
 * pipeline must not have. Ids delete precisely what the artifact records;
 * anything filed mid-run is simply next week's mail.
 */
import { writeFileSync, readFileSync } from "node:fs";

/** Rows per read request. PostgREST may cap this lower (Supabase's db-max-rows
 *  defaults to 1000); paging stops on an empty page, not on a short one, so a
 *  server-side cap slows the drain down rather than truncating it. */
const PAGE_SIZE = 1000;

/** Ids per delete request. Each uuid costs ~37 characters in the URL, so this
 *  keeps a request under 4 kB — far below any proxy's URL limit. */
const DELETE_CHUNK = 100;

/** Runaway guard: ~5M rows is orders of magnitude past a real week, so hitting
 *  it means paging is looping, not that the mailbox is full. */
const MAX_PAGES = 5000;

/** One row of the `signals` table, exactly as PostgREST returns it. Written to
 *  the artifact unchanged — the audit trail should record what the database
 *  held, not what this script found interesting. */
export interface SignalRow {
  id: string;
  created_at: string;
  context: string;
  signal_type: string;
  cyrillic: string;
  traditional: string | null;
  sense: string | null;
  proposal_kind: string | null;
  proposal_traditional: string | null;
  proposal_sense: string | null;
  verdict: boolean | null;
  question_id: string | null;
  reviewer_id: string | null;
  session_id: string;
}

function env(): { url: string; key: string } {
  // The public alias is accepted so a maintainer can drain by hand with the
  // same .env they use to build the site locally.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n" +
        "The service_role key bypasses RLS: it belongs in GitHub Actions secrets " +
        "or a local .env that git cannot see — never in apps/web, never committed.\n" +
        "Setup: supabase/README.md",
    );
    process.exit(1);
  }
  return { url: url.replace(/\/+$/u, ""), key };
}

function headers(key: string, extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

/**
 * Fail the whole run, loudly, when the project cannot be reached.
 *
 * Free-tier projects pause after ~7 days of inactivity and the export runs
 * weekly, so "no response" is a state this job will genuinely meet. It must
 * never be mistaken for a quiet week: a paused project that exports zero rows
 * looks exactly like a week nobody contributed, and silently dropping
 * contributions is what would cost real community trust.
 */
async function healthCheck(url: string, key: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/signals?select=id&limit=1`, { headers: headers(key) });
  } catch (err) {
    console.error(
      `Cannot reach ${url} — ${err instanceof Error ? err.message : String(err)}\n\n` +
        "This is NOT an empty mailbox. The most likely cause is a paused free-tier " +
        "project (they pause after ~7 days of inactivity). Open the Supabase dashboard, " +
        "resume the project, and re-run this workflow — the signals are still there.\n" +
        "If it is not paused, check that the keepalive workflow is still running.",
    );
    process.exit(1);
  }
  if (!response.ok) {
    console.error(
      `The signals table answered ${response.status} ${response.statusText}.\n` +
        (await response.text()).slice(0, 500) +
        "\n\nCommon causes: the project is paused or restoring, the service_role key " +
        "was rotated, or supabase/schema.sql has not been applied to this project.",
    );
    process.exit(1);
  }
}

/** Every row currently in the mailbox, oldest first. */
async function readAll(url: string, key: string): Promise<SignalRow[]> {
  const rows: SignalRow[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const query =
      `select=*&order=created_at.asc,id.asc&limit=${PAGE_SIZE}&offset=${rows.length}`;
    const response = await fetch(`${url}/rest/v1/signals?${query}`, { headers: headers(key) });
    if (!response.ok) {
      console.error(`Read failed at offset ${rows.length}: ${response.status} ${await response.text()}`);
      process.exit(1);
    }
    const batch = (await response.json()) as SignalRow[];
    if (batch.length === 0) return rows;
    rows.push(...batch);
  }
  console.error(
    `Stopped after ${MAX_PAGES} pages (${rows.length} rows). That is far more than a real ` +
      "week of signals — treat this as a paging bug, not a full mailbox, and do not delete anything.",
  );
  process.exit(1);
}

/** Delete exactly these ids, in chunks; returns how many rows the server removed. */
async function deleteIds(url: string, key: string, ids: string[]): Promise<number> {
  let deleted = 0;
  for (let i = 0; i < ids.length; i += DELETE_CHUNK) {
    const chunk = ids.slice(i, i + DELETE_CHUNK);
    const response = await fetch(`${url}/rest/v1/signals?id=in.(${chunk.join(",")})`, {
      method: "DELETE",
      // count=exact makes the response say how many rows were actually
      // removed. Without it a DELETE that matched nothing returns 204 exactly
      // like one that removed a hundred rows.
      headers: headers(key, { Prefer: "return=minimal,count=exact" }),
    });
    if (!response.ok) {
      console.error(
        `Delete failed after ${deleted} rows: ${response.status} ${await response.text()}\n` +
          "The undeleted rows stay in the mailbox and will be exported again next run; " +
          "aggregation skips anything already processed, so nothing is double-counted.",
      );
      process.exit(1);
    }
    deleted += Number(response.headers.get("content-range")?.split("/")[1] ?? chunk.length);
  }
  return deleted;
}

function readJsonl(path: string): SignalRow[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as SignalRow);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const deleteMode = args[0] === "--delete";
  const file = deleteMode ? args[1] : args[0];
  if (!file) {
    console.error("Usage: bun scripts/export-signals.ts [--delete] <file.jsonl>");
    process.exit(1);
  }
  const { url, key } = env();

  if (deleteMode) {
    const rows = readJsonl(file);
    if (rows.length === 0) {
      console.log("Nothing to delete.");
      return;
    }
    const deleted = await deleteIds(url, key, rows.map((r) => r.id));
    console.log(`Deleted ${deleted} of ${rows.length} exported rows.`);
    if (deleted < rows.length) {
      // Not an error: a re-run of a job whose delete already succeeded lands
      // here, and so does any row a maintainer removed by hand.
      console.log("Rows already gone are counted as deleted — the mailbox holds no duplicates.");
    }
    return;
  }

  await healthCheck(url, key);
  const rows = await readAll(url, key);
  writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length > 0 ? "\n" : ""), "utf8");

  const byType = new Map<string, number>();
  for (const row of rows) byType.set(row.signal_type, (byType.get(row.signal_type) ?? 0) + 1);
  const sessions = new Set(rows.map((r) => r.session_id)).size;
  console.log(`Exported ${rows.length} signals from ${sessions} sessions to ${file}`);
  for (const [type, count] of [...byType].sort()) console.log(`  ${type}: ${count}`);
  if (rows.length === 0) {
    console.log("The mailbox is empty. The project answered, so this is a quiet week, not an outage.");
  }
}

if (import.meta.main) {
  await main();
}
