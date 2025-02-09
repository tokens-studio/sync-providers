import type { TransformedToken } from "style-dictionary";

// Register a new transform to add isUsingPureReference property
// We need this to understand if we can create an alias inside design tools (as Figma only supports pure reference links)
export const attributeIsPureReference = {
  name: "attribute/isPureReference",
  type: "attribute" as const,
  transform: (token: TransformedToken) => {
    if (typeof token.original.value === "string") {
      const value = token.original.value.trim();
      const isPureReference =
        /^{[^{}]+}$/.test(value) &&
        !token.$extensions?.["studio.tokens"]?.modify;
      return {
        isUsingPureReference: isPureReference,
      };
    }
    return {};
  },
};
