import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { indexServantNames } from "./servantNames";
import { convertClassName } from "./classNames";
import { log } from "~/util/logger";
import { createItemProcessor } from "./processItemData";
import { createEnhancementProcessor } from "./processEnhancementStage";
import { createSkillProcessor } from "./processServantSkill";

const knownSpecialcases = new Set([800100, 304800, 2300600]);

// WIP
export async function processApiData(
  niceServantJP: NiceServant[],
  niceServantEN: NiceServant[]
) {
  const servantNames = indexServantNames(niceServantJP, niceServantEN);
  const servantsList = new Array<Servant>();
  const itemProcessor = createItemProcessor();
  const enhancementProcessor = createEnhancementProcessor(itemProcessor);
  const skillProcessor = createSkillProcessor();

  // process servant list
  for (const servantJP of niceServantJP) {
    const id = servantJP.id;

    // TEMP: special case testing
    if (knownSpecialcases.has(id)) {
      log.warn(
        `Temporarily skipping ${servantNames[servantJP.id].name} as they need hardcoded special cases`
      );
      continue;
    }

    const servantEN = niceServantEN.find(servant => servant.id == id);
    const enhancements = enhancementProcessor.convert(servantJP, servantEN);
    const skillIds = skillProcessor.handleSkills(servantJP, servantEN);

    const servant: Servant = {
      id,
      collectionNo: servantJP.collectionNo,
      ...servantNames[id],
      rarity: servantJP.rarity,
      cost: servantJP.cost,
      className: convertClassName(servantJP.className),
      gender: servantJP.gender,
      ...skillIds,
      noblePhantasms: [], // TODO: NPs
      ...enhancements
    };

    if (servantEN) servant.en = true;

    servantsList.push(servant);
  }

  // TODO: actually write these to files instead of returning
  return {
    itemsList: itemProcessor.getItemList(),
    servantsList,
    skillsList: skillProcessor.getSkillList()
  };
}
