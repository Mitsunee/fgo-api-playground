import { mkdir, readFile, writeFile } from "fs/promises";
import type { CacheInfo } from "./types";
import { log } from "~/utils/logger";
import { dirname } from "path";

const infoPath = "data/cache/info.json";

export async function writeCacheInfo(info: CacheInfo) {
  await mkdir(dirname(infoPath), { recursive: true });
  await writeFile(infoPath, JSON.stringify(info), "utf8");
}

export async function getCacheInfo() {
  const info: CacheInfo = { EN: 0, JP: 0, lastChecked: 0, cacheVer: -1 };

  try {
    // read and parse file
    const file = await readFile(infoPath, "utf8");
    const data: unknown = JSON.parse(file);
    if (typeof data != "object" || data === null) throw new Error("");

    // discover valid props
    if ("EN" in data && typeof data.EN === "number") info.EN = data.EN;
    if ("JP" in data && typeof data.JP === "number") info.JP = data.JP;
    if ("lastChecked" in data && typeof data.lastChecked === "number") {
      info.lastChecked = data.lastChecked;
    }
    if ("cacheVer" in data && typeof data.cacheVer === "number") {
      info.cacheVer = data.cacheVer;
    }
  } catch {
    log.warn("Could not find or read local cache info");
  }

  return info;
}
