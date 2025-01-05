import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { convertClassName } from "./classNames";
import { servantClassToString } from "~/util/servantClassToString";
import {
  filterClassNameTokens,
  joinTokenizedName,
  tokenizeServantName
} from "~/util/tokenizeServantName";

export type ServantNameIndex = ReturnType<typeof indexServantNames>;

const filteredTokens = new Set([
  "Brave",
  "Summer Vacation",
  "Cinderella",
  "Halloween"
]);

const addedNames = new Map([
  [204900, ["Barghest", "Tam Lin Gawain"]], // Summer Barghest
  // Summer Baobhan (2800600) seems to have all her names
  [901700, ["Tam Lin Lancelot"]], // Summer Melusine
  [504500, ["Castoria"]], // Caster Castoria btw lol
  [202200, ["Altera (Santa)"]],
  [505300, ["Queen Morgan"]], // Aesc
  [3300100, ["Sodom's Beast", "Nero Claudius"]], // split her names, also she's a Nero
  [305300, ["Tam Lin Britomart"]],
  [2300800, ["Hakunon"]], // Female Hakuno
  [404200, ["Habenyan", "Habbycat"]],
  [604200, ["Tamamo Vitch", "Koyanskaya"]],
  [2500900, ["Tamamo Vitch", "Koyanskaya"]],
  [2800900, ["Arcueid Brunestud"]], // Phantasmoon
  [2301000, ["Tlaloc"]], // Summer Tlaloc
  [303800, ["Uesugi Kenshin"]], // Lancer Kagetora
  [901800, ["Nagao Kagetora"]], // Ruler Kagetora
  [2800300, ["Merlin (Prototype)"]], // Lady Avalon
  [1100900, ["Ishtar"]], // Space Ishtar is also an Ishtar
  [1101000, ["Ushiwakamaru", "Yoshitsune"]], // I played too much P4G
  [603400, ["Yoshitsune"]],
  [401400, ["Yoshitsune"]],
  [1101800, ["Ushi Gozen"]], // split her names
  [304000, ["Meltryllis"]],
  [604300, ["Valkyrie (Ortlinde)", "Valkyrie (Irs)"]],
  [604400, ["Valkyrie (Hildr)", "Valkyrie (Rún)"]],
  [604500, ["Valkyrie (Thrúd)", "Valkyrie (Rindr)"]]
]);

const replacedNames = new Map([
  [2300100, "BB (Welfare)"],
  [2300200, "BB (Summer)"], // old summer BB
  [704000, "Queen Morgan"], // how dare they miss the Queen prefix on Morgan
  [402700, "Altria Pendragon (Alter) (Summer)"],
  [900700, "Quetzalcoatl (Samba) (Santa)"],
  [402200, "Altria Pendragon (Alter) (Santa)"],
  [3300100, "Draco"],
  [2300700, "Hakuno Kishinami (M)"],
  [2300800, "Hakuno Kishinami (F)"],
  [103400, "Queen Medb"], // Summer Medb is missing the Queen prefix
  [602500, "First Hassan"], // fuck your quotes sir
  [601900, "Fuuma Kotarou"], // gotta be fair here and remove his quotes too
  [603000, "Katou Danzo"], // more quotes
  [1101800, "Minamoto-no-Raikou"] // split her names
]);

function tokenizeName(name: string) {
  const tokens = tokenizeServantName(name);
  return filterClassNameTokens(tokens, filteredTokens);
}

function getAdditionalServantNames(servant: ServantWithLore) {
  const names = new Set<string>();

  Object.values(servant.ascensionAdd.overWriteServantName.ascension).forEach(
    name => names.add(name)
  );
  Object.values(servant.ascensionAdd.overWriteServantName.costume).forEach(
    name => names.add(name)
  );
  Object.values(
    servant.ascensionAdd.overWriteServantBattleName.ascension
  ).forEach(name => names.add(name));
  Object.values(
    servant.ascensionAdd.overWriteServantBattleName.costume
  ).forEach(name => names.add(name));

  return names;
}

export function indexServantNames(
  niceServantJP: ServantWithLore[],
  niceServantEN: ServantWithLore[]
) {
  const servantNamesTokenized: Record<
    ID,
    { name: string[]; names: string[][] }
  > = {};
  const nameRoots: Record<string, Set<number>> = {};
  const niceServantMap: Record<ID, ServantWithLore> = {};

  for (const servantJP of niceServantJP) {
    const servantEN = niceServantEN.find(servant => servant.id == servantJP.id);
    niceServantMap[servantJP.id] = servantEN || servantJP;

    // collect all names
    const name =
      replacedNames.get(servantJP.id) || servantEN?.name || servantJP.name;
    let names = new Set<string>(addedNames.get(servantJP.id));
    if (servantEN) {
      names = names.union(getAdditionalServantNames(servantEN));
    } else {
      names = names.union(getAdditionalServantNames(servantJP));
    }

    // no duplicates pls
    names.delete(name);

    // tokenize names
    const nameTokenized = tokenizeName(name);
    const namesTokenized = Array.from(names, name => tokenizeName(name));
    servantNamesTokenized[servantJP.id] = {
      name: nameTokenized,
      names: namesTokenized
    };

    // index names
    nameRoots[nameTokenized[0]] ||= new Set();
    nameRoots[nameTokenized[0]].add(servantJP.id);
    for (const nameTokenized of namesTokenized) {
      nameRoots[nameTokenized[0]] ||= new Set();
      nameRoots[nameTokenized[0]].add(servantJP.id);
    }
  }

  for (const [root, servantIDs] of Object.entries(nameRoots)) {
    if (servantIDs.size < 2) continue;

    // find pointers to relevant name
    const namePointers: Record<ID, "name" | number> = {};
    const servantClasses: Record<ID, ServantClass> = {};
    for (const id of servantIDs) {
      servantClasses[id] = convertClassName(niceServantMap[id].className);
      if (servantNamesTokenized[id].name[0] == root) {
        namePointers[id] = "name";
      } else {
        const idx = servantNamesTokenized[id].names.findIndex(
          name => name[0] == root
        );
        if (idx < 0) {
          throw new Error(
            `${id} was listed for root name '${root}', but name wasn't found`
          );
        }
        namePointers[id] = idx;
      }
    }

    // handle special cases with servants with multiple versions of the same class
    if (new Set(Object.values(servantClasses)).size == 1) {
      // prettier-ignore
      const joinedNames = new Set(servantIDs.values().map(
        id => joinTokenizedName(namePointers[id] == "name"
          ? servantNamesTokenized[id].name
          : servantNamesTokenized[id].names[namePointers[id]]
      )));

      if (joinedNames.size < servantIDs.size) {
        throw new Error(
          `Found ${servantIDs.size} Servants with same class under name root '${root}', but only ${joinedNames.size} unique names possible`
        );
      }
      continue;
    }

    // append class name to all names
    for (const id of servantIDs) {
      const className = servantClassToString(
        convertClassName(niceServantMap[id].className)
      );
      const pointer = namePointers[id];
      const nameTokenized =
        pointer == "name"
          ? servantNamesTokenized[id].name
          : servantNamesTokenized[id].names[pointer];
      if (nameTokenized[nameTokenized.length - 1] == className) continue;
      nameTokenized.push(className);
    }

    // count unique names
    // prettier-ignore
    const joinedNames = new Set(servantIDs.values().map(
      id => joinTokenizedName(namePointers[id] == "name"
        ? servantNamesTokenized[id].name
        : servantNamesTokenized[id].names[namePointers[id]]
    )));

    if (joinedNames.size < servantIDs.size) {
      throw new Error(
        `Found ${servantIDs.size} Servants under name root '${root}', but only ${joinedNames.size} unique names possible:\n${Array.from(
          joinedNames
        )
          .map(name => ` -  ${name}`)
          .join("\n")}`
      );
    }
  }

  // create final map
  const servantNames: Record<ID, { name: string; names: string[] }> = {};
  const reverseMap = new Map<string, number>();
  for (const { id } of niceServantJP) {
    const { name: nameTokenized, names: namesTokenized } =
      servantNamesTokenized[id];

    // name
    const name = joinTokenizedName(nameTokenized);
    const reverse = reverseMap.get(name);
    if (typeof reverse == "number") {
      throw new Error(
        `Name '${name}' is shared between IDs ${reverse} and ${id}`
      );
    }
    servantNames[id] = { name, names: [] };

    // names
    for (const nameTokenized of namesTokenized) {
      const name = joinTokenizedName(nameTokenized);
      const reverse = reverseMap.get(name);
      if (typeof reverse == "number") {
        throw new Error(
          `Name '${name}' is shared between IDs ${reverse} and ${id}`
        );
      }
      servantNames[id].names.push(name);
    }
  }

  return servantNames;
}
