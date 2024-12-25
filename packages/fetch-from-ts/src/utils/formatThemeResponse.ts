import type { NewExperimentalThemeObject } from "@repo/types/NewExperimentalThemeObject.js";
import type { ThemeGroup } from "@tokens-studio/internal-types.js";

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
