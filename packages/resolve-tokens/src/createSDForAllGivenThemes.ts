import StyleDictionary from "style-dictionary";
import { generateThemes } from "./generateThemes.js";
import type { NewExperimentalThemeObject } from "../../types/NewExperimentalThemeObject.js";
import type { DesignTokens, PreprocessedTokens } from "style-dictionary/types";
import { convertArrayToNestedObject } from "./convertArrayToNestedObject.js";
import { register } from "@tokens-studio/sd-transforms";
import Color from "colorjs.io";
import type { UsedTokenSetsMap } from "@tokens-studio/types";
import { parseFontShorthand } from "./parseFontShorthand.js";

register(StyleDictionary);

// Register a new transform to convert units to pure numbers
// Figma doesnt know units, just numbers. So we expect that they're 16px (but technically we should support a dynamic base font size via a token and resolving)
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
// We need this to understand if we can create an alias inside design tools (as Figma only supports pure reference links)
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
      if (!formattedTokens || !formattedTokens.length) return acc;
      const output = formattedTokens[0]?.output as PreprocessedTokens[];

      // We need to adjust the output value to what the platform expects.
      // This doesnt seem to work yet with transformers, so we perform this additional step here.
      // Ideally I wouldn't have this step and I could do it in the form of a transformer above.
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
