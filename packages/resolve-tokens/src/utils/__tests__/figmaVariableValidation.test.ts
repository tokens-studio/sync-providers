import { describe, expect, it } from "vitest";
import {
  isGradient,
  isMultiValueDimension,
  getInvalidFigmaVariableReason,
} from "../figmaVariableValidation.js";

describe("figmaVariableValidation", () => {
  describe("isGradient", () => {
    it("should return true for linear gradient values", () => {
      expect(isGradient("linear-gradient(to right, #000, #fff)")).toBe(true);
    });

    it("should return false for non-gradient values", () => {
      expect(isGradient("#000")).toBe(false);
      expect(isGradient(123)).toBe(false);
      expect(isGradient(null)).toBe(false);
      expect(isGradient(undefined)).toBe(false);
    });
  });

  describe("isMultiValueDimension", () => {
    it("should return true for dimension type with space-separated values", () => {
      expect(isMultiValueDimension("dimension", "10px 20px")).toBe(true);
    });

    it("should return false for single dimension values", () => {
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
    it("should return reason for excluded types", () => {
      expect(getInvalidFigmaVariableReason("typography", "#000")).toBe(
        "Type 'typography' is not supported in Figma variables",
      );
      expect(getInvalidFigmaVariableReason("shadow", "#000")).toBe(
        "Type 'shadow' is not supported in Figma variables",
      );
    });

    it("should return reason for gradient values", () => {
      expect(
        getInvalidFigmaVariableReason(
          "color",
          "linear-gradient(to right, #000, #fff)",
        ),
      ).toBe("Gradient values are not supported in Figma variables");
    });

    it("should return reason for multi-value dimensions", () => {
      expect(getInvalidFigmaVariableReason("dimension", "10px 20px")).toBe(
        "Multi-value dimension tokens are not supported in Figma variables",
      );
    });

    it("should return undefined for valid cases", () => {
      expect(getInvalidFigmaVariableReason("color", "#000")).toBeUndefined();
      expect(
        getInvalidFigmaVariableReason("dimension", "10px"),
      ).toBeUndefined();
    });
  });
});
