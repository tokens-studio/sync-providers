export function convertSingleFileToMultiFile(
  path: string,
  parsed: Record<string, unknown> | Array<unknown>,
) {
  if (typeof parsed !== "object") {
    throw new Error("Invalid data");
  }
  const result = Object.entries(parsed).map(([key, value]) => ({
    name: key,
    path: `${path.replace(/\.json$/, "")}/${key}.json`,
    data: value,
  }));

  return result;
}
