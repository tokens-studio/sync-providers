import { SingleToken, UsedTokenSetsMap } from "@tokens-studio/types";
import { getTokenSetsOrder } from "./getTokenSetsOrder.js";
import { TokenSetsCombined } from "./convertAllSetsToArray.js";

export function mergeTokenGroups(
  tokens: TokenSetsCombined,
  usedSets: UsedTokenSetsMap = {},
  overallConfig: UsedTokenSetsMap = {},
  activeTokenSet?: string,
): SingleToken[] {
  const { tokenSetsOrder, usedSetsList, overallSets } = getTokenSetsOrder(
    tokens,
    usedSets,
    overallConfig,
    activeTokenSet,
  );

  // Helper to determine if a token should be merged. We only merge object tokens if the current set is enabled (to avoid accidental merges)
  const shouldMerge = (currentSet: string, existingToken: SingleToken) =>
    usedSetsList.includes(currentSet) &&
    existingToken.internal__Parent &&
    !overallSets.includes(existingToken.internal__Parent);

  return tokenSetsOrder.reduce((mergedTokens, setName) => {
    const setTokens = tokens[setName] || [];
    setTokens.forEach((token) => {
      const existingIndex = mergedTokens.findIndex(
        (t) => t.name === (token.name as unknown as string),
      );
      const existingToken = mergedTokens[existingIndex];
      const newToken = {
        ...token,
        internal__Parent: setName,
      } as SingleToken;

      if (existingIndex === -1) {
        // If the token does not exist yet, add it.
        mergedTokens.push(newToken);
      } else if (
        shouldMerge(setName, existingToken) &&
        existingIndex > -1 &&
        typeof existingToken.value === "object" &&
        typeof newToken.value === "object" &&
        !Array.isArray(existingToken.value) &&
        !Array.isArray(newToken.value)
      ) {
        // If the token should be merged, and is an object - and not an array, merge them (e.g. composition, typography)
        mergedTokens.splice(existingIndex, 1, {
          ...newToken,
          value: {
            ...existingToken.value,
            ...newToken.value,
          },
        } as SingleToken);
      } else {
        // In all other cases, just replace.
        mergedTokens[existingIndex] = newToken;
      }
    });
    return mergedTokens;
  }, [] as SingleToken[]);
}
