#!/usr/bin/env node
import { JsonFileMentionStore, type StoredMention } from "./lib/mention-store.mts";

const STORE_PATH = process.env.MENTION_STORE_PATH ?? "data/x-mentions.json";

const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write(
    "Usage: close-mention.mts <mention-id|id..id> [<mention-id|id..id>...]\n",
  );
  process.exit(1);
}

const NUMERIC = /^[0-9]+$/;

type Range = { kind: "range"; from: bigint; to: bigint; raw: string };
type Single = { kind: "single"; id: string };
type Parsed = Range | Single;

function parseArg(arg: string): Parsed {
  if (!arg.includes("..")) {
    return { kind: "single", id: arg };
  }
  const parts = arg.split("..");
  if (parts.length !== 2) {
    process.stderr.write(`Invalid range "${arg}": expected exactly one ".." separator\n`);
    process.exit(1);
  }
  const [a, b] = parts;
  if (!a || !b) {
    process.stderr.write(`Invalid range "${arg}": both endpoints required (open-ended ranges not supported)\n`);
    process.exit(1);
  }
  if (!NUMERIC.test(a) || !NUMERIC.test(b)) {
    process.stderr.write(`Invalid range "${arg}": endpoints must be numeric mention ids\n`);
    process.exit(1);
  }
  const from = BigInt(a);
  const to = BigInt(b);
  if (from > to) {
    process.stderr.write(`Invalid range "${arg}": left endpoint must be <= right endpoint\n`);
    process.exit(1);
  }
  return { kind: "range", from, to, raw: arg };
}

const parsed = args.map(parseArg);

const store = new JsonFileMentionStore(STORE_PATH);

let openMentions: StoredMention[] | null = null;
async function getOpen(): Promise<StoredMention[]> {
  if (openMentions === null) openMentions = await store.listOpen();
  return openMentions;
}

const idsToClose = new Set<string>();
const missing: string[] = [];

for (const item of parsed) {
  if (item.kind === "single") {
    const mention = await store.getById(item.id);
    if (!mention) {
      missing.push(item.id);
      continue;
    }
    if (mention.closed_at !== null) continue;
    idsToClose.add(item.id);
  } else {
    const open = await getOpen();
    const matches = open.filter((m) => {
      if (!NUMERIC.test(m.id)) return false;
      const id = BigInt(m.id);
      return id >= item.from && id <= item.to;
    });
    if (matches.length === 0) {
      process.stderr.write(
        `No open mentions in range ${item.raw}\n`,
      );
      process.exit(1);
    }
    process.stderr.write(
      `Closing ${matches.length} mention${matches.length === 1 ? "" : "s"} in range ${item.raw}\n`,
    );
    for (const m of matches) idsToClose.add(m.id);
  }
}

for (const id of idsToClose) {
  await store.close(id);
}

if (missing.length > 0) {
  process.stderr.write(
    `No mention with id ${missing.join(", ")} in the store\n`,
  );
  process.exit(1);
}
