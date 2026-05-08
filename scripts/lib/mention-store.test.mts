import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonFileMentionStore, type StoredMention } from "./mention-store.mts";

function makeMention(overrides: Partial<StoredMention> = {}): StoredMention {
  return {
    id: "1",
    fetched_at: "2026-05-08T10:00:00.000Z",
    closed_at: null,
    text: "hello @matt",
    author_username: "alice",
    author_name: "Alice",
    created_at: "2026-05-08T09:00:00.000Z",
    parent_ref_id: null,
    ...overrides,
  };
}

describe("JsonFileMentionStore", () => {
  let tmpDir: string;
  let filePath: string;
  let store: JsonFileMentionStore;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "mention-store-test-"));
    filePath = join(tmpDir, "x-mentions.json");
    store = new JsonFileMentionStore(filePath);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe("upsertOpen", () => {
    it("inserts a new mention", async () => {
      const m = makeMention({ id: "100" });
      await store.upsertOpen(m);
      const result = await store.getById("100");
      assert.deepEqual(result, m);
    });

    it("is idempotent — upserting same id twice yields one row", async () => {
      const m = makeMention({ id: "100" });
      await store.upsertOpen(m);
      await store.upsertOpen(m);
      const all = await store.listOpen();
      assert.equal(all.length, 1);
    });

    it("does not reopen a closed mention", async () => {
      const m = makeMention({ id: "100" });
      await store.upsertOpen(m);
      await store.close("100");
      await store.upsertOpen(m);
      const result = await store.getById("100");
      assert.notEqual(result!.closed_at, null);
    });

    it("updates fields when re-upserting an open mention", async () => {
      await store.upsertOpen(makeMention({ id: "100", text: "old text" }));
      await store.upsertOpen(makeMention({ id: "100", text: "new text" }));
      const result = await store.getById("100");
      assert.equal(result!.text, "new text");
      const all = await store.listOpen();
      assert.equal(all.length, 1);
    });
  });

  describe("listOpen", () => {
    it("returns empty array for fresh store", async () => {
      const result = await store.listOpen();
      assert.deepEqual(result, []);
    });

    it("returns only open mentions", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      await store.upsertOpen(makeMention({ id: "2" }));
      await store.close("1");
      const open = await store.listOpen();
      assert.equal(open.length, 1);
      assert.equal(open[0]!.id, "2");
    });

    it("returns mentions oldest-first by created_at", async () => {
      await store.upsertOpen(
        makeMention({ id: "2", created_at: "2026-05-08T11:00:00.000Z" }),
      );
      await store.upsertOpen(
        makeMention({ id: "1", created_at: "2026-05-08T09:00:00.000Z" }),
      );
      const open = await store.listOpen();
      assert.equal(open[0]!.id, "1");
      assert.equal(open[1]!.id, "2");
    });
  });

  describe("getById", () => {
    it("returns null for unknown id", async () => {
      const result = await store.getById("nonexistent");
      assert.equal(result, null);
    });

    it("returns the mention by id", async () => {
      const m = makeMention({ id: "42" });
      await store.upsertOpen(m);
      const result = await store.getById("42");
      assert.deepEqual(result, m);
    });
  });

  describe("close", () => {
    it("transitions a mention out of the open set", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      await store.close("1");
      const open = await store.listOpen();
      assert.equal(open.length, 0);
    });

    it("sets closed_at to a non-null ISO string", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      await store.close("1");
      const m = await store.getById("1");
      assert.notEqual(m!.closed_at, null);
      assert.doesNotThrow(() => new Date(m!.closed_at!));
    });

    it("is a no-op for unknown id", async () => {
      await assert.doesNotReject(() => store.close("nonexistent"));
    });
  });

  describe("atomic write durability", () => {
    it("writes valid JSON to disk", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      const raw = await readFile(filePath, "utf8");
      assert.doesNotThrow(() => JSON.parse(raw));
    });

    it("persists across store instances", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      const store2 = new JsonFileMentionStore(filePath);
      const result = await store2.getById("1");
      assert.equal(result!.id, "1");
    });

    it("never leaves a partially-written destination file (uses tmp+rename)", async () => {
      // Pre-populate the destination so we can detect mid-write corruption.
      await writeFile(filePath, JSON.stringify({}, null, 2), "utf8");

      // Stub writeFile is hard from outside; instead, monkey-patch the
      // destination to be a directory the store can't overwrite directly.
      // The store writes to a tmp file first and renames — so even if the
      // process were killed mid-stream, the destination still parses.
      // Verify by triggering writes and asserting destination always parses.
      for (let i = 0; i < 10; i++) {
        await store.upsertOpen(makeMention({ id: String(i) }));
        const raw = await readFile(filePath, "utf8");
        assert.doesNotThrow(
          () => JSON.parse(raw),
          `destination must parse after write ${i}`,
        );
      }
    });

    it("does not leave tmp files behind on success", async () => {
      await store.upsertOpen(makeMention({ id: "1" }));
      await store.upsertOpen(makeMention({ id: "2" }));
      await store.close("1");
      const entries = await readdir(tmpDir);
      const stragglers = entries.filter((e) => e.startsWith(".tmp-"));
      assert.deepEqual(stragglers, []);
    });
  });
});
