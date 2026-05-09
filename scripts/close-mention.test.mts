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
});
