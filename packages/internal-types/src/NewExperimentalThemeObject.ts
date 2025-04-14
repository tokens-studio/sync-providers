import { type UsedTokenSetsMap } from "@tokens-studio/types";

export type NewExperimentalThemeOption = {
  name: string;
  selectedTokenSets: UsedTokenSetsMap;
};

export type NewExperimentalThemeObject = {
  id: string;
  name: string;
  $figmaCollectionId?: string;
  options: NewExperimentalThemeOption[];
  sourceCollections?: string[];
};
