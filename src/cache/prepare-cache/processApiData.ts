import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";

export async function processApiData(
  niceServantJP: ServantWithLore[],
  niceServantEN: ServantWithLore[]
) {
  const servantsJP = new Set<number>();
  const servantsEN = new Set<number>();

  throw new Error("Processing unimplemented");
}
