import { describe, test, expect } from "vitest";
import { getFigmaTypeForTokenType } from "./getFigmaTypeForTokenType.js";
import type { DesignToken } from "style-dictionary/types";

describe("getFigmaTypeForTokenType", () => {
  test("throws error when token type is missing", () => {
    const token = {} as DesignToken;
    expect(() => getFigmaTypeForTokenType(token)).toThrow(
      "Token type is required",
    );
  });

  test("handles font weights correctly", () => {
    const numericToken: DesignToken = {
      type: "fontWeight",
      original: { value: "400" },
    } as DesignToken;
    const stringToken: DesignToken = {
      type: "fontWeight",
      original: { value: "Regular" },
    } as DesignToken;

    expect(getFigmaTypeForTokenType(numericToken)).toBe("FLOAT");
    expect(getFigmaTypeForTokenType(stringToken)).toBe("STRING");
  });

  test.each([
    ["color", "COLOR"],
    ["borderRadius", "FLOAT"],
    ["spacing", "FLOAT"],
    ["sizing", "FLOAT"],
    ["opacity", "FLOAT"],
    ["fontSize", "FLOAT"],
    ["lineHeight", "FLOAT"],
    ["letterSpacing", "FLOAT"],
    ["paragraphSpacing", "FLOAT"],
    ["dimension", "FLOAT"],
    ["number", "FLOAT"],
    ["fontFamily", "STRING"],
    ["fontWeight", "STRING"],
    ["textAlign", "STRING"],
    ["textDecoration", "STRING"],
    ["textTransform", "STRING"],
    ["boolean", "BOOLEAN"],
    ["customType", "STRING"],
  ])("maps %s type to %s Figma type", (tokenType, expectedFigmaType) => {
    const token: DesignToken = {
      type: tokenType,
    } as DesignToken;

    expect(getFigmaTypeForTokenType(token)).toBe(expectedFigmaType);
  });

  test("is case insensitive", () => {
    const token: DesignToken = {
      type: "COLOR",
    } as DesignToken;

    expect(getFigmaTypeForTokenType(token)).toBe("COLOR");
  });
});
