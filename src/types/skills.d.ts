interface SkillOwner {
  servantId: number;
  /**
   * Skill Slot number, 1-3 meaning regular active skills, 100 to 104 being
   * Append Skills, 0 being Passive Skills
   */
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
  type: "active" | "passive" | "append";
  detail: string;
  owners: Array<SkillOwner>;
}

interface ServantSkillExtended
  extends Omit<ServantSkill, "owners">,
    Omit<SkillOwner, "servantId"> {
  owner: number;
}
