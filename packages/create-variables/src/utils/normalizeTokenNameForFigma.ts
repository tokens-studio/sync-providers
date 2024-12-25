// Replace . with /
export function normalizeTokenNameForFigma(name: string) {
  return name.replace(/\./g, "/");
}
