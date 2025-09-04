import { parseArgs } from "util";
import { log, logger, createTimer } from "~/utils/logger";
import { getCacheInfo, writeCacheInfo } from "../getCacheInfo";
import { CACHE_VER } from "../types";
import { getRemoteCacheInfo } from "./getRemoteCacheInfo";
import { getNiceServant } from "./getNiceServant";
import { processNiceServant } from "./processNiceServant";
import { getNiceWar } from "./getNiceWar";
import { processNiceWar } from "./processNiceWar";
import { getNiceClassScore } from "./getNiceClassScore";

const timer = createTimer();
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    /**
     * Force checking API info
     */
    "force-check": { type: "boolean", short: "f", default: false },
    /**
     * Reprocess data without checking for updates
     */
    reprocess: { type: "boolean", short: "r", default: false },
    /**
     * Redownload all Quest Phases, even if cached files exist
     */
    "update-quests": { type: "boolean", short: "q", default: false }
  }
});

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  // get cache info
  const now = Date.now();
  const localInfo = await getCacheInfo();

  // check whether we are reprocessing cached data only
  if (args.reprocess) {
    log.info("Skipping cache update check and reprocessing cached data");
    const [niceServantJP, niceServantEN] = await Promise.all([
      getNiceServant("JP"),
      getNiceServant("EN")
    ]);
    const [niceWarJP, niceWarEN] = await Promise.all([
      getNiceWar("JP"),
      getNiceWar("EN")
    ]);
    const [niceScoreJP, niceScoreEN] = await Promise.all([
      getNiceClassScore("JP"),
      getNiceClassScore("EN")
    ]);

    // perform data update
    await Promise.all([
      processNiceServant(
        niceServantJP,
        niceServantEN,
        niceScoreJP,
        niceScoreEN
      ),
      processNiceWar(niceWarJP, niceWarEN)
    ]);
    log.success("Wrote new data cache");

    return;
  }

  // check whether we've updated within the past hour already
  const checkAfter = localInfo.lastChecked + 3_600_000;
  const checkForced = args["force-check"] || CACHE_VER > localInfo.cacheVer;
  log.debug({ localInfo, now, checkAfter, checkForced });
  if (!checkForced && now < checkAfter) {
    log.info("Cache update check skipped. Use --force-check to check now");
    return;
  }

  // fetch remote info
  const remoteInfo = await getRemoteCacheInfo();
  const updateJP = localInfo.JP < remoteInfo.JP;
  const updateEN = localInfo.EN < remoteInfo.EN;
  const noUpdate = !updateJP && !updateEN;
  if (noUpdate) {
    log.info("Cache is up-to-date");
    return;
  }

  // fetch data
  if (!noUpdate) log.info(`Updating cache`);
  const [niceServantJP, niceServantEN] = await Promise.all([
    getNiceServant("JP", updateJP),
    getNiceServant("EN", updateEN)
  ]);
  const [niceWarJP, niceWarEN] = await Promise.all([
    getNiceWar("JP", updateJP),
    getNiceWar("EN", updateEN)
  ]);
  const [niceScoreJP, niceScoreEN] = await Promise.all([
    getNiceClassScore("JP"),
    getNiceClassScore("EN")
  ]);

  if (!noUpdate) {
    // update local info
    log.debug(`Updating local cache info`);
    await writeCacheInfo({
      JP: remoteInfo.JP,
      EN: remoteInfo.EN,
      lastChecked: now,
      cacheVer: CACHE_VER
    });
  }

  // perform data update
  await Promise.all([
    processNiceServant(niceServantJP, niceServantEN, niceScoreJP, niceScoreEN),
    processNiceWar(
      niceWarJP,
      niceWarEN,
      updateJP,
      updateEN,
      args["update-quests"]
    )
  ]);
  log.success("Wrote new data cache");
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e));
