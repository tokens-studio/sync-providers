import { describe, it, expect } from "vitest";
import { getAliasName } from "./getAliasName.js";

describe("getAliasName", () => {
  it("should remove curly braces from a string", () => {
    expect(getAliasName("{color.primary}")).toBe("color.primary");
  });

  it("should trim whitespace and remove curly braces", () => {
    expect(getAliasName("  {color.secondary}  ")).toBe("color.secondary");
  });

  it("should handle strings without curly braces", () => {
    expect(getAliasName("color.tertiary")).toBe("color.tertiary");
  });

  it("should handle empty string", () => {
    expect(getAliasName("")).toBe("");
  });

  it("should handle string with only whitespace", () => {
    expect(getAliasName("   ")).toBe("");
  });

  it("should handle multiple sets of curly braces", () => {
    expect(getAliasName("{{color.primary}}")).toBe("color.primary");
  });
});
