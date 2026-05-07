#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { getValidAccessToken } from "./x-lib/oauth.mts";
import { getMentions, type Mention, type MentionAuthor } from "./x-lib/x-api.mts";
import { loadState, saveState } from "./x-lib/storage.mts";

const tokens = await getValidAccessToken();
const state = await loadState();

const allMentions: Mention[] = [];
const authorsById = new Map<string, MentionAuthor>();
let paginationToken: string | undefined;
let newestId: string | undefined;

do {
  const res = await getMentions({
    accessToken: tokens.access_token,
    userId: tokens.user_id,
    sinceId: state.last_seen_mention_id,
    paginationToken,
  });
  if (res.data) allMentions.push(...res.data);
  for (const u of res.includes?.users ?? []) authorsById.set(u.id, u);
  newestId = newestId ?? res.meta.newest_id;
  paginationToken = res.meta.next_token;
} while (paginationToken);

console.log(`Fetched ${allMentions.length} new mention(s) for @${tokens.username}.`);

if (allMentions.length > 0) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = `data/x-mentions-${stamp}.json`;
  await mkdir("data", { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify(
      {
        fetched_at: new Date().toISOString(),
        since_id: state.last_seen_mention_id ?? null,
        mentions: allMentions.map((m) => ({
          ...m,
          author: authorsById.get(m.author_id) ?? null,
        })),
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`Wrote ${outPath}`);
}

if (newestId) {
  await saveState({ last_seen_mention_id: newestId });
  console.log(`Updated last_seen_mention_id → ${newestId}`);
}
