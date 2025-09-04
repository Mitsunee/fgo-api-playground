/**
 * Turns ServantClass property into nice human-readable string (i.e. capitalized,
 * and spaces inserted where needed)
 * @param name ServantClass property
 * @returns ServantClass as string
 */
export function describeServantClass(name: ServantClass): string {
  switch (name) {
    // REGULAR
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
    case "unbeast":
      return name.replace(/^(.)/, c => c.toUpperCase());
    case "moonCancer":
      return "Moon Cancer";
    case "alterEgo":
      return "Alter Ego";
    // GRANDS
    case "grandSaber":
    case "grandArcher":
    case "grandLancer":
    case "grandRider":
    case "grandCaster":
    case "grandAssassin":
    case "grandBerserker":
    case "grandShielder":
    case "grandRuler":
    case "grandAvenger":
    case "grandForeigner":
    case "grandPretender":
    case "grandUnbeast":
      return name.replace(/^grand/, "Grand ");
    case "grandMoonCancer":
      return "Grand Moon Cancer";
    case "grandAlterego":
      return "Grand Alter Ego";
  }
}
