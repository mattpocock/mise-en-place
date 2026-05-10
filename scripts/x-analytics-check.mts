#!/usr/bin/env node
import { Command } from "commander";
import { getValidAccessToken } from "./lib/oauth.mts";
import { getUserTweets, type Tweet } from "./lib/x-api.mts";
import {
  loadLikesCache,
  saveLikesCache,
  type CachedLikedTweet,
  type LikesCache,
} from "./lib/x-likes-cache.mts";

const TTL_HOURS = 3;
const WINDOW_HOURS = 168;
const RECENT_HOURS = 24;

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

type SortKey = "likes" | "views" | "time";

type Options = {
  fetch: boolean;
  sort: SortKey;
};

const program = new Command();
program
  .name("x-analytics-check")
  .description(
    "List your Twitter posts from the last 7 days with engagement metrics. " +
      "Refreshes at most every 3 hours — deliberate Lurk-guard.",
  )
  .option("--no-fetch", "skip the X API fetch even if the cache is stale")
  .option(
    "--sort <key>",
    "sort by likes | views | time (default: likes)",
    parseSort,
    "likes" as SortKey,
  );

program.parse();
await main(program.opts<Options>());

function parseSort(raw: string): SortKey {
  if (raw !== "likes" && raw !== "views" && raw !== "time") {
    throw new Error(`expected likes|views|time, got "${raw}"`);
  }
  return raw;
}

async function main(opts: Options): Promise<void> {
  let cache = await loadLikesCache();

  if (opts.fetch && shouldFetch(cache)) {
    cache = await runFetch(cache);
  }

  render(cache, opts.sort);
}

function shouldFetch(cache: LikesCache): boolean {
  if (!cache.last_fetched_at) return true;
  const ageHours =
    (Date.now() - new Date(cache.last_fetched_at).getTime()) / 3_600_000;
  return ageHours >= TTL_HOURS;
}

async function runFetch(cache: LikesCache): Promise<LikesCache> {
  const tokens = await getValidAccessToken();
  const now = new Date();
  const startTime = new Date(
    now.getTime() - WINDOW_HOURS * 3_600_000,
  ).toISOString();

  const fetched: Tweet[] = [];
  let pagination: string | undefined;
  do {
    const res = await getUserTweets({
      accessToken: tokens.access_token,
      userId: tokens.user_id,
      startTime,
      paginationToken: pagination,
    });
    if (res.data) fetched.push(...res.data);
    pagination = res.meta.next_token;
  } while (pagination);

  const fetchedAt = now.toISOString();
  const tweets: Record<string, CachedLikedTweet> = {};
  for (const t of fetched) {
    if (t.referenced_tweets && t.referenced_tweets.length > 0) continue;
    tweets[t.id] = { ...t, fetched_at: fetchedAt };
  }

  const next: LikesCache = {
    last_fetched_at: fetchedAt,
    username: tokens.username,
    tweets,
  };
  await saveLikesCache(next);
  return next;
}

function render(cache: LikesCache, sort: SortKey): void {
  const tweets = Object.values(cache.tweets);
  const now = Date.now();

  if (cache.last_fetched_at) {
    const ageMin = Math.round(
      (now - new Date(cache.last_fetched_at).getTime()) / 60_000,
    );
    console.log(`\n${dim(`fetched ${ageMin}m ago · TTL ${TTL_HOURS}h`)}\n`);
  } else {
    console.log(`\n${dim("no cached data")}\n`);
  }

  if (tweets.length === 0) {
    console.log("No tweets in the last 7 days.\n");
    return;
  }

  const sorted = sortTweets(tweets, sort);
  console.log(
    sorted.map((t) => renderBlock(t, now, cache.username)).join("\n\n"),
  );
  console.log();
}

export function sortTweets(
  tweets: CachedLikedTweet[],
  sort: SortKey,
): CachedLikedTweet[] {
  const copy = [...tweets];
  switch (sort) {
    case "likes":
      return copy.sort(
        (a, b) => b.public_metrics.like_count - a.public_metrics.like_count,
      );
    case "views":
      return copy.sort(
        (a, b) =>
          (b.public_metrics.impression_count ?? 0) -
          (a.public_metrics.impression_count ?? 0),
      );
    case "time":
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

function dim(s: string): string {
  return `${DIM}${s}${RESET}`;
}

function bold(s: string): string {
  return `${BOLD}${s}${RESET}`;
}

function fmtCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtAge(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function renderBlock(
  t: CachedLikedTweet,
  now: number,
  username: string | undefined,
): string {
  const ageHours = (now - new Date(t.created_at).getTime()) / 3_600_000;
  const recent = ageHours < RECENT_HOURS;
  const m = t.public_metrics;
  const views = m.impression_count;

  const recentTag = recent ? `${bold("[recent]")}${DIM} ` : "";
  const header = `${DIM}${recentTag}${fmtAge(ageHours)} ago${RESET}`;
  const body = t.text.replace(/\n/g, " ");
  const counts =
    `${DIM}${m.reply_count} reply · ${m.retweet_count} retweet · ${m.quote_count} quote · ${RESET}` +
    `${bold(`${m.like_count} likes`)}` +
    (views !== undefined
      ? `${dim(" · ")}${bold(`${fmtCount(views)} views`)}`
      : "");
  const url = dim(`https://x.com/${username ?? "i"}/status/${t.id}`);
  return `${header}\n${body}\n${counts}\n${url}`;
}
