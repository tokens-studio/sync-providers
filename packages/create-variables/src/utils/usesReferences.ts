export function usesReferences(value: string) {
  return value.startsWith("{") && value.endsWith("}");
}
