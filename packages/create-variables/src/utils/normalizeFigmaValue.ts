import { normalizeFigmaColor } from "./normalizeFigmaColor.js";

export function normalizeFigmaValue(
  value: VariableValue,
  type: VariableResolvedDataType,
): VariableValue {
  if (
    typeof value === "object" &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  ) {
    return {
      type: "VARIABLE_ALIAS",
      id: value.id,
    };
  }

  const roundToSixDecimals = (num: number) =>
    Math.round(num * 1000000) / 1000000;

  if (!isNaN(Number(value))) {
    return roundToSixDecimals(Number(value));
  }

  // Figma returns colors with quite a few decimals, so we need to round them to a normalized value
  if (type === "COLOR") {
    return normalizeFigmaColor(
      value as { r: number; g: number; b: number; a: number },
    );
  }
  return value;
}
