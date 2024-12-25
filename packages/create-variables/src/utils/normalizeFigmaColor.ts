export function normalizeFigmaColor({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}): { r: number; g: number; b: number; a: number } {
  const roundToSixDecimals = (num: number) =>
    Math.round(num * 1000000) / 1000000;

  return {
    r: roundToSixDecimals(r),
    g: roundToSixDecimals(g),
    b: roundToSixDecimals(b),
    a: roundToSixDecimals(a),
  };
}
