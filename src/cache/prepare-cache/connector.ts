import { ApiConnector, Language, Region } from "@atlasacademy/api-connector";

export const connectorJP = new ApiConnector({
  region: Region.JP,
  language: Language.ENGLISH
});
export const connectorEN = new ApiConnector({
  region: Region.NA,
  language: Language.ENGLISH
});
