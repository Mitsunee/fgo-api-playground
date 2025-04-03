import { parseArgs } from "util";
import { servantsCache } from "~/cache";
import { getNiceServant } from "~/cache/prepare-cache/getNiceServant";
import { describeServant } from "~/utils/describeServant";
import { listToMap } from "~/utils/listToMap";
import { log, logger, createTimer } from "~/utils/logger";

const timer = createTimer();
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    collection: { type: "boolean", short: "c", default: false }
  }
});

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  const [niceServantJP, niceServantEN, servantsList] = await Promise.all([
    getNiceServant("JP", false),
    getNiceServant("EN", false),
    servantsCache.read()
  ]);
  const servantIdsEN = new Set(niceServantEN.map(s => s.id));
  const servantsMap = listToMap(servantsList);

  for (const niceServant of niceServantJP) {
    if (servantIdsEN.has(niceServant.id)) continue;
    if (
      niceServant.ascensionMaterials["1"]?.items[0]?.item.type == "eventItem"
    ) {
      const servant = servantsMap[niceServant.id];
      const describedName = describeServant(servant, {
        showClass: true,
        showId: !args.collection,
        showCollectionNo: args.collection
      });
      console.log(` -  ${describedName}`);
    }
  }
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e));
