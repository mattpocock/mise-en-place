import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SCRIPT = new URL("./close-mention.mts", import.meta.url).pathname;

async function run(
  mentionIds: string[] | undefined,
  storePath: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const args = ["--experimental-strip-types", "--no-warnings", SCRIPT];
  if (mentionIds !== undefined) args.push(...mentionIds);
  try {
    const { stdout, stderr } = await execFileAsync("node", args, {
      env: { ...process.env, MENTION_STORE_PATH: storePath },
    });
    return { code: 0, stdout, stderr };
  } catch (err: unknown) {
    const e = err as { code: number; stdout: string; stderr: string };
    return { code: e.code, stdout: e.stdout, stderr: e.stderr };
  }
}

function storeWith(mentions: Record<string, unknown>): string {
  return JSON.stringify(mentions, null, 2) + "\n";
}

describe("close-mention CLI", () => {
  let tmpDir: string;
  let storePath: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "close-mention-test-"));
    storePath = join(tmpDir, "x-mentions.json");
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("closes an open mention — exit 0, silent stdout", async () => {
    await writeFile(
      storePath,
      storeWith({
        "100": {
          id: "100",
          fetched_at: "2026-05-08T10:00:00.000Z",
          closed_at: null,
          text: "hello",
          author_username: "alice",
          author_name: "Alice",
          created_at: "2026-05-08T09:00:00.000Z",
          parent_ref_id: null,
        },
      }),
    );

    const result = await run(["100"], storePath);
    assert.equal(result.code, 0, `expected exit 0, got ${result.code}`);
    assert.equal(result.stdout, "", "expected silent stdout");

    const data = JSON.parse(await readFile(storePath, "utf8"));
    assert.notEqual(data["100"].closed_at, null, "closed_at should be set");
  });

  it("exits non-zero for unknown mention id", async () => {
    await writeFile(storePath, storeWith({}));

    const result = await run(["nonexistent"], storePath);
    assert.notEqual(result.code, 0, "expected non-zero exit");
    assert.match(result.stderr, /nonexistent/, "error should mention the id");
  });

  it("exits zero for already-closed mention — idempotent", async () => {
    await writeFile(
      storePath,
      storeWith({
        "200": {
          id: "200",
          fetched_at: "2026-05-08T10:00:00.000Z",
          closed_at: "2026-05-08T11:00:00.000Z",
          text: "hello",
          author_username: "bob",
          author_name: "Bob",
          created_at: "2026-05-08T09:00:00.000Z",
          parent_ref_id: null,
        },
      }),
    );

    const originalData = await readFile(storePath, "utf8");
    const result = await run(["200"], storePath);
    assert.equal(result.code, 0, "expected exit 0 for already-closed");
    assert.equal(result.stdout, "", "expected silent stdout");

    const afterData = await readFile(storePath, "utf8");
    assert.equal(afterData, originalData, "file should not be rewritten");
  });

  it("closes multiple mentions in one invocation", async () => {
    await writeFile(
      storePath,
      storeWith({
        "100": {
          id: "100",
          fetched_at: "2026-05-08T10:00:00.000Z",
          closed_at: null,
          text: "hello",
          author_username: "alice",
          author_name: "Alice",
          created_at: "2026-05-08T09:00:00.000Z",
          parent_ref_id: null,
        },
        "101": {
          id: "101",
          fetched_at: "2026-05-08T10:00:00.000Z",
          closed_at: null,
          text: "hi",
          author_username: "bob",
          author_name: "Bob",
          created_at: "2026-05-08T09:30:00.000Z",
          parent_ref_id: null,
        },
      }),
    );

    const result = await run(["100", "101"], storePath);
    assert.equal(result.code, 0, `expected exit 0, got ${result.code}`);

    const data = JSON.parse(await readFile(storePath, "utf8"));
    assert.notEqual(data["100"].closed_at, null, "100 should be closed");
    assert.notEqual(data["101"].closed_at, null, "101 should be closed");
  });

  it("closes valid ids and reports unknown ones with non-zero exit", async () => {
    await writeFile(
      storePath,
      storeWith({
        "100": {
          id: "100",
          fetched_at: "2026-05-08T10:00:00.000Z",
          closed_at: null,
          text: "hello",
          author_username: "alice",
          author_name: "Alice",
          created_at: "2026-05-08T09:00:00.000Z",
          parent_ref_id: null,
        },
      }),
    );

    const result = await run(["100", "nonexistent"], storePath);
    assert.notEqual(result.code, 0, "expected non-zero exit");
    assert.match(result.stderr, /nonexistent/);

    const data = JSON.parse(await readFile(storePath, "utf8"));
    assert.notEqual(data["100"].closed_at, null, "valid id should still close");
  });

  it("exits non-zero when no mention-id argument is provided", async () => {
    await writeFile(storePath, storeWith({}));

    const result = await run(undefined, storePath);
    assert.notEqual(result.code, 0, "expected non-zero exit");
    assert.match(result.stderr, /usage/i, "should print usage hint");
  });

  describe("range syntax (id..id)", () => {
    function openMention(id: string): Record<string, unknown> {
      return {
        id,
        fetched_at: "2026-05-08T10:00:00.000Z",
        closed_at: null,
        text: `tweet ${id}`,
        author_username: "alice",
        author_name: "Alice",
        created_at: "2026-05-08T09:00:00.000Z",
        parent_ref_id: null,
      };
    }

    function closedMention(id: string): Record<string, unknown> {
      return { ...openMention(id), closed_at: "2026-05-08T11:00:00.000Z" };
    }

    it("closes all open mentions in the inclusive range", async () => {
      await writeFile(
        storePath,
        storeWith({
          "100": openMention("100"),
          "150": openMention("150"),
          "200": openMention("200"),
          "300": openMention("300"),
        }),
      );

      const result = await run(["100..200"], storePath);
      assert.equal(result.code, 0, `expected exit 0, got ${result.code}: ${result.stderr}`);
      assert.match(result.stderr, /3 mentions/, "summary should report 3 closed");

      const data = JSON.parse(await readFile(storePath, "utf8"));
      assert.notEqual(data["100"].closed_at, null);
      assert.notEqual(data["150"].closed_at, null);
      assert.notEqual(data["200"].closed_at, null);
      assert.equal(data["300"].closed_at, null, "outside-range stays open");
    });

    it("range with single-id span (id..id) closes only that id", async () => {
      await writeFile(
        storePath,
        storeWith({ "100": openMention("100"), "200": openMention("200") }),
      );

      const result = await run(["100..100"], storePath);
      assert.equal(result.code, 0);

      const data = JSON.parse(await readFile(storePath, "utf8"));
      assert.notEqual(data["100"].closed_at, null);
      assert.equal(data["200"].closed_at, null);
    });

    it("range matching only already-closed mentions errors", async () => {
      await writeFile(
        storePath,
        storeWith({
          "100": closedMention("100"),
          "150": closedMention("150"),
          "300": openMention("300"),
        }),
      );

      const result = await run(["100..200"], storePath);
      assert.notEqual(result.code, 0, "expected non-zero exit");
      assert.match(result.stderr, /no open mentions in range/i);
    });

    it("range matching no stored mentions errors", async () => {
      await writeFile(storePath, storeWith({ "1000": openMention("1000") }));

      const result = await run(["100..200"], storePath);
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /100\.\.200/);
    });

    it("reversed range (high..low) errors", async () => {
      await writeFile(storePath, storeWith({ "150": openMention("150") }));

      const result = await run(["200..100"], storePath);
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /left endpoint/i);
    });

    it("non-numeric endpoint errors", async () => {
      await writeFile(storePath, storeWith({ "100": openMention("100") }));

      const result = await run(["100..abc"], storePath);
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /numeric/i);
    });

    it("open-ended range (id..) errors", async () => {
      await writeFile(storePath, storeWith({ "100": openMention("100") }));

      const result = await run(["100.."], storePath);
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /endpoints required/i);
    });

    it("multiple .. in argument errors", async () => {
      await writeFile(storePath, storeWith({ "100": openMention("100") }));

      const result = await run(["100..200..300"], storePath);
      assert.notEqual(result.code, 0);
      assert.match(result.stderr, /one ".." separator/);
    });

    it("mixes individual ids and ranges in one invocation", async () => {
      await writeFile(
        storePath,
        storeWith({
          "50": openMention("50"),
          "100": openMention("100"),
          "150": openMention("150"),
          "500": openMention("500"),
        }),
      );

      const result = await run(["50", "100..150", "500"], storePath);
      assert.equal(result.code, 0, `expected exit 0, got ${result.code}: ${result.stderr}`);

      const data = JSON.parse(await readFile(storePath, "utf8"));
      assert.notEqual(data["50"].closed_at, null);
      assert.notEqual(data["100"].closed_at, null);
      assert.notEqual(data["150"].closed_at, null);
      assert.notEqual(data["500"].closed_at, null);
    });

    it("range with closed mentions interleaved closes only opens", async () => {
      await writeFile(
        storePath,
        storeWith({
          "100": openMention("100"),
          "120": closedMention("120"),
          "140": openMention("140"),
        }),
      );

      const originalClosedAt = "2026-05-08T11:00:00.000Z";
      const result = await run(["100..200"], storePath);
      assert.equal(result.code, 0);
      assert.match(result.stderr, /2 mentions/, "should close 2, skip the already-closed");

      const data = JSON.parse(await readFile(storePath, "utf8"));
      assert.notEqual(data["100"].closed_at, null);
      assert.equal(data["120"].closed_at, originalClosedAt, "already-closed timestamp untouched");
      assert.notEqual(data["140"].closed_at, null);
    });
  });
});
