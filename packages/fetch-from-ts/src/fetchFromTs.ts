import {
  rawTokenToSingleToken,
  RawToken,
  Graphql,
  Configuration,
  ThemeGroup,
  TokenSet,
  ProjectQuery,
} from "@tokens-studio/sdk";
import set from "set-value";
import { formatThemeResponse } from "./utils/formatThemeResponse.js";
import { TOKENS_DATA_QUERY } from "./queries/TOKENS_DATA_QUERY.js";
import { fetchWithRetry } from "./utils/fetchWithRetry.js";

export async function fetchTokensFromStudio({
  urn,
  apiKey,
}: {
  urn: string;
  apiKey?: string;
}) {
  if (!urn) {
    console.error("No project chosen");
    return;
  }
  if (apiKey) {
    Configuration.setAPIKey(apiKey);
  }
  try {
    const data = await fetchWithRetry(() =>
      Graphql.exec<ProjectQuery>(
        Graphql.op(TOKENS_DATA_QUERY, {
          limit: 3000,
          urn,
        }),
      ),
    );

    if (data.errors) {
      console.error("error", data.errors[0].path);
    }

    if (!data.data) {
      console.error("No data found");
      return;
    }

    const rawTokenSets = (data.data?.project?.sets as TokenSet[]) || [];
    const rawThemeGroups =
      (data.data?.project?.themeGroups as ThemeGroup[]) || [];
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
