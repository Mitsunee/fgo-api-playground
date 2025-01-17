import { describeServantClass } from "./describeServantClass";
import {
  filterClassNameTokens,
  joinTokenizedName,
  tokenizeServantName
} from "./tokenizeServantName";

interface DescribeServantOptions {
  /**
   * Whether to show class. By default the className descriptor is only used where
   * necessary to distinguish servants. Setting `true` will force the className
   * descriptor to be displayed, while setting `false` will never display it
   */
  showClass?: boolean;
  /**
   * Whether to show the collection number (`true`)
   */
  showCollectionNo?: boolean;
  /**
   * Whether to show the id (`true`, default). Set to `false` to hide the id
   */
  showId?: boolean;
  /**
   * Name to use instead of default servant name
   */
  overrideName?: string;
}

export function describeServant(
  servant: Servant,
  opts: DescribeServantOptions = {}
) {
  const showClass = opts.showClass;
  const showCollectionNo = opts.showCollectionNo ?? false;
  const showId = opts.showId ?? true;

  let name = opts.overrideName || servant.name;
  if (typeof showClass == "boolean") {
    const tokens = filterClassNameTokens(tokenizeServantName(name));
    if (showClass) tokens.push(describeServantClass(servant.className));
    name = joinTokenizedName(tokens);
  }

  if (showCollectionNo) {
    name = `[#${servant.collectionNo}] ${name}`;
  }

  if (showId) {
    name = `[${servant.id}] ${name}`;
  }

  return name;
}
