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

export const GET_TOKEN_SET_PAGE = gql`
  query TokenSetsPage(
    $projectId: String!
    $organization: String!
    $branch: String!
    $page: Int!
  ) {
    project(id: $projectId, organization: $organization) {
      branch(name: $branch) {
        tokenSets(page: $page, limit: 100) {
          nextPage
          totalPages
          data {
            name
            orderIndex
            type
            raw
          }
        }
      }
    }
  }
`;
