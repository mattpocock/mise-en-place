import type { CachedTweet, TweetCache } from "./storage.mts";
import type { ReferencedTweet } from "./x-api.mts";
import type { ThreadNode } from "./mention-renderer.mts";

export function buildThread(leafId: string, cache: TweetCache): ThreadNode[] {
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
    chain.push({
      id: t.id,
      author_username: t.author?.username ?? null,
      author_name: t.author?.name ?? null,
      text: t.text,
      created_at: t.created_at,
    });
    currentId = parentRef ? parentRef.id : null;
  }
  return chain.reverse();
}
