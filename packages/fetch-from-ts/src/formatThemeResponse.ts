import { NewExperimentalThemeObject } from "../../types/NewExperimentalThemeObject";

interface ThemeGroupOption {
  urn: string;
  name: string;
  selectedTokenSets: string;
  figmaStyleReferences: string;
  figmaVariableReferences: string;
}

interface ThemeGroup {
  urn: string;
  name: string;
  options: ThemeGroupOption[];
}

export function formatThemeResponse(
  themeGroups: ThemeGroup[],
): NewExperimentalThemeObject[] {
  return themeGroups.map((group) => ({
    id: group.urn,
    name: group.name,
    options: group.options.map((option) => ({
      name: option.name,
      selectedTokenSets: JSON.parse(JSON.parse(option.selectedTokenSets)),
    })),
  }));
}
