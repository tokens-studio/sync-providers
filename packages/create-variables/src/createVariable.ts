
export async function createVariable({
  name, collection, type
}: {
  name: string;
  collection: VariableCollection;
  type: VariableResolvedDataType;
}): Promise<Variable | null> {
  try {
    return figma.variables.createVariable(name, collection, type);
  } catch (e) {
    console.error(e);
  }
  return null;
}
