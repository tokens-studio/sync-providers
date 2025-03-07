import type { DesignToken } from "style-dictionary/types";
import { isNumberWeight } from "./isNumberWeight.js";
import type { VariableResolvedDataType } from "@figma/plugin-typings/plugin-api-standalone.d.ts";

export function getFigmaTypeForTokenType(
  token: DesignToken,
): VariableResolvedDataType {
  if (!token.type) throw new Error("Token type is required");

  // Special case for font weight
  if (token.type === "fontWeight") {
    return isNumberWeight(token.original?.value) ? "FLOAT" : "STRING";
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
    case "number":
      return "FLOAT";
    case "fontfamily":
    case "fontweight":
    case "textalign":
    case "textdecoration":
    case "texttransform":
    case "text":
      return "STRING";
    case "boolean":
      return "BOOLEAN";
    default:
      return "STRING";
  }
}
