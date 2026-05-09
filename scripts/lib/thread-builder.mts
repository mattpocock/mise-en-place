import type { CachedTweet, TweetCache } from "./storage.mts";
import type { ReferencedTweet } from "./x-api.mts";
import type { StoredMention } from "./mention-store.mts";

export type NodeStatus = "new" | "open" | "context";

export type ThreadTreeNode = {
  id: string;
  tweet: CachedTweet | null;
  status: NodeStatus;
  children: ThreadTreeNode[];
};

export type MentionThread = {
  rootKey: string;
  rootResolved: boolean;
  newestOpenAt: string;
  root: ThreadTreeNode;
};

function findReplyParentId(t: CachedTweet | undefined): string | null {
  if (!t) return null;
  const ref = t.referenced_tweets?.find(
    (r: ReferencedTweet) => r.type === "replied_to",
  );
  return ref?.id ?? null;
}

function resolveRoot(
  leafId: string,
  cache: TweetCache,
): { rootKey: string; rootResolved: boolean; pathIds: string[] } {
  const pathIds: string[] = [];
  const seen = new Set<string>();
  let currentId: string | null = leafId;
  let lastCachedId = leafId;
  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const t = cache[currentId];
    if (!t) {
      return { rootKey: currentId, rootResolved: false, pathIds };
    }
    pathIds.push(currentId);
    lastCachedId = currentId;
    currentId = findReplyParentId(t);
  }
  return { rootKey: lastCachedId, rootResolved: true, pathIds };
}

function synthesizeFromMention(m: StoredMention): CachedTweet {
  return {
    id: m.id,
    text: m.text,
    author_id: "",
    created_at: m.created_at,
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 0,
      quote_count: 0,
    },
    referenced_tweets: m.parent_ref_id
      ? [{ type: "replied_to", id: m.parent_ref_id }]
      : undefined,
    author: {
      id: "",
      username: m.author_username,
      name: m.author_name,
      verified: false,
    },
  };
}

export function groupIntoMentionThreads(
  openMentions: StoredMention[],
  inputCache: TweetCache,
  newIds: Set<string>,
): MentionThread[] {
  const openIds = new Set(openMentions.map((m) => m.id));
  // Fall back to StoredMention data for any open mention missing from the
  // tweet cache — e.g. when the cache file is absent or out of date.
  const cache: TweetCache = { ...inputCache };
  for (const m of openMentions) {
    if (!cache[m.id]) cache[m.id] = synthesizeFromMention(m);
  }

  type Group = {
    rootKey: string;
    rootResolved: boolean;
    nodeIds: Set<string>;
    leafCreatedAts: string[];
  };
  const groups = new Map<string, Group>();

  for (const m of openMentions) {
    const { rootKey, rootResolved, pathIds } = resolveRoot(m.id, cache);
    let g = groups.get(rootKey);
    if (!g) {
      g = {
        rootKey,
        rootResolved,
        nodeIds: new Set(),
        leafCreatedAts: [],
      };
      groups.set(rootKey, g);
    }
    for (const id of pathIds) g.nodeIds.add(id);
    g.leafCreatedAts.push(m.created_at);
  }

  const threads: MentionThread[] = [];
  for (const g of groups.values()) {
    const parentOf = new Map<string, string | null>();
    for (const id of g.nodeIds) {
      const parent = findReplyParentId(cache[id]);
      parentOf.set(id, parent && g.nodeIds.has(parent) ? parent : null);
    }

    const childrenOf = new Map<string, string[]>();
    for (const id of g.nodeIds) childrenOf.set(id, []);
    for (const [id, parent] of parentOf) {
      if (parent) childrenOf.get(parent)!.push(id);
    }

    const makeNode = (id: string): ThreadTreeNode => {
      const tweet = cache[id] ?? null;
      const status: NodeStatus = newIds.has(id)
        ? "new"
        : openIds.has(id)
          ? "open"
          : "context";
      const childIds = (childrenOf.get(id) ?? []).slice().sort((a, b) => {
        const ta = cache[a]?.created_at ?? "";
        const tb = cache[b]?.created_at ?? "";
        return ta.localeCompare(tb);
      });
      return {
        id,
        tweet,
        status,
        children: childIds.map(makeNode),
      };
    };

    let root: ThreadTreeNode;
    if (g.rootResolved) {
      const rootId = [...g.nodeIds].find((id) => !parentOf.get(id))!;
      root = makeNode(rootId);
    } else {
      const topCachedIds = [...g.nodeIds].filter((id) => !parentOf.get(id));
      topCachedIds.sort((a, b) => {
        const ta = cache[a]?.created_at ?? "";
        const tb = cache[b]?.created_at ?? "";
        return ta.localeCompare(tb);
      });
      root = {
        id: g.rootKey,
        tweet: null,
        status: "context",
        children: topCachedIds.map(makeNode),
      };
    }

    g.leafCreatedAts.sort();
    const newestOpenAt = g.leafCreatedAts[g.leafCreatedAts.length - 1]!;
    threads.push({
      rootKey: g.rootKey,
      rootResolved: g.rootResolved,
      newestOpenAt,
      root,
    });
  }

  threads.sort((a, b) => b.newestOpenAt.localeCompare(a.newestOpenAt));
  return threads;
}
