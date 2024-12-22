export function isNumberWeight(value: string | number): boolean {
  if (typeof value === "number") return true;
  if (
    typeof value === "string" &&
    !value.startsWith("{") &&
    !isNaN(Number(value))
  ) {
    return true;
  }
  return false;
}
