import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Tweet } from "./x-api.mts";

export type CachedLikedTweet = Tweet & { fetched_at: string };

export type LikesCache = {
  last_fetched_at?: string;
  username?: string;
  tweets: Record<string, CachedLikedTweet>;
};

const LIKES_CACHE_PATH = "data/x-likes-cache.json";

export const loadLikesCache = async (): Promise<LikesCache> => {
  try {
    const raw = await readFile(LIKES_CACHE_PATH, "utf8");
    return JSON.parse(raw) as LikesCache;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { tweets: {} };
    throw err;
  }
};

export async function saveLikesCache(cache: LikesCache): Promise<void> {
  await mkdir(dirname(LIKES_CACHE_PATH), { recursive: true });
  await writeFile(
    LIKES_CACHE_PATH,
    JSON.stringify(cache, null, 2) + "\n",
    "utf8",
  );
}
