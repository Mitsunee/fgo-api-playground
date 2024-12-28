interface ServantNP {
  id: number;
  name: string;
  card: CardType;
  detail: string;
  owner: number;
  /**
   * Upgrade Level where 0 is non-upgradable skill, 1 is skill with no upgrade
   */
  upgradeLevel: number;
  upgradeLevelMax: number;
}
