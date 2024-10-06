import { expect, test, describe } from "vitest";
import { fetchTokensFromStudio } from "./fetchTokensFromStudio.js";

const urn =
  "urn:ts:tokens:eu-central-1:9NqwHFgsXTAMc2VXsimS7H:project/sDeXdrjEds6Y7w8gzUJsQ6";
const apiKey = "api_key_949d5d1a-353a-43f3-b300-80e390b5c99a";

describe("fetchFromTs", () => {
  test(
    "should fetch tokens from Tokens Studio",
    async () => {
      const tokens = await fetchTokensFromStudio({ urn, apiKey });
      expect(tokens).toBeDefined();
    },
    { timeout: 10000 },
  ); // 10 second timeout because our API is slow and brittle.
});
