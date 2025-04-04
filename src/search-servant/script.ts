import type { MatchData } from "fast-fuzzy";
import { Searcher } from "fast-fuzzy";
import { parseArgs } from "util";
import { servantsCache } from "~/cache";
import { describeServant } from "~/utils/describeServant";
import { col, log, logger, createTimer } from "~/utils/logger";

const timer = createTimer();
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    threshold: { type: "string", short: "t", default: "0.7" },
    collection: { type: "boolean", short: "c", default: false },
    original: { type: "boolean", default: true },
    alt: { type: "boolean", default: true }
  },
  allowPositionals: true,
  allowNegative: true
});

function prettyPrintMatch(match: MatchData<unknown>) {
  const text = match.original;
  const { index, length } = match.match;
  const end = index + length;
  const before = text.slice(0, index);
  const matched = text.slice(index, end);
  const after = text.substring(end);

  return `${before}${col.bold(col.redBright(matched))}${after}`;
}

async function main() {
  // DEBUG
  if (args.values.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  // handle treshold arg
  let threshold = 0.7;
  if (args.values.threshold) {
    const match = args.values.threshold.match(/^0\.\d+$|^[10]$/);
    if (!match) {
      log.warn(
        `Unrecognized threshold '${args.values.threshold}'. Value must be number from 0 to 1. Using default threshold of 0.7.`
      );
    } else {
      threshold = Number(match[0]);
    }
  }

  // create searcher
  const servantsList = await servantsCache.read();
  const searcher = new Searcher(servantsList, {
    keySelector: candidate =>
      args.values.alt
        ? [candidate.name].concat(candidate.names)
        : [candidate.name],
    returnMatchData: true,
    threshold
  });

  // handle queries
  for (const query of args.positionals) {
    const results = searcher.search(query);
    console.log(`Search for "${query}":`);
    if (results.length < 1) {
      console.log("  No results.\n");
      continue;
    }

    for (const result of results) {
      const pretty = prettyPrintMatch(result);
      const describedName = describeServant(result.item, {
        showId: !args.values.collection,
        showCollectionNo: args.values.collection,
        overrideName: pretty
      });
      const origName =
        !args.values.original || result.item.name == result.original
          ? ""
          : ` (original name: ${result.item.name})`;
      console.log(`  - ${describedName}${origName}`);
    }

    console.log(""); // empty line
  }
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e));
