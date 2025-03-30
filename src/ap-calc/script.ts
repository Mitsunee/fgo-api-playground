import spacetime from "spacetime";
import { parseArgs } from "util";
import { log, logger, createTimer } from "~/utils/logger";
import { parseNumericArg } from "~/utils/parseNumericArg";

const timer = createTimer();
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    max: { type: "string", short: "m", default: "144" },
    target: { type: "string", short: "t" },
    node: { type: "string", short: "n" }
  },
  allowPositionals: true
});
const usageText = `USAGE: pnpm ap-calc [--max <num>] [--node <num>] [--target <num>] <current-ap> [<current-timer>]`;

const timeDiffer = (() => {
  const now = spacetime.now().startOf("second");

  return function (deltaSeconds: number) {
    const then = now.add(deltaSeconds, "second");
    const { diff } = then.since(now);
    return {
      time: then.format("{time-24}:{second-pad}"),
      in: [diff.hours, diff.minutes, diff.seconds]
        .map(v => v.toString().padStart(2, "0"))
        .join(":")
    };
  };
})();

async function main() {
  // DEBUG
  if (args.values.verbose) logger.setLogLevel("Debug");
  log.debug(args);

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
  const timerValue = args.positionals[1] || "";
  let timerSeconds = 300;
  if (timerValue) {
    const match = timerValue.match(/^([0-4]):?([0-5][0-9])$/);
    if (!match) {
      throw new Error(`Could not parse value for current timer: ${timerValue}`);
    }

    timerSeconds = Number(match[1]) * 60 + Number(match[2]);
  }
  log.debug({ apCurr, apMax, timerValue, timerSeconds });

  const table = new Array<{
    ap: number;
    title: string;
    time: string;
    in: string;
  }>();

  if (nodeCost) {
    let runs = 0;
    for (let ap = nodeCost; ap <= apMax; ap += nodeCost) {
      const deltaAP = ap - apCurr;
      const deltaSeconds = (deltaAP - 1) * 300 + timerSeconds;
      table.push(
        Object.assign({ ap, title: `Run #${++runs}` }, timeDiffer(deltaSeconds))
      );
    }
  }

  if (targetAP) {
    const deltaTargetAP = targetAP - apCurr;
    const deltaTargetSeconds = (deltaTargetAP - 1) * 300 + timerSeconds;
    table.push(
      Object.assign(
        { ap: targetAP, title: "Target" },
        timeDiffer(deltaTargetSeconds)
      )
    );
  }

  // handle max AP
  const deltaMaxAP = apMax - apCurr;
  const deltaMaxSeconds = (deltaMaxAP - 1) * 300 + timerSeconds;
  table.push(
    Object.assign({ ap: apMax, title: "Max AP" }, timeDiffer(deltaMaxSeconds))
  );

  // print table
  console.table(
    table
      .filter(run => run.ap >= apCurr)
      .sort((a, b) => a.ap - b.ap)
      .reduce(
        (obj, { title, ...row }) => {
          obj[title] = row;
          return obj;
        },
        {} as Record<string, Omit<(typeof table)[0], "title">>
      ),
    ["ap", "time", "in"]
  );
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => {
    log.info(usageText);
    log.fatal(e);
  });
