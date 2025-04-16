import { gql } from "@tokens-studio/sdk";

export const GET_PROJECT_DATA_QUERY = gql`
  query Branch($projectId: String!, $organization: String!, $name: String) {
    project(id: $projectId, organization: $organization) {
      branch(name: $name) {
        themeGroups {
          data {
            id
            name
            options {
              name
              selectedTokenSets
            }
          }
        }
      }
    }
  }
`;

