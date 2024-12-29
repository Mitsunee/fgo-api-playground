export function servantClassToString(name: ServantClass): string {
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
