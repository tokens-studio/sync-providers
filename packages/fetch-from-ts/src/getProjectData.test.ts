/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { getProjectData } from "./getProjectData.js";
import { getAllTokenSets } from "./getAllTokenSets.js";
import { GET_PROJECT_DATA_QUERY } from "./queries/GET_PROJECT_DATA_QUERY.js";

// Mock getAllTokenSets module
vi.mock("./getAllTokenSets.js", () => ({
  getAllTokenSets: vi.fn(),
}));

describe("getProjectData", () => {
  const mockClient = {
    query: vi.fn(),
  };

  const mockThemeGroups = {
    data: [
      {
        id: "theme1",
        name: "Theme 1",
        options: [
          {
            name: "Default",
            selectedTokenSets: { set1: "enabled" },
          },
        ],
      },
    ],
  };

  const mockTokenData = {
    tokens: { color: { primary: "#000000" } },
    tokenSets: { set1: { isDynamic: false } },
    tokenSetOrder: ["set1"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset();
  });

  test("successfully fetches and formats project data", async () => {
    // Setup mocks
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            themeGroups: mockThemeGroups,
          },
        },
      },
    });

    (getAllTokenSets as any).mockResolvedValueOnce(mockTokenData);

    // Execute
    const result = await getProjectData(
      "project-id",
      "org-id",
      mockClient as any,
    );

    // Verify
    expect(result).toEqual({
      tokens: mockTokenData.tokens,
      tokenSets: mockTokenData.tokenSets,
      tokenSetOrder: mockTokenData.tokenSetOrder,
      themes: [
        {
          id: "theme1",
          name: "Theme 1",
          options: [
            {
              name: "Default",
              selectedTokenSets: { set1: "enabled" },
            },
          ],
        },
      ],
    });

    // Verify client.query was called with correct parameters
    expect(mockClient.query).toHaveBeenCalledWith({
      query: GET_PROJECT_DATA_QUERY,
      variables: {
        projectId: "project-id",
        organization: "org-id",
        name: "main",
      },
    });
  });

  test("returns null when branch data is missing", async () => {
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: null,
        },
      },
    });

    const result = await getProjectData(
      "project-id",
      "org-id",
      mockClient as any,
    );
    expect(result).toBeNull();
  });

  test("returns null and logs error when query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockClient.query.mockRejectedValueOnce(new Error("API Error"));

    const result = await getProjectData(
      "project-id",
      "org-id",
      mockClient as any,
    );

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching tokens",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  test("handles missing tokenData gracefully", async () => {
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            themeGroups: mockThemeGroups,
          },
        },
      },
    });

    (getAllTokenSets as any).mockResolvedValueOnce(undefined);

    const result = await getProjectData(
      "project-id",
      "org-id",
      mockClient as any,
    );

    expect(result).toEqual({
      tokens: null,
      tokenSets: {},
      tokenSetOrder: [],
      themes: expect.any(Array),
    });
  });
});
