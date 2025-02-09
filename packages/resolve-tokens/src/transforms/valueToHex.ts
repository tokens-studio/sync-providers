import type { TransformedToken } from "style-dictionary";
import Color from "colorjs.io";

// Register a new transform to convert units to pure numbers
// Figma doesnt know units, just numbers. So we expect that they're 16px (but technically we should support a dynamic base font size via a token and resolving)
export const valueToHex = {
  name: "color/valueToHex",
  type: "value" as const,
  transitive: true,
  transform: (token: TransformedToken) => {
    if (token.type !== "color") return token.value;
    let transformedColor = token.value;
    try {
      transformedColor = new Color(token.value).toString({ format: "hex" });
    } catch (e) {
      console.warn(`Error parsing ${token.name} with value ${token.value}`);
    }
    return transformedColor;
  },
};
