import { createOrUpdateVariable } from "./createOrUpdateVariable.js";
import { normalizeTokenNameForFigma } from "./utils/normalizeTokenNameForFigma.js";
import { normalizeType } from "./utils/normalizeType.js";

export async function createVariableAlias({
  collection,
  modeId,
  key,
  valueKey,
  tokens,
}: {
  collection: VariableCollection;
  modeId: string;
  key: string;
  valueKey: string;
  tokens: Record<string, any>;
}) {
  const token = tokens[valueKey];
  return await createOrUpdateVariable({
    collection,
    modeId,
    type: normalizeType(token.resolvedType),
    name: normalizeTokenNameForFigma(key),
    value: {
      type: "VARIABLE_ALIAS",
      id: `${token.id}`,
    },
    description: token.description,
  });
}
