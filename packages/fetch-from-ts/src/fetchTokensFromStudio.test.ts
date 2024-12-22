import { expect, test, describe } from "vitest";
import { fetchTokensFromStudio } from "./fetchTokensFromStudio.js";

const apiKey = "api_key_13496355-f477-4cc6-8e7a-cc13688e9320";
const organization = "0d1d924a-14fb-4e87-b436-bd8c66926684";
const projectId = "15f31a9c-907b-46d5-a9df-8286b3b38e08";

// Skipping until we know how to solve the error with ws implementation in test env
describe.skip("fetchFromTs", () => {
  test(
    "should fetch tokens from Tokens Studio",
    async () => {
      const tokens = await fetchTokensFromStudio({
        projectId,
        organization,
        apiKey,
      });
      expect(tokens).toBeDefined();
    },
    { timeout: 10000 },
  ); // 10 second timeout because our API is slow and brittle.
});
