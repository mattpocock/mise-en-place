# Quote tweets are Mentions, fetched separately

The fetch-mentions Capture pipeline previously surfaced only **Reply Mentions** — tweets that @-mention Matt via `/users/:id/mentions`. Tweets that *quote* one of his tweets without an @-mention never appeared, despite being equally important triage material. **Quote Mentions** are now surfaced alongside Reply Mentions through the same CLI, store, and renderer.

## Decisions

- **Mention is the umbrella; Quote Mention is a sibling to Reply Mention.** Glossary in `CONTEXT.md` widened. **Mention Thread** stays defined as a reply chain — a Quote Mention has no thread, only a 2-node display.
- **Stored Mentions carry an explicit `kind: "reply" | "quote"`.** Cheap, makes the distinction load-bearing in the JSON store, lets `groupIntoMentionThreads` skip thread-walking for quotes and the renderer attach a `[QUOTE]` label.
- **Quotes are fetched from X API Recent Search** via `query=quotes_of:<username>`. One additional call per implicit fetch, alongside `getMentions`. Existing `tweet.read` OAuth scope is sufficient — no re-auth.
- **Cursors are split.** State grows `last_seen_reply_id` (renamed from `last_seen_mention_id`) and `last_seen_quote_id`. Each endpoint paginates against its own cursor because the id streams are independent.
- **First-run backlog: fetch all quotes from the last 7 days.** Matches how `since_id` works on first run for replies. One-time event.
- **Implicit close fires on `replied_to` or `quoted` by self.** Quote-back is a real public response and should close the Mention without manual triage.
- **Rendering is unified.** Quote Mentions render in the same `--limit/--offset` ordering as Reply Mentions (oldest-first by mention id). The 2-node display reuses `renderThread`: root is Matt's quoted tweet, child is the quote tweet with `[QUOTE]` label and the usual open/new status marker.

## Considered and rejected

- **Treat quotes as a separate concept, not a Mention.** Cleaner glossary boundary (Mention Thread stays uncomplicated), but contradicts the operational reality: Matt triages them with the same priority and the same gestures. Rejected.
- **Per-tweet `/tweets/:id/quote_tweets` polling** instead of Recent Search. Avoids the 7-day search window, but requires maintaining "which of my tweets to check, for how long" and is N+1. The 7-day cap is non-binding under normal Capture cadence. Rejected.
- **Single shared `last_seen_mention_id` across both endpoints (max).** Simpler state, but a high reply id races the quote cursor ahead of unseen quotes. Rejected — correctness over simplicity.
- **Separate render section for quotes** (`── N reply mention(s) ── ... ── M quote mention(s) ──`). Visually clearer, but breaks the unified id-ordered slice that parallel-triage `--limit/--offset` depends on. Rejected.
- **Implicit close on reply only, not quote-back.** Forces explicit triage even after a public response. Rejected — the whole point of implicit close is to skip already-handled items.
- **Render the quote tweet alone, no quoted parent.** Saves a fetch and tokens, but loses the "what of mine got quoted" context that makes the quote interpretable. Rejected.

## Consequences

- The state file gains `last_seen_quote_id` and renames `last_seen_mention_id` to `last_seen_reply_id`. Existing state files need a one-shot migration (rename in place, leave the new key undefined to trigger a 7-day backlog fetch).
- `StoredMention.kind` is a new required field. Any existing entries default to `"reply"` on load.
- Implicit fetch latency roughly doubles on the cold path: two API calls instead of one. TTL-warm calls are unaffected.
- The `quotes_of:` operator requires X API access to Recent Search. Available on the current tier; if the tier is downgraded, quote fetching silently fails and only Reply Mentions surface.
- A new failure mode: if the cached quote tweet's `referenced_tweets[type=quoted]` points at a tweet that's been deleted or is unreachable, the rendered "thread" shows an unresolved-tweet placeholder as the root. Matches the existing behaviour for unresolved reply parents.
