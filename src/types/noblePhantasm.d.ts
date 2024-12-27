interface ServantNP {
  id: number;
  name: string;
  card: CardType;
  detail: string;
  owner: number;
  upgradeLevel: number;
  /**
   * Upgrade Level where 0 is non-upgradable skill, 1 is skill with no upgrade
   */
  upgradeLevelMax: number;
}
