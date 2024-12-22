import { variableIdToNameMap } from "../operate.js";

export function areReferenceNamesEqual(
  existingValue: VariableValue,
  rawValue: string,
) {
  if (
    typeof existingValue === "object" &&
    "type" in existingValue &&
    existingValue.type === "VARIABLE_ALIAS"
  ) {
    return variableIdToNameMap.get(existingValue.id) === rawValue;
  }
  return false;
}
