export async function getLocalVariables() {
  return await figma.variables.getLocalVariablesAsync();
}
