export interface CacheInfo {
  /**
   * timestamp of last API data update for Global Server
   */
  EN: number;
  /**
   * timestamp of last API data update for JP Server
   */
  JP: number;
  /**
   * timestamp of last check to prevent updating multiple times within short timeframe
   */
  lastChecked: number;
  /**
   * Version override for if new data is added to the cache
   */
  cacheVer: number;
}

/**
 * Current Cache Version
 */
export const CACHE_VER = 1;

/* Cache Version History:
v0: Development
v1: added nice_war
*/
