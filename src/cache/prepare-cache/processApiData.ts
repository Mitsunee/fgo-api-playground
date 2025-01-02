import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { log } from "~/util/logger";
import { indexServantNames } from "./servantNames";
import { createItemProcessor } from "./processItemData";
import { createEnhancementProcessor } from "./processEnhancementStage";
import { createSkillProcessor } from "./processServantSkill";
import { createServantProcessor } from "./processServant";

const filteredSpecialcases = new Set([800100]);

// WIP
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

    // TEMP: ignore unhandled special cases
    if (filteredSpecialcases.has(id)) {
      log.warn(
        `Temporarily skipping ${servantNames[servantJP.id].name} as they need hardcoded special cases`
      );
      continue;
    }

    const servantEN = niceServantEN.find(servant => servant.id == id);
    servantsProcessor.processServant(servantJP, servantEN);
  }

  // TODO: actually write these to files instead of returning
  return {
    itemsList: itemProcessor.getItemList(),
    servantsList: servantsProcessor.getServantsList(),
    skillsList: skillProcessor.getSkillList()
  };
}
