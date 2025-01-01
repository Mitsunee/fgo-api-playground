type ID = number | `${number}`;
type SupportedRegion = "EN" | "JP";
type CardType = "buster" | "arts" | "quick";
type FaceCardType = CardType | "extra";

interface EntityBase {
  id: number;
  name: string;
  /**
   * Set to true if available on EN Server
   */
  en?: true;
}

interface EnhancementStage {
  qp: number;
  /**
   * Array of Tuples containing item IDs with the amount needed
   */
  items: Array<[number, number]>;
}

interface SkillUpgrade {
  /**
   * Upgrade Level where 0 is non-upgradable skill, 1 is skill with no upgrade
   */
  upgradeLevel: number;
  /**
   * Maximum Upgrade Level where 0 is non-upgradable skill, 1 is skill with no
   * upgrade
   */
  upgradeLevelMax: number;
  en?: Omit<SkillUpgrade, "en">;
}
