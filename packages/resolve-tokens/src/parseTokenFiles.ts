import type { DesignTokens } from "style-dictionary/types";

export async function parseTokenFiles(
  files: Array<{ name: string; data: string }>,
): Promise<{
  tokenFiles: Record<string, DesignTokens>;
  $themes?: DesignTokens;
  $metadata?: DesignTokens;
}> {
  const tokenFiles: Record<string, DesignTokens> = {};
  let $themes: DesignTokens | undefined;
  let $metadata: DesignTokens | undefined;

  for (const file of files) {
    const parsedData = JSON.parse(file.data);
    if (file.name === "$themes") {
      // TODO: Check if this is a valid themes file
      $themes = parsedData;
    } else if (file.name === "$metadata") {
      // TODO: Check if this is a valid metadata file
      $metadata = parsedData;
    } else {
      tokenFiles[file.name] = parsedData;
    }
  }

  const result: {
    tokenFiles: Record<string, DesignTokens>;
    $themes?: DesignTokens;
    $metadata?: DesignTokens;
  } = { tokenFiles };

  if ($themes) result.$themes = $themes;
  if ($metadata) result.$metadata = $metadata;

  return result;
}
