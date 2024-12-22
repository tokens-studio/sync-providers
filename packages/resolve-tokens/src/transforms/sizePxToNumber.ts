import type { TransformedToken } from "style-dictionary";

// Register a new transform to convert units to pure numbers
// Figma doesnt know units, just numbers. So we expect that they're 16px (but technically we should support a dynamic base font size via a token and resolving)
export const sizePxToNumber = {
  name: "size/pxToNumber",
  type: "value" as const,
  transitive: true,
  transform: (token: TransformedToken) => {
    const value = token.value;
    if (typeof value === "string") {
      if (value.endsWith("px")) {
        return parseFloat(value);
      } else if (value.endsWith("rem")) {
        // Assuming 1rem = 16px
        return parseFloat(value) * 16;
      } else if (value.endsWith("em")) {
        // Assuming 1em = 16px, same as rem
        return parseFloat(value) * 16;
      }
    }
    return value;
  },
};
