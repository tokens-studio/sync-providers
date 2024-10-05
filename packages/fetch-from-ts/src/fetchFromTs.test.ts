import { expect, test, describe } from 'vitest';
import { fetchTokensFromStudio } from "./fetchFromTs";

describe("fetchFromTs", () => {
    test("should fetch tokens from Tokens Studio", async () => {
        const tokens = await fetchTokensFromStudio();
        expect(tokens).toBeDefined();
    }, { timeout: 10000 }); // 10 second timeout
});