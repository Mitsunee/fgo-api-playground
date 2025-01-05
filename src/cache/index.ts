import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { dirname } from "path";

export class CacheFile<T> {
  path: string;
  dir: string;
  cache?: T;

  constructor(path: string) {
    this.path = path;
    this.dir = dirname(path);
  }

  async write(data: T) {
    this.cache = data;
    await mkdir(this.dir, { recursive: true });
    return writeFile(this.path, JSON.stringify(data), "utf-8");
  }

  async read() {
    if (this.cache) return this.cache;
    const file = await readFile(this.path, "utf-8");
    const data = JSON.parse(file) as T;
    this.cache = data;
    return data;
  }

  async exists() {
    try {
      await stat(this.path);
      return true;
    } catch {
      return false;
    }
  }
}

export const servantsCache = new CacheFile<Servant[]>("data/servantsList.json");
export const itemsCache = new CacheFile<Item[]>("data/itemsList.json");
export const skillsCache = new CacheFile<ServantSkill[]>(
  "data/skillsList.json"
);
export const freeQuestsCache = new CacheFile<FreeQuest[]>(
  "data/freeQuestsList.json"
);
