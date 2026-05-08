#!/usr/bin/env node
import { getValidAccessToken } from "./lib/oauth.mts";
import {
  getMentions,
  getTweets,
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
  type TweetCache,
} from "./lib/storage.mts";
import {
  JsonFileMentionStore,
  type StoredMention,
} from "./lib/mention-store.mts";
import { renderMention } from "./lib/mention-renderer.mts";
import { buildThread } from "./lib/thread-builder.mts";

const STORE_PATH = "data/x-mentions.json";
const MAX_THREAD_DEPTH = 30;

const tokens = await getValidAccessToken();
const state = await loadState();
const cache = await loadTweetCache();
const store = new JsonFileMentionStore(STORE_PATH);

const allMentions: Mention[] = [];
const authorsById = new Map<string, MentionAuthor>();
let paginationToken: string | undefined;
let newestId: string | undefined;

do {
  const res = await getMentions({
    accessToken: tokens.access_token,
    userId: tokens.user_id,
    sinceId: state.last_seen_mention_id,
    paginationToken,
  });
  if (res.data) allMentions.push(...res.data);
  for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
  for (const t of res.includes?.tweets ?? []) cacheTweet(t);
  newestId = newestId ?? res.meta.newest_id;
  paginationToken = res.meta.next_token;
} while (paginationToken);

console.log(
  `Fetched ${allMentions.length} new mention(s) for @${tokens.username}.`,
);

for (const m of allMentions) cacheTweet(m);

const ancestorsAdded = await resolveParentChains();
if (ancestorsAdded > 0) {
  console.log(
    `Resolved ${ancestorsAdded} additional ancestor tweet(s) up the reply chain.`,
  );
}

await saveTweetCache(cache);

const fetchedIds = new Set(allMentions.map((m) => m.id));
const now = new Date().toISOString();

for (const m of allMentions) {
  const author = authorsById.get(m.author_id);
  const parentRef = m.referenced_tweets?.find(
    (r: ReferencedTweet) => r.type === "replied_to",
  );
  const stored: StoredMention = {
    id: m.id,
    fetched_at: now,
    closed_at: null,
    text: m.text,
    author_username: author?.username ?? "unknown",
    author_name: author?.name ?? "unknown",
    created_at: m.created_at,
    parent_ref_id: parentRef?.id ?? null,
  };
  await store.upsertOpen(stored);
}

if (newestId) {
  await saveState({ last_seen_mention_id: newestId });
  console.log(`Updated last_seen_mention_id → ${newestId}`);
}

const openSet = await store.listOpen();
if (openSet.length === 0) {
  console.log("\nNo open mentions.");
} else {
  console.log(`\n── Open mentions (${openSet.length}) ──\n`);
  for (const mention of openSet) {
    const thread = buildThread(mention.id, cache);
    const isNew = fetchedIds.has(mention.id);
    console.log(renderMention(mention, thread, isNew));
    console.log("");
  }
}

function cacheTweet(tweet: Tweet): void {
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

async function resolveParentChains(): Promise<number> {
  let added = 0;
  for (let depth = 0; depth < MAX_THREAD_DEPTH; depth++) {
    const missing = unresolvedParentIds(cache);
    if (missing.length === 0) break;
    for (let i = 0; i < missing.length; i += 100) {
      const batch = missing.slice(i, i + 100);
      const res = await getTweets({
        accessToken: tokens.access_token,
        ids: batch,
      });
      for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
      for (const t of res.data ?? []) {
        cacheTweet(t);
        added++;
      }
      for (const t of res.includes?.tweets ?? []) cacheTweet(t);
    }
  }
  return added;
}

