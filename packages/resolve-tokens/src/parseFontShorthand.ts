import { convertToUnitDimensions } from "./createSDForAllGivenThemes.js";

interface FontProperties {
  fontWeight?: number;
  fontSize?: string;
  lineHeight?: string;
  fontFamily?: string;
}

export function parseFontShorthand(fontShorthand: string): FontProperties {
  const parts = fontShorthand.trim().split(/\s+/);
  const result: FontProperties = {};

  // Font weight
  if (/^(\d{3})$/.test(parts[0])) {
    const weightValue = parts.shift() || '';
    result.fontWeight = parseInt(weightValue, 10) || 400;
  }

  // Font size and line height
  const sizeAndLineHeight = parts.shift();
  if (sizeAndLineHeight) {
    const [fontSize, lineHeight] = sizeAndLineHeight.split('/');
    result.fontSize = convertToUnitDimensions(fontSize);
    if (lineHeight) {
      result.lineHeight = convertToUnitDimensions(lineHeight);
    }
  }

  // Font family (the rest)
  if (parts.length > 0) {
    // Check if the font family is enclosed in quotes
    if (parts[0].startsWith("'") || parts[0].startsWith('"')) {
      const quoteChar = parts[0][0];
      let fontFamily = '';
      while (parts.length > 0 && !parts[0].endsWith(quoteChar)) {
        fontFamily += parts.shift() + ' ';
      }
      if (parts.length > 0) {
        fontFamily += parts.shift();
      }
      result.fontFamily = fontFamily.slice(1, -1); // Remove quotes
    } else {
      result.fontFamily = parts.join(' ');
    }
  }

  return result;
}