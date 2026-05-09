#!/usr/bin/env node
import { JsonFileMentionStore } from "./lib/mention-store.mts";

const STORE_PATH = process.env.MENTION_STORE_PATH ?? "data/x-mentions.json";

const mentionIds = process.argv.slice(2);
if (mentionIds.length === 0) {
  process.stderr.write("Usage: close-mention.mts <mention-id> [<mention-id>...]\n");
  process.exit(1);
}

const store = new JsonFileMentionStore(STORE_PATH);

const missing: string[] = [];
for (const id of mentionIds) {
  const mention = await store.getById(id);
  if (!mention) {
    missing.push(id);
    continue;
  }
  if (mention.closed_at !== null) continue;
  await store.close(id);
}

if (missing.length > 0) {
  process.stderr.write(
    `No mention with id ${missing.join(", ")} in the store\n`,
  );
  process.exit(1);
}
