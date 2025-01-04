import type { ServantWithLore as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import type { ServantProcessor } from "./processServant";
import { log } from "~/util/logger";
import type { ServantNameIndex } from "./servantNames";

// og
const ogSkills = new Set([1000, 236000, 2000, 133000]);
const ogNPs = new Set([800100, 800101, 800104]);
const ogCostumes = new Set(["800130", "800160", "800170"]);

// Ortinax
const ortinaxSkills = new Set([459550, 744450, 460250, 457000, 2162350]);
const ortinaxNPs = new Set([800105, 800106]);
const ortinaxCostumes = new Set(["800140", "800150"]);

export function processServantMashu(
  mashJP: NiceServant,
  mashEN: NiceServant,
  servantsProcessor: ServantProcessor,
  servantNames: ServantNameIndex
) {
  // separate out into two different servants
  const ogJP: NiceServant = {
    ...mashJP,
    name: "Mash Kyrielight",
    skills: [],
    noblePhantasms: [],
    costumeMaterials: {}
  };
  const ogEN: NiceServant = {
    ...mashEN,
    name: "Mash Kyrielight",
    skills: [],
    noblePhantasms: [],
    costumeMaterials: {}
  };
  const ortinaxJP: NiceServant = {
    ...mashJP,
    id: mashJP.id + 50,
    name: "Mash Kyrielight (Ortinax)",
    skills: [],
    noblePhantasms: [],
    costumeMaterials: {}
  };
  const ortinaxEN: NiceServant = {
    ...mashEN,
    id: mashEN.id + 50,
    name: "Mash Kyrielight (Ortinax)",
    skills: [],
    noblePhantasms: [],
    costumeMaterials: {}
  };

  // sort in skills
  for (const skill of mashJP.skills) {
    if (ortinaxSkills.has(skill.id)) {
      ortinaxJP.skills.push(skill);
      continue;
    }
    if (!ogSkills.has(skill.id)) {
      log.warn(
        `Unknown Mash skill ${skill.name} (${skill.id}, num: ${skill.num || "no num"})`
      );
    }
    ogJP.skills.push(skill);
  }
  for (const skill of mashEN.skills) {
    if (ortinaxSkills.has(skill.id)) {
      ortinaxEN.skills.push(skill);
      continue;
    }
    if (!ogSkills.has(skill.id)) {
      log.warn(
        `Unknown Mash skill ${skill.name} (${skill.id}, num: ${skill.num || "no num"})`
      );
    }
    ogEN.skills.push(skill);
  }

  // sort in NPs
  for (const np of mashJP.noblePhantasms) {
    if (ortinaxNPs.has(np.id)) {
      log.debug(
        `Attributing NP ${np.name} (${np.id}) to Mash Kyrielight (Ortinax)`
      );
      if (np.id == 800105) np.strengthStatus = 1; // extra special case
      ortinaxJP.noblePhantasms.push(np);
      continue;
    }
    if (!ogNPs.has(np.id)) {
      log.warn(`Unknown Mash NP ${np.name} (${np.id})`);
    }
    log.debug(
      `Attributing NP ${np.name} (${np.id}) to Mash Kyrielight (Original)`
    );
    ogJP.noblePhantasms.push(np);
  }
  for (const np of mashEN.noblePhantasms) {
    if (ortinaxNPs.has(np.id)) {
      log.debug(
        `Attributing NP ${np.name} (${np.id}) to Mash Kyrielight (Ortinax)`
      );
      ortinaxEN.noblePhantasms.push(np);
      if (np.id == 800105) np.strengthStatus = 1; // extra special case
      continue;
    }
    if (!ogNPs.has(np.id)) {
      log.warn(`Unknown Mash NP ${np.name} (${np.id})`);
    }
    log.debug(
      `Attributing NP ${np.name} (${np.id}) to Mash Kyrielight (Original)`
    );
    ogEN.noblePhantasms.push(np);
  }

  // sort in costumes
  for (const [key, materials] of Object.entries(mashJP.costumeMaterials)) {
    if (ortinaxCostumes.has(key)) {
      ortinaxJP.costumeMaterials[key] = materials;
      continue;
    }
    if (!ogCostumes.has(key)) {
      log.warn(`Unknown Mash Costume ${key}`);
    }
    ogJP.costumeMaterials[key] = materials;
  }
  for (const [key, materials] of Object.entries(mashEN.costumeMaterials)) {
    if (ortinaxCostumes.has(key)) {
      ortinaxEN.costumeMaterials[key] = materials;
      continue;
    }
    if (!ogCostumes.has(key)) {
      log.warn(`Unknown Mash Costume ${key}`);
    }
    ogEN.costumeMaterials[key] = materials;
  }

  // add Mash (Ortinax) to name index
  servantNames[800150] = { name: "Mash Kyrielight (Ortinax)", names: [] };

  // process split servants
  servantsProcessor.processServant(ogJP, ogEN);
  servantsProcessor.processServant(ortinaxJP, ortinaxEN);
}
