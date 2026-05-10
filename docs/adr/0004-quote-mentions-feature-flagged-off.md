# Quote Mentions fetch is feature-flagged off

ADR 0003 added Quote Mentions to the fetch-mentions Capture pipeline via the X API Recent Search `quotes_of:<username>` operator. That operator is no longer available on the current X API tier — fetches now return HTTP 400 with `Reference to invalid operator 'quotes_of'`, breaking the entire `npm run x:mentions` flow (replies included). Commit `f6f192c` already removed quote-tweets from `x-analytics-check` for the same reason.

## Decisions

- **Gate the quote fetch behind `X_FETCH_QUOTES` env var, default off.** When unset or anything other than `"true"`, `runFetch` skips the `searchQuotes` call entirely. Replies fetch unaffected.
- **No CLI flag, no config file.** Env var is the lightest possible switch and matches how the rest of the script reads credentials. Re-enabling later is a one-line `.env` change once tier access is restored.
- **Storage, renderer, and `kind: "quote"` all stay.** The flag only suppresses the fetch. Existing quote mentions in the store still render and close normally; there's just no new ingestion.

## Considered and rejected

- **Delete the quote pass entirely** (mirroring `f6f192c`). Cleaner diff, but throws away a working implementation that becomes valuable again the moment the API tier is upgraded. The gated code costs one `if` and an env var. Rejected.
- **Try a different operator** (`url:twitter.com/<username>` or per-tweet `/tweets/:id/quote_tweets`). Both were already considered and rejected in ADR 0003 for correctness/cost reasons; the API-tier downgrade doesn't change that calculus. Rejected.
- **Default the flag on, fail soft on 400.** Surfaces the missing-tier problem as silent under-fetching. Rejected — explicit off is clearer than a swallowed error.

## Consequences

- `npm run x:mentions` works again on the current tier, surfacing only Reply Mentions.
- Quote Mentions captured before this change remain in the store and continue to render until closed.
- `last_seen_quote_id` in state stops advancing while the flag is off; re-enabling will trigger a 7-day backlog fetch from wherever the cursor was last parked (consistent with the first-run behaviour described in ADR 0003).
- The `searchQuotes` helper in `scripts/lib/x-api.mts` is now dead code under the default config but kept for the re-enable path.
