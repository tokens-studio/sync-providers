export interface ThemeGroupOption {
  urn: string;
  name: string;
  selectedTokenSets: string; // TODO: Check if that's really the data we get instead of the map?
  figmaStyleReferences: string;
  figmaVariableReferences: string;
}
