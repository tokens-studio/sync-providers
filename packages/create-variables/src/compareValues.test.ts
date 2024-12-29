import { describe, expect, test } from "vitest";
import { compareValues } from "./compareValues.js";
import type { ExistingVariable } from "./operate.js";
import { variableIdToNameMap } from "./operate.js";
import type { FlattenedNode } from "../../internal-types/src/FlattenedNode.js";

describe("compareValues", () => {
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

    expect(compareValues(existing, newToken)).toBe(true);
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

    expect(compareValues(existing, newToken)).toBe(false);
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

    expect(compareValues(existing, newToken)).toBe(false);
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

    expect(compareValues(existing, newToken)).toBe(false);
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

    expect(compareValues(existing, newToken)).toBe(true);
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

    expect(compareValues(existing, newToken)).toBe(true);
  });
});
