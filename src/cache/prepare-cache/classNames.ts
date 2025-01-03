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
    default:
      throw new Error(`Unsupported class name '${name}'`);
  }
}
