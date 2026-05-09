import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { groupIntoMentionThreads } from "./thread-builder.mts";
import type { TweetCache, CachedTweet } from "./storage.mts";
import type { StoredMention } from "./mention-store.mts";

function makeCachedTweet(
  overrides: Partial<CachedTweet> & { id: string },
): CachedTweet {
  return {
    text: "tweet text",
    author_id: "a1",
    created_at: "2026-05-08T09:00:00.000Z",
    public_metrics: {
      retweet_count: 0,
      reply_count: 0,
      like_count: 0,
      quote_count: 0,
    },
    author: { id: "a1", username: "alice", name: "Alice", verified: false },
    ...overrides,
  };
}

function makeMention(overrides: Partial<StoredMention> & { id: string }): StoredMention {
  return {
    fetched_at: "2026-05-08T10:00:00.000Z",
    closed_at: null,
    text: "tweet",
    author_username: "alice",
    author_name: "Alice",
    created_at: "2026-05-08T09:00:00.000Z",
    parent_ref_id: null,
    ...overrides,
  };
}

describe("groupIntoMentionThreads", () => {
  it("returns empty when there are no open mentions", () => {
    const threads = groupIntoMentionThreads([], {}, new Set());
    assert.deepEqual(threads, []);
  });

  it("groups two mentions sharing a root into one thread", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1", text: "Root" }),
      "2": makeCachedTweet({
        id: "2",
        text: "Reply A",
        created_at: "2026-05-08T10:00:00.000Z",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
      "3": makeCachedTweet({
        id: "3",
        text: "Reply B",
        created_at: "2026-05-08T11:00:00.000Z",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const mentions = [
      makeMention({ id: "2", created_at: "2026-05-08T10:00:00.000Z" }),
      makeMention({ id: "3", created_at: "2026-05-08T11:00:00.000Z" }),
    ];
    const threads = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads.length, 1);
    assert.equal(threads[0]!.rootKey, "1");
    assert.equal(threads[0]!.rootResolved, true);
    assert.equal(threads[0]!.root.id, "1");
    assert.equal(threads[0]!.root.children.length, 2);
    // siblings sorted chronologically
    assert.equal(threads[0]!.root.children[0]!.id, "2");
    assert.equal(threads[0]!.root.children[1]!.id, "3");
  });

  it("uses unresolved parent id as root key when chain dies at a gap", () => {
    const cache: TweetCache = {
      "2": makeCachedTweet({
        id: "2",
        text: "Reply to missing",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
      "3": makeCachedTweet({
        id: "3",
        text: "Another reply to missing",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const mentions = [makeMention({ id: "2" }), makeMention({ id: "3" })];
    const threads = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads.length, 1);
    assert.equal(threads[0]!.rootKey, "1");
    assert.equal(threads[0]!.rootResolved, false);
    assert.equal(threads[0]!.root.tweet, null);
    assert.equal(threads[0]!.root.children.length, 2);
  });

  it("marks newly fetched mentions as 'new' and existing opens as 'open'", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1" }),
      "2": makeCachedTweet({
        id: "2",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const mentions = [makeMention({ id: "2" })];
    const threads = groupIntoMentionThreads(
      mentions,
      cache,
      new Set(["2"]),
    );
    assert.equal(threads[0]!.root.children[0]!.status, "new");

    const threads2 = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads2[0]!.root.children[0]!.status, "open");
  });

  it("ancestors that are not open mentions are marked 'context'", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1" }),
      "2": makeCachedTweet({
        id: "2",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const mentions = [makeMention({ id: "2" })];
    const threads = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads[0]!.root.status, "context");
  });

  it("orders threads by newest open mention first", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1" }),
      "2": makeCachedTweet({
        id: "2",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
      "10": makeCachedTweet({ id: "10" }),
      "20": makeCachedTweet({
        id: "20",
        referenced_tweets: [{ type: "replied_to", id: "10" }],
      }),
    };
    const mentions = [
      makeMention({ id: "2", created_at: "2026-05-08T09:00:00.000Z" }),
      makeMention({ id: "20", created_at: "2026-05-08T11:00:00.000Z" }),
    ];
    const threads = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads.length, 2);
    assert.equal(threads[0]!.rootKey, "10");
    assert.equal(threads[1]!.rootKey, "1");
  });

  it("prunes branches that don't lead to an open mention", () => {
    // root has two replies; only one has an open mention under it
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1", text: "Root" }),
      "2": makeCachedTweet({
        id: "2",
        text: "Reply on the open path",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
      "3": makeCachedTweet({
        id: "3",
        text: "Unrelated sibling — never mentioned",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const mentions = [makeMention({ id: "2" })];
    const threads = groupIntoMentionThreads(mentions, cache, new Set());
    assert.equal(threads[0]!.root.children.length, 1);
    assert.equal(threads[0]!.root.children[0]!.id, "2");
  });
});
