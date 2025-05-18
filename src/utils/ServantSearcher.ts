import type { MatchData } from "fast-fuzzy";
import { Searcher } from "fast-fuzzy";
import { col } from "~/utils/logger";
import { servantsCache } from "~/cache";

export async function createServantSearcher(
  includeAltNames = true,
  threshold = 0.7
) {
  const servantsList = await servantsCache.read();
  const searcher = new Searcher(servantsList, {
    keySelector: includeAltNames
      ? candidate => [candidate.name].concat(candidate.names)
      : candidate => [candidate.name],
    returnMatchData: true,
    threshold
  });

  return searcher;
}

export function prettyPrintMatch(match: MatchData<unknown>) {
  const text = match.original;
  const { index, length } = match.match;
  const end = index + length;
  const before = text.slice(0, index);
  const matched = text.slice(index, end);
  const after = text.substring(end);

  return `${before}${col.bold(col.redBright(matched))}${after}`;
}
