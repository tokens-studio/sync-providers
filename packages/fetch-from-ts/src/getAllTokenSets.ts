import { GET_TOKEN_SET_PAGE } from "./queries/GET_PROJECT_DATA_QUERY.js";
import {
  create,
  TokenSetType,
  type PaginatedSets,
  type TokensSet,
} from "@tokens-studio/sdk";
import { type AnyTokenSet } from "@tokens-studio/types";

type TokenData = {
  tokens: AnyTokenSet | null | undefined;
  tokenSets: {
    [tokenSetName: string]: { isDynamic: boolean };
  };
  tokenSetOrder: string[];
};

export async function getAllTokenSets(
  id: string,
  orgId: string,
  client: ReturnType<typeof create>,
): Promise<TokenData | null> {
  try {
    //We attempt to get the initial page
    const data = await client.query({
      query: GET_TOKEN_SET_PAGE,
      variables: {
        projectId: id,
        organization: orgId,
        name: "main",
        page: 1,
      },
    });

    if (!data.data?.project?.branch) {
      return null;
    }

    const paginatedData = data.data.project.branch.tokenSets as PaginatedSets;

    const page1Data = data.data.project.branch.tokenSets.data as TokensSet[];

    // +1 to account from non zero index, another +1 to account for the first page
    const pageIndices = Array.from(
      { length: paginatedData.totalPages - 1 },
      (_, i) => i + 2,
    );

    //Make a request in paralel here based on the amount of pages
    const remainingPages = await Promise.all(
      pageIndices.map(async (page) => {
        const data = await client.query({
          query: GET_TOKEN_SET_PAGE,
          variables: {
            projectId: id,
            organization: orgId,
            name: "main",
            page,
          },
        });
        return data.data.project.branch.tokenSets.data as TokensSet[];
      }),
    );

    //Combine the data from all pages
    const tokenSets = [...page1Data, ...remainingPages.flat()];

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

    return { ...returnData, tokenSetOrder };
  } catch (e) {
    console.error("Error fetching tokens", e);
    return null;
  }
}
