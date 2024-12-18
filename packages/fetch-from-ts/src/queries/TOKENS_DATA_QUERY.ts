export const TOKENS_DATA_QUERY = `
query Branch($projectId: String!, $organization: String!, $name: String) {
  project(id: $projectId, organization: $organization) {
    branch(name: $name) {
      tokenSets {
        data {
          name
          orderIndex
          type
          tokens {
            name
            type
            description
            extensions
            value
          }
        }
      }
      themeGroups {
        data {
          name
          options {
            name
            figmaStyleReferences
            figmaVariableReferences
            selectedTokenSets
          }
        }
      }
    }
  }
}`;
