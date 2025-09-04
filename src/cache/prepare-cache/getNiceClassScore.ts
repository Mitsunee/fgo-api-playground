import type { ClassBoard } from "@atlasacademy/api-connector/dist/Schema/ClassBoard";
import { CacheFile } from "..";
import { log } from "~/utils/logger";
import { connectorEN, connectorJP } from "./connector";

const cacheFiles = new Map<SupportedRegion, CacheFile<ClassBoard[]>>();

export async function getNiceClassScore(
  region: SupportedRegion,
  update = false
) {
  const connector = region == "EN" ? connectorEN : connectorJP;
  const descriptor = `class_score_list for region ${region}`;
  let scoreList: ClassBoard[];
  let cacheFile = cacheFiles.get(region);
  if (!cacheFile) {
    const filePath = `data/cache/${region}/class_score_list.json`;
    cacheFile = new CacheFile(filePath);
    cacheFiles.set(region, cacheFile);
  }

  if (!update) {
    const exists = await cacheFile.exists();
    if (!exists) {
      log.warn(`${descriptor} does not yet exist, forcing update`);
      update = true;
    }
  }

  if (update) {
    log.debug(`Fetching ${descriptor}`);
    scoreList = await connector.classBoardList();
    await cacheFile.write(scoreList);
    log.info(`Updated ${descriptor}`);
  } else {
    try {
      const data = await cacheFile.read();
      if (!Array.isArray(data)) throw new Error("");
      scoreList = data;
      log.debug(`Using cached ${descriptor}`);
    } catch (e) {
      log.error(`Could not retrieve ${descriptor}`);
      throw e;
    }
  }

  return scoreList;
}
