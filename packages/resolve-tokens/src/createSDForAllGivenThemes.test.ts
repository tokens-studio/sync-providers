import { TokenSetStatus } from "@tokens-studio/types";
import type { DesignTokens } from "style-dictionary/types";
import type { NewExperimentalThemeObject } from "@tokens-studio/internal-types";
import { expect, describe, it } from "vitest";
import { createSDForAllGivenThemes } from "./createSDForAllGivenThemes.js";

const tokenSets: Record<string, DesignTokens> = {
  highContrast: {
    color: {
      gray: {
        100: { $value: "#FFFFFF", $type: "color" },
        900: { $value: "#000000", $type: "color" },
      },
    },
  },
  primitives: {
    color: {
      gray: {
        100: { $value: "#FAFAFA", $type: "color" },
        900: { $value: "#2E2E2E", $type: "color" },
      },
    },
  },
  "mode/light": {
    color: {
      background: {
        primary: { $value: "{color.gray.100}", $type: "color" },
        secondary: { $value: "{color.gray.900}", $type: "color" },
      },
    },
  },
  "mode/dark": {
    color: {
      background: {
        primary: { $value: "{color.gray.900}", $type: "color" },
        secondary: { $value: "{color.gray.100}", $type: "color" },
      },
    },
  },
  components: {
    button: {
      background: { $value: "{color.background.primary}", $type: "color" },
      foreground: { $value: "{color.background.secondary}", $type: "color" },
    },
  },
};

const testThemes: NewExperimentalThemeObject[] = [
  {
    name: "Mode",
    id: "123",
    options: [
      {
        name: "Light",
        selectedTokenSets: {
          "mode/light": TokenSetStatus.ENABLED,
          components: TokenSetStatus.ENABLED,
        },
      },
      {
        name: "Dark",
        selectedTokenSets: {
          "mode/dark": TokenSetStatus.ENABLED,
          components: TokenSetStatus.ENABLED,
        },
      },
      {
        name: "HighContrast",
        selectedTokenSets: {
          components: TokenSetStatus.ENABLED,
          "mode/dark": TokenSetStatus.ENABLED,
          highContrast: TokenSetStatus.SOURCE,
        },
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

describe("createSDForAllGivenThemes", () => {
  it("should generate correct StyleDictionary instances for all themes", async () => {
    const result = await createSDForAllGivenThemes(tokenSets, testThemes);

    expect(Object.keys(result)).toHaveLength(5); // Expecting 5 theme options: Light, Dark, HighContrast, Primitives Default, Components Default

    // Check Mode/Light theme
    expect(result["Mode/Light"]).toHaveLength(4);
    const buttonBackground = result["Mode/Light"].find(
      (token) => token.name === "button.background",
    );
    const buttonForeground = result["Mode/Light"].find(
      (token) => token.name === "button.foreground",
    );
    const primaryBackground = result["Mode/Light"].find(
      (token) => token.name === "color.background.primary",
    );
    const secondaryBackground = result["Mode/Light"].find(
      (token) => token.name === "color.background.secondary",
    );
    expect(buttonBackground?.value).toStrictEqual({
      r: 0.980392,
      g: 0.980392,
      b: 0.980392,
      a: 1,
    });
    expect(buttonForeground?.value).toStrictEqual({
      r: 0.180392,
      g: 0.180392,
      b: 0.180392,
      a: 1,
    });
    expect(primaryBackground?.value).toStrictEqual({
      r: 0.980392,
      g: 0.980392,
      b: 0.980392,
      a: 1,
    });
    expect(secondaryBackground?.value).toStrictEqual({
      r: 0.180392,
      g: 0.180392,
      b: 0.180392,
      a: 1,
    });

    // Check Mode/Dark theme
    expect(result["Mode/Dark"]).toHaveLength(4);
    const darkPrimaryBackground = result["Mode/Dark"].find(
      (token) => token.name === "color.background.primary",
    );
    const darkSecondaryBackground = result["Mode/Dark"].find(
      (token) => token.name === "color.background.secondary",
    );
    expect(darkPrimaryBackground?.value).toStrictEqual({
      r: 0.180392,
      g: 0.180392,
      b: 0.180392,
      a: 1,
    });
    expect(darkSecondaryBackground?.value).toStrictEqual({
      r: 0.980392,
      g: 0.980392,
      b: 0.980392,
      a: 1,
    });

    // Check Mode/HighContrast theme
    expect(result["Mode/HighContrast"]).toHaveLength(4);
    const highContrastPrimaryBackground = result["Mode/HighContrast"].find(
      (token) => token.name === "color.background.primary",
    );
    const highContrastSecondaryBackground = result["Mode/HighContrast"].find(
      (token) => token.name === "color.background.secondary",
    );
    expect(highContrastPrimaryBackground?.value).toStrictEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    });
    expect(highContrastSecondaryBackground?.value).toStrictEqual({
      r: 1,
      g: 1,
      b: 1,
      a: 1,
    });

    // Check Primitives/Default theme
    expect(result["Primitives/Default"]).toHaveLength(2);
    const primitivesGray100 = result["Primitives/Default"].find(
      (token) => token.name === "color.gray.100",
    );
    const primitivesGray900 = result["Primitives/Default"].find(
      (token) => token.name === "color.gray.900",
    );
    expect(primitivesGray100?.value).toStrictEqual({
      r: 0.980392,
      g: 0.980392,
      b: 0.980392,
      a: 1,
    });
    expect(primitivesGray900?.value).toStrictEqual({
      r: 0.180392,
      g: 0.180392,
      b: 0.180392,
      a: 1,
    });

    // Check Components/Default theme
    expect(result["Components/Default"]).toHaveLength(2);
    const componentsButtonBackground = result["Components/Default"].find(
      (token) => token.name === "button.background",
    );
    const componentsButtonForeground = result["Components/Default"].find(
      (token) => token.name === "button.foreground",
    );
    expect(componentsButtonBackground?.value).toStrictEqual({
      r: 0.180392,
      g: 0.180392,
      b: 0.180392,
      a: 1,
    });
    expect(componentsButtonForeground?.value).toStrictEqual({
      r: 0.980392,
      g: 0.980392,
      b: 0.980392,
      a: 1,
    });
  });

  it("should resolve math expressions in token values", async () => {
    const mathTokenSets: Record<string, DesignTokens> = {
      base: {
        spacing: {
          base: { $value: "4px", $type: "dimension" },
          medium: { $value: "{spacing.base} * 2", $type: "dimension" },
          large: { $value: "{spacing.medium} * 2", $type: "dimension" },
        },
        opacity: {
          half: { $value: "50%", $type: "opacity" },
          quarter: { $value: "{opacity.half} / 2", $type: "opacity" },
        },
      },
    };

    const mathThemes: NewExperimentalThemeObject[] = [
      {
        name: "Math",
        id: "math",
        options: [
          {
            name: "Default",
            selectedTokenSets: { base: TokenSetStatus.ENABLED },
          },
        ],
      },
    ];

    const result = await createSDForAllGivenThemes(mathTokenSets, mathThemes);

    expect(result["Math/Default"]).toBeDefined();
    expect(result["Math/Default"]).toHaveLength(5);

    const mediumSpacing = result["Math/Default"].find(
      (token) => token.name === "spacing.medium",
    );
    const largeSpacing = result["Math/Default"].find(
      (token) => token.name === "spacing.large",
    );
    const quarterOpacity = result["Math/Default"].find(
      (token) => token.name === "opacity.quarter",
    );

    expect(mediumSpacing?.value).toBe(8);
    expect(largeSpacing?.value).toBe(16);
    expect(quarterOpacity?.value).toBe(0.25);
  });

  it("should apply color modifiers from $extensions", async () => {
    const colorModifierTokenSets: Record<string, DesignTokens> = {
      base: {
        color: {
          primary: { $value: "#0000FF", $type: "color" },
          primaryLight: {
            $value: "{color.primary}",
            $type: "color",
            $extensions: {
              "studio.tokens": {
                modify: {
                  type: "lighten",
                  value: "1",
                  space: "srgb",
                },
              },
            },
          },
          primaryDark: {
            $value: "{color.primary}",
            $type: "color",
            $extensions: {
              "studio.tokens": {
                modify: {
                  type: "darken",
                  value: "0.5",
                  space: "srgb",
                },
              },
            },
          },
        },
      },
    };

    const colorModifierThemes: NewExperimentalThemeObject[] = [
      {
        name: "ColorModifier",
        id: "colorModifier",
        options: [
          {
            name: "Default",
            selectedTokenSets: { base: TokenSetStatus.ENABLED },
          },
        ],
      },
    ];

    const result = await createSDForAllGivenThemes(
      colorModifierTokenSets,
      colorModifierThemes,
    );

    expect(result["ColorModifier/Default"]).toBeDefined();
    expect(result["ColorModifier/Default"]).toHaveLength(3);

    const primaryColor = result["ColorModifier/Default"].find(
      (token) => token.name === "color.primary",
    );
    const primaryLightColor = result["ColorModifier/Default"].find(
      (token) => token.name === "color.primaryLight",
    );
    const primaryDarkColor = result["ColorModifier/Default"].find(
      (token) => token.name === "color.primaryDark",
    );

    expect(primaryColor?.value).toStrictEqual({ r: 0, g: 0, b: 1, a: 1 });
    expect(primaryLightColor?.value).toStrictEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(primaryDarkColor?.value).toStrictEqual({
      r: 0,
      g: 0,
      b: 0.501961,
      a: 1,
    });
  });

  it("should handle colors using references inside rgba() strings", async () => {
    const referenceColorTokenSets: Record<string, DesignTokens> = {
      base: {
        color: {
          primary: { $value: "#FF0000", $type: "color" },
          secondary: { $value: "rgba({color.primary}, 0.5)", $type: "color" },
          pure: { $value: "{color.primary}", $type: "color" },
        },
      },
    };

    const referenceColorThemes: NewExperimentalThemeObject[] = [
      {
        name: "ReferenceColor",
        id: "referenceColor",
        options: [
          {
            name: "Default",
            selectedTokenSets: { base: TokenSetStatus.ENABLED },
          },
        ],
      },
    ];

    const result = await createSDForAllGivenThemes(
      referenceColorTokenSets,
      referenceColorThemes,
    );

    expect(result["ReferenceColor/Default"]).toBeDefined();
    expect(result["ReferenceColor/Default"]).toHaveLength(3);

    const primaryColor = result["ReferenceColor/Default"].find(
      (token) => token.name === "color.primary",
    );
    const secondaryColor = result["ReferenceColor/Default"].find(
      (token) => token.name === "color.secondary",
    );
    const pureColor = result["ReferenceColor/Default"].find(
      (token) => token.name === "color.pure",
    );

    expect(primaryColor?.value).toStrictEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(secondaryColor?.value).toStrictEqual({
      r: 1,
      g: 0,
      b: 0,
      a: 0.501961,
    });
    expect(pureColor?.value).toStrictEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(pureColor?.attributes.isUsingPureReference).toBe(true);
  });

  it("should only include tokens from enabled token sets in each theme", async () => {
    const isolatedTokenSets: Record<string, DesignTokens> = {
      set1: {
        color: {
          red: { $value: "#FF0000", $type: "color" },
          blue: { $value: "#0000FF", $type: "color" },
        },
      },
      set2: {
        color: {
          green: { $value: "#00FF00", $type: "color" },
          yellow: { $value: "#FFFF00", $type: "color" },
        },
      },
      set3: {
        color: {
          purple: { $value: "#800080", $type: "color" },
          orange: { $value: "#FFA500", $type: "color" },
        },
      },
    };

    const isolatedThemes: NewExperimentalThemeObject[] = [
      {
        name: "Theme1",
        id: "theme1",
        options: [
          {
            name: "Default",
            selectedTokenSets: {
              set1: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
      {
        name: "Theme2",
        id: "theme2",
        options: [
          {
            name: "Default",
            selectedTokenSets: {
              set2: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
    ];

    const result = await createSDForAllGivenThemes(
      isolatedTokenSets,
      isolatedThemes,
    );

    // Check Theme1/Default
    expect(result["Theme1/Default"]).toBeDefined();
    const theme1Tokens = result["Theme1/Default"];

    // Should only contain tokens from set1
    expect(theme1Tokens.some((token) => token.name === "color.red")).toBe(true);
    expect(theme1Tokens.some((token) => token.name === "color.blue")).toBe(
      true,
    );
    // Should not contain tokens from set2 or set3
    expect(theme1Tokens.some((token) => token.name === "color.green")).toBe(
      false,
    );
    expect(theme1Tokens.some((token) => token.name === "color.yellow")).toBe(
      false,
    );
    expect(theme1Tokens.some((token) => token.name === "color.purple")).toBe(
      false,
    );
    expect(theme1Tokens.some((token) => token.name === "color.orange")).toBe(
      false,
    );

    // Check Theme2/Default
    expect(result["Theme2/Default"]).toBeDefined();
    const theme2Tokens = result["Theme2/Default"];

    // Should only contain tokens from set2
    expect(theme2Tokens.some((token) => token.name === "color.green")).toBe(
      true,
    );
    expect(theme2Tokens.some((token) => token.name === "color.yellow")).toBe(
      true,
    );
    // Should not contain tokens from set1 or set3
    expect(theme2Tokens.some((token) => token.name === "color.red")).toBe(
      false,
    );
    expect(theme2Tokens.some((token) => token.name === "color.blue")).toBe(
      false,
    );
    expect(theme2Tokens.some((token) => token.name === "color.purple")).toBe(
      false,
    );
    expect(theme2Tokens.some((token) => token.name === "color.orange")).toBe(
      false,
    );
  });

  it("should mark invalid color values with appropriate attributes", async () => {
    const invalidColorTokenSets: Record<string, DesignTokens> = {
      base: {
        color: {
          invalid: { $value: "foo", $type: "color" },
          valid: { $value: "#FF0000", $type: "color" },
          referenceToInvalid: { $value: "{color.invalid}", $type: "color" },
        },
      },
    };

    const invalidColorThemes: NewExperimentalThemeObject[] = [
      {
        name: "InvalidColor",
        id: "invalidColor",
        options: [
          {
            name: "Default",
            selectedTokenSets: { base: TokenSetStatus.ENABLED },
          },
        ],
      },
    ];

    const result = await createSDForAllGivenThemes(
      invalidColorTokenSets,
      invalidColorThemes,
    );

    expect(result["InvalidColor/Default"]).toBeDefined();
    expect(result["InvalidColor/Default"]).toHaveLength(3);

    const invalidColor = result["InvalidColor/Default"].find(
      (token) => token.name === "color.invalid",
    );
    const validColor = result["InvalidColor/Default"].find(
      (token) => token.name === "color.valid",
    );
    const referenceToInvalid = result["InvalidColor/Default"].find(
      (token) => token.name === "color.referenceToInvalid",
    );

    expect(invalidColor?.attributes?.invalidForFigmaVariableReason).toBe(
      "Invalid color value",
    );
    expect(
      validColor?.attributes?.invalidForFigmaVariableReason,
    ).toBeUndefined();
    expect(referenceToInvalid?.attributes?.invalidForFigmaVariableReason).toBe(
      "Invalid color value",
    );
  });
});
