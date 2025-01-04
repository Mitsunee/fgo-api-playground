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

none yet :)

## Cache

Instead of constantly redownloading the same data the `pnpm prepare-cache` script downloads all needed data for servants and items at once and stores it in `./data/cache`. Data is transformed to match the data structures descriped in [`./src/types`](./src/types), which avoids duplicates and removes attributes that are not used in any scripts.

```
data
├── itemsList.json (transformed item data)
├── servantsList.json (transformed servant data)
├── skillsList.json (transformed skill data)
└── cache
   ├── info.json (information cache export age and last check date)
   ├── EN
   |  └── nice_servant.json (niceServant (with lore) export)
   └── JP
      └── nice_servant.json (niceServant (with lore) export)
```

Data should always be retrieved with the provided utilities in [`./src/cache`](./src/cache/index.ts)

### Flags

`prepare-cache` takes the following flags:

- `--verbose`, `-v`: Show debug output
- `--force-check`, `-f`: Force checking API for updated exports
- `--reprocess`, `-r`: Don't check API and reprocess cached exports (disables `-f`!)
