#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { JsonFileMentionStore } from "./lib/mention-store.mts";
import { renderThread } from "./lib/mention-renderer.mts";
import { groupIntoMentionThreads } from "./lib/thread-builder.mts";
import type { TweetCache } from "./lib/storage.mts";

const STORE_PATH = process.env.MENTION_STORE_PATH ?? "data/x-mentions.json";
const CACHE_PATH = process.env.TWEET_CACHE_PATH ?? "data/x-tweet-cache.json";

const store = new JsonFileMentionStore(STORE_PATH);

let cache: TweetCache = {};
try {
  const raw = await readFile(CACHE_PATH, "utf8");
  cache = JSON.parse(raw) as TweetCache;
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
}

const openSet = await store.listOpen();

if (openSet.length === 0) {
  console.log("No open mentions.");
} else {
  const threads = groupIntoMentionThreads(openSet, cache, new Set());
  console.log(
    `── ${threads.length} mention thread(s), ${openSet.length} open mention(s) ──\n`,
  );
  for (const thread of threads) {
    console.log(renderThread(thread));
    console.log("");
  }
}
