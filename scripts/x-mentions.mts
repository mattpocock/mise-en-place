#!/usr/bin/env node
import { Command } from "commander";
import { getValidAccessToken } from "./lib/oauth.mts";
import {
  getMentions,
  getTweets,
  searchQuotes,
  type Mention,
  type MentionAuthor,
  type ReferencedTweet,
  type Tweet,
} from "./lib/x-api.mts";
import {
  loadState,
  saveState,
  loadTweetCache,
  saveTweetCache,
  type State,
  type TweetCache,
} from "./lib/storage.mts";
import {
  JsonFileMentionStore,
  type StoredMention,
} from "./lib/mention-store.mts";
import { renderThread } from "./lib/mention-renderer.mts";
import { groupIntoMentionThreads } from "./lib/thread-builder.mts";

const STORE_PATH = "data/x-mentions.json";
const MAX_THREAD_DEPTH = 30;
const DEFAULT_TTL_SECONDS = 60;

type Options = {
  limit?: number;
  offset: number;
  count: boolean;
  fetch: boolean;
  forceFetch: boolean;
  ttl: number;
};

const program = new Command();
program
  .name("x-mentions")
  .description("List open Twitter mentions for triage.")
  .option("-l, --limit <n>", "max mentions to render", parseNonNegativeInt)
  .option(
    "-o, --offset <n>",
    "skip the first N mentions",
    parseNonNegativeInt,
    0,
  )
  .option("-c, --count", "print only the count; skip rendering", false)
  .option("--no-fetch", "skip the X API fetch even if the cache is stale")
  .option("--force-fetch", "fetch even if within the TTL window", false)
  .option(
    "--ttl <seconds>",
    "how long a fetch stays warm",
    parseNonNegativeInt,
    DEFAULT_TTL_SECONDS,
  );

program.parse();
await main(program.opts<Options>());

function parseNonNegativeInt(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`expected a non-negative integer, got "${raw}"`);
  }
  return n;
}

async function main(opts: Options): Promise<void> {
  const state = await loadState();
  const cache = await loadTweetCache();
  const store = new JsonFileMentionStore(STORE_PATH);

  const shouldFetch = decideFetch(state, opts);
  if (shouldFetch) {
    await runFetch(state, cache, store);
  }

  if (opts.count) {
    const open = await store.listOpen();
    const threads = groupIntoMentionThreads(open, cache, new Set());
    console.log(`${open.length} mentions, ${threads.length} threads`);
    return;
  }

  await renderOpen(store, cache, opts);
}

function decideFetch(state: State, opts: Options): boolean {
  if (opts.forceFetch) return true;
  if (!opts.fetch) return false;
  if (!state.last_fetched_at) return true;
  const ageSeconds =
    (Date.now() - new Date(state.last_fetched_at).getTime()) / 1000;
  return ageSeconds >= opts.ttl;
}

async function runFetch(
  state: State,
  cache: TweetCache,
  store: JsonFileMentionStore,
): Promise<void> {
  const tokens = await getValidAccessToken();

  const replies: Mention[] = [];
  const quotes: Mention[] = [];
  const authorsById = new Map<string, MentionAuthor>();

  let replyPagination: string | undefined;
  let newestReplyId: string | undefined;
  do {
    const res = await getMentions({
      accessToken: tokens.access_token,
      userId: tokens.user_id,
      sinceId: state.last_seen_reply_id,
      paginationToken: replyPagination,
    });
    if (res.data) replies.push(...res.data);
    for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
    for (const t of res.includes?.tweets ?? []) cacheTweet(cache, authorsById, t);
    newestReplyId = newestReplyId ?? res.meta.newest_id;
    replyPagination = res.meta.next_token;
  } while (replyPagination);

  let quotePagination: string | undefined;
  let newestQuoteId: string | undefined;
  do {
    const res = await searchQuotes({
      accessToken: tokens.access_token,
      username: tokens.username,
      sinceId: state.last_seen_quote_id,
      paginationToken: quotePagination,
    });
    if (res.data) quotes.push(...res.data);
    for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
    for (const t of res.includes?.tweets ?? []) cacheTweet(cache, authorsById, t);
    newestQuoteId = newestQuoteId ?? res.meta.newest_id;
    quotePagination = res.meta.next_token;
  } while (quotePagination);

  for (const m of replies) cacheTweet(cache, authorsById, m);
  for (const m of quotes) cacheTweet(cache, authorsById, m);

  const ancestorsAdded = await resolveParentChains(
    cache,
    authorsById,
    tokens.access_token,
  );
  if (ancestorsAdded > 0) {
    console.error(
      `Resolved ${ancestorsAdded} additional ancestor tweet(s) up the reply chain.`,
    );
  }

  await saveTweetCache(cache);

  const now = new Date().toISOString();
  for (const m of replies) {
    await store.upsertOpen(toStoredMention(m, "reply", authorsById, now));
  }
  for (const m of quotes) {
    await store.upsertOpen(toStoredMention(m, "quote", authorsById, now));
  }

  await saveState({
    last_seen_reply_id: newestReplyId ?? state.last_seen_reply_id,
    last_seen_quote_id: newestQuoteId ?? state.last_seen_quote_id,
    last_fetched_at: now,
  });

  const implicitlyClosed = await reconcileImplicitCloses(
    cache,
    store,
    tokens.username,
  );
  if (implicitlyClosed > 0) {
    console.error(
      `Implicitly closed ${implicitlyClosed} mention(s) already replied to by @${tokens.username}.`,
    );
  }
}

async function renderOpen(
  store: JsonFileMentionStore,
  cache: TweetCache,
  opts: Options,
): Promise<void> {
  const openSet = await store.listOpen();
  const totalThreads = groupIntoMentionThreads(openSet, cache, new Set()).length;

  if (openSet.length === 0) {
    console.log("\nNo open mentions.");
    return;
  }

  const end =
    opts.limit === undefined ? openSet.length : opts.offset + opts.limit;
  const slice = openSet.slice(opts.offset, end);

  if (slice.length === 0) {
    console.log(
      `\nNo mentions in slice (offset=${opts.offset}, limit=${opts.limit ?? "∞"}). ` +
        `Total: ${openSet.length} mentions, ${totalThreads} threads.`,
    );
    return;
  }

  const threads = groupIntoMentionThreads(slice, cache, new Set());
  const sliceDesc =
    opts.limit === undefined && opts.offset === 0
      ? ""
      : ` (showing ${slice.length} of ${openSet.length}, offset=${opts.offset})`;

  console.log(
    `\n── ${threads.length} mention thread(s), ${slice.length} open mention(s)${sliceDesc} ──\n`,
  );
  for (const thread of threads) {
    console.log(renderThread(thread));
    console.log("");
  }
}

function toStoredMention(
  m: Mention,
  kind: "reply" | "quote",
  authorsById: Map<string, MentionAuthor>,
  now: string,
): StoredMention {
  const author = authorsById.get(m.author_id);
  const refType = kind === "quote" ? "quoted" : "replied_to";
  const parentRef = m.referenced_tweets?.find(
    (r: ReferencedTweet) => r.type === refType,
  );
  return {
    id: m.id,
    kind,
    fetched_at: now,
    closed_at: null,
    text: m.text,
    author_username: author?.username ?? "unknown",
    author_name: author?.name ?? "unknown",
    created_at: m.created_at,
    parent_ref_id: parentRef?.id ?? null,
  };
}

function cacheTweet(
  cache: TweetCache,
  authorsById: Map<string, MentionAuthor>,
  tweet: Tweet,
): void {
  const existing = cache[tweet.id];
  cache[tweet.id] = {
    ...tweet,
    author: existing?.author ?? authorsById.get(tweet.author_id) ?? null,
  };
}

function unresolvedParentIds(c: TweetCache): string[] {
  const ids = new Set<string>();
  for (const t of Object.values(c)) {
    for (const ref of t.referenced_tweets ?? []) {
      if (ref.type !== "replied_to") continue;
      if (!c[ref.id]) ids.add(ref.id);
    }
  }
  return [...ids];
}

async function resolveParentChains(
  cache: TweetCache,
  authorsById: Map<string, MentionAuthor>,
  accessToken: string,
): Promise<number> {
  let added = 0;
  for (let depth = 0; depth < MAX_THREAD_DEPTH; depth++) {
    const missing = unresolvedParentIds(cache);
    if (missing.length === 0) break;
    for (let i = 0; i < missing.length; i += 100) {
      const batch = missing.slice(i, i + 100);
      const res = await getTweets({ accessToken, ids: batch });
      for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
      for (const t of res.data ?? []) {
        cacheTweet(cache, authorsById, t);
        added++;
      }
      for (const t of res.includes?.tweets ?? []) cacheTweet(cache, authorsById, t);
    }
  }
  return added;
}

async function reconcileImplicitCloses(
  cache: TweetCache,
  store: JsonFileMentionStore,
  username: string,
): Promise<number> {
  const respondedToBySelf = new Set<string>();
  for (const t of Object.values(cache)) {
    if (t.author?.username !== username) continue;
    for (const ref of t.referenced_tweets ?? []) {
      if (ref.type === "replied_to" || ref.type === "quoted") {
        respondedToBySelf.add(ref.id);
      }
    }
  }
  let closed = 0;
  for (const m of await store.listOpen()) {
    if (respondedToBySelf.has(m.id)) {
      await store.close(m.id);
      closed++;
    }
  }
  return closed;
}
