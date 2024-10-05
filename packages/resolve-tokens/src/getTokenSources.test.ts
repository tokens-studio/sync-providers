import { DesignTokens } from "style-dictionary/types";
import { TokenSetStatus } from "@tokens-studio/types";
import { mergeTokenGroups } from "./mergeTokenGroups.js";
import { convertAllSetsToCombinedObject } from "./convertAllSetsToCombinedObject.js";
import { describe, beforeEach, it, expect } from "vitest";

const tokenSets: Record<string, DesignTokens> = {
  highContrast: {
    color: {
      background: {
        primary: { $value: "#FF0000", $type: "color" },
        secondary: { $value: "#0000FF", $type: "color" },
      },
    },
  },
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
  typography: {
    heading: {
      fontFamily: { $value: "Arial", $type: "fontFamily" },
      fontSize: { $value: "24px", $type: "dimension" },
    },
  },
};

describe("mergeTokenGroups", () => {
  let tokenSetArrays: Awaited<
    ReturnType<typeof convertAllSetsToCombinedObject>
  >;

  beforeEach(async () => {
    tokenSetArrays = await convertAllSetsToCombinedObject(tokenSets);
  });

  it("should generate merged tokens for each theme option", async () => {
    const expectedMergedTokens = [
      {
        internal__Parent: "mode/light",
        type: "color",
        name: "color.background.primary",
        value: "#FFFFFF",
      },
      {
        internal__Parent: "mode/light",
        type: "color",
        name: "color.background.secondary",
        value: "#F0F0F0",
      },
      {
        internal__Parent: "primitives",
        type: "color",
        name: "color.gray.100",
        value: "#000000",
      },
      {
        internal__Parent: "primitives",
        type: "color",
        name: "color.gray.900",
        value: "#FFFFFF",
      },
      {
        internal__Parent: "components",
        type: "color",
        name: "button.background",
        value: "#000000",
      },
      {
        internal__Parent: "components",
        type: "color",
        name: "button.foreground",
        value: "#FFFFFF",
      },
      {
        internal__Parent: "typography",
        type: "fontFamily",
        name: "heading.fontFamily",
        value: "Arial",
      },
      {
        internal__Parent: "typography",
        type: "dimension",
        name: "heading.fontSize",
        value: "24px",
      },
    ];

    const result = await mergeTokenGroups(tokenSetArrays, {
      "mode/light": TokenSetStatus.ENABLED,
    });
    expect(result).toEqual(expectedMergedTokens);
  });
});
