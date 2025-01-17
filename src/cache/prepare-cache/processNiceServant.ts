import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { log } from "~/utils/logger";
import { itemsCache, servantsCache, skillsCache } from "~/cache";
import { indexServantNames } from "./servantNames";
import { createItemProcessor } from "./processItemData";
import { createEnhancementProcessor } from "./processEnhancementStage";
import { createSkillProcessor } from "./processServantSkill";
import { createServantProcessor } from "./processServant";
import { processServantMashu } from "./processServantMashu";
import { createNPsProcessor } from "./processNoblePhantasm";

export async function processNiceServant(
  niceServantJP: NiceServant[],
  niceServantEN: NiceServant[]
) {
  const servantNames = indexServantNames(niceServantJP, niceServantEN);
  const itemProcessor = createItemProcessor();
  const enhancementProcessor = createEnhancementProcessor(itemProcessor);
  const skillProcessor = createSkillProcessor();
  const npsProcessor = createNPsProcessor();
  const servantsProcessor = createServantProcessor({
    enhancementProcessor,
    skillProcessor,
    npsProcessor,
    servantNames
  });

  // process servant list
  for (const servantJP of niceServantJP) {
    const id = servantJP.id;
    const servantEN = niceServantEN.find(servant => servant.id == id);

    // Special case: Mash
    if (id == 800100) {
      if (!servantEN) throw new Error("Unexpected Eggplant Error");
      processServantMashu(
        servantJP,
        servantEN,
        servantsProcessor,
        servantNames
      );
      continue;
    }
    if (id == 800150) {
      throw new Error("Unexpected Eggplant id override");
    }

    servantsProcessor.processServant(servantJP, servantEN);
  }

  const itemsList = itemProcessor.getItemList();
  const servantsList = servantsProcessor.getServantsList();
  const skillsList = skillProcessor.getSkillList();
  const npsList = npsProcessor.getNPsList();
  const costumesList = enhancementProcessor.getCostumesList();
  log.info(`${itemsList.length} Items found`);
  log.info(`${servantsList.length} Servants found`);
  log.info(`${skillsList.length} Skills found`);
  log.info(`${npsList.length} NPs found`);
  log.info(`${costumesList.length} Costumes found`);

  await Promise.all([
    itemsCache.write(itemsList),
    servantsCache.write(servantsList),
    skillsCache.write(skillsList)
  ]);
}
