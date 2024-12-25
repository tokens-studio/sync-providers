import { create } from "@tokens-studio/sdk";
import { ORGANIZATIONS_QUERY } from "./queries/ORGANIZATIONS_QUERY.js";
import type {
  Organization,
  OrganizationsResponse,
} from "./types/OrganizationsResponse.js";

export async function fetchProjectsFromStudio(
  apiKey: string,
): Promise<Organization[]> {
  try {
    const client = create({
      host: process.env.TOKENS_STUDIO_API_HOST || "graphql.app.tokens.studio",
      secure: process.env.NODE_ENV !== "development",
      auth: `Bearer ${apiKey}`,
    });

    const result = await client.query<OrganizationsResponse>({
      query: ORGANIZATIONS_QUERY,
    });

    if (result.errors?.length) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message);
    }

    if (
      !result.data?.organizations ||
      !result.data?.organizations.data.length
    ) {
      throw new Error("No organizations found");
    }

    return result.data?.organizations.data ?? [];
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
}
