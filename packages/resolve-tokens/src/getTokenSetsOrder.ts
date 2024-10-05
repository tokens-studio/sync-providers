import { UsedTokenSetsMap, TokenSetStatus } from "@tokens-studio/types";
import { sortSets } from "./sortSets.js";
import { TokenSetsCombined } from "./convertAllSetsToArray.js";

export function getTokenSetsOrder(
  tokens: TokenSetsCombined,
  usedSets: UsedTokenSetsMap,
  overallConfig: UsedTokenSetsMap,
  activeTokenSet?: string,
): { tokenSetsOrder: string[]; usedSetsList: string[]; overallSets: string[] } {
  const originalTokenSetOrder = Object.keys(tokens);
  const usedSetsList = originalTokenSetOrder.filter(
    (key) =>
      usedSets[key] === TokenSetStatus.ENABLED ||
      usedSets[key] === TokenSetStatus.SOURCE,
  );
  const overallSets = originalTokenSetOrder
    .filter((set) => !usedSetsList.includes(set))
    .sort((a, b) => sortSets(a, b, overallConfig));

  if (activeTokenSet) {
    usedSetsList.splice(usedSetsList.indexOf(activeTokenSet), 1);
    usedSetsList.push(activeTokenSet);
  }

  const tokenSetsOrder = [...overallSets, ...usedSetsList];

  return { tokenSetsOrder, usedSetsList, overallSets };
}
