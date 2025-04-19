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
    help: { type: "boolean", short: "h", default: false },
    collection: { type: "boolean", short: "c", default: false },
    unreleased: { type: "boolean", short: "u", default: true },
    released: { type: "boolean", short: "r", default: false }
  },
  allowNegative: true
});

const textHelp = `Welfares\n\nUsage:
  welfares [-vhcr] [--no-unreleased]\n\nOptions:
  -v,--verbose      Enable debug logging
  -h,--help         Print this help text and exit
  -c,--collection   Show Collection Number instead of internal ID
  -r,--released     Show released Welfare Servants (disabled by default)
  --no-released     Hide released Welfare Servants
  -u,--unreleased   Show unreleased Welfare Servants (enabled by default)
  --no-unreleased   Hide unreleased Welfare Servants`;

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  if (args.help) {
    console.log(textHelp);
    return;
  }

  const [niceServantJP, niceServantEN, servantsList] = await Promise.all([
    getNiceServant("JP", false),
    getNiceServant("EN", false),
    servantsCache.read()
  ]);
  const servantIdsEN = new Set(niceServantEN.map(s => s.id));
  const servantsMap = listToMap(servantsList);
  const welfares = niceServantJP
    .filter(niceServant => {
      // check ascension mats for event item
      if (
        niceServant.ascensionMaterials["1"]?.items[0]?.item.type != "eventItem"
      ) {
        return false;
      }

      // filter based on --unreleased and --released args
      const released = servantIdsEN.has(niceServant.id);
      if ((released && !args.released) || (!released && !args.unreleased)) {
        return false;
      }

      return true;
    })
    .reduce(
      (map, niceServant) => {
        const released = servantIdsEN.has(niceServant.id);

        if (released) {
          map.released.push(servantsMap[niceServant.id]);
        } else {
          map.unreleased.push(servantsMap[niceServant.id]);
        }

        return map;
      },
      { released: new Array<Servant>(), unreleased: new Array<Servant>() }
    );

  // sort by collectionNo
  welfares.released.sort((a, b) => a.collectionNo - b.collectionNo);
  welfares.unreleased.sort((a, b) => a.collectionNo - b.collectionNo);

  // print released welfares
  if (welfares.released.length) {
    console.log(`Released welfares:`);
    for (const servant of welfares.released) {
      const describedName = describeServant(servant, {
        showClass: true,
        showId: !args.collection,
        showCollectionNo: args.collection
      });
      console.log(` -  ${describedName}`);
    }

    // print empty line
    console.log("");
  }

  // print unreleased welfares
  if (welfares.unreleased.length) {
    console.log(`Unreleased welfares:`);
    for (const servant of welfares.unreleased) {
      const describedName = describeServant(servant, {
        showClass: true,
        showId: !args.collection,
        showCollectionNo: args.collection
      });
      console.log(` -  ${describedName}`);
    }

    // print empty line
    console.log("");
  }
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e));
