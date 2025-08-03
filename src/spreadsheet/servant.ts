import { stdin, stdout } from "process";
import { createInterface } from "readline/promises";
import { parseArgs } from "util";
import type { MatchData } from "fast-fuzzy";
import { servantsCache } from "~/cache";
import { log, logger, createTimer, col } from "~/utils/logger";
import {
  createServantSearcher,
  prettyPrintMatch
} from "~/utils/ServantSearcher";
import { describeServantClass } from "~/utils/describeServantClass";

const timer = createTimer();
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    verbose: { type: "boolean", short: "v", default: false }
  },
  allowPositionals: true
});
const rl = createInterface({ input: stdin, output: stdout });

async function proposeOption(
  candidate: Servant,
  matchData?: MatchData<Servant>
) {
  const input = await rl.question(
    `Found Servant '${matchData ? prettyPrintMatch(matchData) : candidate.name}'. Add to list? [Y/n]:`
  );
  if (input.toLowerCase() == "n") return false;

  // Name Picker
  const nameIdx = Number(
    await rl.question(
      `Pick Name:\n  [0] ${candidate.name} (default)\n${candidate.names
        .map((name, idx) => `  [${idx + 1}] ${name}\n`)
        .join("")}  [${
        candidate.names.length + 1
      }] ${col.italic("New Name")}\n\nSelect Option [0-${
        candidate.names.length + 1
      }]: `
    )
  );

  // pre-defined name
  if (isNaN(nameIdx) || nameIdx == 0) return candidate.name;
  if (candidate.names.length >= nameIdx) return candidate.names[nameIdx - 1];

  // custom name
  const customName = await rl.question(
    `Enter new Name (leave empty to use default name): `
  );
  return customName || candidate.name;
}

async function main() {
  // DEBUG
  if (args.values.verbose) logger.setLogLevel("Debug");
  log.debug(args);

  const servants = new Array<[Servant, string]>();
  const [searcher, servantsList] = await Promise.all([
    createServantSearcher(),
    servantsCache.read()
  ]);
  for (const value of args.positionals) {
    // handle adding by ID
    const id = Number(value);
    if (!isNaN(id)) {
      const candidate = servantsList.find(
        servant => servant.id == id || servant.collectionNo == id
      );
      if (!candidate) {
        log.warn(`Found no Servant for id '${id}'`);
        continue;
      }
      const proposal = await proposeOption(candidate);
      if (proposal) servants.push([candidate, proposal]);
      continue;
    }

    // handle adding by name search
    const candidates = searcher.search(value);
    if (candidates.length < 1) {
      log.warn(`Found no Servant for search '${value}'`);
      continue;
    }
    for (const match of candidates) {
      const proposal = await proposeOption(match.item, match);
      if (proposal) servants.push([match.item, proposal]);
    }
  }

  // generate table rows
  console.log(""); // just put an empty line to make copying easier
  servants.sort((a, b) => a[0].id - b[0].id);
  for (const [servant, servantName] of servants) {
    // ID and Name
    stdout.write(`${servant.collectionNo}\t${servantName}\t`);
    // icon
    stdout.write(
      `=IMAGE("https://static.atlasacademy.io/JP/Faces/f_${servant.id}3.png")\t`
    );
    // bond CE
    if (servant.bondCE) {
      stdout.write(
        `=IMAGE("https://static.atlasacademy.io/JP/Faces/f_${servant.bondCE}0.png")\t`
      );
      stdout.write(
        `=IMAGE("https://static.atlasacademy.io/JP/EquipFaces/f_${servant.bondCE}0.png")\t`
      );
    } else {
      stdout.write(`N/A\tN/A\t`);
    }
    // rarity, cost, class
    stdout.write(
      `${servant.rarity}\t${servant.cost}\t${describeServantClass(servant.className)}\n`
    );
  }
  console.log(""); // just put an empty line to make copying easier
}

main()
  .then(() => log.success(`Completed in ${timer()}`))
  .catch(e => log.fatal(e))
  .finally(() => rl.close());
