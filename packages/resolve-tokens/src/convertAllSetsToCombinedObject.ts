import { DesignTokens } from "style-dictionary/types";
import {
  TokenSetsCombined,
  convertSingleSetToArray,
} from "./convertAllSetsToArray.js";
import { type SingleToken } from "@tokens-studio/types";

export async function convertAllSetsToCombinedObject(
  tokenSets: Record<string, DesignTokens | SingleToken[]>,
): Promise<TokenSetsCombined> {
  const combinedTokenSets: TokenSetsCombined = {};

  for (const [key, value] of Object.entries(tokenSets)) {
    if (Array.isArray(value)) {
      combinedTokenSets[key] = value;
      continue;
    }
    combinedTokenSets[key] = await convertSingleSetToArray(value);
  }

  return combinedTokenSets;
}
