import { parseArgs } from "util";
import { log, logger, createTimer } from "~/utils/logger";
import { parseNumericArg } from "~/utils/parseNumericArg";
import { parseTimerValue } from "./parseTimerValue";
import { RunList } from "./RunList";
import { join } from "path";
import { ScriptHistory } from "./ScriptHistory";
import { commandHelp } from "./commandHelp";

const MAX_AP = 148;

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
  strict: false
});

function commandHistory(history: ScriptHistory) {
  const args = parseArgs({
    args: process.argv.slice(2),
    options: globalOpts,
    allowPositionals: true
  });
  log.debug({ args });

  let idx: number | undefined = undefined;
  if (args.positionals[0] == "prev" || args.positionals[1] == "prev") {
    idx = 1;
  } else {
    idx = parseNumericArg({
      value: args.positionals[1],
      name: "index",
      min: 1,
      max: history.length
    });
  }

  if (!idx) {
    throw new Error(
      `Could not parse positional parameters: '${args.positionals.slice(0, 2).join(" ")}'`
    );
  }

  const runs = history.getRunList(idx - 1);
  console.table(runs.toTable(), ["ap", "time"]);
}

function commandCalculate() {
  const args = parseArgs({
    args: process.argv.slice(2),
    options: {
      ...globalOpts,
      max: { type: "string", short: "m", default: MAX_AP.toString() },
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
    fallback: MAX_AP
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
  if (typeof apCurr != "number") {
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
  const firstPositional = argsInit.positionals[0] as string | undefined;
  log.debug({ argsInit, firstPositional });

  // handle help command
  if (argsInit.values.help || firstPositional == "help") {
    commandHelp(argsInit.positionals, MAX_AP);
    return;
  }

  // load history
  const historyLoc = join(import.meta.dirname, ".history");
  const history = await ScriptHistory.loadFromFile(
    historyLoc,
    !!argsInit.values["show-all"]
  );

  // handle history command
  if (firstPositional == "history" || firstPositional == "prev") {
    commandHistory(history);
    return;
  }

  // handle calculate command
  const newList = commandCalculate();
  history.push(newList);
  await history.updateFile();
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => {
    log.fatal(e);
  });
