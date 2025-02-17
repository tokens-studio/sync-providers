import { GET_PROJECT_DATA_QUERY } from "./queries/GET_PROJECT_DATA_QUERY.js";
import {
  TokenSetType,
  type ThemeGroup,
  type TokensSet,
} from "@tokens-studio/sdk";
import { type AnyTokenSet } from "@tokens-studio/types";

type ProjectData = {
  tokens: AnyTokenSet | null | undefined;
  themes: any; // TODO: Add type
  tokenSets: {
    [tokenSetName: string]: { isDynamic: boolean };
  };
  tokenSetOrder: string[];
};

export async function getProjectData(
  id: string,
  orgId: string,
  client: any, // TODO: Add type
): Promise<ProjectData | null> {
  try {
    const data = await client.query({
      query: GET_PROJECT_DATA_QUERY,
      variables: {
        projectId: id,
        organization: orgId,
        name: "main",
      },
    });

    if (!data.data?.project?.branch) {
      return null;
    }

    const tokenSets = data.data.project.branch.tokenSets.data as TokensSet[];

    const returnData = tokenSets.reduce(
      (
        acc: {
          tokens: AnyTokenSet;
          tokenSets: Record<string, { isDynamic: boolean }>;
        },
        tokenSet,
      ) => {
        if (!tokenSet.name) return acc;
        acc.tokens[tokenSet.name] = tokenSet.raw;

        acc.tokenSets[tokenSet.name] = {
          isDynamic: tokenSet.type === TokenSetType.Dynamic,
        };

        return acc;
      },
      { tokens: {}, tokenSets: {} },
    );

    // sort by orderIndex
    const tokenSetOrder = [...tokenSets]
      .sort((a, b) => (+(a.orderIndex || 0) > +(b.orderIndex || 0) ? 1 : -1))
      .map((tokenSet) => tokenSet.name);

    const themeGroups = data.data.project.branch.themeGroups
      .data as ThemeGroup[];

    const themes = themeGroups.map((group) => ({
      id: group.name, // TODO: Make it a proper unique id
      name: group.name,
      options: group.options.map((option) => ({
        name: option.name,
        selectedTokenSets: option.selectedTokenSets,
      })),
    }));

    return { ...returnData, tokenSetOrder, themes };
  } catch (e) {
    console.error("Error fetching tokens", e);
    return null;
  }
}
