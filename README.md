# fgo-api-playground

This repository is my personal playground for doing stuff with the [FGO Game Data API](https://api.atlasacademy.io/docs) provided by [Atlas Academy](https://atlasacademy.io/)

<p align="center"><img src="./.github/banner.jpeg" width="640" height="320" alt="Fate/Grand Order"></p>

## Usage

This repository is inded to be used with Node.js v22 and pnpm 9.x

```
pnpm install
pnpm prepare-cache
```

## Scripts

### Servant Search

```
pnpm search-servant [-c,--collection] [-t,--threshold] ...queries
```

Script to easily search for Servants by name.

- `-t`/`--threshold`: fuzzy search threshold (number from 0 to 1)
- `-c`/`--collection`: display collection number instead of id
- `--no-original`: hide the original name for search results of alternative names
- `--no-alt`: do not consider alternative names in searches

### Welfare Servant Search

```
pnpm tsx src/welfares/script.ts
```

Script that lists event welfare Servants that have not yet been released on the EN server.

See `-h` or `--help` for manual page.

### AP Calc

```
pnpm ap-calc [-vsh]
```

Simple AP Calculator that calculates time to Max AP and targets based on node cost or target AP. Output is given as a table with time (24h notation) and delta until that point.

See `-h` or `--help` for manual page.

## Cache

Instead of constantly redownloading the same data the `pnpm prepare-cache` script downloads all needed data for servants and items at once and stores it in `./data/cache`. Data is transformed to match the data structures descriped in [`./src/types`](./src/types), which avoids duplicates and removes attributes that are not used in any scripts.

```
data
├── freeQuestList.json (transformed free quest data)
├── itemsList.json (transformed item data)
├── servantsList.json (transformed servant data)
├── skillsList.json (transformed skill data)
├── warsList.json (transformed war data)
└── cache
   ├── info.json (information cache export age and last check date)
   ├── EN
   |  ├── nice_servant.json (niceServant (with lore) export)
   |  ├── nice_war.json (niceWar export)
   |  └── questPhase
   |      └── {id}_{phase}.json (basic quest phase cache)
   └── JP
      ├── nice_servant.json (niceServant (with lore) export)
      ├── nice_war.json (niceWar export)
      └── questPhase
          └── {id}_{phase}.json (basic quest phase cache)
```

Data should always be retrieved with the provided utilities in [`./src/cache`](./src/cache/index.ts)

### Flags

`prepare-cache` takes the following flags:

- `--verbose`, `-v`: Show debug output
- `--force-check`, `-f`: Force checking API for updated exports
- `--reprocess`, `-r`: Don't check API and reprocess cached exports (disables `-f`!)
- `--update-quests`,`-q`: Redownload all Quest Phases, even if cached files exist
