/**
 * Turns ServantClass property into nice human-readable string (i.e. capitalized,
 * and spaces inserted where needed)
 * @param name ServantClass property
 * @returns ServantClass as string
 */
export function describeServantClass(name: ServantClass): string {
  switch (name) {
    case "saber":
    case "archer":
    case "lancer":
    case "rider":
    case "caster":
    case "assassin":
    case "berserker":
    case "shielder":
    case "ruler":
    case "avenger":
    case "pretender":
    case "foreigner":
    case "beast":
      return name.replace(/^(.)/, c => c.toUpperCase());
    case "moonCancer":
      return "Moon Cancer";
    case "alterEgo":
      return "Alter Ego";
  }
}
