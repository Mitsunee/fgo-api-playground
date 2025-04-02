import { parseArgs } from "util";
import { log, logger, createTimer } from "~/utils/logger";
import { parseNumericArg } from "~/utils/parseNumericArg";
import { parseTimerValue } from "./parseTimerValue";
import { RunList } from "./RunList";
import { join } from "path";
import { ScriptHistory } from "./ScriptHistory";

const timer = createTimer();
const globalOpts = {
  verbose: { type: "boolean", short: "v", default: false },
  help: { type: "boolean", short: "h", default: false },
  "show-all": { type: "boolean", short: "s", default: false }
} as const;
const argsInit = parseArgs({
  args: process.argv.slice(2),
  options: globalOpts,
  allowPositionals: true,
  strict: false,
  tokens: true
});
const usageText = `USAGE: pnpm ap-calc [--show-all] [--max <num>] [--node <num>] [--target <num>] <current-ap> [<current-timer>]`;

// TODO: update usage texts
function commandHelp() {
  console.log(usageText);
}

function commandCalculate() {
  const args = parseArgs({
    args: process.argv.slice(2),
    options: {
      ...globalOpts,
      max: { type: "string", short: "m", default: "144" },
      target: { type: "string", short: "t" },
      node: { type: "string", short: "n" }
    },
    allowPositionals: true
  });
  log.debug({ args });

  // parse args
  const apMax = parseNumericArg({
    value: args.values.max,
    name: "--max",
    min: 20,
    fallback: 144
  });
  const nodeCost = parseNumericArg({
    value: args.values.node,
    name: "--node",
    min: 1
  });
  const targetAP = parseNumericArg({
    value: args.values.target,
    name: "--target",
    min: 1
  });

  // parse positionals
  const apCurr = parseNumericArg({
    value: args.positionals[0],
    name: "current ap",
    min: 0
  });
  if (!apCurr) {
    throw new Error(
      `Could not parse value for current ap: '${args.positionals[0]}'`
    );
  }
  const timerSeconds = parseTimerValue(args.positionals[1]);
  const runs = new RunList(
    apCurr,
    timerSeconds,
    timer.start,
    args.values["show-all"]
  );
  log.debug({ apCurr, apMax, timerValue: args.positionals[1], timerSeconds });

  // handle node ap cost runs
  if (nodeCost) {
    let runCount = 0;
    for (let ap = nodeCost; ap <= apMax; ap += nodeCost) {
      runs.push(ap, `Run ${++runCount}`);
    }
  }

  // handle target and max AP
  if (targetAP) runs.push(targetAP, "Target");
  runs.push(apMax, "Max AP");

  // print table
  console.table(runs.toTable(), ["ap", "time", "in"]);
  return runs;
}

async function main() {
  // DEBUG
  if (argsInit.values.verbose) logger.setLogLevel("Debug");
  log.debug({ argsInit });

  if (argsInit.values.help || argsInit.positionals[0] == "help") {
    commandHelp();
    return;
  }

  // load history
  const historyLoc = join(import.meta.dirname, ".history");
  const history = await ScriptHistory.loadFromFile(
    historyLoc,
    !!argsInit.values["show-all"]
  );

  // TODO: here is where other commands would go :)

  // handle calculate command
  const newList = commandCalculate();
  history.push(newList);
  await history.updateFile();
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => {
    log.info(usageText);
    log.fatal(e);
  });
