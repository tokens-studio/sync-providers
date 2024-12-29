import type { FlattenedNode } from "../../internal-types/src/FlattenedNode.js";
import type { ExistingVariable } from "./operate.js";
import { areReferenceNamesEqual } from "./utils/areReferenceNamesEqual.js";
import { getAliasName } from "./utils/getAliasName.js";
import { normalizeFigmaColor } from "./utils/normalizeFigmaColor.js";
import { normalizeFigmaValue } from "./utils/normalizeFigmaValue.js";

export function compareValues(
  existing: ExistingVariable,
  newToken: FlattenedNode,
): boolean {
  let isSameValue = false;
  let isSameScopes = false;
  let isSameDescription = false;

  const rawValue = newToken.original.value;
  const type = newToken.original.type;
  const normalizedExisting = normalizeFigmaValue(existing.value, existing.type);
  const normalizedNew =
    type === "color" && typeof newToken.value === "object"
      ? normalizeFigmaColor(newToken.value)
      : newToken.value;

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
  // Check that description is the same
  isSameDescription = existing.description === newToken.description;

  // Check that all conditions are met for isSame (same value, )
  return isSameValue && isSameScopes && isSameDescription;
}
