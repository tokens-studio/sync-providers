import { describe, it, expect } from "vitest";
import { convertArrayToNestedObject } from "./convertArrayToNestedObject.js";

describe("convertArrayToNestedObject", () => {
  it("should convert a flat array of tokens into a nested object", () => {
    const tokens = [
      { name: "color.primary", value: "#0000FF", type: "color" },
      { name: "color.secondary", value: "#FF0000", type: "color" },
      { name: "spacing.small", value: "4px", type: "dimension" },
      { name: "font.size.base", value: "16px", type: "dimension" },
    ];

    const expected = {
      color: {
        primary: { value: "#0000FF", type: "color" },
        secondary: { value: "#FF0000", type: "color" },
      },
      spacing: {
        small: { value: "4px", type: "dimension" },
      },
      font: {
        size: {
          base: { value: "16px", type: "dimension" },
        },
      },
    };

    const result = convertArrayToNestedObject(tokens);
    expect(result).toEqual(expected);
  });

  it("should handle empty input array", () => {
    const tokens: Array<{ name: string; value: any; type: string }> = [];
    const result = convertArrayToNestedObject(tokens);
    expect(result).toEqual({});
  });

  it("should handle single-level tokens", () => {
    const tokens = [
      { name: "primary", value: "#0000FF", type: "color" },
      { name: "secondary", value: "#FF0000", type: "color" },
    ];

    const expected = {
      primary: { value: "#0000FF", type: "color" },
      secondary: { value: "#FF0000", type: "color" },
    };

    const result = convertArrayToNestedObject(tokens);
    expect(result).toEqual(expected);
  });

  it("should handle deeply nested tokens", () => {
    const tokens = [
      { name: "theme.light.color.primary", value: "#0000FF", type: "color" },
      { name: "theme.dark.color.primary", value: "#000080", type: "color" },
    ];

    const expected = {
      theme: {
        light: {
          color: {
            primary: { value: "#0000FF", type: "color" },
          },
        },
        dark: {
          color: {
            primary: { value: "#000080", type: "color" },
          },
        },
      },
    };

    const result = convertArrayToNestedObject(tokens);
    expect(result).toEqual(expected);
  });
});
