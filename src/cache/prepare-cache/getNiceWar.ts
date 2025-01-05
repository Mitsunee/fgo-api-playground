import type { War as NiceWar } from "@atlasacademy/api-connector/dist/Schema/War";
import { log } from "~/util/logger";
import { CacheFile } from "..";
import { connectorEN, connectorJP } from "./connector";

const cacheFiles = new Map<SupportedRegion, CacheFile<NiceWar[]>>();

export async function getNiceWar(region: SupportedRegion, update = false) {
  const connector = region == "EN" ? connectorEN : connectorJP;
  const descriptor = `nice_war for region ${region}`;
  let niceWar: NiceWar[];
  let cacheFile = cacheFiles.get(region);
  if (!cacheFile) {
    const filePath = `data/cache/${region}/nice_war.json`;
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
    niceWar = await connector.warListNice();
    await cacheFile.write(niceWar);
    log.info(`Updated ${descriptor}`);
  } else {
    try {
      const data = await cacheFile.read();
      if (!Array.isArray(data)) throw new Error("");
      niceWar = data;
      log.debug(`Using cached ${descriptor}`);
    } catch (e) {
      log.error(`Could not retrieve ${descriptor}`);
      throw e;
    }
  }

  return niceWar;
}
