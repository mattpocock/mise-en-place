import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderThread } from "./mention-renderer.mts";
import type { MentionThread, ThreadTreeNode } from "./thread-builder.mts";
import type { CachedTweet } from "./storage.mts";

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

function makeNode(
  overrides: Partial<ThreadTreeNode> & { id: string },
): ThreadTreeNode {
  return {
    tweet: makeCachedTweet({ id: overrides.id }),
    status: "context",
    children: [],
    ...overrides,
  };
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[\d+m/g, "");
}

function makeThread(root: ThreadTreeNode): MentionThread {
  return {
    rootKey: root.id,
    rootResolved: root.tweet !== null,
    newestOpenAt: "2026-05-08T10:00:00.000Z",
    root,
  };
}

describe("renderThread", () => {
  it("renders a single-node thread (root only)", () => {
    const thread = makeThread(
      makeNode({
        id: "1",
        tweet: makeCachedTweet({ id: "1", text: "Hello world" }),
      }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(out.includes("@alice"));
    assert.ok(out.includes("Hello world"));
    assert.ok(out.includes("[1]"));
  });

  it("renders a parent with two sibling children using box-drawing", () => {
    const thread = makeThread(
      makeNode({
        id: "1",
        tweet: makeCachedTweet({ id: "1", text: "Root" }),
        children: [
          makeNode({
            id: "2",
            tweet: makeCachedTweet({
              id: "2",
              text: "First child",
              author: {
                id: "b",
                username: "bob",
                name: "Bob",
                verified: false,
              },
            }),
            status: "open",
          }),
          makeNode({
            id: "3",
            tweet: makeCachedTweet({
              id: "3",
              text: "Second child",
              author: {
                id: "c",
                username: "carol",
                name: "Carol",
                verified: false,
              },
            }),
            status: "new",
          }),
        ],
      }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(out.includes("├─ "), "first sibling uses ├─");
    assert.ok(out.includes("└─ "), "last sibling uses └─");
    assert.ok(out.includes("● open"), "open marker present");
    assert.ok(out.includes("★ new"), "new marker present");
    assert.ok(out.includes("@bob"));
    assert.ok(out.includes("@carol"));
  });

  it("renders nested children with continuation prefix │", () => {
    const thread = makeThread(
      makeNode({
        id: "1",
        tweet: makeCachedTweet({ id: "1" }),
        children: [
          makeNode({
            id: "2",
            tweet: makeCachedTweet({ id: "2" }),
            children: [
              makeNode({
                id: "3",
                tweet: makeCachedTweet({ id: "3" }),
                status: "new",
              }),
            ],
          }),
          makeNode({ id: "4", tweet: makeCachedTweet({ id: "4" }) }),
        ],
      }),
    );
    const out = stripAnsi(renderThread(thread));
    // child of non-last sibling should be prefixed with │
    assert.ok(/│  └─ /.test(out), "continuation prefix used for nested child");
  });

  it("renders an unresolved root as a gap placeholder", () => {
    const thread: MentionThread = {
      rootKey: "999",
      rootResolved: false,
      newestOpenAt: "2026-05-08T10:00:00.000Z",
      root: {
        id: "999",
        tweet: null,
        status: "context",
        children: [
          {
            id: "2",
            tweet: makeCachedTweet({ id: "2", text: "Hangs from gap" }),
            status: "new",
            children: [],
          },
        ],
      },
    };
    const out = stripAnsi(renderThread(thread));
    assert.ok(out.includes("unresolved tweet 999"));
    assert.ok(out.includes("Hangs from gap"));
  });

  it("flattens multi-line tweet text", () => {
    const thread = makeThread(
      makeNode({
        id: "1",
        tweet: makeCachedTweet({ id: "1", text: "line one\n\nline two" }),
      }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(out.includes("line one line two"));
    assert.ok(!out.includes("line one\n"));
  });

  it("renders [QUOTE] label on quote-kind nodes", () => {
    const thread = makeThread(
      makeNode({
        id: "100",
        tweet: makeCachedTweet({ id: "100", text: "Matt's tweet" }),
        children: [
          makeNode({
            id: "200",
            tweet: makeCachedTweet({ id: "200", text: "Quoting Matt" }),
            status: "open",
            kind: "quote",
          }),
        ],
      }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(out.includes("[QUOTE]"), "quote label rendered");
  });

  it("does not render [QUOTE] on reply-kind or unspecified nodes", () => {
    const thread = makeThread(
      makeNode({
        id: "1",
        tweet: makeCachedTweet({ id: "1" }),
        children: [
          makeNode({
            id: "2",
            tweet: makeCachedTweet({ id: "2" }),
            status: "open",
            kind: "reply",
          }),
        ],
      }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(!out.includes("[QUOTE]"), "no quote label on reply");
  });

  it("emits no marker for context nodes", () => {
    const thread = makeThread(
      makeNode({ id: "1", tweet: makeCachedTweet({ id: "1" }) }),
    );
    const out = stripAnsi(renderThread(thread));
    assert.ok(!out.includes("★ new"));
    assert.ok(!out.includes("● open"));
  });
});
