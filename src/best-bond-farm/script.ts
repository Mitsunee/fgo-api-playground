import { parseArgs } from "util";
import { freeQuestsCache, warsCache } from "~/cache";
import { listToMap } from "~/utils/listToMap";
import { log, logger, timer } from "~/utils/logger";

const getTime = timer();
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    top: { type: "string", short: "t", default: "5" }
  }
});

const evalFreeQuest = (() => {
  const cache = new Map<FreeQuest, number>();
  return function evalFreeQuest(freeQuest: FreeQuest) {
    const cached = cache.get(freeQuest);
    if (cached) return cached;

    // BUG: Atlas API seems to be giving the incorrect value for freeQuest.bond
    const res = freeQuest.bond / freeQuest.apCost;
    cache.set(freeQuest, res);
    return res;
  };
})();

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  // parse arg
  let bestN = args.top ? parseInt(args.top) : 5;
  if (isNaN(bestN) || bestN < 1) {
    log.error(
      `Could not parse argument for --top '${args.top}'. Argument must integer > 0`
    );
    log.warn("Using '5' as fallback value for --top");
    bestN = 5;
  }

  // get data
  const [freeQuestList, warsList] = await Promise.all([
    freeQuestsCache.read(),
    warsCache.read()
  ]);
  const warsMap = listToMap(warsList);

  // sort
  const sortedList = freeQuestList.toSorted((a, b) => {
    return evalFreeQuest(b) - evalFreeQuest(a);
  });

  // TEMP
  console.table(
    sortedList.slice(0, bestN).map(fq => ({
      id: fq.id,
      eval: Math.round(evalFreeQuest(fq)),
      name: fq.name,
      war: warsMap[fq.war].longName
    }))
  );
}

main()
  .then(() => log.success(`Completed in ${getTime()}`))
  .catch(e => log.fatal(e));
