import StyleDictionary from "style-dictionary";
import { generateThemes } from "./generateThemes.js";
import { NewExperimentalThemeObject } from "../../types/NewExperimentalThemeObject.js";
import { DesignTokens, PreprocessedTokens } from "style-dictionary/types";
import { convertArrayToNestedObject } from "./convertArrayToNestedObject.js";
import { register } from "@tokens-studio/sd-transforms";
import Color from "colorjs.io";
import { UsedTokenSetsMap } from "@tokens-studio/types";
import { parseFontShorthand } from "./parseFontShorthand";
import { parseColor } from "./parseColor";
register(StyleDictionary);

// Register a new transform to convert units to pure numbers
StyleDictionary.registerTransform({
  name: "size/pxToNumber",
  type: "value",
  transitive: true,
  transform: (token) => {
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
});

// Register a new transform to add isUsingPureReference property
StyleDictionary.registerTransform({
  name: "attribute/isPureReference",
  type: "attribute",
  transform: (token) => {
    if (typeof token.original.value === "string") {
      const value = token.original.value.trim();
      const isPureReference = /^{[^{}]+}$/.test(value);
      return {
        isUsingPureReference: isPureReference,
      };
    }
    return {};
  },
});

export function convertToUnitDimensions(
  value: string,
): `${number}px` | `${number}rem` | `${number}em` {
  if (typeof value === "string") {
    if (value.endsWith("px")) {
      return `${parseFloat(value)}px`;
    } else if (value.endsWith("rem")) {
      return `${parseFloat(value)}rem`;
    } else if (value.endsWith("em")) {
      return `${parseFloat(value)}em`;
    } else {
      return `${parseFloat(value)}px`;
    }
  } else if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}

export async function createSDForAllGivenThemes(
  tokenSets: Record<string, DesignTokens>,
  themes: NewExperimentalThemeObject[],
  overallConfig?: UsedTokenSetsMap,
): Promise<Record<string, PreprocessedTokens[]>> {
  const mergedTokensForAllThemes = await generateThemes(
    tokenSets,
    themes,
    overallConfig,
  );

  return Object.entries(mergedTokensForAllThemes).reduce(
    async (acc, [themeName, tokens]) => {
      const treeOfTokens = convertArrayToNestedObject(tokens);

      const sd = new StyleDictionary({
        tokens: treeOfTokens,
        log: {
          verbosity: "verbose",
        },
        preprocessors: ["tokens-studio"],
        platforms: {
          array: {
            transformGroup: "tokens-studio",
            transforms: [
              "name/original",
              "size/pxToNumber",
              "attribute/isPureReference",
            ],
            buildPath: "build/array/",
            files: [
              {
                format: "just-an-array",
              },
            ],
          },
        },
      });

      const formattedTokens = await sd.formatPlatform("array");
      const output = formattedTokens[0].output as PreprocessedTokens[];
      const transformedOutput = output.map((token) => {
        if (token.type === "color" && typeof token.value === "string") {
          const transformedColor = new Color(token.value)
            .to("srgb")
            .toString({ format: "hex" });
          // TODO: Disable for Framer or find a different way to specify how the output format should look like
          // const parsedColor = parseColor(transformedColor);
          token.value = transformedColor;
          // token.value = parsedColor;
        } else if (token.type === "typography") {
          const parsedFont = parseFontShorthand(token.value);
          token.value = parsedFont;
        }
        return token;
      });

      return {
        ...(await acc),
        [themeName]: transformedOutput,
      };
    },
    Promise.resolve({}),
  );
}
