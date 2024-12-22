import type { DesignToken } from "style-dictionary/types";
import { isNumberWeight } from "./isNumberWeight.js";
import type { VariableScope } from "@figma/plugin-typings/plugin-api-standalone.d.ts";

export function getFigmaScopeForTokenType(token: DesignToken): VariableScope[] {
  const type = token.$extensions?.["studio.tokens"]?.originalType || token.type;
  if (!type) throw new Error("Token type is required");

  switch (type.toLowerCase()) {
    case "color":
      return ["ALL_SCOPES"];
    case "borderradius":
      return ["CORNER_RADIUS"];
    case "borderwidth":
      return ["STROKE_FLOAT"];
    case "spacing":
      return ["GAP"];
    case "sizing":
      return ["WIDTH_HEIGHT"];
    case "opacity":
      return ["OPACITY"];
    case "fontsize":
      return ["FONT_SIZE"];
    case "lineheight":
    case "lineheights":
      return ["LINE_HEIGHT"];
    case "letterspacing":
      return ["LETTER_SPACING"];
    case "paragraphspacing":
      return ["PARAGRAPH_SPACING"];
    case "fontfamily":
    case "fontfamilies":
      return ["FONT_FAMILY"];
    case "fontweight":
    case "fontweights":
      return isNumberWeight(token.original?.value)
        ? ["FONT_WEIGHT"]
        : ["FONT_STYLE"];
    case "text":
      return ["TEXT_CONTENT"];
    default:
      return ["ALL_SCOPES"];
  }
}
