import type { FlattenedNode } from "@tokens-studio/internal-types";
import type { ExistingVariable } from "./operate.js";
import { areReferenceNamesEqual } from "./utils/areReferenceNamesEqual.js";
import { getAliasName } from "./utils/getAliasName.js";
import { normalizeFigmaColor } from "./utils/normalizeFigmaColor.js";
import { normalizeFigmaValue } from "./utils/normalizeFigmaValue.js";
import { usesReferences } from "./utils/usesReferences.js";

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

  // Check if the existing value is a reference
  const isExistingReference =
    typeof normalizedExisting === "object" &&
    normalizedExisting !== null &&
    "type" in normalizedExisting &&
    normalizedExisting.type === "VARIABLE_ALIAS";

  // Check if the new value should be a reference
  const shouldBeReference = usesReferences(rawValue);

  // If one is a reference and the other isn't, they're not the same
  // This ensures we update when changing from raw value to reference or vice versa
  if (isExistingReference !== shouldBeReference) {
    return false;
  }

  // If both are references, check if they reference the same variable
  if (isExistingReference && shouldBeReference) {
    isSameValue = areReferenceNamesEqual(
      normalizedExisting,
      getAliasName(rawValue),
    );
  } else {
    // If neither are references, compare the actual values
    isSameValue =
      JSON.stringify(normalizedExisting) === JSON.stringify(normalizedNew);
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
