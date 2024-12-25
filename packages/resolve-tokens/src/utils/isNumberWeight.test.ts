import { describe, expect, test } from "vitest";
import { isNumberWeight } from "./isNumberWeight.js";

describe("isNumberWeight", () => {
  test("returns true for number values", () => {
    expect(isNumberWeight(400)).toBe(true);
    expect(isNumberWeight(700)).toBe(true);
    expect(isNumberWeight(0)).toBe(true);
  });

  test("returns true for numeric strings", () => {
    expect(isNumberWeight("400")).toBe(true);
    expect(isNumberWeight("700")).toBe(true);
    expect(isNumberWeight("0")).toBe(true);
  });

  test("returns false for non-numeric strings", () => {
    expect(isNumberWeight("regular")).toBe(false);
    expect(isNumberWeight("{foobar}")).toBe(false);
    expect(isNumberWeight("500 Italic")).toBe(false);
  });
});
