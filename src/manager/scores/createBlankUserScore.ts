import type { UserClassScore } from "./types";

export function createBlankUserScore(id: number) {
  const score: UserClassScore = {
    id,
    unlockedNodes: []
  };

  return score;
}
