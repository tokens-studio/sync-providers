import { gql } from "@tokens-studio/sdk";

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      data {
        name
        id
        projects {
          data {
            name
            id
          }
        }
      }
    }
  }
`;
