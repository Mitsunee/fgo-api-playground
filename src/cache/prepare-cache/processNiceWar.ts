import type { War as NiceWar } from "@atlasacademy/api-connector/dist/Schema/War";
import { WarFlag } from "@atlasacademy/api-connector/dist/Schema/War";
import { log } from "~/utils/logger";
import { freeQuestsCache, warsCache } from "..";
import { getBasicQuestPhase } from "./getBasicQuestPhase";

// WIP
export async function processNiceWar(
  niceWarJP: NiceWar[],
  niceWarEN: NiceWar[],
  updateJP = false,
  updateEN = false
) {
  const freeQuestList = new Array<FreeQuest>();
  const warsList = new Array<War>();

  for (const warJP of niceWarJP) {
    const warEN = niceWarEN.find(war => war.id == warJP.id);
    const questIds = Array<number>();

    // skip non-main-scenario wars and ordeal call
    if (!warJP.flags.includes(WarFlag.MAIN_SCENARIO) || warJP.id == 401) {
      continue;
    }

    for (const spotJP of warJP.spots) {
      const spotEN = warEN?.spots.find(spot => spot.id == spotJP.id);
      for (const questJP of spotJP.quests) {
        // skip everything but repeatable free quests
        if (
          questJP.type != "free" ||
          questJP.afterClear != "repeatLast" ||
          questJP.consumeType != "ap"
        ) {
          continue;
        }

        const questEN = spotEN?.quests.find(quest => quest.id == questJP.id);
        const region = questEN ? "EN" : "JP";
        const phase = await getBasicQuestPhase(
          region,
          questJP.id,
          questJP.phases.length,
          region == "JP" ? updateJP : updateEN
        );

        const freeQuest: FreeQuest = {
          id: questJP.id,
          name: questEN?.name || questJP.name,
          war: warJP.id,
          apCost: phase.consume,
          bond: phase.bond
        };

        if (questEN) freeQuest.en = true;

        freeQuestList.push(freeQuest);
        questIds.push(questJP.id);
      }
    }

    if (questIds.length < 1) continue;

    const war: War = {
      id: warJP.id,
      name: warEN?.name || warJP.name,
      longName: warEN?.longName || warJP.longName,
      quests: questIds
    };

    if (warEN) war.en = true;

    warsList.push(war);
  }

  log.info(`${freeQuestList.length} Free Quests found`);
  log.info(`${warsList.length} Wars found (with quests saved)`);
  await Promise.all([
    freeQuestsCache.write(freeQuestList),
    warsCache.write(warsList)
  ]);
}
