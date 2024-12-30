import type { FlattenedNode } from "@tokens-studio/internal-types";
import type { ExistingVariable } from "./operate.js";
import { areReferenceNamesEqual } from "./utils/areReferenceNamesEqual.js";
import { getAliasName } from "./utils/getAliasName.js";
import { normalizeFigmaColor } from "./utils/normalizeFigmaColor.js";
import { normalizeFigmaValue } from "./utils/normalizeFigmaValue.js";

export function hasSameAttributes({
  existing,
  newToken,
  existingValue,
}: {
  existing: ExistingVariable;
  newToken: FlattenedNode;
  existingValue: VariableValue;
}): boolean {
  let isSameValue = false;
  let isSameScopes = false;
  let isSameDescription = false;

  const rawValue = newToken.original.value;
  const type = newToken.original.type;
  const normalizedExisting = normalizeFigmaValue(existingValue, existing.type);
  const normalizedNew =
    type === "color" && typeof newToken.value === "object"
      ? normalizeFigmaColor(newToken.value)
      : normalizeFigmaValue(newToken.value);

  isSameValue =
    JSON.stringify(normalizedExisting) === JSON.stringify(normalizedNew);

  // Check if the new value is a reference to the existing value and if so, if the reference is the same token name
  if (
    rawValue &&
    areReferenceNamesEqual(normalizedExisting, getAliasName(rawValue))
  ) {
    isSameValue = true;
  }
  // Check that scopes are the same
  isSameScopes = existing.scopes.every((scope) =>
    newToken.attributes.figmaScopes?.includes(scope),
  );
  // Check that description is the same, Figma trims the \n at the end, so we do that too
  isSameDescription =
    (existing.description?.trim() || "") ===
      (newToken.description?.trim() || "") ||
    (existing.description === "" && newToken.description === null);

  const isSame = isSameValue && isSameScopes && isSameDescription;

  return isSame;
}
