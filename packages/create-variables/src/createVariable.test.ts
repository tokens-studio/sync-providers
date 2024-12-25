import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVariable } from "./createVariable.js";

describe("createVariable", () => {
  const mockCollection = { id: "collection-id" } as VariableCollection;
  const mockVariable = { id: "variable-id", name: "test-variable" };
  const mockCreateVariable = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("figma", {
      variables: {
        createVariable: mockCreateVariable,
      },
    });
  });

  it("should create a variable with the correct parameters", async () => {
    mockCreateVariable.mockImplementation(() => mockVariable);

    const result = await createVariable({
      name: "test-variable",
      collection: mockCollection,
      type: "COLOR",
    });

    expect(mockCreateVariable).toHaveBeenCalledWith(
      "test-variable",
      mockCollection,
      "COLOR",
    );
    expect(result).toEqual(mockVariable);
  });

  it("should throw error when creation fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error");
    const mockError = new Error("Failed to create variable");
    mockCreateVariable.mockImplementation(() => {
      throw mockError;
    });

    await expect(
      createVariable({
        name: "test-variable",
        collection: mockCollection,
        type: "COLOR",
      }),
    ).rejects.toThrow(mockError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
  });
});
