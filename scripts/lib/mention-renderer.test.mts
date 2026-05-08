import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderMention, type ThreadNode } from "./mention-renderer.mts";
import type { StoredMention } from "./mention-store.mts";

function makeMention(overrides: Partial<StoredMention> = {}): StoredMention {
  return {
    id: "100",
    fetched_at: "2026-05-08T10:00:00.000Z",
    closed_at: null,
    text: "Hey @matt great video!",
    author_username: "alice",
    author_name: "Alice Johnson",
    created_at: "2026-05-08T09:00:00.000Z",
    parent_ref_id: null,
    ...overrides,
  };
}

function makeThread(nodes: Partial<ThreadNode>[]): ThreadNode[] {
  return nodes.map((n, i) => ({
    id: String(i + 1),
    author_username: "user" + i,
    author_name: "User " + i,
    text: "tweet " + i,
    created_at: "2026-05-08T09:00:00.000Z",
    ...n,
  }));
}

describe("renderMention", () => {
  it("renders a single mention with no thread", () => {
    const mention = makeMention();
    const output = renderMention(mention, [], false);
    assert.ok(output.includes("@alice"), "should include author handle");
    assert.ok(
      output.includes("Hey @matt great video!"),
      "should include mention text",
    );
    assert.ok(!output.includes("★ new"), "should not have new marker");
  });

  it("renders a mention with ★ new marker when isNew is true", () => {
    const mention = makeMention();
    const output = renderMention(mention, [], true);
    assert.ok(output.includes("★ new"), "should have new marker");
  });

  it("does not include ★ new marker when isNew is false", () => {
    const mention = makeMention();
    const output = renderMention(mention, [], false);
    assert.ok(!output.includes("★ new"), "should not have new marker");
  });

  it("renders a mention with a 3-deep thread", () => {
    const mention = makeMention({ id: "3", parent_ref_id: "2" });
    const thread = makeThread([
      { id: "1", author_username: "bob", text: "Original post" },
      { id: "2", author_username: "carol", text: "First reply" },
      {
        id: "3",
        author_username: "alice",
        text: "Hey @matt great video!",
      },
    ]);
    const output = renderMention(mention, thread, false);
    assert.ok(output.includes("@bob"), "should include root author");
    assert.ok(output.includes("Original post"), "should include root text");
    assert.ok(output.includes("@carol"), "should include mid-thread author");
    assert.ok(output.includes("First reply"), "should include mid-thread text");
    assert.ok(output.includes("@alice"), "should include mention author");
  });

  it("renders a mention with a missing parent in cache", () => {
    const mention = makeMention({ parent_ref_id: "999" });
    const output = renderMention(mention, [], false);
    assert.ok(
      output.includes("Hey @matt great video!"),
      "should still render the mention text",
    );
  });

  it("includes the mention id", () => {
    const mention = makeMention({ id: "42" });
    const output = renderMention(mention, [], false);
    assert.ok(output.includes("42"), "should include the mention id");
  });
});
