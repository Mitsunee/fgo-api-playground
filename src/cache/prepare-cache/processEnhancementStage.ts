import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import type {
  EntityLevelUpMaterialProgression,
  EntityLevelUpMaterials
} from "@atlasacademy/api-connector/dist/Schema/Entity";
import type { ItemProcessor } from "./processItemData";
import { log } from "~/util/logger";

type ServantEnhancements = Pick<
  Servant,
  "skillMaterials" | "ascensionMaterials" | "appendSkillMaterials" | "costumes"
>;
export type EnhancementProcessor = ReturnType<
  typeof createEnhancementProcessor
>;

export function createEnhancementProcessor(itemProcessor: ItemProcessor) {
  const skippedItems = new Set<number>();

  function convertEnhancementStage(
    { items, qp }: EntityLevelUpMaterials,
    en: boolean
  ) {
    const stage: EnhancementStage = { items: [], qp };

    for (const itemAmount of items) {
      // skip event items
      if (skippedItems.has(itemAmount.item.id)) continue;
      if (itemAmount.item.type == "eventItem") {
        log.debug(`Skipping event item ${itemAmount.item.name}`);
        skippedItems.add(itemAmount.item.id);
        continue;
      }

      // add to stage
      stage.items.push([itemAmount.item.id, itemAmount.amount]);

      // if item not previously processed do that now and push it to list
      itemProcessor.registerItem(itemAmount.item, en);
    }

    return stage;
  }

  function convertEnhancementStages(
    materials: EntityLevelUpMaterialProgression,
    en: boolean
  ) {
    return Object.entries(materials)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(entry => convertEnhancementStage(entry[1], en));
  }

  function convertServantCostume(
    key: string,
    servantJP: NiceServant,
    servantEN?: NiceServant
  ) {
    const id = Number(key);
    const en = Boolean(servantEN?.profile.costume[key]);
    const materials = servantJP.costumeMaterials[key];
    const costume: ServantCostume = {
      id,
      name:
        servantEN?.profile.costume[key]?.name ||
        servantJP.profile.costume[key].name,
      owner: servantJP.id,
      unlock: convertEnhancementStage(materials, en)
    };
    return costume;
  }

  function convertServantCostumes(
    servantJP: NiceServant,
    servantEN?: NiceServant
  ) {
    return Object.keys(servantJP.costumeMaterials).map(key =>
      convertServantCostume(key, servantJP, servantEN)
    );
  }

  function handleEnhancements(servantJP: NiceServant, servantEN?: NiceServant) {
    const servant = servantEN || servantJP;
    const en = Boolean(servantEN);
    const enhancements: ServantEnhancements = {
      skillMaterials: convertEnhancementStages(servant.skillMaterials, en),
      ascensionMaterials: convertEnhancementStages(
        servant.ascensionMaterials,
        en
      ),
      appendSkillMaterials: convertEnhancementStages(
        servant.appendSkillMaterials,
        en
      ),
      costumes: convertServantCostumes(servantJP, servantEN)
    };

    return enhancements;
  }

  return { convert: handleEnhancements, getSkipped: () => skippedItems };
}
