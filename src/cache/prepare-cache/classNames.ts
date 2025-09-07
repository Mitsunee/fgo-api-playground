import { ClassName } from "@atlasacademy/api-connector";

export function convertClassName(name: ClassName): ServantClass {
  switch (name) {
    case ClassName.SABER:
    case ClassName.ARCHER:
    case ClassName.LANCER:
    case ClassName.RIDER:
    case ClassName.CASTER:
    case ClassName.ASSASSIN:
    case ClassName.BERSERKER:
    case ClassName.SHIELDER:
    case ClassName.RULER:
    case ClassName.ALTER_EGO:
    case ClassName.AVENGER:
    case ClassName.MOON_CANCER:
    case ClassName.PRETENDER:
    case ClassName.FOREIGNER:
      return name;
    case ClassName.BEAST:
    case ClassName.BEAST_ERESH:
      return "beast";
    case ClassName.UN_BEAST_OLGA_MARIE:
      return "unbeast";
    case ClassName.GRAND_SABER:
    case ClassName.GRAND_ARCHER:
    case ClassName.GRAND_LANCER:
    case ClassName.GRAND_RIDER:
    case ClassName.GRAND_CASTER:
    case ClassName.GRAND_ASSASSIN:
    case ClassName.GRAND_BERSERKER:
    case ClassName.GRAND_SHIELDER:
    case ClassName.GRAND_RULER:
    case ClassName.GRAND_ALTER_EGO:
    case ClassName.GRAND_AVENGER:
    case ClassName.GRAND_MOON_CANER:
    case ClassName.GRAND_FOREIGNER:
    case ClassName.GRAND_PRETENDER:
      return name as Extract<ServantClass, `grand${string}`>;
    case ClassName.GRAND_BEAST_DRACO:
    case ClassName.GRAND_BEAST_ERESH:
    case ClassName.GRAND_UN_BEAST_OLGA_MARIE:
      return "grandUnbeast";

    default:
      throw new Error(`Unsupported class name '${name}'`);
  }
}
