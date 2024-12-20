import { type DesignTokens } from "style-dictionary/types";
import { type UsedTokenSetsMap } from "@tokens-studio/types";
import { mergeTokenGroups } from "./mergeTokenGroups.js";
import { convertAllSetsToCombinedObject } from "./convertAllSetsToCombinedObject.js";
import { type NewExperimentalThemeObject } from "../../internal-types/NewExperimentalThemeObject.js";
import { type SingleToken } from "@tokens-studio/types";

export async function generateThemes(
  tokenSets: Record<string, DesignTokens | SingleToken[]>,
  themes: NewExperimentalThemeObject[],
  overallConfig?: UsedTokenSetsMap,
) {
  const mergedTokensForOptions: Record<string, SingleToken[]> = {};
  const tokenSetArrays = await convertAllSetsToCombinedObject(tokenSets);

  for (const theme of themes) {
    for (const option of theme.options) {
      const mergedTokens = await mergeTokenGroups(
        tokenSetArrays,
        option.selectedTokenSets,
        overallConfig,
      );
      const key = `${theme.name}/${option.name}`;
      mergedTokensForOptions[key] = mergedTokens || []; // Handle potentially undefined mergedTokens
    }
  }
  return mergedTokensForOptions;
}
