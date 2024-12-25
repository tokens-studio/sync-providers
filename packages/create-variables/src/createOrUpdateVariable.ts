import { areReferenceNamesEqual } from "./utils/areReferenceNamesEqual.js";
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
  rawValue,
  scopes = ["ALL_SCOPES"],
}: {
  collection: VariableCollection;
  modeId: string;
  type: VariableResolvedDataType;
  name: string;
  value: any;
  rawValue: string;
  scopes?: VariableScope[];
}) {
  const variableName = normalizeTokenNameForFigma(name);
  const key = `${variableName}-${collection.id}`;

  let variable = createdTokens[variableName] || localVariables.get(key);

  if (variable && variable.valuesByMode[modeId]) {
    const existingValue = normalizeFigmaValue(
      variable.valuesByMode[modeId],
      type,
    );
    const newValue = normalizeFigmaValue(value, type);
    if (
      JSON.stringify(existingValue) !== JSON.stringify(newValue) &&
      !areReferenceNamesEqual(existingValue, rawValue)
    ) {
      try {
        variable.setValueForMode(modeId, newValue);
        variable.scopes = scopes;
      } catch (e) {
        console.error(name, e, variable, modeId, value, newValue);
      }
      updatedTokens[name] = variable;
    }
  } else {
    try {
      variable = await createVariable({ name: variableName, collection, type });
      if (variable) {
        createdTokens[name] = variable;
        variable.setValueForMode(modeId, value);
        variable.scopes = scopes;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return variable;
}
