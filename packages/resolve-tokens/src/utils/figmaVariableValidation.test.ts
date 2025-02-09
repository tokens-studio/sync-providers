import { describe, expect, it } from "vitest";
import {
  isGradient,
  isCssVariable,
  isMultiValueDimension,
  isValidColor,
  getInvalidFigmaVariableReason,
} from "./figmaVariableValidation.js";

describe("figmaVariableValidation", () => {
  describe("isGradient", () => {
    it("should return true for linear gradient values", () => {
      expect(isGradient("linear-gradient(red, blue)")).toBe(true);
    });

    it("should return false for non-gradient values", () => {
      expect(isGradient("red")).toBe(false);
      expect(isGradient("#ff0000")).toBe(false);
    });
  });

  describe("isCssVariable", () => {
    it("should return true for CSS variable values", () => {
      expect(isCssVariable("var(--color-primary)")).toBe(true);
      expect(isCssVariable("var(--cds-default-ui-nav-action-visited)")).toBe(
        true,
      );
    });

    it("should return false for non-CSS variable values", () => {
      expect(isCssVariable("red")).toBe(false);
      expect(isCssVariable("#ff0000")).toBe(false);
    });
  });

  describe("isMultiValueDimension", () => {
    it("should return true for multi-value dimension tokens", () => {
      expect(isMultiValueDimension("dimension", "10px 20px")).toBe(true);
    });

    it("should return false for single-value dimension tokens", () => {
      expect(isMultiValueDimension("dimension", "10px")).toBe(false);
    });

    it("should return false for non-dimension types", () => {
      expect(isMultiValueDimension("color", "10px 20px")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isMultiValueDimension("dimension", 123)).toBe(false);
      expect(isMultiValueDimension("dimension", null)).toBe(false);
      expect(isMultiValueDimension("dimension", undefined)).toBe(false);
    });
  });

  describe("getInvalidFigmaVariableReason", () => {
    it("should return undefined for valid color values", () => {
      expect(getInvalidFigmaVariableReason("color", "#ff0000")).toBeUndefined();
      expect(
        getInvalidFigmaVariableReason("color", "rgb(255, 0, 0)"),
      ).toBeUndefined();
      expect(
        getInvalidFigmaVariableReason("color", "hsl(0, 100%, 50%)"),
      ).toBeUndefined();
    });

    it("should return error message for CSS variable color values", () => {
      expect(
        getInvalidFigmaVariableReason("color", "var(--color-primary)"),
      ).toBe(
        "CSS variable values are not supported for color tokens in Figma variables",
      );
      expect(
        getInvalidFigmaVariableReason(
          "color",
          "var(--cds-default-ui-nav-action-visited)",
        ),
      ).toBe(
        "CSS variable values are not supported for color tokens in Figma variables",
      );
    });

    it("should return error message for gradient values", () => {
      expect(
        getInvalidFigmaVariableReason("color", "linear-gradient(red, blue)"),
      ).toBe("Gradient values are not supported in Figma variables");
    });

    it("should return error message for excluded types", () => {
      expect(getInvalidFigmaVariableReason("typography", "some value")).toBe(
        "Type 'typography' is not supported in Figma variables",
      );
    });

    it("should return error message for multi-value dimensions", () => {
      expect(getInvalidFigmaVariableReason("dimension", "10px 20px")).toBe(
        "Multi-value dimension tokens are not supported in Figma variables",
      );
    });
  });
});
