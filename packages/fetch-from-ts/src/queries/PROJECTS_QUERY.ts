export const PROJECTS_QUERY = `
query Organizations {
    organizations {
        name
        urn
        projects {
        urn
        name
        }
    }
}`;
