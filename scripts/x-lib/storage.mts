import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
  username: string;
};

export type State = {
  last_seen_mention_id?: string;
};

const TOKENS_PATH = "data/x-tokens.json";
const STATE_PATH = "data/x-state.json";

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export const loadTokens = () => readJson<Tokens>(TOKENS_PATH);
export const saveTokens = (t: Tokens) => writeJson(TOKENS_PATH, t);
export const loadState = async (): Promise<State> =>
  (await readJson<State>(STATE_PATH)) ?? {};
export const saveState = (s: State) => writeJson(STATE_PATH, s);
