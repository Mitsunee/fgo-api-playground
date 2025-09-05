import type { Interface } from "readline/promises";

/**
 * User-choice menu for picking Class/Grand Score
 * @param scoresList read cachefile
 * @param rl Readline Interface
 * @returns idx in scoresList
 */
export async function chooseScore(scoresList: ClassScore[], rl: Interface) {
  const n = scoresList.length.toString().length;
  const choice = await rl.question(
    `Pick Class Score:\n${scoresList
      .map(
        (score, idx) =>
          `  ${" ".repeat(n - (idx + 1).toString().length)}[${idx + 1}] ${score.name}${
            score.en ? "" : " (JP only)"
          }\n`
      )
      .join("")}\nChoice (1-${scoresList.length}): `
  );

  // parse input
  const choiceParsed = parseInt(choice) - 1;
  if (
    isNaN(choiceParsed) ||
    choiceParsed < 0 ||
    choiceParsed >= scoresList.length
  ) {
    return;
  }

  return choiceParsed;
}
