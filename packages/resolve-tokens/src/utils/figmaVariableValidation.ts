import { parseColor } from "../parseColor.js";

export const excludedTypes = [
  "composition",
  "shadow",
  "border",
  "typography",
  "asset",
] as const;

export const isGradient = (value: unknown): boolean => {
  return typeof value === "string" && value.startsWith("linear-gradient");
};

export const isCssVariable = (value: unknown): boolean => {
  return typeof value === "string" && value.startsWith("var(");
};

export const isMultiValueDimension = (
  type: string,
  value: unknown,
): boolean => {
  return (
    type === "dimension" && typeof value === "string" && value.includes(" ")
  );
};

export const isInvalidColorValue = (value: string) => {
  try {
    parseColor(value);
    return false;
  } catch (_e) {
    return true;
  }
};

export const getInvalidFigmaVariableReason = (
  type: string,
  value: unknown,
): string | undefined => {
  if (excludedTypes.includes(type as any)) {
    return `Type '${type}' is not supported in Figma variables`;
  }

  if (isGradient(value)) {
    return "Gradient values are not supported in Figma variables";
  }

  if (type === "color" && isCssVariable(value)) {
    return "CSS variable values are not supported for color tokens in Figma variables";
  }

  if (
    type === "color" &&
    typeof value === "string" &&
    isInvalidColorValue(value)
  ) {
    return "Invalid color value";
  }

  if (isMultiValueDimension(type, value)) {
    return "Multi-value dimension tokens are not supported in Figma variables";
  }

  return undefined;
};
