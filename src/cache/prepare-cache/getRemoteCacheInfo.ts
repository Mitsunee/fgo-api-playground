import { log } from "~/util/logger";
import { connectorEN, connectorJP } from "./connector";

export async function getRemoteCacheInfo() {
  log.debug("Fetching remote info");

  const [infoJP, infoEN] = await Promise.all([
    connectorJP.info(),
    connectorEN.info()
  ]);

  return { JP: infoJP.timestamp, EN: infoEN.timestamp };
}
