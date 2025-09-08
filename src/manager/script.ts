import { parseArgs } from "util";
import { createInterface } from "readline/promises";
import { log, logger, createTimer } from "~/utils/logger";

const timer = createTimer();
const rl = createInterface({ input: process.stdin, output: process.stdout });
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false }
  }
});

async function main() {
  // DEBUG
  if (args.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  // TEMP: immediatly load scoresManager, while nothing else is implemented
  const { scoresManager } = await import("./scores");
  const res = await scoresManager(rl);
  log.debug(res);
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e))
  .finally(() => rl.close());
