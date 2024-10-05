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

  it("overrides tokens if needed, even from a prior set", async () => {
    const expectedMergedTokens = [
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
        internal__Parent: "highContrast",
        type: "color",
        name: "color.background.primary",
        value: "#FF0000",
      },
      {
        internal__Parent: "highContrast",
        type: "color",
        name: "color.background.secondary",
        value: "#0000FF",
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
      highContrast: TokenSetStatus.ENABLED,
    });
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should merge object tokens when both sets are enabled", async () => {
    const expectedMergedTokens = [
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.primary",
        value: "#000000",
      },
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.secondary",
        value: "#1A1A1A",
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
      typography: TokenSetStatus.ENABLED,
      components: TokenSetStatus.ENABLED,
    });
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should not merge object tokens when one set is disabled", async () => {
    const expectedMergedTokens = [
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.primary",
        value: "#000000",
      },
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.secondary",
        value: "#1A1A1A",
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
    ];

    const result = await mergeTokenGroups(tokenSetArrays, {
      typography: TokenSetStatus.DISABLED,
      components: TokenSetStatus.ENABLED,
    });
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should handle empty usedSets", async () => {
    const expectedMergedTokens = [
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.primary",
        value: "#000000",
      },
      {
        internal__Parent: "mode/dark",
        type: "color",
        name: "color.background.secondary",
        value: "#1A1A1A",
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

    const result = await mergeTokenGroups(tokenSetArrays);
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should handle overallConfig", async () => {
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
    ];

    const result = await mergeTokenGroups(
      tokenSetArrays,
      {
        "mode/light": TokenSetStatus.ENABLED,
      },
      {
        primitives: TokenSetStatus.SOURCE,
      },
    );
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should not merge array tokens", async () => {
    const arrayTokenSets: Record<string, DesignTokens> = {
      set1: {
        array: { $value: ["item1", "item2"], $type: "array" },
        object: { $value: { prop1: "value1" }, $type: "object" },
      },
      set2: {
        array: { $value: ["item3", "item4"], $type: "array" },
        object: { $value: { prop2: "value2" }, $type: "object" },
      },
    };
    const arrayTokenSetArrays =
      await convertAllSetsToCombinedObject(arrayTokenSets);

    const expectedMergedTokens = [
      {
        internal__Parent: "set2",
        type: "array",
        name: "array",
        value: ["item3", "item4"],
      },
      {
        internal__Parent: "set2",
        type: "object",
        name: "object",
        value: { prop1: "value1", prop2: "value2" },
      },
    ];

    const result = await mergeTokenGroups(arrayTokenSetArrays, {
      set1: TokenSetStatus.ENABLED,
      set2: TokenSetStatus.ENABLED,
    });
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should not fail if given selected set doesnt exist in tokenSetArrays", async () => {
    const simpleTokenSets: Record<string, DesignTokens> = {
      set1: {
        background: {
          primary: { $value: "#000000", $type: "color" },
        },
      },
    };
    const simpleTokenSetArray =
      await convertAllSetsToCombinedObject(simpleTokenSets);

    const result = await mergeTokenGroups(simpleTokenSetArray, {
      randomset: TokenSetStatus.ENABLED,
    });
    expect(result).toEqual([
      {
        internal__Parent: "set1",
        type: "color",
        name: "background.primary",
        value: "#000000",
      },
    ]);
  });
});
