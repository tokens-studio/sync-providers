import { type ThemeObject } from "@tokens-studio/internal-types";

export function getSourceCollectionKeys(themes: ThemeObject[]): string[] {
  return themes.reduce((acc, theme) => {
    if (theme.sourceCollections) {
      theme.sourceCollections.forEach((collectionId) => {
        const existingThemeGroup = themes.find(
          (theme) => theme.id === collectionId,
        );
        if (existingThemeGroup && existingThemeGroup.$figmaCollectionId) {
          acc.push(existingThemeGroup.$figmaCollectionId);
        }
      });
    }
    return acc;
  }, [] as string[]);
}
