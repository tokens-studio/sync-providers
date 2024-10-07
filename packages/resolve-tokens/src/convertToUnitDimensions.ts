export function convertToUnitDimensions(
  value: string,
): `${number}px` | `${number}rem` | `${number}em` {
  if (typeof value === "string") {
    if (value.endsWith("px")) {
      return `${parseFloat(value)}px`;
    } else if (value.endsWith("rem")) {
      return `${parseFloat(value)}rem`;
    } else if (value.endsWith("em")) {
      return `${parseFloat(value)}em`;
    } else {
      return `${parseFloat(value)}px`;
    }
  } else if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}
