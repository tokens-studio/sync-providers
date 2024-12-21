import type { DesignToken } from "style-dictionary/types";

export function getFigmaTypeForTokenType(
  token: DesignToken,
): VariableResolvedDataType {
  if (!token.type) throw new Error("Token type is required");

  if (token.type === "fontWeight" && typeof token.value === "string") {
    return "STRING";
  } else if (token.type === "fontWeight" && typeof token.value === "number") {
    return "FLOAT";
  }

  switch (token.type?.toLowerCase()) {
    case "color":
      return "COLOR";
    case "borderradius":
    case "spacing":
    case "sizing":
    case "opacity":
    case "fontsize":
    case "lineheight":
    case "letterspacing":
    case "paragraphspacing":
    case "dimension":
      return "FLOAT";
    case "fontfamily":
    case "fontweight":
    case "textalign":
    case "textdecoration":
    case "texttransform":
      return "STRING";
    case "boolean":
      return "BOOLEAN";
    default:
      return "STRING";
  }
}
