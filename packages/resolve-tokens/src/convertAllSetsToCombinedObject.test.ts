import { describe, it, expect } from "vitest";
import { convertAllSetsToCombinedObject } from "./convertAllSetsToCombinedObject.js";
import * as contrastMedium from "../../sets/contrastMedium.json";
import * as contrastHigh from "../../sets/contrastHigh.json";
import * as contrastLow from "../../sets/contrastLow.json";
import * as platformMicrosoft from "../../sets/platformMicrosoft.json";
import * as platformXbox from "../../sets/platformXbox.json";
import * as primitives from "../../sets/primitives.json";
import * as references from "../../sets/references.json";
import { DesignTokens } from "style-dictionary/types";

const tokenSets: Record<string, DesignTokens> = {
  references: references as unknown as DesignTokens,
  primitives: primitives as unknown as DesignTokens,
  contrastHigh: contrastHigh as unknown as DesignTokens,
  contrastMedium: contrastMedium as unknown as DesignTokens,
  contrastLow: contrastLow as unknown as DesignTokens,
  platformMicrosoft: platformMicrosoft as unknown as DesignTokens,
  platformXbox: platformXbox as unknown as DesignTokens,
};

describe("convertAllSetsToArray", () => {
  it("should process all token sets and return arrays for each set with expected lengths", async () => {
    const result = await convertAllSetsToCombinedObject(tokenSets);

    expect(result).toBeTruthy();
    expect(typeof result).toBe("object");

    const expectedSets = {
      references: 2000,
      primitives: 2000,
      contrastHigh: 26,
      contrastMedium: 12,
      contrastLow: 12,
      platformMicrosoft: 6,
      platformXbox: 6,
    };

    for (const [setName, expectedLength] of Object.entries(expectedSets)) {
      expect(result).toHaveProperty(setName);
      expect(Array.isArray(result[setName])).toBe(true);
      expect(result[setName]).toHaveLength(expectedLength);
    }
  });

  it("should generate merged tokens for each theme option", async () => {
    const tokenSets: Record<string, DesignTokens> = {
      primitives: {
        color: {
          gray: {
            100: { $value: "#000000", $type: "color" },
            900: { $value: "#FFFFFF", $type: "color" },
          },
        },
      },
      "mode/light": {
        color: {
          background: {
            primary: { $value: "#FFFFFF", $type: "color" },
            secondary: { $value: "#F0F0F0", $type: "color" },
          },
        },
      },
      "mode/dark": {
        color: {
          background: {
            primary: { $value: "#000000", $type: "color" },
            secondary: { $value: "#1A1A1A", $type: "color" },
          },
        },
      },
      components: {
        button: {
          background: { $value: "#000000", $type: "color" },
          foreground: { $value: "#FFFFFF", $type: "color" },
        },
      },
    };

    const expectedTokenSetArrays = {
      "mode/light": [
        { name: "color.background.primary", value: "#FFFFFF", type: "color" },
        { name: "color.background.secondary", value: "#F0F0F0", type: "color" },
      ],
      "mode/dark": [
        { name: "color.background.primary", value: "#000000", type: "color" },
        { name: "color.background.secondary", value: "#1A1A1A", type: "color" },
      ],
      primitives: [
        { name: "color.gray.100", value: "#000000", type: "color" },
        { name: "color.gray.900", value: "#FFFFFF", type: "color" },
      ],
      components: [
        { name: "button.background", value: "#000000", type: "color" },
        { name: "button.foreground", value: "#FFFFFF", type: "color" },
      ],
    };

    const tokenSetArrays = await convertAllSetsToCombinedObject(tokenSets);
    expect(tokenSetArrays).toEqual(expectedTokenSetArrays);
  });
});
