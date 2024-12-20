import { create } from "@tokens-studio/sdk";
import { getProjectData } from "./getProjectData.js";

const makeClient = (secret: string) =>
  create({
    host: process.env.TOKENS_STUDIO_API_HOST || "graphql.app.tokens.studio",
    secure: process.env.NODE_ENV !== "development",
    auth: `Bearer ${secret}`,
  });

export async function fetchTokensFromStudio({
  projectId,
  organization,
  apiKey,
}: {
  projectId: string;
  organization: string;
  apiKey: string;
}) {
  const client = makeClient(apiKey);
  if (!projectId || !organization) {
    console.error("No project org organization chosen");
    return;
  }
  try {
    const projectData = await getProjectData(projectId, organization, client);

    if (!projectData) {
      console.error("No data found");
      return;
    }

    return {
      tokens: projectData.tokens,
      themes: projectData.themes,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
