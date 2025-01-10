import { type DesignTokens } from "style-dictionary/types";
import {
  type TokenSetsCombined,
  convertSingleSetToArray,
} from "./convertAllSetsToArray.js";
import { type AnyTokenSet } from "@tokens-studio/types";

export async function convertAllSetsToCombinedObject(
  tokenSets: AnyTokenSet,
): Promise<TokenSetsCombined> {
  const combinedTokenSets: TokenSetsCombined = {};

  for (const [key, value] of Object.entries(tokenSets)) {
    if (Array.isArray(value)) {
      combinedTokenSets[key] = value;
      continue;
    }
    combinedTokenSets[key] = await convertSingleSetToArray(
      value as unknown as DesignTokens, // type cast as SD expects `DesignTokens`
    );
  }

  return combinedTokenSets;
}
