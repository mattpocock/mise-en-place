import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildThread } from "./thread-builder.mts";
import type { TweetCache, CachedTweet } from "./storage.mts";

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

describe("buildThread", () => {
  it("returns empty array when leaf id is not in cache", () => {
    const cache: TweetCache = {};
    const result = buildThread("999", cache);
    assert.deepEqual(result, []);
  });

  it("returns single node for tweet with no parent", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1", text: "Hello world" }),
    };
    const result = buildThread("1", cache);
    assert.equal(result.length, 1);
    assert.equal(result[0]!.id, "1");
    assert.equal(result[0]!.author_username, "alice");
    assert.equal(result[0]!.text, "Hello world");
  });

  it("returns full chain for a 3-deep thread, root-first", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1", text: "Root" }),
      "2": makeCachedTweet({
        id: "2",
        text: "Reply",
        author_id: "a2",
        author: { id: "a2", username: "bob", name: "Bob", verified: false },
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
      "3": makeCachedTweet({
        id: "3",
        text: "Deep reply",
        author_id: "a3",
        author: { id: "a3", username: "carol", name: "Carol", verified: false },
        referenced_tweets: [{ type: "replied_to", id: "2" }],
      }),
    };
    const result = buildThread("3", cache);
    assert.equal(result.length, 3);
    assert.equal(result[0]!.id, "1");
    assert.equal(result[0]!.author_username, "alice");
    assert.equal(result[1]!.id, "2");
    assert.equal(result[1]!.author_username, "bob");
    assert.equal(result[2]!.id, "3");
    assert.equal(result[2]!.author_username, "carol");
  });

  it("stops at missing parent in cache", () => {
    const cache: TweetCache = {
      "2": makeCachedTweet({
        id: "2",
        text: "Reply to missing",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const result = buildThread("2", cache);
    assert.equal(result.length, 1);
    assert.equal(result[0]!.id, "2");
  });

  it("handles circular references without infinite loop", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({
        id: "1",
        text: "A",
        referenced_tweets: [{ type: "replied_to", id: "2" }],
      }),
      "2": makeCachedTweet({
        id: "2",
        text: "B",
        referenced_tweets: [{ type: "replied_to", id: "1" }],
      }),
    };
    const result = buildThread("1", cache);
    assert.equal(result.length, 2);
  });

  it("uses null for author fields when author is missing", () => {
    const cache: TweetCache = {
      "1": makeCachedTweet({ id: "1", author: null }),
    };
    const result = buildThread("1", cache);
    assert.equal(result[0]!.author_username, null);
    assert.equal(result[0]!.author_name, null);
  });
});
