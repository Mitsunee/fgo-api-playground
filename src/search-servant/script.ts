import { parseArgs } from "util";
import { describeServant } from "~/utils/describeServant";
import { log, logger, createTimer } from "~/utils/logger";
import {
  createServantSearcher,
  prettyPrintMatch
} from "~/utils/ServantSearcher";

const timer = createTimer();
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    help: { type: "boolean", short: "h", default: false },
    threshold: { type: "string", short: "t", default: "0.7" },
    collection: { type: "boolean", short: "c", default: false },
    original: { type: "boolean", default: true },
    alt: { type: "boolean", default: true }
  },
  allowPositionals: true,
  allowNegative: true
});

const textHelp = `Search Servant\n\nUsage:
  search-servant [-vc] [-t <float>] [--no-original] [--no-alt] <...queries>\n\nOptions:
  -v,--verbose      Enable debug logging
  -h,--help         Print this help text and exit
  -t,--threshold    Modify search threshold (float between 0 and 1)
  -c,--collection   Show Collection Number instead of internal ID
  --original        Show original name (enabled by default)
  --no-original     Hide original name
  --alt             Search alternative Names (enabled by default)
  --no-alt          Do not search alternative Names`;

async function main() {
  // DEBUG
  if (args.values.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  if (args.values.help) {
    console.log(textHelp);
    return;
  }

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
  const searcher = await createServantSearcher(args.values.alt, threshold);

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
