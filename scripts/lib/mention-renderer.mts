import type { StoredMention } from "./mention-store.mts";

export type ThreadNode = {
  id: string;
  author_username: string | null;
  author_name: string | null;
  text: string;
  created_at: string;
};

export function renderMention(
  mention: StoredMention,
  thread: ThreadNode[],
  isNew: boolean,
): string {
  const lines: string[] = [];
  const marker = isNew ? " ★ new" : "";
  lines.push(
    `── @${mention.author_username} [${mention.id}]${marker} ──`,
  );

  if (thread.length > 0) {
    for (const node of thread) {
      const handle = node.author_username ?? "unknown";
      lines.push(`  @${handle}: ${node.text}`);
    }
  } else {
    lines.push(`  ${mention.text}`);
  }

  return lines.join("\n");
}
