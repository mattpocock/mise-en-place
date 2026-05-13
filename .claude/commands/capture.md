You are driving a **batch Capture** session on the Twitter **Channel**. Your job is to pull 100 open mentions at a time, group them into proposed actions, get the user's approval on the whole plan, then execute it. Domain language follows CONTEXT.md.

## 1. Fetch

First, get the size of the open set:

```
npm run x:mentions -- --count
```

This prints `<N> mentions, <M> threads`. Fetching from the X API happens implicitly here, gated by a 60s TTL on the local cache.

If `N` is 0, tell the user there are no mentions to process and stop.

Then load the batch:

```
npm run x:mentions -- --limit 100
```

When the batch is processed and closed, pull the next 100 the same way — closed mentions drop out of the open set, so `--offset 0` keeps surfacing the oldest unprocessed ones.

## 2. Group the batch

Read every mention in the batch and assign each to one of five groups:

- **Interesting** — original thought, insight, claim, or observation worth considering.
- **Testimonial** — praise worthy of being included in a testimonial on my website. Usually only of course material.
- **Question** — an interesting question, where answering it may result in an enlightening or useful conversation. Need not be positive - sometimes good conversations come from straight-up trolls.
- **Dismiss** — noise, thank-yous, retweet notifications, anything not actionable.
- **Uncategorisable** — you cannot confidently place it in any of the four above. Surface to the user instead of guessing.

## 4. Present the plan

Show the user the categories, and ask them if they are correct.

Do NOT show tasks you are planning to dismiss.

Use human-readable descriptions. Don't show ID's to the user. Say "@theo said that your course looked great." Provide links to the tweets to view them - but only for ones where a real decision might need to be made.

## 5. Apply edits

If the user requests edits (e.g. "move mention 123 to Dismiss", "rename the new note to X", "use the Inbox project not Foo"), update the plan and re-print only the changed sections. Confirm before executing.

## 6. Execute

Dismissed tasks should be dismissed via:

```
npm run x:close-mention -- <id1> <id2> <id3> ...
```

Or, for a contiguous block of ids, use range syntax `<from>..<to>` (inclusive on both ends, numeric comparison over the open set):

```
npm run x:close-mention -- 1234567890000000000..1234567890000000050
```

Ranges and individual ids can be mixed in one invocation.

## 8. Report and continue

After executing the batch, print a summary:

```
Batch complete. <closed>/<batch_size> closed.
Failures: <list of mention ids + reason>, or "none".
```

Then:

- Pull the next 100 with `npm run x:mentions -- --limit 100` and repeat from step 3

## 9. Stop

Stop when:

- The open set is exhausted — tell the user "All mentions processed."
- The user asks to stop — acknowledge and stop immediately.

## Failure handling

- If `npm run x:mentions -- --count` or any subsequent batch read fails, surface the error and stop — do not proceed with a stale open set.
- If `npm run x:close-mention` fails, surface the error. The mention(s) were not closed — note this to the user.

## Rules

- Always close mentions via `npm run x:close-mention`, never by writing to the mention store directly.
- Never execute the plan without explicit user approval — this is interactive Capture, not auto-triage.
- Resolve every Uncategorisable item before executing; never silently drop a mention.
- Preserve existing role tags (`#hook`/`#brick`) when merging into an existing Note.
- The tweet permalink format is `https://x.com/<author_username>/status/<tweet_id>`.
- Only close a mention after its side effect succeeds.
