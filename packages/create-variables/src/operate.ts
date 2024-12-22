import type { ThemeObject } from "@tokens-studio/internal-types";
import type { SingleToken } from "@tokens-studio/types";
import { getSourceCollectionVariables } from "./utils/getSourceCollectionVariables.js";
import { createVariableCollectionWithModes } from "./createVariableCollectionWithModes.js";
import { getLocalVariables } from "./utils/getLocalVariables.js";
import { createTokensForCollectionMode } from "./createTokensForCollectionMode.js";

export const createdTokens: Record<string, Variable> = {};
export const updatedTokens: Record<string, Variable> = {};
export let localVariables: Map<string, Variable> = new Map();
export const variableIdToNameMap: Map<string, string> = new Map();

interface CollectionWithModes {
  collection: VariableCollection;
  modes: VariableMode[];
}

export async function operate(
  resolvedTokens: Record<string, SingleToken[]>,
  themes: ThemeObject[],
) {
  console.log("operate", resolvedTokens, themes);
  const startTotalOperation = Date.now();

  const startSourceCollectionVariables = Date.now();
  const sourceCollectionVariables = await getSourceCollectionVariables(
    themes as unknown as ThemeObject[],
  );
  console.log(
    `Get source collection variables: ${Date.now() - startSourceCollectionVariables}ms`,
  );

  const startLocalVariables = Date.now();
  const localVariablesArray = await getLocalVariables();
  localVariables = new Map(
    localVariablesArray.map((v: Variable) => [
      `${v.name}-${v.variableCollectionId}`,
      v,
    ]),
  );
  console.log(`Get local variables: ${Date.now() - startLocalVariables}ms`);

  for (const theme of themes) {
    const startTheme = Date.now();
    await (async () => {
      const startCreateCollection = Date.now();
      const { collection, modes }: CollectionWithModes =
        await createVariableCollectionWithModes({
          collectionName: theme.name,
          modes: theme.options,
        });
      console.log("collection", collection, modes);
      console.log(
        `Create variable collection with modes: ${Date.now() - startCreateCollection}ms`,
      );

      const startSourceVariables = Date.now();
      const availableSourceVariablesForTheme = theme.sourceCollections
        ? theme.sourceCollections.flatMap((collectionId) => {
            const existingThemeGroup = themes.find(
              (t) => t.id === collectionId,
            );
            const figmaCollectionId = existingThemeGroup?.$figmaCollectionId;
            return figmaCollectionId &&
              sourceCollectionVariables[figmaCollectionId]
              ? sourceCollectionVariables[figmaCollectionId]
              : [];
          })
        : [];
      console.log(
        `Get available source variables for theme: ${Date.now() - startSourceVariables}ms`,
      );

      // IDEA:
      // Instead of doing all theme options in the first run, just do the first theme mode.
      // Then, in the second run, if its not a reference we set the value.
      for (const option of theme.options) {
        const startFirstRun = Date.now();
        console.log("starting first run for option", option.name);

        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];
        console.log("flatArrayOfTokensToCreate", flatArrayOfTokensToCreate);

        const modeToCreate = modes.find(
          (m: VariableMode) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        console.log(
          "modeToCreate",
          modeToCreate,
          option.name,
          flatArrayOfTokensToCreate,
        );

        const startCreateTokens = Date.now();
        await createTokensForCollectionMode({
          collection,
          mode: modeToCreate,
          tokens: flatArrayOfTokensToCreate,
          shouldCreateAliases: false,
          availableSourceVariables: availableSourceVariablesForTheme,
        });
        console.log(
          `Create tokens for collection mode (first pass): ${Date.now() - startCreateTokens}ms`,
        );
        console.log(
          `First run for option ${option.name}: ${Date.now() - startFirstRun}ms`,
        );
      }

      for (const option of theme.options) {
        const startSecondRun = Date.now();

        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];

        const modeToCreate = modes.find(
          (m: VariableMode) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        console.log("starting second run for option", option.name);

        const startCreateTokens = Date.now();
        await createTokensForCollectionMode({
          collection,
          mode: modeToCreate,
          tokens: flatArrayOfTokensToCreate,
          shouldCreateAliases: true,
          availableSourceVariables: availableSourceVariablesForTheme,
        });
        console.log(
          `Create tokens for collection mode (second pass): ${Date.now() - startCreateTokens}ms`,
        );
        console.log(
          `Second run for option ${option.name}: ${Date.now() - startSecondRun}ms`,
        );
      }
    })();
    console.log(`Theme ${theme.name}: ${Date.now() - startTheme}ms`);
  }
  console.log(`Total operation: ${Date.now() - startTotalOperation}ms`);
}
