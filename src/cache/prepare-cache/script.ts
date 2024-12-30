import { parseArgs } from "util";
import { log, logger, timer } from "~/util/logger";
import { getCacheInfo, writeCacheInfo } from "../getCacheInfo";
import { CACHE_VER } from "../types";
import { getRemoteCacheInfo } from "./getRemoteCacheInfo";
import { getNiceServant } from "./getNiceServant";
import { processApiData } from "./processApiData";

const getTime = timer();
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    /**
     * Force checking API info
     */
    "force-check": { type: "boolean", short: "f", default: false },
    /**
     * Reprocess data even if no updated data is available on either region,
     * implies force-check is true
     */
    reprocess: { type: "boolean", short: "r", default: false }
  }
});

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  // get cache info
  const now = Date.now();
  const localInfo = await getCacheInfo();

  // check whether we've updated within the past hour already
  const checkAfter = localInfo.lastChecked + 3_600_000;
  const checkForced =
    args["force-check"] || args.reprocess || CACHE_VER > localInfo.cacheVer;
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
  if (noUpdate && !args.reprocess) {
    log.info("Cache is up-to-date");
    return;
  }

  // fetch data
  if (!noUpdate) log.info(`Updating cache`);
  const [niceServantJP, niceServantEN] = await Promise.all([
    getNiceServant("JP", updateJP),
    getNiceServant("EN", updateEN)
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
  await processApiData(niceServantJP, niceServantEN);
}

main()
  .then(() => log.success(`Completed in ${getTime()}`))
  .catch(e => log.fatal(e));
