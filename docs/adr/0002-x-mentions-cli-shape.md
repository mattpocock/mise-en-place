# x-mentions CLI: implicit fetch, explicit list

The `x-mentions` CLI is a single command that lists open Twitter Mentions. Fetching from the X API is performed implicitly on each invocation, gated by a TTL on the local store (default 60s): if the store was refreshed recently, the call reads warm and skips the API.

There is deliberately **no** `fetch` command. End users (and LLM agents driving Capture sessions) should never have to think about "did I fetch first?" — the only operation that exists is "show me my open mentions." `--no-fetch` and `--force-fetch` exist as escape hatches; everything else is implicit.

## Surface

- `--limit N` / `--offset N` — paginate the rendered open mentions. The unit is **Mention**, not Mention Thread: the Mention is the triage unit (the reply being replied to), and parallel triage sessions need to slice on it. Each picked mention is still rendered inside its full thread context, so no comprehension is lost.
- Ordering is **oldest-first by mention id ascending** (X snowflake ids are time-ordered). New mentions land at the end, so existing offsets remain valid for already-seen mentions across fetches — important for parallel sessions and for crash-resume.
- `--count` — print only the open-mention/thread totals; skip rendering threads. Compatible with `--limit/--offset` (the count describes the whole open set, not the slice). Without `--count`, the totals are already in the rendered header for free.

## Why implicit fetch

The motivating use case is parallel triage: an LLM running multiple sessions in parallel, each grabbing a slice of open mentions via `list --limit N --offset M`. If fetch were a separate command, every session would have to either (a) call it redundantly, racing on `last_seen_mention_id` and wasting API quota, or (b) coordinate to ensure exactly one session fetches — pushing complexity onto the caller.

A TTL-gated implicit fetch resolves both: the first `list` call refreshes the store, subsequent calls within the TTL window read it directly. No coordination, no redundancy, no surface area for the caller to get wrong.

## Considered and rejected

- **Separate `fetch` subcommand.** Cleaner separation of mutating vs. read-only operations, but pushes the "did I fetch?" question onto every caller. Rejected.
- **Always fetch on every call.** Simpler than TTL, but punishes parallel triage with redundant API calls. Rejected — the TTL check is cheap.
- **`--offset > 0` skips fetch.** Implicit and surprising; couples pagination semantics to fetch semantics. Rejected.
- **Limit/offset by Mention Thread.** Preserves thread integrity, but Mention is the actual triage unit and slicing by thread leaves uneven token-cost slices. Rejected.
- **Subcommand layer (`x-mentions list ...`).** Redundant when there is only one operation. Rejected for now; can be added later if a second operation lands.

## Consequences

- The first call in a TTL window has visible API latency; subsequent calls are fast. Surprising only if you don't know about the TTL.
- A new `last_fetched_at` field on the state file becomes load-bearing alongside `last_seen_mention_id` and must be written transactionally with the fetched mentions.
- Mention ordering must remain stable across fetches for offsets to be meaningful. New mentions appending to the end (oldest-first by id) preserves this; any future ordering change must consider parallel-session correctness.
