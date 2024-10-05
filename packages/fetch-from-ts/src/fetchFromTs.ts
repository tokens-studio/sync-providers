import { rawTokenToSingleToken, RawToken, Graphql, Configuration, ThemeGroup, TokenSet, ProjectQuery } from '@tokens-studio/sdk';
import set from 'set-value';
import { TOKEN_FRAGMENT } from './TOKEN_FRAGMENT.js';

export interface Token {
    name?: string | null;
    description?: string | null;
    type?: string | null;
    value: any;
    $extensions?: any;
}

// const API_KEY = 'api_key_949d5d1a-353a-43f3-b300-80e390b5c99a'
const API_KEY = 'api_key_436aa9c3-bc02-45cb-a03d-9f0938eccbe8'

// const PROJECT_URN = 'urn:ts:tokens:eu-central-1:9NqwHFgsXTAMc2VXsimS7H:project/sDeXdrjEds6Y7w8gzUJsQ6'
const PROJECT_URN = 'urn:ts:tokens:eu-central-1:gXBY2j47ijUXVvB7cWuYvE:project/hcbdP8Kk4tj52qtoLtkLDG'
Configuration.setAPIKey(API_KEY);

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 100): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... Attempts left: ${retries}`);
            await delay(delayMs);
            return fetchWithRetry(fn, retries - 1, delayMs);
        }
        throw error;
    }
}

export async function fetchTokensFromStudio() {
    console.log("fetching tokens");
    try {
        const data = await fetchWithRetry(() => Graphql.exec<ProjectQuery>(
            Graphql.op(`
              query Project($urn: String!) {
                project(urn: $urn) {
                   name
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
              }`, {
              limit: 3000,
              urn: PROJECT_URN
            })
        ));

        if (data.errors) {
            console.log("error", data.errors[0].path);
        }

        if (!data.data) {
            console.log('No data found');
            return;
        }

        const rawTokenSets = data.data?.project?.sets as TokenSet[] || [];
        const themeGroups = data.data?.project?.themeGroups as ThemeGroup[] || [];

        const tokenSetTrees = rawTokenSets.reduce((acc: Record<string, object>, tokenSet) => {
            const stringified = tokenSet.tokens.reduce((tokenAcc: object, token: RawToken) => {
                try {
                    set(tokenAcc, token.name!.split('.'), rawTokenToSingleToken(token));
                } catch (e) {
                    console.log("error", e, token.name);
                }
                return tokenAcc;
            }, {});
            acc[tokenSet.name] = stringified;
            return acc;
        }, {});

        const projectInfo = {
            name: data.data?.project?.name
        }

        return {
            tokenSetTrees,
            themeGroups,
            projectInfo,
        }

    } catch (err) {
        console.error(err);
    }
}