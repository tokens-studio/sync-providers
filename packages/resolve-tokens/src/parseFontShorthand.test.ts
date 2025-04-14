import { describe, test, expect } from "vitest";
import { parseFontShorthand } from "./parseFontShorthand.js";

describe("parseFontShorthand", () => {
  test("parses font weight, size, and family", () => {
    const result = parseFontShorthand("700 16px Arial");
    expect(result).toEqual({
      fontWeight: 700,
      fontSize: "16px",
      fontFamily: "Arial",
    });
  });

  test("parses font size and family without weight", () => {
    const result = parseFontShorthand("16px Arial");
    expect(result).toEqual({
      fontSize: "16px",
      fontFamily: "Arial",
    });
  });

  test("parses line height when provided", () => {
    const result = parseFontShorthand("400 16px/1.5 Arial");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: "1.5px",
      fontFamily: "Arial",
    });
  });

  test("handles multi-word font families without adding quotes", () => {
    const result = parseFontShorthand("400 16px Helvetica Neue");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Helvetica Neue",
    });
  });

  test("removes quotes from already quoted font families", () => {
    const result = parseFontShorthand("400 16px 'Helvetica Neue'");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Helvetica Neue",
    });

    const resultDoubleQuotes = parseFontShorthand('400 16px "Helvetica Neue"');
    expect(resultDoubleQuotes).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Helvetica Neue",
    });
  });

  test("takes only first font family when multiple are provided with comma", () => {
    const result = parseFontShorthand("400 16px Arial, Helvetica, sans-serif");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Arial",
    });
  });

  test("handles font sizes with different units", () => {
    const result = parseFontShorthand("400 1.5rem Helvetica");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "1.5rem",
      fontFamily: "Helvetica",
    });
  });

  test("handles line heights with different units", () => {
    const result = parseFontShorthand("400 16px/1.5rem Arial");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: "1.5rem",
      fontFamily: "Arial",
    });
  });

  test("handles extra whitespace", () => {
    const result = parseFontShorthand("  400   16px    Arial   ");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Arial",
    });
  });

  test("handles font families with numbers in their names", () => {
    const result = parseFontShorthand("400 16px Helvetica 55 Roman");
    expect(result).toEqual({
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "Helvetica 55 Roman",
    });
  });
});
