import type { ThemeObject } from "@tokens-studio/types";
import type { DesignTokens } from "style-dictionary/types";

export type RemoteTokenStorageMetadata = {
  tokenSetOrder?: string[];
  tokenSetsData?: Record<string, { id: string; isDynamic?: boolean }>;
};

export function prepareTokensForPush({
  tokens,
  themes,
  metadata,
}: {
  tokens: Record<string, DesignTokens>;
  themes: ThemeObject[];
  metadata: RemoteTokenStorageMetadata;
}): { path: string; name: string; data: string }[] {
  const files: { path: string; name: string; data: string }[] = [];

  // Add token files
  Object.entries(tokens).forEach(([tokenSetName, tokenSet]) => {
    files.push({
      path: `tokens/${tokenSetName}.json`,
      name: tokenSetName,
      data: JSON.stringify(tokenSet, null, 2),
    });
  });

  // Add themes file
  files.push({
    path: "tokens/$themes.json",
    name: "$themes",
    data: JSON.stringify(themes, null, 2),
  });

  // Add metadata file
  files.push({
    path: "tokens/$metadata.json",
    name: "$metadata",
    data: JSON.stringify(metadata, null, 2),
  });

  return files;
}
