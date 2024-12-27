interface SkillOwner {
  servantId: number;
  num: number;
  /**
   * Upgrade Level where 0 is non-upgradable skill, 1 is skill with no upgrade
   */
  upgradeLevel: number;
  upgradeLevelMax: number;
}

interface ServantSkill {
  id: number;
  name: string;
  detail: string;
  owners: Array<SkillOwner>;
}

interface ServantSkillExtended
  extends Omit<ServantSkill, "owners">,
    Omit<SkillOwner, "servantId"> {
  owner: number;
}
