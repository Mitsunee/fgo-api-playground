import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { connectorEN, connectorJP } from "./connector";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { log } from "~/util/logger";
import { EntityType } from "@atlasacademy/api-connector/dist/Schema/Entity";

export async function getNiceServant(region: SupportedRegion, update = false) {
  const connector = region == "EN" ? connectorEN : connectorJP;
  const filePath = `data/cache/${region}/nice_servant.json`;
  await mkdir(dirname(filePath), { recursive: true });

  let niceServant: ServantWithLore[];
  if (update) {
    log.debug(`Fetching nice_servant for region ${region}`);
    niceServant = await connector.servantListNiceWithLore();
    niceServant = niceServant.filter(
      servant =>
        servant.id != 2501500 || // filters out Aoko who becomes different servant after her NP
        servant.type === EntityType.NORMAL ||
        servant.type === EntityType.HEROINE
    );
    await writeFile(filePath, JSON.stringify(niceServant), "utf8");
    log.info(`Updated nice_servant for region ${region}`);
  } else {
    try {
      const file = await readFile(filePath, "utf8");
      const data = JSON.parse(file);
      if (!Array.isArray(data)) throw new Error("");
      niceServant = data;
      log.debug(`Using cached nice_servant for region ${region}`);
    } catch {
      throw new Error(
        `Could not retrieve nice_servant.json for region ${region}`
      );
    }
  }

  return niceServant;
}
