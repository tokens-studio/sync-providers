import { describe, it, expect } from "vitest";
import type { FlattenedNode } from "./FlattenedNode";

describe("FlattenedNode", () => {
  it("should allow valid FlattenedNode object", () => {
    const validNode: FlattenedNode = {
      name: "color.primary",
      value: "#000000",
      type: "color",
      attributes: {
        isUsingPureReference: false,
      },
      original: {
        name: "color.primary",
        value: "#000000",
        type: "color",
      },
    };

    expect(validNode.name).toBe("color.primary");
    expect(validNode.value).toBe("#000000");
    expect(validNode.type).toBe("color");
    expect(validNode.attributes.isUsingPureReference).toBe(false);
  });

  it("should allow optional figma-related attributes", () => {
    const nodeWithFigmaAttributes: FlattenedNode = {
      name: "spacing.small",
      value: "8px",
      type: "dimension",
      attributes: {
        isUsingPureReference: true,
        invalidForFigmaVariableReason: "Invalid format",
        figmaScopes: ["ALL_SCOPES"],
        figmaType: "FLOAT",
      },
      original: {
        name: "spacing.small",
        value: "8px",
        type: "dimension",
      },
    };

    expect(nodeWithFigmaAttributes.attributes.isUsingPureReference).toBe(true);
    expect(
      nodeWithFigmaAttributes.attributes.invalidForFigmaVariableReason,
    ).toBe("Invalid format");
    expect(Array.isArray(nodeWithFigmaAttributes.attributes.figmaScopes)).toBe(
      true,
    );
    expect(nodeWithFigmaAttributes.attributes.figmaType).toBe("FLOAT");
  });

  it("should maintain original values separate from current values", () => {
    const nodeWithDifferentOriginal: FlattenedNode = {
      name: "modified.token",
      value: "new-value",
      type: "string",
      attributes: {
        isUsingPureReference: false,
      },
      original: {
        name: "original.token",
        value: "original-value",
        type: "string",
      },
    };

    expect(nodeWithDifferentOriginal.name).toBe("modified.token");
    expect(nodeWithDifferentOriginal.original.name).toBe("original.token");
    expect(nodeWithDifferentOriginal.value).toBe("new-value");
    expect(nodeWithDifferentOriginal.original.value).toBe("original-value");
  });

  it("should type check required properties", () => {
    // This test is for type checking only
    const completeNode: FlattenedNode = {
      name: "test",
      value: "test",
      type: "string",
      attributes: {
        isUsingPureReference: false,
      },
      original: {
        name: "test",
        value: "test",
        type: "string",
      },
    };

    expect(completeNode).toHaveProperty("name");
    expect(completeNode).toHaveProperty("value");
    expect(completeNode).toHaveProperty("type");
    expect(completeNode).toHaveProperty("attributes");
    expect(completeNode).toHaveProperty("original");
    expect(completeNode.attributes).toHaveProperty("isUsingPureReference");
  });
});
