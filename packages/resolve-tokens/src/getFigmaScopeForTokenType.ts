import type { DesignToken } from "style-dictionary/types";

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
    case "spacing":
      return {
        scopes: ["GAP", "PADDING"],
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
      return {
        scopes: ["FONT_FAMILY"],
      };
    case "fontweight":
      return {
        scopes: ["FONT_WEIGHT"],
      };
    case "textalign":
    case "textdecoration":
    case "texttransform":
      return {
        scopes: ["TEXT"],
      };
    default:
      return {
        scopes: ["ALL_SCOPES"],
      };
  }
}
