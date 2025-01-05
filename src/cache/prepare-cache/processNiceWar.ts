import type { War as NiceWar } from "@atlasacademy/api-connector/dist/Schema/War";
import { WarFlag } from "@atlasacademy/api-connector/dist/Schema/War";
import { getBasicQuestPhase } from "./getBasicQuestPhase";
import { log } from "~/util/logger";
import { freeQuestsCache } from "..";

// WIP
export async function processNiceWar(
  niceWarJP: NiceWar[],
  niceWarEN: NiceWar[],
  updateJP = false,
  updateEN = false
) {
  // TODO: also keep a warsList so quests can map to that
  // TODO: I forgot AP cost, which is part of the entire point of this lol
  const freeQuestList = new Array<FreeQuest>();

  for (const warJP of niceWarJP) {
    const warEN = niceWarEN.find(war => war.id == warJP.id);

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
          war: warEN && region == "EN" ? warEN.name : warJP.name,
          bond: phase.bond
        };

        if (questEN) freeQuest.en = true;

        freeQuestList.push(freeQuest);
      }
    }
  }

  log.info(`${freeQuestList.length} Free Quests found`);
  await freeQuestsCache.write(freeQuestList);
}
