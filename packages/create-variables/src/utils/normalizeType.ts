export function normalizeType(type: string): VariableResolvedDataType {
  if (type === "color") {
    return "COLOR";
  }
  return type.toUpperCase() as VariableResolvedDataType;
}
