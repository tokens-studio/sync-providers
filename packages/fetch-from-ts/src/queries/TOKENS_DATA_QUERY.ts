import { TOKEN_FRAGMENT } from "./TOKEN_FRAGMENT.js";

export const TOKENS_DATA_QUERY = `
query Project($urn: String!) {
  project(urn: $urn) {
      name
      organization {
        urn
        name
      }
      sets {
      urn
      name
      type
      projectUrn
      generatorUrn
      orderIndex
      tokens(limit: 500) {
          ${TOKEN_FRAGMENT}
      }
    }
    themeGroups {
      urn
      name
      options {
          urn
          name
          selectedTokenSets
          figmaStyleReferences
          figmaVariableReferences
      }
    }
  }
}`;
