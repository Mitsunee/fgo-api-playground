import type { QuestPhaseBasic } from "@atlasacademy/api-connector/dist/Schema/Quest";
import { log } from "~/util/logger";
import { CacheFile } from "..";
import { connectorEN, connectorJP } from "./connector";
import { sleep } from "~/util/sleep";

type FileKey = `${number}_${number}`;
type CacheKey = `${SupportedRegion}:${FileKey}`;
const cacheFiles = new Map<CacheKey, CacheFile<QuestPhaseBasic>>();

export async function getBasicQuestPhase(
  region: SupportedRegion,
  id: number,
  phase: number,
  update = false
) {
  const connector = region == "EN" ? connectorEN : connectorJP;
  const fileKey: FileKey = `${id}_${phase}`;
  const cacheKey: CacheKey = `${region}:${fileKey}`;
  const descriptor = `Quest Phase ${id}/${phase} for region ${region}`;
  let questPhase: QuestPhaseBasic;
  let cacheFile = cacheFiles.get(cacheKey);
  if (!cacheFile) {
    const filePath = `data/cache/${region}/quest_phase/${fileKey}.json`;
    cacheFile = new CacheFile(filePath);
    cacheFiles.set(cacheKey, cacheFile);
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
    questPhase = await connector.questPhaseBasic(id, phase);
    await Promise.all([cacheFile.write(questPhase), sleep()]);
    log.info(`Updated ${descriptor}`);
  } else {
    try {
      questPhase = await cacheFile.read();
      log.debug(`Using cached ${descriptor}`);
    } catch (e) {
      log.error(`Could not retrieve ${descriptor}`);
      throw e;
    }
  }

  return questPhase;
}
