import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import type { EnhancementProcessor } from "./processEnhancementStage";
import type { SkillProcessor } from "./processServantSkill";
import type { ServantNameIndex } from "./servantNames";
import { convertNoblePhantasms } from "./processNoblePhantasm";
import { convertClassName } from "./classNames";

export type ServantProcessor = ReturnType<typeof createServantProcessor>;
interface ServantProcessorDependencies {
  enhancementProcessor: EnhancementProcessor;
  skillProcessor: SkillProcessor;
  servantNames: ServantNameIndex;
}

export function createServantProcessor({
  enhancementProcessor,
  skillProcessor,
  servantNames
}: ServantProcessorDependencies) {
  const servantsList = new Array<Servant>();

  function processServant(servantJP: NiceServant, servantEN?: NiceServant) {
    const id = servantJP.id;
    const enhancements = enhancementProcessor.convert(servantJP, servantEN);
    const skillIds = skillProcessor.handleSkills(servantJP, servantEN);
    const noblePhantasms = convertNoblePhantasms(servantJP, servantEN);

    const servant: Servant = {
      id,
      collectionNo: servantJP.collectionNo,
      ...servantNames[id],
      rarity: servantJP.rarity,
      cost: servantJP.cost,
      className: convertClassName(servantJP.className),
      gender: servantJP.gender,
      ...skillIds,
      noblePhantasms,
      ...enhancements
    };

    if (servantEN) servant.en = true;

    servantsList.push(servant);
    return servant;
  }

  function getServantsList() {
    return servantsList.toSorted((a, b) => a.id - b.id);
  }

  return { getServantsList, processServant };
}
