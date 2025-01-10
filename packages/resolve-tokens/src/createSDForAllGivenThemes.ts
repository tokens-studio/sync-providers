import StyleDictionary from "style-dictionary";
import { generateThemes } from "./generateThemes.js";
import type { NewExperimentalThemeObject } from "@tokens-studio/internal-types";
import type { DesignTokens, PreprocessedTokens } from "style-dictionary/types";
import { convertArrayToNestedObject } from "./convertArrayToNestedObject.js";
import { register } from "@tokens-studio/sd-transforms";
import Color from "colorjs.io";
import type { AnyTokenSet, UsedTokenSetsMap } from "@tokens-studio/types";
import { parseFontShorthand } from "./parseFontShorthand.js";
import { parseColor } from "./parseColor.js";
import { TokenSetStatus } from "@tokens-studio/types";
import { isNumberWeight } from "./utils/isNumberWeight.js";
import { sizePxToNumber } from "./transforms/sizePxToNumber.js";
import { attributeIsPureReference } from "./transforms/attributeIsPureReference.js";
import { attributeInvalidForFigmaVariableReason } from "./transforms/attributeInvalidForFigmaVariableReason.js";
import { attributeFigmaTypeAndScope } from "./transforms/attributeFigmaTypeAndScope.js";

register(StyleDictionary);

// Register all transforms
StyleDictionary.registerTransform(sizePxToNumber);
StyleDictionary.registerTransform(attributeIsPureReference);
StyleDictionary.registerTransform(attributeInvalidForFigmaVariableReason);
StyleDictionary.registerTransform(attributeFigmaTypeAndScope);

export async function createSDForAllGivenThemes(
  tokenSets: AnyTokenSet,
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
              "attribute/invalidForFigmaVariableReason",
              "attribute/figmaTypeAndScope",
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

      // Filter tokens based on enabled sets in current theme
      const groupName = themeName.split("/")[0];
      const optionName = themeName.split("/")[1];
      const currentTheme = themes
        .find(
          (themeGroup) =>
            themeGroup.name === groupName &&
            themeGroup.options.some((option) => option.name === optionName),
        )
        ?.options.find((option) => option.name === optionName);

      if (!currentTheme) {
        return acc;
      }

      const enabledSets = Object.entries(currentTheme.selectedTokenSets)
        .filter(([_, status]) => status === TokenSetStatus.ENABLED)
        .reduce((acc, [setName]) => ({ ...acc, [setName]: true }), {});

      const filteredOutput = output.filter((token) => {
        const tokenSet = token.original?.internal__Parent;
        return tokenSet && enabledSets[tokenSet];
      });

      if (!filteredOutput.length) {
        return acc;
      }

      // We need to adjust the output value to what the platform expects.
      // This doesnt seem to work yet with transformers, so we perform this additional step here.
      // Ideally I wouldn't have this step and I could do it in the form of a transformer above.
      const transformedOutput = filteredOutput.map((token) => {
        if (
          token.type === "color" &&
          typeof token.value === "string" &&
          !token.value.startsWith("linear-gradient")
        ) {
          const transformedColor = new Color(token.value)
            .to("srgb")
            .toString({ format: "hex" });
          // TODO: Disable for Framer or find a different way to specify how the output format should look like
          const parsedColor = parseColor(transformedColor);
          // token.value = transformedColor;
          token.value = parsedColor;
        }
        if (token.type === "typography") {
          const parsedFont = parseFontShorthand(token.value);
          token.value = parsedFont;
        }
        if (
          token.attributes?.figmaType === "FLOAT" &&
          typeof token.value === "string" &&
          !token.value?.startsWith("{")
        ) {
          token.value = parseFloat(token.value);
        }
        if (token.type === "fontWeight") {
          token.value = token.original?.value.startsWith("{")
            ? token.original?.value
            : isNumberWeight(token.original?.value)
              ? parseFloat(token.original?.value)
              : token.original?.value;
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
