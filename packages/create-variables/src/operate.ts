import type { ThemeObject } from "@tokens-studio/internal-types";
import type { SingleToken } from "@tokens-studio/types";
import { getSourceCollectionVariables } from "./utils/getSourceCollectionVariables.js";
import { createVariableCollectionWithModes } from "./createVariableCollectionWithModes.js";
import { getLocalVariables } from "./utils/getLocalVariables.js";
import { createTokensForCollectionMode } from "./createTokensForCollectionMode.js";

export let createdTokens: Record<string, Variable> = {};
export let updatedTokens: Record<string, Variable> = {};
export let localVariables: Map<string, Variable> = new Map();
export const variableIdToNameMap: Map<string, string> = new Map();

interface CollectionWithModes {
  collection: VariableCollection;
  modes: VariableMode[];
}

interface OperateResult {
  createdCount: number;
  updatedCount: number;
  totalOperationTime: number;
}

export async function operate(
  resolvedTokens: Record<string, SingleToken[]>,
  themes: ThemeObject[],
): Promise<OperateResult> {
  const startTotalOperation = Date.now();

  // Clear the tokens after operation
  createdTokens = {};
  updatedTokens = {};
  localVariables.clear();
  variableIdToNameMap.clear();

  const sourceCollectionVariables = await getSourceCollectionVariables(
    themes as unknown as ThemeObject[],
  );
  const localVariablesArray = await getLocalVariables();
  localVariables = new Map(
    localVariablesArray.map((v: Variable) => [
      `${v.name}-${v.variableCollectionId}`,
      v,
    ]),
  );

  for (const theme of themes) {
    await (async () => {
      const { collection, modes }: CollectionWithModes =
        await createVariableCollectionWithModes({
          collectionName: theme.name,
          modes: theme.options,
        });

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

      // IDEA:
      // Instead of doing all theme options in the first run, just do the first theme mode.
      // Then, in the second run, if its not a reference we set the value.
      for (const option of theme.options) {
        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];

        const modeToCreate = modes.find(
          (m: VariableMode) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        await createTokensForCollectionMode({
          collection,
          mode: modeToCreate,
          tokens: flatArrayOfTokensToCreate,
          shouldCreateAliases: false,
          availableSourceVariables: availableSourceVariablesForTheme,
        });
      }

      for (const option of theme.options) {
        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];

        const modeToCreate = modes.find(
          (m: VariableMode) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        await createTokensForCollectionMode({
          collection,
          mode: modeToCreate,
          tokens: flatArrayOfTokensToCreate,
          shouldCreateAliases: true,
          availableSourceVariables: availableSourceVariablesForTheme,
        });
      }
    })();
  }

  const endTotalOperation = Date.now();

  return {
    createdCount: Object.keys(createdTokens).length,
    updatedCount: Object.keys(updatedTokens).length,
    totalOperationTime: endTotalOperation - startTotalOperation,
  };
}
