interface War extends EntityBase {
  longName: string;
  quests: number[];
}

interface Quest extends EntityBase {
  war: id;
  apCost: number;
}

interface FreeQuest extends Quest {
  bond: number;
}
