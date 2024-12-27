type ServantClass =
  | "saber"
  | "archer"
  | "lancer"
  | "rider"
  | "caster"
  | "assassin"
  | "berserker"
  | "shielder"
  | "ruler"
  | "alterEgo"
  | "avenger"
  | "moonCancer"
  | "pretender"
  | "foreigner"
  | "beastEresh";

// WIP
// TODO: needs materials for skills, appends, costumes, ascension
// TODO: how to handle event welfares?
// TODO: how to handle Mashu?
interface Servant {
  id: number;
  name: string;
  names: string[];
  collectionNo: number;
  rarity: number;
  cost: number;
  className: ServantClass;
  gender: "male" | "female" | "unknown";
  skills: Array<number>;
  noblePhantasms: Array<number>;
}
