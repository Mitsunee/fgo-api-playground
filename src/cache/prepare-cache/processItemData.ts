import type { Item as NiceItem } from "@atlasacademy/api-connector/dist/Schema/Item";

export type ItemProcessor = ReturnType<typeof createItemProcessor>;

function convertItemRarity(item: NiceItem): Item["rarity"] {
  switch (item.background) {
    case "bronze":
    case "silver":
    case "gold":
      return item.background;
    default:
      throw new Error(
        `Item '${item.name}' (${item.id}) has unaccepted background type ${item.background}`
      );
  }
}

function convertItem(niceItem: NiceItem) {
  const item: Item = {
    id: niceItem.id,
    name: niceItem.name,
    rarity: convertItemRarity(niceItem),
    priority: niceItem.priority
  };

  return item;
}

export function createItemProcessor() {
  const itemsMap: Record<ID, Item> = {};

  function getItemList() {
    return Object.values(itemsMap).sort((a, b) => a.priority - b.priority);
  }

  function registerItem(niceItem: NiceItem, en: boolean) {
    itemsMap[niceItem.id] ||= convertItem(niceItem);
    if (en) itemsMap[niceItem.id].en = true;
  }

  return { getItemList, registerItem };
}
