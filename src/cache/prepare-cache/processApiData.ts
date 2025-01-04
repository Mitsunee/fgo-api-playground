import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { log } from "~/util/logger";
import { itemsCache, servantsCache, skillsCache } from "~/cache";
import { indexServantNames } from "./servantNames";
import { createItemProcessor } from "./processItemData";
import { createEnhancementProcessor } from "./processEnhancementStage";
import { createSkillProcessor } from "./processServantSkill";
import { createServantProcessor } from "./processServant";
import { processServantMashu } from "./processServantMashu";

export async function processApiData(
  niceServantJP: NiceServant[],
  niceServantEN: NiceServant[]
) {
  const servantNames = indexServantNames(niceServantJP, niceServantEN);
  const itemProcessor = createItemProcessor();
  const enhancementProcessor = createEnhancementProcessor(itemProcessor);
  const skillProcessor = createSkillProcessor();
  const servantsProcessor = createServantProcessor({
    servantNames,
    enhancementProcessor,
    skillProcessor
  });

  // process servant list
  for (const servantJP of niceServantJP) {
    const id = servantJP.id;
    const servantEN = niceServantEN.find(servant => servant.id == id);

    // Special case: Mash
    if (id == 800100) {
      if (!servantEN) throw new Error("Unexpected Eggplant Error");
      processServantMashu(servantJP, servantEN, servantsProcessor);
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
  // TODO: npList and costumeList just for logging purposes?
  log.info(`${itemsList.length} Items found`);
  log.info(`${servantsList.length} Servants found`);
  log.info(`${skillsList.length} Skills found`);

  await Promise.all([
    itemsCache.write(itemsList),
    servantsCache.write(servantsList),
    skillsCache.write(skillsList)
  ]);

  log.success("Wrote new data cache");
}
