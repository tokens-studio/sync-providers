import { describe, expect, test } from "vitest";
import { hasSameAttributes } from "./hasSameAttributes.js";
import type { ExistingVariable } from "./operate.js";
import { variableIdToNameMap } from "./operate.js";
import type { FlattenedNode } from "@tokens-studio/internal-types";

describe("hasSameAttributes", () => {
  test("returns true when all values match", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "color/primary",
      type: "COLOR",
      value: { r: 1, g: 0, b: 0, a: 1 },
      scopes: ["ALL_SCOPES"],
      description: "Primary color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { r: 1, g: 0, b: 0, a: 1 },
      },
    };

    const newToken: FlattenedNode = {
      name: "color/primary",
      type: "color",
      value: { r: 1, g: 0, b: 0, a: 1 },
      original: {
        name: "color/primary",
        value: "#FF0000",
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Primary color",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(true);
  });

  test("returns false when values don't match", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "color/primary",
      type: "COLOR",
      value: { r: 1, g: 0, b: 0, a: 1 },
      scopes: ["ALL_SCOPES"],
      description: "Primary color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { r: 1, g: 0, b: 0, a: 1 },
      },
    };

    const newToken: FlattenedNode = {
      name: "color/primary",
      type: "color",
      value: { r: 0, g: 1, b: 0, a: 1 },
      original: {
        name: "color/primary",
        value: "#00FF00",
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Primary color",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });

  test("returns false when scopes don't match", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "color/primary",
      type: "COLOR",
      value: { r: 1, g: 0, b: 0, a: 1 },
      scopes: ["ALL_FILLS"],
      description: "Primary color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { r: 1, g: 0, b: 0, a: 1 },
      },
    };

    const newToken: FlattenedNode = {
      name: "color/primary",
      type: "color",
      value: { r: 1, g: 0, b: 0, a: 1 },
      original: {
        name: "color/primary",
        value: "#FF0000",
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Primary color",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });

  test("returns false when descriptions don't match", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "color/primary",
      type: "COLOR",
      value: { r: 1, g: 0, b: 0, a: 1 },
      scopes: ["ALL_SCOPES"],
      description: "Primary color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { r: 1, g: 0, b: 0, a: 1 },
      },
    };

    const newToken: FlattenedNode = {
      name: "color/primary",
      type: "color",
      value: { r: 1, g: 0, b: 0, a: 1 },
      original: {
        name: "color/primary",
        value: "#FF0000",
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Different description",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });

  test("handles reference values correctly", () => {
    // Clear and set up the mock for variableIdToNameMap
    variableIdToNameMap.clear();
    variableIdToNameMap.set("123", "color.base.red");

    const existing: ExistingVariable = {
      id: "123",
      name: "color/primary",
      type: "COLOR",
      value: { type: "VARIABLE_ALIAS", id: "123" },
      scopes: ["ALL_SCOPES"],
      description: "Primary color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { type: "VARIABLE_ALIAS", id: "123" },
      },
    };

    const newToken: FlattenedNode = {
      name: "color/primary",
      type: "color",
      value: "{color.base.red}",
      original: {
        name: "color/primary",
        value: "{color.base.red}",
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: true,
      },
      description: "Primary color",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(true);
  });

  test("handles non-color values", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "spacing/small",
      type: "FLOAT",
      value: "8",
      scopes: ["ALL_SCOPES"],
      description: "Small spacing",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: "8",
      },
    };

    const newToken: FlattenedNode = {
      name: "spacing/small",
      type: "number",
      value: "8",
      original: {
        name: "spacing/small",
        value: "8",
        type: "FLOAT",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Small spacing",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(true);
  });

  test("normalizes floating point numbers with many decimals", () => {
    const existing: ExistingVariable = {
      id: "123",
      name: "spacing/precise",
      type: "FLOAT",
      value: 11.000000001,
      scopes: ["ALL_SCOPES"],
      description: "Precise spacing",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: 11.000000001,
      },
    };

    const newToken: FlattenedNode = {
      name: "spacing/precise",
      type: "number",
      value: "11",
      original: {
        name: "spacing/precise",
        value: "11",
        type: "FLOAT",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Precise spacing",
    };

    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(true);
  });

  // New test cases for the updated functionality

  test("returns false when changing from raw value to reference with same resolved value", () => {
    // Set up the mock for variableIdToNameMap
    variableIdToNameMap.clear();
    variableIdToNameMap.set("456", "color.grey.50");

    // Existing variable with raw color value
    const existing: ExistingVariable = {
      id: "123",
      name: "semantic/neutral/50",
      type: "COLOR",
      value: { r: 0.909804, g: 0.909804, b: 0.909804, a: 1 }, // #E8E8E8
      scopes: ["ALL_SCOPES"],
      description: "Neutral color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { r: 0.909804, g: 0.909804, b: 0.909804, a: 1 },
      },
    };

    // New token with reference to another variable that resolves to the same color
    const newToken: FlattenedNode = {
      name: "semantic/neutral/50",
      type: "color",
      value: { r: 0.909804, g: 0.909804, b: 0.909804, a: 1 }, // Same resolved value
      original: {
        name: "semantic/neutral/50",
        value: "{color.grey.50}", // But now it's a reference
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: true,
      },
      description: "Neutral color",
    };

    // Should return false because we're changing from raw value to reference
    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });

  test("returns false when changing from reference to raw value with same resolved value", () => {
    // Set up the mock for variableIdToNameMap
    variableIdToNameMap.clear();
    variableIdToNameMap.set("456", "color.grey.50");

    // Existing variable with reference
    const existing: ExistingVariable = {
      id: "123",
      name: "semantic/neutral/50",
      type: "COLOR",
      value: { type: "VARIABLE_ALIAS", id: "456" },
      scopes: ["ALL_SCOPES"],
      description: "Neutral color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { type: "VARIABLE_ALIAS", id: "456" },
      },
    };

    // New token with raw value that resolves to the same color
    const newToken: FlattenedNode = {
      name: "semantic/neutral/50",
      type: "color",
      value: { r: 0.909804, g: 0.909804, b: 0.909804, a: 1 }, // Same resolved value
      original: {
        name: "semantic/neutral/50",
        value: "#E8E8E8", // But now it's a raw value
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: false,
      },
      description: "Neutral color",
    };

    // Should return false because we're changing from reference to raw value
    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });

  test("returns false when changing from one reference to another reference", () => {
    // Set up the mock for variableIdToNameMap
    variableIdToNameMap.clear();
    variableIdToNameMap.set("456", "color.grey.50");

    // Existing variable with reference to color.grey.50
    const existing: ExistingVariable = {
      id: "123",
      name: "semantic/neutral/50",
      type: "COLOR",
      value: { type: "VARIABLE_ALIAS", id: "456" },
      scopes: ["ALL_SCOPES"],
      description: "Neutral color",
      collection: "tokens",
      mode: "default",
      valuesByMode: {
        default: { type: "VARIABLE_ALIAS", id: "456" },
      },
    };

    // New token with reference to a different variable
    const newToken: FlattenedNode = {
      name: "semantic/neutral/50",
      type: "color",
      value: { r: 0.909804, g: 0.909804, b: 0.909804, a: 1 }, // Same resolved value
      original: {
        name: "semantic/neutral/50",
        value: "{color.base.grey.50}", // Different reference
        type: "COLOR",
      },
      attributes: {
        figmaScopes: ["ALL_SCOPES"],
        isUsingPureReference: true,
      },
      description: "Neutral color",
    };

    // Should return false because we're changing to a different reference
    expect(
      hasSameAttributes({ existing, newToken, existingValue: existing.value }),
    ).toBe(false);
  });
});
