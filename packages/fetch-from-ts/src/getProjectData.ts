import { GET_PROJECT_DATA_QUERY } from "./queries/GET_PROJECT_DATA_QUERY.js";
import { create, type ThemeGroup } from "@tokens-studio/sdk";
import { type AnyTokenSet } from "@tokens-studio/types";
import { getAllTokenSets } from "./getAllTokenSets.js";

type Theme = {
  id: string;
  name: string;
  options: {
    name: string;
    selectedTokenSets: Record<string, string>;
  }[];
};
type ProjectData = {
  tokens: AnyTokenSet | null | undefined;
  themes: Theme[];
  tokenSets: {
    [tokenSetName: string]: { isDynamic: boolean };
  };
  tokenSetOrder: string[];
};

export async function getProjectData(
  id: string,
  orgId: string,
  client: ReturnType<typeof create>,
): Promise<ProjectData | null> {
  try {
    const [data, tokenData] = await Promise.all([
      client.query({
        query: GET_PROJECT_DATA_QUERY,
        variables: {
          projectId: id,
          organization: orgId,
          name: "main",
        },
      }),
      getAllTokenSets(id, orgId, client),
    ]);

    if (!data.data?.project?.branch) {
      return null;
    }

    const themeGroups = data.data.project.branch.themeGroups
      .data as ThemeGroup[];

    const themes = themeGroups.map(
      (group) =>
        ({
          id: group.id,
          name: group.name,
          options: group.options.map((option) => ({
            name: option.name,
            selectedTokenSets: option.selectedTokenSets,
          })),
        }) as Theme,
    );

    return {
      tokens: tokenData?.tokens ?? null,
      tokenSets: tokenData?.tokenSets ?? {},
      tokenSetOrder: tokenData?.tokenSetOrder ?? [],
      themes,
    };
  } catch (e) {
    console.error("Error fetching tokens", e);
    return null;
  }
}
