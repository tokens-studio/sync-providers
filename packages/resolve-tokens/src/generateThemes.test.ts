import type { DesignTokens } from "style-dictionary/types";
import { generateThemes } from "./generateThemes.js";
import type { NewExperimentalThemeObject } from "@tokens-studio/internal-types";
import { TokenSetStatus } from "@tokens-studio/types";
import { describe, it, expect } from "vitest";

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
  emptySet: {},
};

describe("generateThemes", () => {
  it("should generate merged tokens for each theme option", async () => {
    const testThemes: NewExperimentalThemeObject[] = [
      {
        name: "Mode",
        id: "123",
        options: [
          {
            name: "Light",
            selectedTokenSets: { "mode/light": TokenSetStatus.ENABLED },
          },
          {
            name: "Dark",
            selectedTokenSets: { "mode/dark": TokenSetStatus.ENABLED },
          },
          {
            name: "HighContrast",
            selectedTokenSets: { highContrast: TokenSetStatus.ENABLED },
          },
        ],
      },
      {
        name: "Primitives",
        id: "456",
        options: [
          {
            name: "Default",
            selectedTokenSets: {
              primitives: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
      {
        name: "Components",
        id: "789",
        options: [
          {
            name: "Default",
            selectedTokenSets: {
              components: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
    ];

    const expectedMergedTokens = {
      "Mode/Light": [
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
      ],
      "Mode/Dark": [
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
      ],
      "Mode/HighContrast": [
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
      ],
      "Primitives/Default": [
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
      ],
      "Components/Default": [
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
      ],
    };

    const result = await generateThemes(tokenSets, testThemes);
    expect(result).toEqual(expectedMergedTokens);
  });

  it("should handle an empty token set", async () => {
    const simpleTokenSets: Record<string, DesignTokens> = {
      nonEmpty: {
        color: {
          primary: { $value: "#FF0000", $type: "color" },
        },
      },
      empty: {},
    };

    const simpleThemes: NewExperimentalThemeObject[] = [
      {
        name: "Simple",
        id: "123",
        options: [
          {
            name: "NonEmpty",
            selectedTokenSets: { nonEmpty: TokenSetStatus.ENABLED },
          },
        ],
      },
    ];

    const expectedResult = {
      "Simple/NonEmpty": [
        {
          internal__Parent: "nonEmpty",
          type: "color",
          name: "color.primary",
          value: "#FF0000",
        },
      ],
    };

    const result = await generateThemes(simpleTokenSets, simpleThemes);
    expect(result).toEqual(expectedResult);
  });
});
