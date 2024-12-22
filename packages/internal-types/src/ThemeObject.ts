export type ThemeObject = {
  id: string;
  name: string;
  $figmaCollectionId?: string;
  options: {
    name: string;
    selectedTokenSets: Record<string, string>;
  }[];
  sourceCollections?: string[];
};
