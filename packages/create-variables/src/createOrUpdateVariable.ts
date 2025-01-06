import { localVariables, createdTokens, updatedTokens } from "./operate.js";
import { createVariable } from "./createVariable.js";
import { normalizeFigmaValue } from "./utils/normalizeFigmaValue.js";
import { normalizeTokenNameForFigma } from "./utils/normalizeTokenNameForFigma.js";

export async function createOrUpdateVariable({
  collection,
  modeId,
  type,
  name,
  value,
  scopes,
  description,
}: {
  collection: VariableCollection;
  modeId: string;
  type: VariableResolvedDataType;
  name: string;
  value: any;
  scopes?: VariableScope[];
  description?: string;
}) {
  const variableName = normalizeTokenNameForFigma(name);
  const key = `${variableName}-${collection.id}`;

  let variable = createdTokens[variableName] || localVariables.get(key);

  if (variable) {
    const newValue = normalizeFigmaValue(value, type);

    try {
      variable.setValueForMode(modeId, newValue);
      if (scopes) variable.scopes = scopes;
    } catch (e) {
      console.error(name, e, variable, modeId, value, newValue);
    }
    updatedTokens[name] = variable;
  } else {
    try {
      variable = await createVariable({ name: variableName, collection, type });
      if (variable) {
        createdTokens[name] = variable;
        variable.setValueForMode(modeId, value);
        if (scopes) variable.scopes = scopes;
        if (description) {
          variable.description = description;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return variable;
}
