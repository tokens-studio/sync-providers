import type { DesignToken } from "style-dictionary/types";
import { isNumberWeight } from "./utils/isNumberWeight.js";

export function getFigmaScopeForTokenType(token: DesignToken): VariableScope {
  const type = token.$extensions?.["studio.tokens"]?.originalType || token.type;
  if (!type) throw new Error("Token type is required");

  switch (type.toLowerCase()) {
    case "color":
      return {
        scopes: ["ALL_SCOPES"],
      };
    case "borderradius":
      return {
        scopes: ["CORNER_RADIUS"],
      };
    case "borderwidth":
      return {
        scopes: ["STROKE_FLOAT"],
      };
    case "spacing":
      return {
        scopes: ["GAP"],
      };
    case "sizing":
      return {
        scopes: ["WIDTH_HEIGHT"],
      };
    case "opacity":
      return {
        scopes: ["OPACITY"],
      };
    case "fontsize":
      return {
        scopes: ["FONT_SIZE"],
      };
    case "lineheight":
    case "lineheights":
      return {
        scopes: ["LINE_HEIGHT"],
      };
    case "letterspacing":
      return {
        scopes: ["LETTER_SPACING"],
      };
    case "paragraphspacing":
      return {
        scopes: ["PARAGRAPH_SPACING"],
      };
    case "fontfamily":
    case "fontfamilies":
      return {
        scopes: ["FONT_FAMILY"],
      };
    case "fontweight":
    case "fontweights":
      return {
        scopes: isNumberWeight(token.original?.value)
          ? ["FONT_WEIGHT"]
          : ["FONT_STYLE"],
      };
    case "text":
      return {
        scopes: ["TEXT_CONTENT"],
      };
    default:
      return {
        scopes: ["ALL_SCOPES"],
      };
  }
}
