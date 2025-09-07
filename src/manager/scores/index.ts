import type { Interface } from "readline/promises";
import { scoresCache } from "~/cache";
import { describeServantClass } from "~/utils/describeServantClass";
import { chooseScore } from "./chooseScore";
import { loadUserScore } from "./loadUserScores";
import { createBlankUserScore } from "./createBlankUserScore";
import { log } from "~/utils/logger";
import { getScoreMats } from "./getScoreMats";
import { printItemList } from "~/utils/printItemList";

export async function scoresManager(rl: Interface) {
  const scoresList = await scoresCache.read();
  let current: undefined | number = undefined;

  while (true) {
    current ??= await chooseScore(scoresList, rl);
    if (current === undefined) return;
    const scoreData = scoresList[current];
    const userScoreFile = await loadUserScore(scoreData.id);
    const userScore = await userScoreFile.read();
    const totalNodes = Object.values(scoreData.nodes).length;
    console.log(
      `\n${scoreData.name}${
        scoreData.classes.length > 1
          ? ` (${scoreData.classes.map(className => describeServantClass(className)).join(", ")})`
          : ""
      }\n${userScore.unlockedNodes.length}/${totalNodes} completed`
    );

    const opt = await rl.question(
      `  [1] Unlock Nodes\n  [2] Check required Materials\n  [3] Reset Class Score\nChoice (1-3): `
    );
    switch (opt) {
      case "1":
        console.error("UNIMPLEMENTED");
        continue; // TEMP
      case "2": {
        const scoreMats = getScoreMats(scoreData, userScore);
        console.log(
          `Required Materials for ${scoreData.name} (${userScore.unlockedNodes.length}/${Object.keys(scoreData.nodes).length}):`
        );
        await printItemList(scoreMats.matAmounts, scoreMats.qp);
        continue;
      }
      case "3":
        log.debug(`writing blank score to ${userScoreFile.path}`);
        await userScoreFile.write(createBlankUserScore(scoreData.id));
        continue;
      default:
        current = undefined;
        continue;
    }
  }
}
