# Notes

## Misc

- Github CI runs with node v20, should be 22 (did I copy this from the flyffu api playground or is that one updated?)

## Data Assumptions to prove

- See Upgrade Levels below
- NPs only have one owner
- Costumes only have one owner
- Mash needs to be hardcoded or ignored
  - possibly add Mashu (Ortinax) as a separate servant?
- ServantIDs are divisible by 100
  - I noticed NPs seem to use servantId + n?
- EoR spoilers have been purged from the API

## Skill Upgrade level

Usually each skill's skillSvts array contains the correct values for each servant, priority can mostly be used to judge upgrade level, where 0 means that the skill cannot be upgraded, 1 means it can be upgraded but has not yet.

Append Skills have no upgrade level (or skillSvts property), but use a different data structure in the `NiceServant["appendPassive"]` array that separately explains num and priority.

### Mash Special cases

Since Mashu can essentially swap out her skill sets her skills' values behave weirdly. I'm unsure how to handle this yet.

### Emiya Special cases (aka skills with multiple upgrades)

Should be covered now

## NP Upgrade Levels

strengthstatus seems to increase from 1 to 99 when upgrading, with 0 meaning non-upgradable like with priority on skills. interestingly npNum seems to be the amount of levels the NP has?

## Emiya/Space Ishtar Special Cases

Alternate NPs appear to have priority set to 0. Their id is also servantId + 90 + n.

## Vlad Berserker (aka NPs with multipls upgrades)

The **weaker** version has strengthStatus 2 for some reason? This may mean I still just sort by priority or id then...

## Epic of Remnant NPs

These seem to have disappeared from the atlas data?
