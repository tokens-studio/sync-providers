import { SingleToken } from "@tokens-studio/types";
import StyleDictionary from "style-dictionary";
import { DesignTokens, PreprocessedTokens } from "style-dictionary/types";

export interface TokenSetsCombined {
  [key: string]: SingleToken[];
}

StyleDictionary.registerFormat({
  name: "just-an-array",
  format: function ({ dictionary }) {
    return dictionary.allTokens;
  },
});

StyleDictionary.registerTransform({
  name: "name/original",
  type: "name",
  transform: (token) => {
    return token.path.join(".");
  },
});

StyleDictionary.registerTransform({
  name: "value/original",
  type: "value",
  transform: (token) => {
    return token.original.value;
  },
});

export async function convertSingleSetToArray(
  tokenTree: DesignTokens,
): Promise<SingleToken[]> {
  const isUsingDTCG = JSON.stringify(tokenTree).includes("$value");
  // handle case of empty token sets
  if (Object.keys(tokenTree).length === 0) {
    console.log("returning empty array");
    return [];
  }
  const sd = new StyleDictionary({
    tokens: tokenTree,
    usesDtcg: isUsingDTCG,
    log: {
      verbosity: "silent",
      errors: {
        brokenReferences: undefined,
      },
    },
    platforms: {
      array: {
        // Disabling because BOTH dont seem to work. only 1
        // transforms: [
        //   'name/original',
        //   'value/original',
        // ],
        buildPath: "build/array/",
        files: [
          {
            format: "just-an-array",
          },
        ],
      },
    },
  });

  // Retrieve the custom formatted output
  const formattedTokens = await sd.formatPlatform("array");
  const originalTokens: PreprocessedTokens[] = formattedTokens[0]
    .output as unknown as PreprocessedTokens[];

  // Change name and value to original / path joined. We do this because somehow doing this in transforms above doesnt work (it works if we do either value OR name, but not both)
  // @ts-expect-error TS error on $type - doesnt seem to like me.
  const normalizedTokens: SingleToken[] = originalTokens.map(
    (token: PreprocessedTokens) => {
      const {
        original,
        path,
        attributes: _attributes,
        // Extract value and type - both types could be present but we dont need it
        $value,
        value,
        $type,
        type,
        ...rest
      } = token;
      const tokenValue = isUsingDTCG ? original?.$value : original?.value;
      const tokenType = isUsingDTCG ? original?.$type : original?.type;
      return {
        ...rest,
        name: path?.join("."),
        value: tokenValue,
        type: tokenType,
      };
    },
  );

  return normalizedTokens;
}
