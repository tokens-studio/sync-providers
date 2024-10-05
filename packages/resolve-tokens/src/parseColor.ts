  // TODO: Write tests
  
  export function parseColor(color: string): { r: number; g: number; b: number; a: number } {
    color = color.trim();
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
    const rgbaRegex =
      /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/;
    const hslRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
    const hslaRegex =
      /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*([\d.]+)\s*\)$/;
    const hexRegex = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    const floatRgbRegex =
      /^\{\s*r:\s*[\d.]+,\s*g:\s*[\d.]+,\s*b:\s*[\d.]+(,\s*opacity:\s*[\d.]+)?\s*\}$/;
  
    const roundToSixDecimals = (num: number) => Math.round(num * 1000000) / 1000000;

    if (rgbRegex.test(color)) {
      const [, r, g, b] = color.match(rgbRegex) as RegExpMatchArray;
      return { 
        r: roundToSixDecimals(parseInt(r) / 255), 
        g: roundToSixDecimals(parseInt(g) / 255), 
        b: roundToSixDecimals(parseInt(b) / 255), 
        a: 1 
      };
    } else if (rgbaRegex.test(color)) {
      const [, r, g, b, a] = color.match(rgbaRegex) as RegExpMatchArray;
      return {
        r: roundToSixDecimals(parseInt(r) / 255),
        g: roundToSixDecimals(parseInt(g) / 255),
        b: roundToSixDecimals(parseInt(b) / 255),
        a: roundToSixDecimals(parseFloat(a)),
      };
    } else if (hslRegex.test(color)) {
      const [, h, s, l] = color.match(hslRegex) as RegExpMatchArray;
      return { ...hslToRgbFloat(parseInt(h), parseInt(s) / 100, parseInt(l) / 100), a: 1 };
    } else if (hslaRegex.test(color)) {
      const [, h, s, l, a] = color.match(hslaRegex) as RegExpMatchArray;
      return {
        ...hslToRgbFloat(parseInt(h), parseInt(s) / 100, parseInt(l) / 100),
        a: parseFloat(a),
      };
    } else if (hexRegex.test(color)) {
      const hexValue = color.substring(1);
      let r, g, b, a;
      if (hexValue.length === 3 || hexValue.length === 4) {
        r = parseInt(hexValue[0] + hexValue[0], 16) / 255;
        g = parseInt(hexValue[1] + hexValue[1], 16) / 255;
        b = parseInt(hexValue[2] + hexValue[2], 16) / 255;
        a = hexValue.length === 4 ? parseInt(hexValue[3] + hexValue[3], 16) / 255 : 1;
      } else if (hexValue.length === 6 || hexValue.length === 8) {
        r = parseInt(hexValue.slice(0, 2), 16) / 255;
        g = parseInt(hexValue.slice(2, 4), 16) / 255;
        b = parseInt(hexValue.slice(4, 6), 16) / 255;
        a = hexValue.length === 8 ? parseInt(hexValue.slice(6, 8), 16) / 255 : 1;
      } else {
        throw new Error("Invalid hex color format");
      }
      return {
        r: roundToSixDecimals(r),
        g: roundToSixDecimals(g),
        b: roundToSixDecimals(b),
        a: roundToSixDecimals(a),
      };
    } else if (floatRgbRegex.test(color)) {
      const parsedColor = JSON.parse(color);
      return {
        r: parsedColor.r,
        g: parsedColor.g,
        b: parsedColor.b,
        a: parsedColor.opacity !== undefined ? parsedColor.opacity : 1,
      };
    } else {
      throw new Error("Invalid color format");
    }
  }
  
  export function hslToRgbFloat(h: number, s: number, l: number) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
  
    if (s === 0) {
      return { r: l, g: l, b: l };
    }
  
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, (h + 1 / 3) % 1);
    const g = hue2rgb(p, q, h % 1);
    const b = hue2rgb(p, q, (h - 1 / 3) % 1);
  
    const roundToSixDecimals = (num: number) => Math.round(num * 1000000) / 1000000;
  
    return { 
      r: roundToSixDecimals(r), 
      g: roundToSixDecimals(g), 
      b: roundToSixDecimals(b) 
    };
  }

  export function normalizeFigmaColor({ r, g, b, a }: { r: number, g: number, b: number, a: number }): { r: number; g: number; b: number; a: number } {
    const roundToSixDecimals = (num: number) => Math.round(num * 1000000) / 1000000;

    return {
      r: roundToSixDecimals(r),
      g: roundToSixDecimals(g),
      b: roundToSixDecimals(b),
      a: roundToSixDecimals(a)
    };
  }