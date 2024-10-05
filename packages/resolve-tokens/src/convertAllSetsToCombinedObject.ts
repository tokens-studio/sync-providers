import { DesignTokens } from "style-dictionary/types";
import { TokenSetsCombined, convertSingleSetToArray } from "./convertAllSetsToArray.js";


export async function convertAllSetsToCombinedObject(tokenSets: Record<string, DesignTokens>): Promise<TokenSetsCombined> {
  const combinedTokenSets: TokenSetsCombined = {};

  for (const [key, value] of Object.entries(tokenSets)) {
    combinedTokenSets[key] = await convertSingleSetToArray(value);
  }

  return combinedTokenSets;
}
