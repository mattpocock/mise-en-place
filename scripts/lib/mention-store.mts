import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

export type StoredMention = {
  id: string;
  fetched_at: string;
  closed_at: string | null;
  text: string;
  author_username: string;
  author_name: string;
  created_at: string;
  parent_ref_id: string | null;
};

export interface MentionStore {
  upsertOpen(mention: StoredMention): Promise<void>;
  listOpen(): Promise<StoredMention[]>;
  getById(id: string): Promise<StoredMention | null>;
  close(id: string): Promise<void>;
}

type StoreData = Record<string, StoredMention>;

export class JsonFileMentionStore implements MentionStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async load(): Promise<StoreData> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as StoreData;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw err;
    }
  }

  private async save(data: StoreData): Promise<void> {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    const tmpPath = join(dir, `.tmp-${randomBytes(8).toString("hex")}.json`);
    await writeFile(tmpPath, JSON.stringify(data, null, 2) + "\n", "utf8");
    await rename(tmpPath, this.filePath);
  }

  async upsertOpen(mention: StoredMention): Promise<void> {
    const data = await this.load();
    if (data[mention.id]) return;
    data[mention.id] = { ...mention, closed_at: null };
    await this.save(data);
  }

  async listOpen(): Promise<StoredMention[]> {
    const data = await this.load();
    return Object.values(data)
      .filter((m) => m.closed_at === null)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
  }

  async getById(id: string): Promise<StoredMention | null> {
    const data = await this.load();
    return data[id] ?? null;
  }

  async close(id: string): Promise<void> {
    const data = await this.load();
    if (!data[id]) return;
    data[id]!.closed_at = new Date().toISOString();
    await this.save(data);
  }
}
