import { readFile, writeFile } from "fs/promises";

export class CacheFile<T> {
  path: string;
  cache?: T;

  constructor(path: string) {
    this.path = path;
  }

  write(data: T) {
    this.cache = data;
    return writeFile(this.path, JSON.stringify(data), "utf-8");
  }

  async read() {
    if (this.cache) return this.cache;
    const file = await readFile(this.path, "utf-8");
    const data = JSON.parse(file) as T;
    this.cache = data;
    return data;
  }
}

export const servantsCache = new CacheFile<Servant[]>("data/servantsList.json");
export const itemsCache = new CacheFile<Item[]>("data/itemsList.json");
export const skillsCache = new CacheFile<ServantSkill[]>(
  "data/skillsList.json"
);
