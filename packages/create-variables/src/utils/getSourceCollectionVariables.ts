import { getSourceCollectionKeys } from "./getSourceCollectionKeys.js";
import { type ThemeObject } from "@tokens-studio/internal-types";

export async function getSourceCollectionVariables(themes: ThemeObject[]) {
  // This is a list of all the source collection keys that are being used in the themes.
  // We need to fetch these collections and resolve the variables so we can use them in the theme.
  const allUniqueSourceCollectionKeys = getSourceCollectionKeys(
    themes as unknown as ThemeObject[],
  );

  const resolvedVariableCache: Record<string, Variable> = {};

  return Promise.all(
    allUniqueSourceCollectionKeys.map(async (collectionKey) => {
      const sourceCollectionVariables =
        await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
          collectionKey,
        );

      // This step is potentially costly. We should maybe only do it for the references that are actually being used, and not for all.
      // E.g. on demand resolve and add to a cache
      const resolvedSourceCollectionVariables = await Promise.all(
        sourceCollectionVariables.map(async (variable) => {
          if (resolvedVariableCache[variable.key]) {
            return resolvedVariableCache[variable.key];
          }
          const resolvedVariable =
            await figma.variables.importVariableByKeyAsync(variable.key);
          resolvedVariableCache[variable.key] = resolvedVariable;
          return resolvedVariable;
        }),
      );
      return { [collectionKey]: resolvedSourceCollectionVariables };
    }),
  ).then((results) =>
    results.reduce((acc, result) => ({ ...acc, ...result }), {}),
  );
}
