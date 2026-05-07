#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { getValidAccessToken } from "./x-lib/oauth.mts";
import {
  getMentions,
  getTweets,
  type Mention,
  type MentionAuthor,
  type ReferencedTweet,
  type Tweet,
} from "./x-lib/x-api.mts";
import {
  loadState,
  saveState,
  loadTweetCache,
  saveTweetCache,
  type CachedTweet,
  type TweetCache,
} from "./x-lib/storage.mts";

const MAX_THREAD_DEPTH = 30;

const tokens = await getValidAccessToken();
const state = await loadState();
const cache = await loadTweetCache();

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

if (allMentions.length > 0) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = `data/x-mentions-${stamp}.json`;
  await mkdir("data", { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify(
      {
        fetched_at: new Date().toISOString(),
        since_id: state.last_seen_mention_id ?? null,
        mentions: allMentions.map((m) => ({
          ...m,
          author: authorsById.get(m.author_id) ?? null,
          thread: buildThread(m.id),
        })),
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`Wrote ${outPath}`);
}

if (newestId) {
  await saveState({ last_seen_mention_id: newestId });
  console.log(`Updated last_seen_mention_id → ${newestId}`);
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

type ThreadNode = {
  id: string;
  author: MentionAuthor | null;
  text: string;
  created_at: string;
  parent_id: string | null;
};

function buildThread(leafId: string): ThreadNode[] {
  const chain: ThreadNode[] = [];
  const seen = new Set<string>();
  let currentId: string | null = leafId;
  while (currentId !== null && !seen.has(currentId)) {
    seen.add(currentId);
    const t: CachedTweet | undefined = cache[currentId];
    if (!t) break;
    const parentRef: ReferencedTweet | undefined = t.referenced_tweets?.find(
      (r: ReferencedTweet) => r.type === "replied_to",
    );
    const parentId: string | null = parentRef ? parentRef.id : null;
    chain.push({
      id: t.id,
      author: t.author,
      text: t.text,
      created_at: t.created_at,
      parent_id: parentId,
    });
    currentId = parentId;
  }
  return chain.reverse();
}
