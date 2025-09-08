import type { Interface } from "readline/promises";
import type { UserClassScore } from "./types";
import { List } from "@foxkit/list";
import { printItemList } from "~/utils/printItemList";
import { log } from "~/utils/logger";

export async function unlockScoreNodes(
  scoreData: ClassScore,
  userScore: UserClassScore,
  rl: Interface
) {
  const list = new List(
    scoreData.startNodes.map(id => scoreData.nodes[id]).reverse()
  );
  let current: ClassScoreNode | undefined;

  while ((current = list.pop())) {
    // if already unlocked push next nodes to list
    if (userScore.unlockedNodes.includes(current.id)) {
      log.debug(`Node ${current.id} already unlocked`);
      for (const id of current.next) {
        list.push(scoreData.nodes[id]);
      }
      continue;
    }

    // Present node
    console.log(`${scoreData.name} [${current.id}]`);
    if (current.detail) console.log(`${current.detail}`);
    await printItemList(Object.fromEntries(current.items), current.qp);

    // Ask whether to unlock, continue if no
    const choice = (await rl.question("Unlock node? [Yn]: ")).toLowerCase();
    if (choice == "n") {
      log.debug(`Node ${current.id} stayed locked`);
      continue;
    }
    userScore.unlockedNodes.push(current.id);
    log.debug(`Node ${current.id} now unlocked`);

    // push next nodes after newly unlocked node
    for (const id of current.next) {
      list.push(scoreData.nodes[id]);
    }
  }
}
