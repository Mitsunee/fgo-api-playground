import type { Servant as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import type { Skill as NiceSkill } from "@atlasacademy/api-connector/dist/Schema/Skill";
import type { AppendPassive as NiceAppend } from "@atlasacademy/api-connector/dist/Schema/Entity";

type UpgradeLevels = Pick<SkillOwner, "upgradeLevel" | "upgradeLevelMax">;
export type SkillProcessor = ReturnType<typeof createSkillProcessor>;

const mapNiceAppends = (() => {
  const cache = new Map<NiceServant, NiceSkill[]>();

  function mapAppendToSkill(append: NiceAppend) {
    const { skill, num } = append;
    return { ...skill, num };
  }

  return function (servant: NiceServant) {
    const cached = cache.get(servant);
    if (cached) return cached;

    const mappedAppends = servant.appendPassive.map(mapAppendToSkill);
    cache.set(servant, mappedAppends);
    return mappedAppends;
  };
})();

export function createSkillProcessor() {
  const skillsMap: Record<ID, ServantSkill> = {};

  function getSkillList() {
    return Object.values(skillsMap).sort((a, b) => a.id - b.id);
  }

  function registerSkill(
    niceSkill: NiceSkill,
    type: ServantSkill["type"],
    en: boolean
  ) {
    const skill = (skillsMap[niceSkill.id] ||= {
      id: niceSkill.id,
      name: niceSkill.name,
      detail: niceSkill.detail || "",
      type,
      owners: []
    });

    if (en) {
      // override skill an detail if we found the english version of a skill
      Object.assign(skill, {
        en: true,
        name: niceSkill.name,
        detail: niceSkill.detail || skill.detail
      });
    }

    return skill;
  }

  function determineSkillUpgrades(
    niceSkill: NiceSkill,
    niceSkills: Array<NiceSkill>
  ): UpgradeLevels {
    const relatedSkills = niceSkills.filter(
      skill => skill.num == niceSkill.num
    );
    if (relatedSkills.length < 2) {
      return { upgradeLevel: 0, upgradeLevelMax: 0 };
    }
    return {
      upgradeLevel: relatedSkills.indexOf(niceSkill) + 1,
      upgradeLevelMax: relatedSkills.length
    };
  }

  function registerSkillOwner(
    id: number,
    servantJP: NiceServant,
    servantEN?: NiceServant
  ) {
    const skill = skillsMap[id];

    // construct owner JP
    const niceSkillJP = servantJP.skills.find(skill => skill.id == id);
    if (!niceSkillJP) {
      throw new Error(
        `Could not find active skill ${skill.name} for servant id ${servantJP.id}`
      );
    }
    const ownerJP = determineSkillUpgrades(niceSkillJP, servantJP.skills);

    // construct owner
    const owner: SkillOwner = {
      servantId: servantJP.id,
      num: niceSkillJP.num!,
      ...ownerJP
    };

    // construct owner EN
    if (servantEN) {
      const niceSkillEN = servantEN.skills.find(skill => skill.id == id);
      if (niceSkillEN) {
        owner.en = determineSkillUpgrades(niceSkillEN, servantEN.skills);
      }
    }

    skill.owners.push(owner);
  }

  function registerPassiveOwner(
    id: number,
    servantJP: NiceServant,
    servantEN?: NiceServant
  ) {
    const skill = skillsMap[id];

    // construct owner
    const niceSkill = servantJP.classPassive.find(passive => passive.id == id);
    if (!niceSkill) {
      throw new Error(
        `Could not find passive skill ${skill.name} for servant id ${servantJP.id}`
      );
    }
    const owner: SkillOwner = {
      servantId: servantJP.id,
      num: 0,
      upgradeLevel: 0,
      upgradeLevelMax: 0
    };

    // construct owner EN
    if (servantEN) {
      const niceSkillEN = servantEN.classPassive.find(
        passive => passive.id == id
      );
      if (niceSkillEN)
        owner.en = {
          upgradeLevel: 0,
          upgradeLevelMax: 0
        };
    }

    skill.owners.push(owner);
  }

  function registerAppendOwner(
    id: number,
    servantJP: NiceServant,
    servantEN?: NiceServant
  ) {
    const skill = skillsMap[id];

    // construct owner JP
    const appendsJP = mapNiceAppends(servantJP);
    const niceAppendJP = appendsJP.find(append => append.id == id);
    if (!niceAppendJP) {
      throw new Error(
        `Could not find append skill ${skill.name} for servant id ${servantJP.id}`
      );
    }
    const ownerJP = determineSkillUpgrades(niceAppendJP, appendsJP);

    // construct owner
    const owner: SkillOwner = {
      servantId: servantJP.id,
      num: niceAppendJP.num!,
      ...ownerJP
    };

    // construct owner EN
    if (servantEN) {
      const appendsEN = mapNiceAppends(servantEN);
      const niceAppendEN = appendsEN.find(append => append.id == id);
      if (niceAppendEN) {
        owner.en = determineSkillUpgrades(niceAppendEN, appendsEN);
      }
    }

    skill.owners.push(owner);
  }

  function handleActives(servantJP: NiceServant, servantEN?: NiceServant) {
    const ids = new Array<number>();
    for (const skillJP of servantJP.skills) {
      const id = skillJP.id;
      const skillEN = servantEN?.skills.find(skill => skill.id == id);
      registerSkill(skillEN || skillJP, "active", Boolean(skillEN));
      registerSkillOwner(id, servantJP, servantEN);
      ids.push(id);
    }
    return ids;
  }

  function handlePassives(servantJP: NiceServant, servantEN?: NiceServant) {
    const ids = new Array<number>();
    for (const skillJP of servantJP.classPassive) {
      const id = skillJP.id;
      const skillEN = servantEN?.classPassive.find(skill => skill.id == id);
      registerSkill(skillEN || skillJP, "passive", Boolean(skillEN));
      registerPassiveOwner(id, servantJP, servantEN);
      ids.push(id);
    }
    return ids;
  }

  function handleAppends(servantJP: NiceServant, servantEN?: NiceServant) {
    const ids = new Array<number>();
    const appendsJP = mapNiceAppends(servantJP);
    const appendsEN = servantEN && mapNiceAppends(servantEN);
    for (const appendJP of appendsJP) {
      const id = appendJP.id;
      const appendEN = appendsEN?.find(skill => skill.id == id);
      registerSkill(appendEN || appendJP, "append", Boolean(appendEN));
      registerAppendOwner(id, servantJP, servantEN);
      ids.push(id);
    }
    return ids;
  }

  function handleSkills(servantJP: NiceServant, servantEN?: NiceServant) {
    const skillIds: Pick<Servant, "skills" | "passiveSkills" | "appendSkills"> =
      {
        skills: handleActives(servantJP, servantEN),
        passiveSkills: handlePassives(servantJP, servantEN),
        appendSkills: handleAppends(servantJP, servantEN)
      };

    return skillIds;
  }

  return { getSkillList, handleSkills };
}
