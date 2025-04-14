import { describe, test, expect } from "vitest";
import { getFigmaScopeForTokenType } from "./getFigmaScopeForTokenType.js";
import type { DesignToken } from "style-dictionary/types";

describe("getFigmaScopeForTokenType", () => {
  test("throws error when token type is missing", () => {
    const token = {} as DesignToken;
    expect(() => getFigmaScopeForTokenType(token)).toThrow(
      "Token type is required",
    );
  });

  test("uses original type from studio.tokens extension if available", () => {
    const token: DesignToken = {
      type: "dimension",
      $extensions: {
        "studio.tokens": {
          originalType: "spacing",
        },
      },
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(["GAP"]);
  });

  test.each([
    ["color", ["ALL_SCOPES"]],
    ["borderRadius", ["CORNER_RADIUS"]],
    ["borderWidth", ["STROKE_FLOAT"]],
    ["spacing", ["GAP"]],
    ["sizing", ["WIDTH_HEIGHT"]],
    ["opacity", ["OPACITY"]],
    ["fontSize", ["FONT_SIZE"]],
    ["lineHeight", ["LINE_HEIGHT"]],
    ["lineHeights", ["LINE_HEIGHT"]],
    ["letterSpacing", ["LETTER_SPACING"]],
    ["paragraphSpacing", ["PARAGRAPH_SPACING"]],
    ["fontFamily", ["FONT_FAMILY"]],
    ["fontFamilies", ["FONT_FAMILY"]],
    ["text", ["TEXT_CONTENT"]],
    ["customType", ["ALL_SCOPES"]],
  ])("maps %s type to %s Figma scope(s)", (tokenType, expectedScopes) => {
    const token: DesignToken = {
      type: tokenType,
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(expectedScopes);
  });

  test("handles font weights with numeric values", () => {
    const numericToken: DesignToken = {
      type: "fontWeight",
      original: { value: "400" },
    } as DesignToken;

    expect(getFigmaScopeForTokenType(numericToken)).toEqual(["FONT_WEIGHT"]);
  });

  test("handles font weights with string values", () => {
    const stringToken: DesignToken = {
      type: "fontWeight",
      original: { value: "Regular" },
    } as DesignToken;

    expect(getFigmaScopeForTokenType(stringToken)).toEqual(["FONT_STYLE"]);
  });

  test("is case insensitive", () => {
    const token: DesignToken = {
      type: "COLOR",
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(["ALL_SCOPES"]);
  });

  test("handles numeric font weight references correctly", () => {
    const token = {
      type: "fontWeight",
      original: { value: "{fontweight.default}" },
      value: "700",
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(["FONT_WEIGHT"]);
  });

  test("handles direct numeric font weights correctly", () => {
    const token = {
      type: "fontWeight",
      original: { value: "700" },
      value: "700",
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(["FONT_WEIGHT"]);
  });

  test("handles named font weights correctly", () => {
    const token = {
      type: "fontWeight",
      original: { value: "Bold" },
      value: "Bold",
    } as DesignToken;

    expect(getFigmaScopeForTokenType(token)).toEqual(["FONT_STYLE"]);
  });
});
