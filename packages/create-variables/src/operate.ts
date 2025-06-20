import type { FlattenedNode, ThemeObject } from "@tokens-studio/internal-types";
import { getSourceCollectionVariables } from "./utils/getSourceCollectionVariables.js";
import { createVariableCollectionWithModes } from "./createVariableCollectionWithModes.js";
import { getLocalVariables } from "./utils/getLocalVariables.js";
import { createTokensForCollectionMode } from "./createTokensForCollectionMode.js";
import { normalizeTokenNameForFigma } from "./utils/normalizeTokenNameForFigma.js";
import { getAliasName } from "./utils/getAliasName.js";
import { normalizeTokenNameFromFigma } from "./utils/normalizeTokenNameFromFigma.js";
import { hasSameAttributes } from "./hasSameAttributes.js";

export let createdTokens: Record<string, Variable> = {};
export let updatedTokens: Record<string, Variable> = {};
export let localVariables: Map<string, Variable> = new Map();
export const variableIdToNameMap: Map<string, string> = new Map();

const filterTokensToCreate = (
  tokens: FlattenedNode[],
  themeKey: string,
  modeToCreate: { modeId: string },
  existingVars: Map<string, ExistingVariable>,
) => {
  return tokens.filter((token) => {
    const normalizedName = normalizeTokenNameForFigma(token.name);
    const key = `${themeKey}/${normalizedName}`;
    const existing = existingVars.get(key);

    if (
      !existing ||
      typeof existing.valuesByMode[modeToCreate.modeId] === "undefined"
    )
      return true; // Create or update token if we dont have a token or a value for this mode

    const existingValue = existing.valuesByMode[
      modeToCreate.modeId
    ] as VariableValue;
    return !hasSameAttributes({
      existing,
      newToken: token,
      existingValue,
    }); // Create if anything changed
  });
};

interface CollectionWithModes {
  collection: VariableCollection;
  modes: { modeId: string; name: string }[];
}

interface OperateResult {
  createdCount: number;
  updatedCount: number;
  totalOperationTime: number;
}

export interface ExistingVariable {
  id: string;
  value: any;
  valuesByMode: Record<string, VariableValue>;
  collection: string;
  mode: string;
  name: string;
  type: VariableResolvedDataType;
  description?: string;
  scopes: VariableScope[];
}

async function getExistingVariables(): Promise<Map<string, ExistingVariable>> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const existingVars = new Map<string, ExistingVariable>();

  for (const collection of collections) {
    const variablePromises = collection.variableIds.map((id) =>
      figma.variables.getVariableByIdAsync(id),
    );
    const variables = (await Promise.all(variablePromises)).filter(
      (v): v is Variable => v !== null,
    );

    // First populate variableIdToNameMap
    for (const variable of variables) {
      const normalizedName = normalizeTokenNameFromFigma(variable.name);
      const nameWithoutBrackets = getAliasName(normalizedName);
      variableIdToNameMap.set(variable.id, nameWithoutBrackets);
    }

    // Then store the variables with their values
    for (const variable of variables) {
      for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
        const mode = collection.modes.find((m) => m.modeId === modeId);
        if (!mode) continue;

        const key = `${collection.name}/${mode.name}/${variable.name}`;
        existingVars.set(key, {
          id: variable.id,
          value,
          valuesByMode: variable.valuesByMode,
          collection: collection.name,
          mode: mode.name,
          name: variable.name,
          type: variable.resolvedType,
          description: variable.description,
          scopes: variable.scopes,
        });
      }
    }
  }

  return existingVars;
}

export async function operate(
  resolvedTokens: Record<string, FlattenedNode[]>,
  themes: ThemeObject[],
): Promise<OperateResult> {
  const startTotalOperation = Date.now();

  // Clear the tokens after operation
  createdTokens = {};
  updatedTokens = {};
  localVariables.clear();
  variableIdToNameMap.clear();

  // Get existing variables for comparison
  const existingVars = await getExistingVariables();

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
              ? sourceCollectionVariables[figmaCollectionId].filter(
                  (v): v is Variable => v !== undefined,
                )
              : [];
          })
        : [];

      // First pass: Create non-alias tokens
      for (const option of theme.options) {
        const modeToCreate = modes.find(
          (m: { modeId: string; name: string }) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];
        const tokensToCreate = filterTokensToCreate(
          flatArrayOfTokensToCreate,
          `${theme.name}/${option.name}`,
          modeToCreate,
          existingVars,
        );

        if (tokensToCreate.length > 0) {
          await createTokensForCollectionMode({
            collection,
            mode: modeToCreate,
            tokens: tokensToCreate,
            shouldCreateAliases: false,
            availableSourceVariables: availableSourceVariablesForTheme,
          });
        }
      }

      // Second pass: Create alias tokens
      for (const option of theme.options) {
        const modeToCreate = modes.find(
          (m: { modeId: string; name: string }) => m.name === option.name,
        );
        if (!modeToCreate) {
          console.warn(`Mode not found for ${option.name}`);
          continue;
        }

        const flatArrayOfTokensToCreate =
          resolvedTokens[`${theme.name}/${option.name}`] || [];
        const tokensToCreate = filterTokensToCreate(
          flatArrayOfTokensToCreate,
          `${theme.name}/${option.name}`,
          modeToCreate,
          existingVars,
        );

        if (tokensToCreate.length > 0) {
          await createTokensForCollectionMode({
            collection,
            mode: modeToCreate,
            tokens: tokensToCreate,
            shouldCreateAliases: true,
            availableSourceVariables: availableSourceVariablesForTheme,
          });
        }
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
