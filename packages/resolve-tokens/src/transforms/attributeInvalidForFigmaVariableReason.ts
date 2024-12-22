import type { TransformedToken } from "style-dictionary";

// Register a transform that adds if the token can be created as a figma variable or not
export const attributeInvalidForFigmaVariableReason = {
  name: "attribute/invalidForFigmaVariableReason",
  type: "attribute" as const,
  transform: (token: TransformedToken) => {
    if (typeof token.type === "string") {
      const type = token.type;
      const excludedTypes = [
        "composition",
        "shadow",
        "border",
        "typography",
        "asset",
      ];

      const isGradient =
        typeof token.value === "string" &&
        token.value?.startsWith("linear-gradient");
      const isMultiValueBorderRadius =
        type === "border" &&
        typeof token.value === "string" &&
        token.value.includes(" ");

      let reason: string | undefined = undefined;
      if (excludedTypes.includes(type)) {
        reason = `Type '${type}' is not supported in Figma variables`;
      } else if (isGradient) {
        reason = "Gradient values are not supported in Figma variables";
      } else if (isMultiValueBorderRadius) {
        reason =
          "Multi-value border radius is not supported in Figma variables";
      }

      return {
        invalidForFigmaVariableReason: reason,
      };
    }
    return {
      invalidForFigmaVariableReason: undefined,
    };
  },
};
