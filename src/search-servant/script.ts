import type { MatchData } from "fast-fuzzy";
import { Searcher } from "fast-fuzzy";
import { parseArgs } from "util";
import { servantsCache } from "~/cache";
import { col, log, logger, timer } from "~/util/logger";

const getTime = timer();
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    threshold: { type: "string", short: "t", default: "0.7" },
    collection: { type: "boolean", short: "c", default: false }
  },
  allowPositionals: true
});

function prettyPrintMatch(match: MatchData<unknown>) {
  const text = match.original;
  const { index, length } = match.match;
  const end = index + length;
  const before = text.slice(0, index);
  const matched = text.slice(index, end);
  const after = text.substring(end);

  return `${before}${col.bold(matched)}${after}`;
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
    keySelector: candidate => [candidate.name].concat(candidate.names),
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
      const num = args.values.collection
        ? result.item.collectionNo
        : result.item.id;
      console.log(`  - [${num}] ${pretty}`);
    }

    console.log(""); // empty line
  }
}

main()
  .then(() => log.success(`Completed in ${getTime()}`))
  .catch(e => log.fatal(e));
