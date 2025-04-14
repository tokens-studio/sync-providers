import { describe, test, expect, vi, beforeEach } from "vitest";
import { getAllTokenSets } from "./getAllTokenSets.js";
import { TokenSetType } from "@tokens-studio/sdk";

describe("getAllTokenSets", () => {
  const mockClient = {
    query: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset();
  });

  test("handles single page of token sets", async () => {
    const mockTokenSets = [
      {
        name: "colors",
        raw: { primary: "#000000" },
        type: TokenSetType.Static,
        orderIndex: 0,
      },
      {
        name: "typography",
        raw: { body: { size: "16px" } },
        type: TokenSetType.Static,
        orderIndex: 1,
      },
    ];

    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            tokenSets: {
              totalPages: 1,
              data: mockTokenSets,
            },
          },
        },
      },
    });

    const result = await getAllTokenSets(
      "project-id",
      "org-id",
      mockClient as any,
    );

    expect(result).toEqual({
      tokens: {
        colors: { primary: "#000000" },
        typography: { body: { size: "16px" } },
      },
      tokenSets: {
        colors: { isDynamic: false },
        typography: { isDynamic: false },
      },
      tokenSetOrder: ["colors", "typography"],
    });

    expect(mockClient.query).toHaveBeenCalledTimes(1);
  });

  test("handles multiple pages of token sets", async () => {
    // First page response
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            tokenSets: {
              totalPages: 3,
              data: [
                {
                  name: "colors",
                  raw: { primary: "#000000" },
                  type: TokenSetType.Static,
                  orderIndex: 0,
                },
              ],
            },
          },
        },
      },
    });

    // Second page response
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            tokenSets: {
              data: [
                {
                  name: "typography",
                  raw: { body: { size: "16px" } },
                  type: TokenSetType.Dynamic,
                  orderIndex: 1,
                },
              ],
            },
          },
        },
      },
    });

    // Third page response
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            tokenSets: {
              data: [
                {
                  name: "spacing",
                  raw: { small: "4px" },
                  type: TokenSetType.Static,
                  orderIndex: 2,
                },
              ],
            },
          },
        },
      },
    });

    const result = await getAllTokenSets(
      "project-id",
      "org-id",
      mockClient as any,
    );

    expect(result).toEqual({
      tokens: {
        colors: { primary: "#000000" },
        typography: { body: { size: "16px" } },
        spacing: { small: "4px" },
      },
      tokenSets: {
        colors: { isDynamic: false },
        typography: { isDynamic: true },
        spacing: { isDynamic: false },
      },
      tokenSetOrder: ["colors", "typography", "spacing"],
    });

    // Verify that the correct number of queries were made
    expect(mockClient.query).toHaveBeenCalledTimes(3);

    // Verify pagination parameters
    expect(mockClient.query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: {
          projectId: "project-id",
          organization: "org-id",
          name: "main",
          page: 1,
        },
      }),
    );

    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: {
          projectId: "project-id",
          organization: "org-id",
          name: "main",
          page: 2,
        },
      }),
    );

    expect(mockClient.query).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        variables: {
          projectId: "project-id",
          organization: "org-id",
          name: "main",
          page: 3,
        },
      }),
    );
  });

  test("handles empty token sets", async () => {
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: {
            tokenSets: {
              totalPages: 1,
              data: [],
            },
          },
        },
      },
    });

    const result = await getAllTokenSets(
      "project-id",
      "org-id",
      mockClient as any,
    );

    expect(result).toEqual({
      tokens: {},
      tokenSets: {},
      tokenSetOrder: [],
    });
  });

  test("handles missing branch data", async () => {
    mockClient.query.mockResolvedValueOnce({
      data: {
        project: {
          branch: null,
        },
      },
    });

    const result = await getAllTokenSets(
      "project-id",
      "org-id",
      mockClient as any,
    );
    expect(result).toBeNull();
  });

  test("handles API errors", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockClient.query.mockRejectedValueOnce(new Error("API Error"));

    const result = await getAllTokenSets(
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
});
