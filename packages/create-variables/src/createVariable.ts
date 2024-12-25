export async function createVariable({
  name,
  collection,
  type,
}: {
  name: string;
  collection: VariableCollection;
  type: VariableResolvedDataType;
}): Promise<Variable> {
  try {
    return figma.variables.createVariable(name, collection, type);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
