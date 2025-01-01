import type {
  EntityLevelUpMaterialProgression,
  EntityLevelUpMaterials
} from "@atlasacademy/api-connector/dist/Schema/Entity";
import type { ItemProcessor } from "./processItemData";
import { log } from "~/util/logger";

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

  return {
    stage: convertEnhancementStage,
    stages: convertEnhancementStages
  };
}
