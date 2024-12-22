import type { TransformedToken } from "style-dictionary";
import { getInvalidFigmaVariableReason } from "../utils/figmaVariableValidation.js";

// Register a transform that adds if the token can be created as a figma variable or not
export const attributeInvalidForFigmaVariableReason = {
  name: "attribute/invalidForFigmaVariableReason",
  type: "attribute" as const,
  transform: (token: TransformedToken) => {
    if (typeof token.type === "string") {
      return {
        invalidForFigmaVariableReason: getInvalidFigmaVariableReason(
          token.type,
          token.value,
        ),
      };
    }
    return {
      invalidForFigmaVariableReason: undefined,
    };
  },
};
