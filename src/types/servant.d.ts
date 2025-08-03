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
  | "beast";

interface Servant extends EntityBase {
  names: string[];
  collectionNo: number;
  rarity: number;
  cost: number;
  className: ServantClass;
  gender: "male" | "female" | "unknown";
  ascensionMaterials: Array<EnhancementStage>;
  skills: Array<number>;
  skillMaterials: Array<EnhancementStage>;
  appendSkills: Array<number>;
  appendSkillMaterials: Array<EnhancementStage>;
  passiveSkills: Array<number>;
  noblePhantasms: Array<ServantNP>;
  costumes: Array<ServantCostume>;
  bondCE?: number;
}
