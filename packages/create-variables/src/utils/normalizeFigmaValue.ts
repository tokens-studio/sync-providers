import { normalizeFigmaColor } from "./normalizeFigmaColor.js";

const roundToSixDecimals = (num: number) => Math.round(num * 1000000) / 1000000;

export function normalizeFigmaValue(
  value: VariableValue,
  type?: VariableResolvedDataType,
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

  // Figma returns colors with quite a few decimals, so we need to round them to a normalized value
  if (type === "COLOR") {
    return normalizeFigmaColor(
      value as { r: number; g: number; b: number; a: number },
    );
  }

  // Handle numeric values (FLOAT, etc)
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(Number(value)))
  ) {
    return roundToSixDecimals(Number(value));
  }

  return value;
}
