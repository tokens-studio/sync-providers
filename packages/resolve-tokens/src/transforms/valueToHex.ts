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

    try {
      const color = new Color(token.value);
      // Convert to sRGB color space first, then to hex
      const srgbColor = color.to("srgb");
      return srgbColor.toString({ format: "hex" });
    } catch (error) {
      console.warn(
        `Error parsing color token "${token.name}" with value "${token.value}":`,
        error,
      );
      return token.value;
    }
  }
};
