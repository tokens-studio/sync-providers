import { SingleToken } from "@tokens-studio/types";
import { DesignTokens } from "style-dictionary/types";

/**
 * Converts a flat array of tokens into a nested object structure.
 * This function is useful for transforming token data from a linear format
 * to a hierarchical structure that's compatible with Style Dictionary.
 * 
 * @param tokens - An array of SingleToken objects, each representing a design token
 *                 with a dot-separated name indicating its position in the hierarchy.
 * @returns A nested object where each level corresponds to a segment of the dot-separated names,
 *          and the leaf nodes contain the token properties (excluding the name).
 */
export function convertArrayToNestedObject(tokens: SingleToken[]): Record<string, DesignTokens> {
  // Initialize an empty object to store the resulting nested structure
  const result: Record<string, DesignTokens> = {};

  // Process each token in the input array
  tokens.forEach(token => {
    // Extract the name and the rest of the token properties
    const { name, ...tokenProperties } = token;
    // Split the name into an array of keys representing the hierarchy
    const keys = name.split('.');
    // Start at the root of the result object
    let current = result;

    // Traverse the hierarchy, creating nested objects as needed
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        // For the last key, assign the token properties
        current[key] = tokenProperties;
      } else {
        // For intermediate keys, create a new object if it doesn't exist
        if (!current[key]) {
          current[key] = {};
        }
        // Move to the next level in the hierarchy
        current = current[key] as Record<string, DesignTokens>;
      }
    });
  });

  // Return the fully constructed nested object
  return result;
}
