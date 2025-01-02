# Notes

## TODO

- Hardcode Mashu/Mashu(Ortinax) as separate Servants
- Hardcode special cases for Melusine (Lancer)?

## Data Assumptions to prove

- See Upgrade Levels below
- Mash needs to be hardcoded or ignored
  - possibly add Mashu (Ortinax) as a separate servant?
- ServantIDs are divisible by 100
  - I noticed NPs seem to use servantId + n?
- IDs of Skills, Class Passives and Append Skills do not overlap

## Skills

Usually each skill's skillSvts array contains the correct values for each servant, priority can mostly be used to judge upgrade level, where 0 means that the skill cannot be upgraded, 1 means it can be upgraded but has not yet.

Append Skills have no upgrade level (or skillSvts property), but use a different data structure in the `NiceServant["appendPassive"]` array that separately explains num and priority. Passive Skills also lack the skillSvts property. If needed individual fetching gives the extra reverse property which includes servant data of every owner.

### Mash Special cases

Since Mashu can essentially swap out her skill sets her skills' values behave weirdly. I'm unsure how to handle this yet.

### Emiya Special cases (aka skills with multiple upgrades)

Should be covered now

### Melusine Special Cases

Melusine's skills look like a skill upgrade with the above rules. Unsure how to handle it yet. The id of the alternate version seems to end in 5, which might be usual?

## NPs

strengthStatus seems to increase from 1 to 99 when upgrading, with 0 meaning non-upgradable like with priority on skills. interestingly npNum seems to be the amount of levels the NP has?

A general rule can be used to filter out alternate NPs by only allowing priority above 0, and only one NP per strengthStatus. Servants with alternate NPs such as BB (Dubai) and Melusine would require a separate system to introduce alternate forms for servants, which is beyond the scope of this repository at this time. Such a system would also likely require manual matching of NP ids for each form.

### Emiya/Space Ishtar Special Cases

Alternate NPs appear to have priority set to 0. Their id is also servantId + 90 + n.

### Other alternate NPs (such as Melusine)

Sort NPs by id and only allow one per strengthStatus

### Vlad Berserker (aka NPs with multiple upgrades)

The **weaker** version has strengthStatus 2 for some reason? This may mean I still just sort by priority or id then...

### Epic of Remnant NPs (aka spoiler-censored ??? names)

strengthStatus can be used to match these together, obviously the one with "???" as name should just be filtered disregarding other filters mentioned above.

## Items

- For Servant Enchancement Items uses array can contain any of: skill, appendSkill, ascension, costume
  - if uses includes "ascension" but type is "eventItem" that's an event welfare ascension material
- Holy Grail has no uses array, its id is 7999
- Exchange Tickets have type itemSelect and start at id 10000
