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

interface Servant {
  id: number;
  name: string;
  names: string[];
  collectionNo: number;
  rarity: number;
  cost: number;
  className: ServantClass;
  gender: "male" | "female" | "unknown";
  ascensionMaterials?: Array<UpgradeStage>;
  skills: Array<number>;
  skillMaterials: Array<UpgradeStage>;
  appendSkills: Array<number>;
  appendSkillMaterials: Array<UpgradeStage>;
  passiveSkills: Array<number>;
  noblePhantasms: Array<number>;
  costumes: Array<Costume>;
}
