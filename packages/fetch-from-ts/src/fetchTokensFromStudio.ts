import {
  rawTokenToSingleToken,
  RawToken,
  create,
  ThemeGroup,
  TokenSet,
} from "@tokens-studio/sdk";
import set from "set-value";
import { formatThemeResponse } from "./utils/formatThemeResponse.js";
import { TOKENS_DATA_QUERY } from "./queries/TOKENS_DATA_QUERY.js";

export async function fetchTokensFromStudio({
  projectId,
  organization,
  apiKey,
}: {
  projectId: string;
  organization: string;
  apiKey?: string;
}) {
  if (!projectId || !organization) {
    console.error("No project org organization chosen");
    return;
  }
  try {
    const client = create({
      host: process.env.TOKENS_STUDIO_API_HOST || "localhost:4200",
      secure: process.env.NODE_ENV !== "development",
      auth: `Bearer ${apiKey}`,
    });
    const data = await client.query({
      query: TOKENS_DATA_QUERY,
      variables: {
        projectId,
        organization,
        name: "master",
      },
    });

    console.log("data", data);

    if (data.errors) {
      console.error("error", data.errors[0].path);
    }

    if (!data.data) {
      console.error("No data found");
      return;
    }

    console.log("data", data.data);

    const rawTokenSets =
      (data.data?.project?.branch?.tokenSets as TokenSet[]) || [];
    const rawThemeGroups =
      (data.data?.project?.branch?.themeGroups as ThemeGroup[]) || [];
    const formattedThemeGroups = formatThemeResponse(rawThemeGroups);

    const tokenSetTrees = rawTokenSets.reduce(
      (acc: Record<string, object>, tokenSet) => {
        const stringified = tokenSet.tokens.reduce(
          (tokenAcc: object, token: RawToken) => {
            try {
              set(
                tokenAcc,
                token.name!.split("."),
                rawTokenToSingleToken(token),
              );
            } catch (e) {
              console.log("error", e, token.name);
            }
            return tokenAcc;
          },
          {},
        );
        acc[tokenSet.name] = stringified;
        return acc;
      },
      {},
    );

    const projectInfo = {
      name: data.data?.project?.name,
    };

    return {
      tokenSetTrees,
      themeGroups: formattedThemeGroups,
      projectInfo,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
