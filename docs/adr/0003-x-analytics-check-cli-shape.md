# x-analytics-check CLI: 3h TTL as Lurk-guard

The `x-analytics-check` CLI is a single command that lists Matt's tweets from the last 168 hours with their engagement metrics (likes, views, retweets, replies, quotes). It is the Twitter slice of the **Analytics Review** Activity — the bounded daily Prep Task that maintains a felt sense of what's resonating.

Like `x-mentions`, fetching is implicit and TTL-gated. **Unlike** `x-mentions`, the TTL is load-bearing for the discipline rather than just a cache optimisation: it is hard-coded at 3 hours and there is no `--force-fetch` escape hatch.

## Why 3h, hard-coded, no override

The opposing failure mode named in `CONTEXT.md` is **Lurk** — compulsively checking the engagement signal on a freshly-shipped Deliverable in the early window, before the signal has settled. The only honest read is post-settling, via Analytics Review.

A configurable TTL with a `--force-fetch` flag would let the user (or an LLM driving a session) bypass the cooldown the moment the Lurk impulse strikes. That defeats the whole point. The script *refusing to refresh more than 8× a day* is the feature.

The mentions ADR (0002) reaches the opposite conclusion for opposite reasons: there, redundant fetches are wasted quota, and parallel triage sessions need an explicit override path. Those pressures don't exist here — Analytics Review is a single bounded daily session, not a parallel triage workload.

## Surface

- No subcommands. One operation: "show me my recent tweets and how they did."
- `--no-fetch` — read the cached snapshot without hitting the API. Useful for iterating on rendering, or when offline. Not an escape hatch from the TTL — it cannot make the cache fresher, only let you re-read what's already there.
- `--sort likes|views|time` (default `likes`) — likes-desc is the daily felt-sense read; views-desc is the rarer "what got reach but didn't land?" view; time-desc is the neutral chronological scan.
- Tweets younger than 24h render with a `[recent]` marker. The signal hasn't settled yet — surfacing the data while flagging its unreliability preserves the Lurk-guard property without silently filtering today's posts.

## What's in scope

Original tweets only — the standalone posts. The fetch uses `users/:id/tweets` with `start_time = now - 168h, exclude=retweets,replies`, then drops anything with `referenced_tweets` client-side (which catches quote-tweets, since the API's `exclude` doesn't cover them).

Excluded:

- **Replies** — conversation, not shipped content.
- **Retweets** — not authored.
- **Quote tweets** — initially in scope (they appear on the Deliverable Calendar as "standalone Tweets"), but in practice they read as amplification or reaction posts and skew the felt-sense signal away from the standalone-original case Analytics Review is for. Reversed during first live run.

Analytics Review is "what's resonating *as standalone content I shipped*"; the originals are the cleanest read.

## Refresh strategy: full pull, not `since_id`

Every refresh re-fetches the entire 168h window. `since_id` would skip already-seen tweets and miss metric drift on them — defeating the purpose of a metrics tool. `users/:id/tweets` returns `public_metrics` inline, so a full pull gives fresh numbers on everything in one call. At ~8 calls/day max under the TTL and well under 100 originals+quotes per week, this is comfortable on quota.

## Storage

Separate cache file, `data/x-likes-cache.json`, **not** an extension of `data/x-tweet-cache.json`. The mentions cache treats tweets as immutable thread context (write-once, read-many); this cache treats them as live metric snapshots (refreshed every 3h). Mixing the two would couple two unrelated invalidation rules — a 5-day-old write from x-analytics-check looks identical to a settled mentions snapshot, and surprise-overwrites become possible.

Each cached tweet records `fetched_at` alongside the metrics, so future delta-tracking (likes-since-last-fetch) is a render change, not a schema migration.

## Considered and rejected

- **Configurable `--ttl` / `--force-fetch`.** Mirrors `x-mentions` for consistency, but undoes the Lurk-guard property in one keystroke. Rejected — the discipline is the feature.
- **`since_id` incremental refresh.** Cheaper on quota, but skips metric updates on existing tweets. Rejected.
- **Include replies in scope.** Captures "felt sense of my Twitter presence as one stream," but conflates Deliverable-resonance with conversation-engagement. Rejected.
- **Include quote-tweets in scope.** Initially in. Reversed after the first live run: quote-tweets dominated the output as amplification of others' posts and crowded out the standalone-original signal Analytics Review is for.
- **Hard cutoff at 24h ago, no "today".** Stricter Lurk-guard but over-corrects — an 8h-old tweet has real signal. Replaced with the visual `[recent]` marker.
- **Extending `data/x-tweet-cache.json`.** Cheaper, but couples mutable metrics to an immutable-thread-context store with different invalidation rules. Rejected.
- **Name `x-likes` / `x-resonance`.** `x-likes` undersells views; `x-resonance` overclaims (the script shows numbers, the human reads resonance). Settled on `x-analytics-check` — Activity-shaped, scoped to one Channel by the `x-` prefix.

## Consequences

- The 3h TTL is hard-coded. Changing it requires a code change, by design.
- The first call in a TTL window has visible API latency; subsequent calls are instant.
- `last_fetched_at` is global to this cache (not per-tweet) for the TTL gate; per-tweet `fetched_at` is also stored for future delta work.
- Tweets that fall out of the 168h window on the next pull are removed from the cache, not retained — this is a recent-resonance tool, not an archive.
