interface SkillOwner extends SkillUpgrade {
  servantId: number;
  /**
   * Skill Slot number, 1-3 meaning regular active skills, 100 to 104 being
   * Append Skills, 0 being Passive Skills
   */
  num: number;
}

interface ServantSkill extends Omit<EntityBase, "en"> {
  type: "active" | "passive" | "append";
  detail: string;
  owners: Array<SkillOwner>;
}

interface ServantSkillExtended
  extends Omit<ServantSkill, "owners">,
    Omit<SkillOwner, "servantId"> {
  owner: number;
}
