import { CacheFile } from "~/cache";
import type { UserClassScore } from "./types";
import { log } from "~/utils/logger";
import { createBlankUserScore } from "./createBlankUserScore";

const cacheFiles = new Map<number, CacheFile<UserClassScore>>();

export async function loadUserScore(id: number) {
  let cacheFile = cacheFiles.get(id);
  if (!cacheFile) {
    const filePath = `data/user/scores/${id}.json`;
    cacheFile = new CacheFile(filePath);
    cacheFiles.set(id, cacheFile);
  }

  const exists = await cacheFile.exists();
  if (!exists) {
    log.debug(
      `User data for Class Score id ${id} does not yet exist, creating file...`
    );
    await cacheFile.write(createBlankUserScore(id));
  }

  return cacheFile;
}
