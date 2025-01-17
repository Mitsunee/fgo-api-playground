import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { EntityType } from "@atlasacademy/api-connector/dist/Schema/Entity";
import { log } from "~/utils/logger";
import { CacheFile } from "..";
import { connectorEN, connectorJP } from "./connector";

const cacheFiles = new Map<SupportedRegion, CacheFile<ServantWithLore[]>>();

export async function getNiceServant(region: SupportedRegion, update = false) {
  const connector = region == "EN" ? connectorEN : connectorJP;
  const descriptor = `nice_servant for region ${region}`;
  let niceServant: ServantWithLore[];
  let cacheFile = cacheFiles.get(region);
  if (!cacheFile) {
    const filePath = `data/cache/${region}/nice_servant.json`;
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
    niceServant = await connector.servantListNiceWithLore();
    niceServant = niceServant.filter(
      servant =>
        servant.id != 2501500 && // filters out Aoko who becomes different servant after her NP
        (servant.type === EntityType.NORMAL ||
          servant.type === EntityType.HEROINE)
    );
    await cacheFile.write(niceServant);
    log.info(`Updated ${descriptor}`);
  } else {
    try {
      const data = await cacheFile.read();
      if (!Array.isArray(data)) throw new Error("");
      niceServant = data;
      log.debug(`Using cached ${descriptor}`);
    } catch (e) {
      log.error(`Could not retrieve ${descriptor}`);
      throw e;
    }
  }

  return niceServant;
}
