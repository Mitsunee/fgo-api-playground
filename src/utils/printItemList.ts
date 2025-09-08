import { itemsCache } from "~/cache";
import { listToMap } from "./listToMap";

export async function printItemList(matAmounts: Record<ID, number>, qp = 0) {
  const itemList = await itemsCache.read();
  const itemMap = listToMap(itemList);
  const qpPretty = qp.toLocaleString();
  let maxNameLen = 2;
  let maxNumLen = qpPretty.length;
  const rows = new Array<[string, string]>();
  const sortedAmounts = (Object.keys(matAmounts) as ID[])
    .map(id => [itemMap[id], matAmounts[id]] as const)
    .sort(([a], [b]) => a.priority - b.priority);

  for (const [item, amount] of sortedAmounts) {
    maxNameLen = Math.max(maxNameLen, item.name.length);
    const amountPretty = amount.toLocaleString();
    maxNumLen = Math.max(maxNumLen, amountPretty.length);
    rows.push([item.name, amountPretty]);
  }

  console.log(
    `┌${"─".repeat(maxNameLen + 2)}┬${"─".repeat(maxNumLen + 2)}┐\n${rows
      .map(
        ([item, amount]) =>
          `│ ${item.padStart(maxNameLen, " ")} │ ${amount.padEnd(maxNumLen, " ")} │\n`
      )
      .join(
        ""
      )}│ ${"QP".padStart(maxNameLen, " ")} │ ${qpPretty.padEnd(maxNumLen, " ")} │\n└${"─".repeat(maxNameLen + 2)}┴${"─".repeat(maxNumLen + 2)}┘\n`
  );
}
