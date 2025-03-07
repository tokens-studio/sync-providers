export function usesReferences(value: string) {
  if (typeof value !== "string") {
    return false;
  }
  return value.startsWith("{") && value.endsWith("}");
}
