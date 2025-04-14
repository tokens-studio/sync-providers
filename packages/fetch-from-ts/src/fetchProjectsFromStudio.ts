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

    if (!result.data?.organizations?.data?.length) {
      throw new Error("No organizations found");
    }

    return result.data?.organizations.data ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error details:", error.message);

    // Extract status code from error message if it exists
    const statusCodeMatch = error.message?.match(/status code (\d{3})/i);
    const statusCode = statusCodeMatch ? parseInt(statusCodeMatch[1]) : null;

    if (statusCode) {
      switch (statusCode) {
        case 401:
          throw new Error("Invalid API key");
        case 429:
          throw new Error("Too many requests: Rate limit exceeded");
        case 500:
          throw new Error("Internal server error: Please try again later");
        default:
          throw new Error(
            `HTTP Error ${statusCode}: ${error.message || "Unknown error"}`,
          );
      }
    }

    // Handle GraphQL errors
    if (error.response?.errors) {
      console.error("GraphQL errors:", error.response.errors);
      throw new Error(error.response.errors[0]?.message || "GraphQL Error");
    }

    // If it's a network or other type of error
    const errorMessage = error.message || "Unknown error occurred";
    throw new Error(`Failed to fetch organizations: ${errorMessage}`);
  }
}
