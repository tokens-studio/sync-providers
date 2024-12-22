import { variableIdToNameMap } from "./operate.js";
import { createOrUpdateVariable } from "./createOrUpdateVariable.js";
import { createVariableAlias } from "./createVariableAlias.js";
import { type FlattenedNode } from "@tokens-studio/internal-types";
import { generateReferenceableVariables } from "./generateReferenceableVariables.js";
import { getAliasName } from "./utils/getAliasName.js";
import { getResolvedValue } from "./utils/getResolvedValue.js";
import { normalizeTokenNameForFigma } from "./utils/normalizeTokenNameForFigma.js";
import { normalizeTokenNameFromFigma } from "./utils/normalizeTokenNameFromFigma.js";
import { usesReferences } from "./utils/usesReferences.js";

export async function createTokensForCollectionMode({
  collection,
  mode,
  tokens,
  shouldCreateAliases = false,
  availableSourceVariables = [],
}: {
  collection: VariableCollection;
  mode: { modeId: string; name: string };
  tokens: FlattenedNode[];
  shouldCreateAliases?: boolean;
  availableSourceVariables?: Variable[];
}): Promise<Record<string, Variable>> {
  // Generate referenceable variables from the local variables and the source ones
  const possibleAliasTokens: Record<string, Variable> =
    await generateReferenceableVariables(
      collection.variableIds,
      availableSourceVariables,
    );
  for (const [name, variable] of Object.entries(possibleAliasTokens)) {
    variableIdToNameMap.set(variable.id, name);
  }

  // First pass: Create all variables with default values
  const BATCH_SIZE = 100;
  const SLEEP_DURATION = 10; // milliseconds

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (node) => {
        const nodeValue = node.original.value;
        // If we're dealing with a reference, we'll use the possibleAliasTokens to resolve it.
        // This helps us get the resolved value that we can use to create the variable.
        const foundAlias = usesReferences(nodeValue)
          ? possibleAliasTokens[getAliasName(nodeValue)]
          : undefined;
        const resolvedValue = getResolvedValue({
          alias: foundAlias,
          resolvedValue: node.value,
          modeId: mode.modeId,
        });

        const updatedVariable = await createOrUpdateVariable({
          collection,
          modeId: mode.modeId,
          type: node.attributes.figmaType,
          name: normalizeTokenNameForFigma(node.name),
          value: resolvedValue,
          rawValue: getAliasName(nodeValue),
          scopes: node.attributes?.figmaScopes,
        });
        if (updatedVariable) {
          possibleAliasTokens[node.name] = updatedVariable;
        }
      }),
    );
    console.log(
      `Processed first pass batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(tokens.length / BATCH_SIZE)}`,
    );
    await new Promise((resolve) => setTimeout(resolve, SLEEP_DURATION));
  }

  // Only populate with aliases if we're in the second step.
  if (shouldCreateAliases) {
    // Second pass: Set correct values and create aliases
    const batchOperations = [];
    for (const node of tokens) {
      const nodeValue = node.original.value;
      if (usesReferences(nodeValue)) {
        const referenceName = getAliasName(nodeValue);
        const foundReference =
          possibleAliasTokens[referenceName] ||
          availableSourceVariables.find(
            (v) => normalizeTokenNameFromFigma(v.name) === referenceName,
          );

        if (foundReference) {
          batchOperations.push({
            collection,
            modeId: mode.modeId,
            key: node.name,
            valueKey: referenceName,
            tokens: possibleAliasTokens,
          });
        } else {
          console.warn(
            `Alias target not found for ${node.name}: ${referenceName}`,
          );
        }
      }
    }

    // Process in larger batches
    for (let i = 0; i < batchOperations.length; i += BATCH_SIZE) {
      const batch = batchOperations.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((op) => createVariableAlias(op).then(() => {})),
      );
      console.log(
        `Processed second pass batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(batchOperations.length / BATCH_SIZE)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, SLEEP_DURATION));
    }
  }
  return possibleAliasTokens;
}
