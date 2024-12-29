import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { indexServantNames } from "./servantNames";

export async function processApiData(
  niceServantJP: ServantWithLore[],
  niceServantEN: ServantWithLore[]
) {
  const _servantNames = indexServantNames(niceServantJP, niceServantEN);

  throw new Error("Processing unimplemented");
}
