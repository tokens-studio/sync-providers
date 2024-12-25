export function getAliasName(value: string) {
  return value.trim()
    .replace(/[\{\}]/g, "");
}
