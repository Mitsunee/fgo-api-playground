import type { Interface } from "readline/promises";
import { scoresCache } from "~/cache";
import { describeServantClass } from "~/utils/describeServantClass";
import { chooseScore } from "./chooseScore";
import { loadUserScore } from "./loadUserScores";
import { createBlankUserScore } from "./createBlankUserScore";

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
      case "2":
        console.error("UNIMPLEMENTED");
        continue; // TEMP
      case "3":
        await userScoreFile.write(createBlankUserScore(scoreData.id));
        continue;
      default:
        current = undefined;
        continue;
    }
  }
}
