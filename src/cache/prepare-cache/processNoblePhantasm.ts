import { Card } from "@atlasacademy/api-connector";
import type { NoblePhantasm as NiceNP } from "@atlasacademy/api-connector/dist/Schema/NoblePhantasm";
import type { Servant as NiceServant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { log } from "~/util/logger";

type UpgradeLevels = Pick<SkillOwner, "upgradeLevel" | "upgradeLevelMax">;

const filterCache = new Map<NiceServant, NiceNP[]>();
function filterServantNPs(servant: NiceServant) {
  const cached = filterCache.get(servant);
  if (cached) return cached;

  const nps = servant.noblePhantasms.toSorted((a, b) => a.id - b.id);
  const npsFiltered = new Array<NiceNP>();
  const seenStrStatus = new Set<number>();
  for (const np of nps) {
    // ignore censored EoR NPs
    if (np.name == "???") {
      log.debug(`Ignoring censored NP of ${servant.name} (${servant.id})`);
      continue;
    }

    // ignore alternate NPs
    if (np.priority < 1 || seenStrStatus.has(np.strengthStatus)) {
      log.debug(
        `Ignoring alternate NP of ${servant.name} (${servant.id}) with priority ${np.priority}, ${
          seenStrStatus.has(np.strengthStatus) ? "" : "un"
        }known strengthStatus`
      );
      continue;
    }
    seenStrStatus.add(np.strengthStatus);

    npsFiltered.push(np);
  }

  // Warn about potential unhandled special cases (assumes that npNum is
  // actually accurately telling amount of NPs a servant has tho)
  const npNum = npsFiltered[0].npNum;
  if (npsFiltered.length != npNum) {
    log.warn(
      `Servant ${servant.name} (${servant.id}) has ${npsFiltered.length} NPs, but npNum is ${npNum}`
    );
  }

  // sorting
  npsFiltered.sort((a, b) => a.priority - b.priority);

  filterCache.set(servant, npsFiltered);
  return npsFiltered;
}

function getUpgradeLevels(np: NiceNP, nps: NiceNP[]): UpgradeLevels {
  if (nps.length < 2) return { upgradeLevel: 0, upgradeLevelMax: 0 };
  const idx = nps.indexOf(np);
  return { upgradeLevel: idx + 1, upgradeLevelMax: nps.length };
}

function convertCardType(card: Card): CardType {
  switch (card) {
    case Card.BUSTER:
    case Card.ARTS:
    case Card.QUICK:
      return card;
    case Card.NONE:
    case Card.EXTRA:
    case Card.BLANK:
    case Card.WEAK:
    case Card.STRENGTH:
      throw new Error(`Unsupported NP Card type ${card}`);
  }
}

export function convertNoblePhantasms(
  servantJP: NiceServant,
  servantEN?: NiceServant
) {
  const npsJP = filterServantNPs(servantJP);
  const npsEN = servantEN && filterServantNPs(servantEN);
  const nps = new Array<ServantNP>();

  for (const npJP of npsJP) {
    const npEN = npsEN?.find(np => np.id == npJP.id);
    const levels = getUpgradeLevels(npJP, npsJP);

    const np: ServantNP = {
      id: npJP.id,
      name: npEN?.name || npJP.name,
      detail: npEN?.detail || npJP.detail || "",
      card: convertCardType(npJP.card),
      owner: servantJP.id,
      ...levels
    };

    // levels en
    const en = npsEN && npEN && getUpgradeLevels(npEN, npsEN);
    if (en) np.en = en;

    nps.push(np);
  }

  return nps;
}
