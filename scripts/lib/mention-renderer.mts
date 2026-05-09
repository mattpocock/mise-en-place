import type {
  MentionThread,
  NodeStatus,
  ThreadTreeNode,
} from "./thread-builder.mts";

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";

function statusMarker(s: NodeStatus): string {
  if (s === "new") return ` ${YELLOW}★ new${RESET}`;
  if (s === "open") return ` ${GREEN}● open${RESET}`;
  return "";
}

function flattenText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function nodeLine(node: ThreadTreeNode): string {
  if (!node.tweet) {
    return `${DIM}(unresolved tweet ${node.id} — deleted, protected, or out of reach)${RESET}`;
  }
  const handle = node.tweet.author?.username ?? "unknown";
  const text = flattenText(node.tweet.text);
  return `${BOLD}@${handle}${RESET}: ${text}${statusMarker(node.status)} ${DIM}[${node.id}]${RESET}`;
}

function renderNode(
  node: ThreadTreeNode,
  prefix: string,
  isLast: boolean,
  isRoot: boolean,
  out: string[],
): void {
  if (isRoot) {
    out.push(nodeLine(node));
  } else {
    const branch = isLast ? "└─ " : "├─ ";
    out.push(prefix + branch + nodeLine(node));
  }
  const childPrefix = isRoot ? "" : prefix + (isLast ? "   " : "│  ");
  node.children.forEach((c, i) => {
    renderNode(c, childPrefix, i === node.children.length - 1, false, out);
  });
}

export function renderThread(thread: MentionThread): string {
  const out: string[] = [];
  renderNode(thread.root, "", true, true, out);
  return out.join("\n");
}
