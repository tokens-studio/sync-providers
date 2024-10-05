import { DesignTokens } from "style-dictionary/types";
import { UsedTokenSetsMap } from "@tokens-studio/types";
import { mergeTokenGroups } from "./mergeTokenGroups.js";
import { convertAllSetsToCombinedObject } from "./convertAllSetsToCombinedObject.js";
import { NewExperimentalThemeObject } from "../../types/NewExperimentalThemeObject.js";
import { SingleToken } from "@tokens-studio/types";

export async function generateThemes(
  tokenSets: Record<string, DesignTokens>,
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
