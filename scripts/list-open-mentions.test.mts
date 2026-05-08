import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SCRIPT = new URL("./list-open-mentions.mts", import.meta.url).pathname;

async function run(
  storePath: string,
  cachePath: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const args = ["--experimental-strip-types", "--no-warnings", SCRIPT];
  try {
    const { stdout, stderr } = await execFileAsync("node", args, {
      env: {
        ...process.env,
        MENTION_STORE_PATH: storePath,
        TWEET_CACHE_PATH: cachePath,
      },
    });
    return { code: 0, stdout, stderr };
  } catch (err: unknown) {
    const e = err as { code: number; stdout: string; stderr: string };
    return { code: e.code, stdout: e.stdout, stderr: e.stderr };
  }
}

describe("list-open-mentions CLI", () => {
  let tmpDir: string;
  let storePath: string;
  let cachePath: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "list-open-test-"));
    storePath = join(tmpDir, "x-mentions.json");
    cachePath = join(tmpDir, "x-tweet-cache.json");
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("prints 'No open mentions' when store is empty", async () => {
    await writeFile(storePath, JSON.stringify({}) + "\n");
    await writeFile(cachePath, JSON.stringify({}) + "\n");

    const result = await run(storePath, cachePath);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /no open mentions/i);
  });

  it("lists open mentions with rendered output", async () => {
    const store = {
      "100": {
        id: "100",
        fetched_at: "2026-05-08T10:00:00.000Z",
        closed_at: null,
        text: "Great video @matt",
        author_username: "alice",
        author_name: "Alice",
        created_at: "2026-05-08T09:00:00.000Z",
        parent_ref_id: null,
      },
    };
    await writeFile(storePath, JSON.stringify(store) + "\n");
    await writeFile(cachePath, JSON.stringify({}) + "\n");

    const result = await run(storePath, cachePath);
    assert.equal(result.code, 0);
    assert.ok(result.stdout.includes("@alice"), "should include author handle");
    assert.ok(result.stdout.includes("100"), "should include mention id");
    assert.ok(
      result.stdout.includes("Great video @matt"),
      "should include mention text",
    );
  });

  it("excludes closed mentions from output", async () => {
    const store = {
      "100": {
        id: "100",
        fetched_at: "2026-05-08T10:00:00.000Z",
        closed_at: "2026-05-08T11:00:00.000Z",
        text: "Already dealt with",
        author_username: "bob",
        author_name: "Bob",
        created_at: "2026-05-08T09:00:00.000Z",
        parent_ref_id: null,
      },
    };
    await writeFile(storePath, JSON.stringify(store) + "\n");
    await writeFile(cachePath, JSON.stringify({}) + "\n");

    const result = await run(storePath, cachePath);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /no open mentions/i);
  });

  it("works when cache file does not exist", async () => {
    const store = {
      "100": {
        id: "100",
        fetched_at: "2026-05-08T10:00:00.000Z",
        closed_at: null,
        text: "Hello",
        author_username: "carol",
        author_name: "Carol",
        created_at: "2026-05-08T09:00:00.000Z",
        parent_ref_id: null,
      },
    };
    await writeFile(storePath, JSON.stringify(store) + "\n");

    const nonExistentCache = join(tmpDir, "no-such-cache.json");
    const result = await run(storePath, nonExistentCache);
    assert.equal(result.code, 0);
    assert.ok(result.stdout.includes("@carol"));
  });

  it("renders thread context when cache has parent tweets", async () => {
    const store = {
      "200": {
        id: "200",
        fetched_at: "2026-05-08T10:00:00.000Z",
        closed_at: null,
        text: "Good point!",
        author_username: "bob",
        author_name: "Bob",
        created_at: "2026-05-08T09:01:00.000Z",
        parent_ref_id: "100",
      },
    };
    const tweetCache = {
      "100": {
        id: "100",
        text: "Original thought",
        author_id: "a1",
        created_at: "2026-05-08T09:00:00.000Z",
        public_metrics: {
          retweet_count: 0,
          reply_count: 1,
          like_count: 0,
          quote_count: 0,
        },
        author: {
          id: "a1",
          username: "alice",
          name: "Alice",
          verified: false,
        },
      },
      "200": {
        id: "200",
        text: "Good point!",
        author_id: "a2",
        created_at: "2026-05-08T09:01:00.000Z",
        public_metrics: {
          retweet_count: 0,
          reply_count: 0,
          like_count: 0,
          quote_count: 0,
        },
        referenced_tweets: [{ type: "replied_to", id: "100" }],
        author: { id: "a2", username: "bob", name: "Bob", verified: false },
      },
    };
    await writeFile(storePath, JSON.stringify(store) + "\n");
    await writeFile(cachePath, JSON.stringify(tweetCache) + "\n");

    const result = await run(storePath, cachePath);
    assert.equal(result.code, 0);
    assert.ok(
      result.stdout.includes("Original thought"),
      "should include parent tweet text",
    );
    assert.ok(
      result.stdout.includes("@alice"),
      "should include parent author",
    );
  });
});
