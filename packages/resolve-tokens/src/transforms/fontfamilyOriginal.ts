import type { TransformedToken } from "style-dictionary";

// Register a transform that adds the specific Figma type and its scoping
export const fontfamilyOriginal = {
  name: "fontfamily/original",
  type: "value" as const,
  transitive: true,
  filter: (token: TransformedToken) => token.type === "fontFamily",
  transform: (token: TransformedToken) => {
    if (typeof token.value === 'string') {
      // Remove single or double quotes if present
      return token.value.replace(/^['"](.+)['"]$/, '$1');
    }
    return token.value;
  },
};
