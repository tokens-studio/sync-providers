import type { TransformedToken } from "style-dictionary";
import { getFigmaTypeForTokenType } from "../utils/getFigmaTypeForTokenType.js";
import { getFigmaScopeForTokenType } from "../utils/getFigmaScopeForTokenType.js";

// Register a transform that adds the specific Figma type and its scoping
export const attributeFigmaTypeAndScope = {
  name: "attribute/figmaTypeAndScope",
  type: "attribute" as const,
  transform: (token: TransformedToken) => {
    return {
      figmaType: getFigmaTypeForTokenType(token),
      figmaScope: getFigmaScopeForTokenType(token),
    };
  },
};
