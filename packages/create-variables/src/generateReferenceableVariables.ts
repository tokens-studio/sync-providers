import { normalizeTokenNameFromFigma } from "./utils/normalizeTokenNameFromFigma.js";

export async function generateReferenceableVariables(
  collectionVariables: string[],
  availableSourceVariables: Variable[],
): Promise<Record<string, Variable>> {
  const tokens: Record<string, Variable> = {};
  const populatedVariables = await Promise.all(
    collectionVariables.map(
      async (variable) => await figma.variables.getVariableByIdAsync(variable),
    ),
  );
  const allLocalVariables = await figma.variables.getLocalVariablesAsync();
  allLocalVariables?.forEach((variable) => {
    tokens[normalizeTokenNameFromFigma(variable.name)] = variable;
  });

  availableSourceVariables?.forEach((variable) => {
    tokens[normalizeTokenNameFromFigma(variable.name)] = variable;
  });

  populatedVariables?.forEach((variable) => {
    if (variable) {
      tokens[normalizeTokenNameFromFigma(variable.name)] = variable;
    }
  });
  return tokens;
}
