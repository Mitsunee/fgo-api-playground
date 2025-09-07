import { List } from "@foxkit/list";
import type { UserClassScore } from "./types";
import { log } from "~/utils/logger";

export function getScoreMats(scoreData: ClassScore, userScore: UserClassScore) {
  const unlocked = new Set(userScore.unlockedNodes);
  const matAmounts: Record<ID, number> = {};
  let qp = 0;

  const list = new List(
    scoreData.startNodes.map(id => scoreData.nodes[id]).reverse()
  );
  let node: ClassScoreNode | undefined;
  while ((node = list.pop())) {
    log.debug(`node ${node.id}`);
    if (!unlocked.has(node.id)) {
      log.debug("node is not unlocked yet");
      qp += node.qp;
      for (const [item, amount] of node.items) {
        matAmounts[item] ||= 0;
        matAmounts[item] += amount;
      }
    }
    for (const id of node.next) {
      list.push(scoreData.nodes[id]);
    }
  }

  return { matAmounts, qp };
}
