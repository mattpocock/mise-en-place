#!/usr/bin/env node
import { JsonFileMentionStore } from "./lib/mention-store.mts";

const STORE_PATH = process.env.MENTION_STORE_PATH ?? "data/x-mentions.json";

const mentionId = process.argv[2];
if (!mentionId) {
  process.stderr.write("Usage: close-mention.mts <mention-id>\n");
  process.exit(1);
}

const store = new JsonFileMentionStore(STORE_PATH);
const mention = await store.getById(mentionId);

if (!mention) {
  process.stderr.write(`No mention with id ${mentionId} in the store\n`);
  process.exit(1);
}

if (mention.closed_at !== null) {
  process.exit(0);
}

await store.close(mentionId);
