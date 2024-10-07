import { Graphql, ProjectQuery } from "@tokens-studio/sdk";
import { fetchWithRetry } from "./utils/fetchWithRetry.js";
import { PROJECTS_QUERY } from "./queries/PROJECTS_QUERY.js";

export async function fetchProjectsFromStudio() {
  const data = await fetchWithRetry(() =>
    Graphql.exec<ProjectQuery>(
      Graphql.op(PROJECTS_QUERY, {
        limit: 100,
      }),
    ),
  );

  if (data.errors) {
    console.error("error", data.errors[0].path);
  }

  if (!data.data) {
    console.error("No data found");
    return [];
  }

  const projectsArray =
    data.data?.organizations.flatMap((organization) =>
      organization.projects.map((project) => ({
        name: `${organization.name}/${project.name}`,
        urn: project.urn,
      })),
    ) || [];

  return projectsArray;
}
